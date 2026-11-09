import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { API_OFFER_NEEDED_MYPRODUCT, CATEGORY_LANG_DEFAULT } from '~/utils/constants'
import { sanitizeMediaUrl } from '~/utils/media'
import type { ProductCard } from '~/types/product'
import type { NeededOfferTargetInfo, OfferNeededResponse } from '~/types/needed'

export function useNeededOffer(productIdSource: MaybeRefOrGetter<string>) {
  const { request } = useApi()
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const loading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const hasNextPage = ref(false)
  const totalProducts = ref(0)

  const products = ref<ProductCard[]>([])
  const targetInfo = ref<NeededOfferTargetInfo>({
    needed_title: '',
    seller_id: '',
    seller_name: '',
    seller_avatar: '',
  })

  const selectedProduct = ref<ProductCard | null>(null)
  const isConfirmModalOpen = ref(false)
  const isSubmitting = ref(false)

  async function fetchMyEligibleProducts(isLoadMore = false): Promise<void> {
    const productId = toValue(productIdSource)
    if (!productId) {
      error.value = 'ID produk tidak valid'
      return
    }

    if (isLoadMore) {
      if (isLoadingMore.value || !hasNextPage.value) return
      isLoadingMore.value = true
      page.value++
    } else {
      loading.value = true
      page.value = 1
      error.value = null
    }

    try {
      const res = await request<{ result?: OfferNeededResponse; data?: { result?: OfferNeededResponse } }>(
        API_OFFER_NEEDED_MYPRODUCT,
        {
          method: 'POST',
          body: {
            page: page.value,
            product_id: productId,
            lang: CATEGORY_LANG_DEFAULT,
          },
        }
      )

      const data = (res?.result || res?.data?.result || res) as OfferNeededResponse | undefined

      if (data) {
        const docs = Array.isArray(data.docs) ? data.docs : []

        if (page.value === 1) {
          products.value = docs
          targetInfo.value = {
            needed_title: data.needed_title || '',
            seller_id: data.seller_id || '',
            seller_name: data.seller_name || '',
            seller_avatar: data.seller_avatar || '',
          }
        } else {
          const existingIds = new Set(
            products.value.map((p) => (p.id || p._id)?.toString()).filter(Boolean)
          )
          const filteredNew = docs.filter((p) => {
            const id = (p.id || p._id)?.toString()
            return !id || !existingIds.has(id)
          })
          products.value.push(...filteredNew)
        }

        totalProducts.value = data.totalDocs ?? products.value.length
        hasNextPage.value = data.hasNextPage === true
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal memuat barang saya'
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  function selectProduct(product: ProductCard) {
    selectedProduct.value = product
    isConfirmModalOpen.value = true
  }

  function closeConfirmModal() {
    isConfirmModalOpen.value = false
  }

  function confirmOffer(overrideTarget?: Partial<NeededOfferTargetInfo>): boolean {
    if (!authStore.isLoggedIn || !selectedProduct.value) {
      return false
    }

    const sellerId = overrideTarget?.seller_id || targetInfo.value.seller_id
    if (!sellerId) {
      error.value = 'Detail penjual tidak ditemukan'
      return false
    }

    const prod = selectedProduct.value
    const neededTitle = overrideTarget?.needed_title || targetInfo.value.needed_title || 'Iklan Dibutuhkan'
    const sellerName = overrideTarget?.seller_name || targetInfo.value.seller_name || ''
    const sellerAvatar = sanitizeMediaUrl(overrideTarget?.seller_avatar || targetInfo.value.seller_avatar || '')
    const initMsg = `Halo, Saya ingin menawarkan produk ini untuk iklan '${neededTitle}'`

    isSubmitting.value = true

    chatStore.openChatWith({
      partnerId: String(sellerId),
      partnerName: sellerName || 'Penjual',
      partnerAvatar: sellerAvatar,
      initMessage: initMsg,
      product: {
        id: String(prod.id || prod._id || ''),
        title: prod.title || 'Produk BekasKu',
        price: Number(prod.price || 0),
        image: sanitizeMediaUrl(Array.isArray(prod.image) ? prod.image[0] : prod.image || ''),
        location: prod.location || '',
        rating: Number(prod.rating || 0),
        is_seller: true,
      },
    })

    isSubmitting.value = false
    isConfirmModalOpen.value = false
    return true
  }

  return {
    loading,
    isLoadingMore,
    error,
    page,
    hasNextPage,
    totalProducts,
    products,
    targetInfo,
    selectedProduct,
    isConfirmModalOpen,
    isSubmitting,
    fetchMyEligibleProducts,
    selectProduct,
    closeConfirmModal,
    confirmOffer,
  }
}
