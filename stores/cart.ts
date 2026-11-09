import { defineStore } from 'pinia'
import {
  API_CART_LIST,
  API_CART_ADD,
  API_WISHLIST_UPDATE,
  TRANSACTION_METHOD_COURRIER,
  TRANSACTION_METHOD_MEET,
} from '~/utils/constants'
import type { CartSeller, CartProduct, CartListResponse, CartSyncItem } from '~/types/cart'
import { useAuthStore } from '~/stores/auth'

export const useCartStore = defineStore('cart', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const listCart = ref<CartSeller[]>([])
  const buyerAddress = ref<Record<string, unknown> | null>(null)
  const buyerId = ref<string>('')
  const transactionMethod = ref<number>(TRANSACTION_METHOD_COURRIER)
  const loading = ref<boolean>(false)
  const syncing = ref<boolean>(false)
  const loaded = ref<boolean>(false)
  const errorMessage = ref<string>('')

  // Hitung jumlah item total untuk badge global di header & mobile bar
  const totalItemCount = computed(() => {
    let count = 0
    for (const seller of listCart.value) {
      for (const p of seller.products || []) {
        count += p.total_product || 1
      }
    }
    return count
  })

  // Produk yang sedang tercentang (checked) & valid
  const checkedProducts = computed(() => {
    const checked: { seller: CartSeller; product: CartProduct }[] = []
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    for (const seller of listCart.value) {
      for (const product of seller.products || []) {
        const isUnavailable = !product.is_available || product.product_stock <= 0
        const isDisabled = isUnavailable || (isMeet ? !product.allow_meet : !product.allow_delivery)
        if (product.checked && !isDisabled) {
          checked.push({ seller, product })
        }
      }
    }
    return checked
  })

  const checkedCount = computed(() => checkedProducts.value.length)

  const totalPrice = computed(() => {
    return checkedProducts.value.reduce((acc, curr) => {
      const price = curr.product.total_price || (curr.product.product_price * (curr.product.total_product || 1))
      return acc + price
    }, 0)
  })

  const totalDiscount = computed(() => {
    return checkedProducts.value.reduce((acc, curr) => {
      const discount = (curr.product.discount || 0) * (curr.product.total_product || 1)
      return acc + discount
    }, 0)
  })

  const isAllChecked = computed(() => {
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    let hasAvailableProduct = false
    for (const seller of listCart.value) {
      for (const p of seller.products || []) {
        const isUnavailable = !p.is_available || p.product_stock <= 0
        const isDisabled = isUnavailable || (isMeet ? !p.allow_meet : !p.allow_delivery)
        if (!isDisabled) {
          hasAvailableProduct = true
          if (!p.checked) return false
        }
      }
    }
    return hasAvailableProduct
  })

  function normalizeProductSelection() {
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    for (const seller of listCart.value) {
      let sellerChecked = true
      let hasSelectable = false
      for (const p of seller.products || []) {
        const isUnavailable = !p.is_available || p.product_stock <= 0
        const isDisabled = isUnavailable || (isMeet ? !p.allow_meet : !p.allow_delivery)
        if (isDisabled) {
          p.checked = false
        } else {
          hasSelectable = true
          if (!p.checked) {
            sellerChecked = false
          }
        }
      }
      seller.checked = hasSelectable ? sellerChecked : false
    }
  }

  async function fetchCart(sync: boolean = false) {
    if (!authStore.isLoggedIn) {
      listCart.value = []
      return
    }

    // Backend sync = deleteMany lalu simpan ulang `data` (user_id wajib). Sync tanpa list/buyer
    // yang valid akan menghapus keranjang user, jadi tolak sebelum list pernah dimuat.
    if (sync && (!loaded.value || !buyerId.value)) {
      return
    }

    if (sync) {
      syncing.value = true
    } else {
      loading.value = true
    }
    errorMessage.value = ''

    try {
      const syncData: CartSyncItem[] = []
      if (sync) {
        for (const s of listCart.value) {
          for (const p of s.products || []) {
            syncData.push({
              id: p.id,
              user_id: buyerId.value,
              seller_id: s.seller_id,
              product_id: p.product_id,
              checked: Boolean(p.checked),
              total: p.total_product || 1,
            })
          }
        }
      }

      const res = await api.post<CartListResponse>(API_CART_LIST, {
        sync,
        data: syncData,
        transaction_method: transactionMethod.value,
      })

      if (res?.result) {
        const rawCart = res.result.cart || []
        const mappedCart = rawCart.map((s) => {
          const products = (s.products || []).map((p) => {
            const prodPrice = Number(p.product_price || 0)
            const origPrice = Number(p.original_price || p.product_price || 0)
            const disc = Number(p.discount || 0)
            const totalProd = Number(p.total_product || 1)
            const stock = Number(p.product_stock || 0)

            return {
              ...p,
              product_price: prodPrice,
              original_price: origPrice > prodPrice ? origPrice : (disc > 0 ? prodPrice + disc : prodPrice),
              discount: disc,
              discount_percent: Number(p.discount_percent || 0),
              total_product: totalProd,
              total_price: Number(p.total_price || (prodPrice * totalProd)),
              total_weight: Number(p.total_weight || 0),
              product_stock: stock,
              is_available: p.is_available !== false && stock > 0,
              checked: p.checked !== false,
            }
          })

          return {
            ...s,
            products,
            checked: products.every((prod) => prod.checked),
          }
        })

        // Stable sort sellers and products within each seller (sesuai mobile cart_controller.dart)
        mappedCart.sort((a, b) => (a.seller_name || '').localeCompare(b.seller_name || ''))
        for (const seller of mappedCart) {
          seller.products?.sort((a, b) => (a.product_title || '').localeCompare(b.product_title || ''))
        }
        listCart.value = mappedCart

        buyerAddress.value = res.result.buyer_address || null
        buyerId.value = res.result.buyer_id || ''
        normalizeProductSelection()
        loaded.value = true
      }
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat keranjang belanja.'
    } finally {
      loading.value = false
      syncing.value = false
    }
  }

  function isProductDisabled(p: CartProduct): boolean {
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    const isUnavailable = !p.is_available || p.product_stock <= 0
    return isUnavailable || (isMeet ? !p.allow_meet : !p.allow_delivery)
  }

  function toggleProduct(seller: CartSeller, product: CartProduct) {
    if (isProductDisabled(product)) return
    product.checked = !product.checked
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    const validProducts = seller.products.filter((p) => {
      const isUnavailable = !p.is_available || p.product_stock <= 0
      return !isUnavailable && !(isMeet ? !p.allow_meet : !p.allow_delivery)
    })
    seller.checked = validProducts.length > 0 && validProducts.every((p) => p.checked)
    syncCartSilently()
  }

  function toggleSeller(seller: CartSeller) {
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    const nextCheck = !seller.checked
    seller.checked = nextCheck
    for (const p of seller.products) {
      const isUnavailable = !p.is_available || p.product_stock <= 0
      const isDisabled = isUnavailable || (isMeet ? !p.allow_meet : !p.allow_delivery)
      if (!isDisabled) {
        p.checked = nextCheck
      }
    }
    syncCartSilently()
  }

  function toggleAll() {
    const nextVal = !isAllChecked.value
    const isMeet = transactionMethod.value === TRANSACTION_METHOD_MEET
    for (const seller of listCart.value) {
      seller.checked = nextVal
      for (const p of seller.products) {
        const isUnavailable = !p.is_available || p.product_stock <= 0
        const isDisabled = isUnavailable || (isMeet ? !p.allow_meet : !p.allow_delivery)
        if (!isDisabled) {
          p.checked = nextVal
        }
      }
    }
    syncCartSilently()
  }

  function updateQuantity(seller: CartSeller, product: CartProduct, newQty: number) {
    if (newQty < 1 || newQty > product.product_stock) return
    product.total_product = newQty
    product.total_price = product.product_price * newQty
    syncCartSilently()
  }

  async function removeProduct(seller: CartSeller, product: CartProduct) {
    seller.products = seller.products.filter((p) => p.product_id !== product.product_id)
    if (seller.products.length === 0) {
      listCart.value = listCart.value.filter((s) => s.seller_id !== seller.seller_id)
    }
    await fetchCart(true)
  }

  async function toggleWishlist(product: CartProduct) {
    try {
      const res = await api.post<{ result?: boolean }>(API_WISHLIST_UPDATE, {
        product_id: product.product_id,
      })
      if (res?.result !== undefined) {
        product.in_wishlist = Boolean(res.result)
      } else {
        product.in_wishlist = !product.in_wishlist
      }
    } catch {
      product.in_wishlist = !product.in_wishlist
    }
  }

  function setTransactionMethod(method: number) {
    if (transactionMethod.value === method) return
    transactionMethod.value = method
    normalizeProductSelection()
    syncCartSilently()
  }

  let syncTimeout: ReturnType<typeof setTimeout> | null = null
  function syncCartSilently() {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      fetchCart(true)
    }, 450)
  }

  function initFromStorage() {
    if (authStore.isLoggedIn) {
      fetchCart(false)
    }
  }

  async function addToCart(productId: string, total: number = 1): Promise<{ success: boolean; message?: string }> {
    if (!authStore.isLoggedIn) {
      return { success: false, message: 'Silahkan login terlebih dahulu' }
    }
    try {
      const res = await api.post<{ status?: boolean; message?: string }>(API_CART_ADD, {
        product_id: productId,
        total,
        checked: true,
        confirm: false,
      })
      if (res?.status === true || (res?.message || '').toLowerCase() === 'success') {
        await fetchCart(false)
        return { success: true }
      }
      return { success: false, message: res?.message || 'Gagal menambahkan ke keranjang' }
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Terjadi kesalahan sistem' }
    }
  }

  return {
    listCart,
    buyerAddress,
    buyerId,
    transactionMethod,
    loading,
    syncing,
    errorMessage,
    totalItemCount,
    totalItems: totalItemCount,
    checkedProducts,
    checkedCount,
    totalPrice,
    totalDiscount,
    isAllChecked,
    fetchCart,
    toggleProduct,
    toggleSeller,
    toggleAll,
    updateQuantity,
    removeProduct,
    toggleWishlist,
    isProductDisabled,
    setTransactionMethod,
    addToCart,
    initFromStorage,
  }
})
