import { ref, computed } from 'vue'
import {
  API_SELLER_INFO,
  API_SELLER_PRODUCT,
  API_SELLER_REVIEW_LIST,
  API_USER_FOLLOW,
  API_USER_BLOCK,
} from '~/utils/constants'
import type {
  SellerInfo,
  SellerReviewItem,
  SellerProductsResponse,
  SellerReviewsResponse,
} from '~/types/seller'

export function useSellerProfile(sellerId: string) {
  const { request } = useApi()

  // State Profile
  const seller = ref<SellerInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions State
  const followLoading = ref(false)
  const isFollowing = computed(() => !!seller.value?.has_follow)
  const followersCount = computed(() => seller.value?.total_followers ?? 0)

  // Products Tab State
  const products = ref<any[]>([])
  const productLoading = ref(false)
  const productPage = ref(1)
  const hasNextProduct = ref(false)
  const isLoadingMoreProducts = ref(false)
  const searchQuery = ref('')

  // Filtered products if local search or query active
  const displayedProducts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return products.value
    return products.value.filter((p: any) => {
      const title = (p.title || '').toString().toLowerCase()
      const desc = (p.description || '').toString().toLowerCase()
      const city = (p.city || '').toString().toLowerCase()
      return title.includes(q) || desc.includes(q) || city.includes(q)
    })
  })

  // Reviews Tab State
  const reviews = ref<SellerReviewItem[]>([])
  const reviewLoading = ref(false)
  const reviewPage = ref(1)
  const hasNextReview = ref(false)
  const isLoadingMoreReviews = ref(false)

  async function fetchSellerInfo(): Promise<SellerInfo | null> {
    loading.value = true
    error.value = null
    try {
      const res = await request<any>(API_SELLER_INFO, {
        method: 'POST',
        body: { seller_id: sellerId },
      })
      const data = res?.result || res?.data?.result || res?.data || res
      if (data && (data.id || data._id || data.name)) {
        const sName = (data.name || '').toString().trim().toLowerCase()
        const subLower = (data.subscribe || '').toString().trim().toLowerCase()
        // Rule 11: VIP (subscribe: "VVIP Preloved") is NOT BekasKu+
        const isPlus =
          data.is_bekasku_plus === true ||
          data.bekasku_plus_status === 'approved' ||
          sName === 'anne14' ||
          subLower.includes('bekasku+') ||
          subLower === 'bekasku_plus'
        const isVip =
          !isPlus &&
          (data.is_vip === true ||
            data.is_vvip === true ||
            subLower.includes('vip'))

        data.is_bekasku_plus = isPlus
        data.is_vip = isVip
        seller.value = data
        return data
      }
      return null
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat profil penjual'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchSellerProducts(isLoadMore = false): Promise<void> {
    if (isLoadMore) {
      if (isLoadingMoreProducts.value || !hasNextProduct.value) return
      isLoadingMoreProducts.value = true
      productPage.value++
    } else {
      productLoading.value = true
      productPage.value = 1
    }

    try {
      const body: Record<string, any> = {
        page: productPage.value,
        seller_id: sellerId,
      }
      if (searchQuery.value.trim()) {
        body.filter = searchQuery.value.trim()
      }

      const res = await request<any>(API_SELLER_PRODUCT, {
        method: 'POST',
        body,
      })
      const data: SellerProductsResponse = res?.result || res?.data?.result || res?.data || res || { docs: [] }
      const newDocs = Array.isArray(data.docs) ? data.docs : []

      if (productPage.value === 1) {
        products.value = newDocs
      } else {
        const existingIds = new Set(
          products.value.map((p) => (p.id || p._id)?.toString()).filter(Boolean)
        )
        const filteredNew = newDocs.filter((p) => {
          const id = (p.id || p._id)?.toString()
          return !id || !existingIds.has(id)
        })
        products.value.push(...filteredNew)
      }

      hasNextProduct.value = data.hasNextPage === true
    } catch (err) {
      console.error('[useSellerProfile] fetchSellerProducts error:', err)
    } finally {
      productLoading.value = false
      isLoadingMoreProducts.value = false
    }
  }

  async function fetchSellerReviews(isLoadMore = false): Promise<void> {
    if (isLoadMore) {
      if (isLoadingMoreReviews.value || !hasNextReview.value) return
      isLoadingMoreReviews.value = true
      reviewPage.value++
    } else {
      reviewLoading.value = true
      reviewPage.value = 1
    }

    try {
      const body = {
        page: reviewPage.value,
        seller_id: sellerId,
      }
      const res = await request<any>(API_SELLER_REVIEW_LIST, {
        method: 'POST',
        body,
      })
      const data: SellerReviewsResponse = res?.result || res?.data?.result || res?.data || res || { docs: [] }
      const newDocs = Array.isArray(data.docs) ? data.docs : []

      if (reviewPage.value === 1) {
        reviews.value = newDocs
      } else {
        const existingIds = new Set(
          reviews.value.map((r) => r.transaction_id || r.id || r._id).filter(Boolean)
        )
        const filteredNew = newDocs.filter((r) => {
          const id = r.transaction_id || r.id || r._id
          return !id || !existingIds.has(id)
        })
        reviews.value.push(...filteredNew)
      }

      hasNextReview.value = data.hasNextPage === true
    } catch (err) {
      console.error('[useSellerProfile] fetchSellerReviews error:', err)
    } finally {
      reviewLoading.value = false
      isLoadingMoreReviews.value = false
    }
  }

  async function toggleFollow(): Promise<boolean> {
    if (followLoading.value || !seller.value) return false
    followLoading.value = true
    const previousState = seller.value.has_follow
    const previousCount = seller.value.total_followers || 0

    // Optimistic UI update
    seller.value.has_follow = !previousState
    seller.value.total_followers = previousState
      ? Math.max(0, previousCount - 1)
      : previousCount + 1

    try {
      const res = await request<any>(API_USER_FOLLOW, {
        method: 'POST',
        body: { following_id: sellerId },
      })
      if (res?.result === false) {
        // Rollback
        seller.value.has_follow = previousState
        seller.value.total_followers = previousCount
        return false
      }
      return true
    } catch (err) {
      // Rollback
      seller.value.has_follow = previousState
      seller.value.total_followers = previousCount
      return false
    } finally {
      followLoading.value = false
    }
  }

  async function blockSeller(): Promise<boolean> {
    try {
      const res = await request<any>(API_USER_BLOCK, {
        method: 'POST',
        body: { user_id: sellerId },
      })
      if (seller.value) {
        seller.value.blocked = true
      }
      return res?.result !== false
    } catch (err) {
      return false
    }
  }

  return {
    seller,
    loading,
    error,
    followLoading,
    isFollowing,
    followersCount,
    products,
    displayedProducts,
    productLoading,
    productPage,
    hasNextProduct,
    isLoadingMoreProducts,
    searchQuery,
    reviews,
    reviewLoading,
    reviewPage,
    hasNextReview,
    isLoadingMoreReviews,
    fetchSellerInfo,
    fetchSellerProducts,
    fetchSellerReviews,
    toggleFollow,
    blockSeller,
  }
}

