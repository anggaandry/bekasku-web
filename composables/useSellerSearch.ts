import { API_SELLER_SEARCH, SEARCH_MAX_ITEMS } from '~/utils/constants'
import type { SellerResult, SellerSearchResponse } from '~/types/search'

export interface SellerSearchParams {
  filter?: string
  type?: number
  rating?: number
  cities?: string[]
  city?: string
  categoryId?: string
  locationId?: string
  provinceName?: string
  verified?: number
  trusted?: number
  vip?: number
  page?: number
  limit?: number
  saveHistory?: boolean
}

export function useSellerSearch() {
  const api = useApi()
  const sellers = ref<SellerResult[]>([])
  const topSellerWithProducts = ref<SellerResult | null>(null)
  const loading = ref(false)
  const hasMore = ref(false)
  const error = ref<string | null>(null)

  async function searchSellers(params: SellerSearchParams = {}): Promise<SellerSearchResponse> {
    loading.value = true
    error.value = null
    try {
      const body: Record<string, any> = {
        filter: params.filter ?? '',
        type: params.type ?? 0,
        rating: params.rating ?? 0,
        cities: params.cities ?? [],
        city: params.city ?? '',
        category_id: params.categoryId ?? '',
        location_id: params.locationId ?? '',
        province_name: params.provinceName ?? '',
        verified: params.verified ?? 0,
        trusted: params.trusted ?? 0,
        vip: params.vip ?? 0,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }
      if (params.saveHistory !== undefined) {
        body.save_history = params.saveHistory
      }

      const res = await api.post<{
        status?: boolean
        message?: string
        result?: SellerSearchResponse
      }>(API_SELLER_SEARCH, body)

      const data = res?.result
      const docs = Array.isArray(data?.docs) ? data.docs : []
      return {
        docs,
        totalDocs: data?.totalDocs,
        page: data?.page,
        totalPages: data?.totalPages,
        hasNextPage: data?.hasNextPage ?? false,
      }
    } catch (e: any) {
      error.value = e?.message || 'Gagal mencari penjual'
      return { docs: [], hasNextPage: false }
    } finally {
      loading.value = false
    }
  }

  async function fetchFirstSellerWithProducts(params: SellerSearchParams) {
    topSellerWithProducts.value = null
    if (!params.filter || !params.filter.trim()) return
    try {
      const res = await searchSellers({
        ...params,
        page: 1,
        limit: 10,
      })
      for (const seller of res.docs) {
        if (Array.isArray(seller.products) && seller.products.length > 0) {
          topSellerWithProducts.value = seller
          break
        }
      }
    } catch {
      topSellerWithProducts.value = null
    }
  }

  return {
    sellers,
    topSellerWithProducts,
    loading,
    hasMore,
    error,
    searchSellers,
    fetchFirstSellerWithProducts,
  }
}

