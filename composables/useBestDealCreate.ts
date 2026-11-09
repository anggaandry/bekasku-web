import { ref, computed } from 'vue'
import {
  API_POST_BESTDEAL_CREATE,
  API_PRODUCT_DETAIL,
  BESTDEAL_MIN_DISCOUNT,
  BESTDEAL_MAX_DISCOUNT,
} from '~/utils/constants'
import type { BestDealCreatePayload, BestDealCreateResponse } from '~/types/bestdeal'
import { useNotification } from '~/composables/useNotification'

export function useBestDealCreate() {
  const api = useApi()
  const { showNotification } = useNotification()

  const productId = ref('')
  const price = ref(0)
  const productTitle = ref('')
  const productImage = ref('')
  const discountText = ref('')
  const discountNum = ref(0)
  const priceBD = ref(0)
  const loading = ref(false)
  const isFetchingProduct = ref(false)
  const error = ref<string | null>(null)

  function setInitialData(id: string, initialPrice = 0, title = '', image = '') {
    productId.value = id
    price.value = initialPrice
    productTitle.value = title
    productImage.value = image
    discountText.value = ''
    discountNum.value = 0
    priceBD.value = 0
    error.value = null
  }

  function changeDiscount(val: string) {
    try {
      const cleanVal = val.replace(/[^0-9]/g, '')
      discountText.value = cleanVal

      if (cleanVal.length > 0) {
        let numVal = parseInt(cleanVal, 10)
        if (Number.isNaN(numVal)) {
          numVal = 0
        }
        if (numVal > BESTDEAL_MAX_DISCOUNT) {
          numVal = BESTDEAL_MAX_DISCOUNT
          discountText.value = String(BESTDEAL_MAX_DISCOUNT)
        }
        discountNum.value = numVal
        const discounted = Math.round(
          price.value - (price.value * numVal) / 100
        )
        priceBD.value = Math.max(0, discounted)
      } else {
        discountNum.value = 0
        priceBD.value = 0
      }
    } catch {
      discountNum.value = 0
      priceBD.value = 0
    }
  }

  async function fetchProductDetail(id: string): Promise<boolean> {
    if (!id) return false
    isFetchingProduct.value = true
    error.value = null
    try {
      const res = await api.post<{
        result?: {
          product?: {
            id?: string
            _id?: string
            title?: string
            price?: number
            image?: string[]
          }
        }
      }>(API_PRODUCT_DETAIL, { id })

      const prod = res?.result?.product
      if (prod) {
        productId.value = String(prod.id || prod._id || id)
        price.value = Number(prod.price || 0)
        productTitle.value = prod.title || ''
        productImage.value = Array.isArray(prod.image) ? prod.image[0] || '' : ''
        return true
      }
      return false
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      error.value = errObj?.message || 'Gagal memuat informasi produk'
      return false
    } finally {
      isFetchingProduct.value = false
    }
  }

  async function createBestDeal(): Promise<{ success: boolean; resultDate?: string }> {
    if (
      discountNum.value < BESTDEAL_MIN_DISCOUNT ||
      discountNum.value > BESTDEAL_MAX_DISCOUNT
    ) {
      showNotification({
        type: 'warning',
        message: `Diskon Best Deal harus antara ${BESTDEAL_MIN_DISCOUNT}% sampai ${BESTDEAL_MAX_DISCOUNT}%.`,
      })
      return { success: false }
    }

    if (!productId.value) {
      showNotification({
        type: 'error',
        message: 'ID produk tidak ditemukan.',
      })
      return { success: false }
    }

    loading.value = true
    error.value = null

    try {
      const body: BestDealCreatePayload = {
        product_id: productId.value,
        bestdeal_price: priceBD.value,
        lang: 'id',
      }

      const res = await api.post<BestDealCreateResponse>(
        API_POST_BESTDEAL_CREATE,
        body
      )

      const isSuccess =
        res?.message?.toString().toLowerCase() === 'success' ||
        Boolean(res?.result)

      if (isSuccess && res?.result) {
        return { success: true, resultDate: String(res.result) }
      }

      const errMsg = res?.message || 'Gagal mendaftarkan produk ke Best Deal'
      showNotification({
        type: 'error',
        message: errMsg,
      })
      return { success: false }
    } catch (err: unknown) {
      const errObj = err as { message?: string; data?: { message?: string } }
      const errMsg =
        errObj?.data?.message ||
        errObj?.message ||
        'Terjadi kesalahan saat mendaftarkan Best Deal'
      showNotification({
        type: 'error',
        message: errMsg,
      })
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const isValidDiscount = computed(
    () =>
      discountNum.value >= BESTDEAL_MIN_DISCOUNT &&
      discountNum.value <= BESTDEAL_MAX_DISCOUNT
  )

  const isButtonEnabled = computed(
    () => discountText.value.length > 0 && discountNum.value > 0
  )

  return {
    productId,
    price,
    productTitle,
    productImage,
    discountText,
    discountNum,
    priceBD,
    loading,
    isFetchingProduct,
    error,
    isValidDiscount,
    isButtonEnabled,
    setInitialData,
    changeDiscount,
    fetchProductDetail,
    createBestDeal,
  }
}

