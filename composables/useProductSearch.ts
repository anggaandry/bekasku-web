import {
  API_PRODUCT_SEARCH,
  API_PRELOVED_LIST,
  SEARCH_TYPE_RECOMMEND,
  SEARCH_TYPE_BEKASKU_PLUS,
  SEARCH_PAGE_SIZE,
} from '~/utils/constants'
import type { ProductCard, ProductSearchResponse } from '~/types/product'

export interface ProductSearchParams {
  page?: number
  type?: number
  lat?: number
  lon?: number
  location?: string
  filter?: string[]
  categoryId?: string
  subcategoryId?: string
  locationId?: string
  provinceName?: string
  minPrice?: number
  maxPrice?: number
  newest?: number
  cheapest?: number
  mostExpensive?: number
  freeOngkir?: number
  trusted?: number
  verified?: number
  vip?: number
  needed?: number
  rating?: number
  limit?: number
  city?: string
  cities?: string[]
}

export function useProductSearch() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function search(params: ProductSearchParams = {}): Promise<ProductSearchResponse> {
    loading.value = true
    error.value = null
    try {
      // Special case: type === 10 (BekasKu+ Preloved) uses /dashboard/preloved per mobile SearchResultController L398
      if (params.type === SEARCH_TYPE_BEKASKU_PLUS) {
        const res = await api.post<any>(API_PRELOVED_LIST, {})
        const raw = res?.result
        const docs: ProductCard[] = Array.isArray(raw) ? raw : raw?.docs || []
        return {
          docs,
          totalDocs: docs.length,
          hasNextPage: false,
        }
      }

      const payload: Record<string, any> = {
        filter: params.filter && params.filter.length > 0 ? params.filter : [],
        type: params.type ?? SEARCH_TYPE_RECOMMEND,
        category_id: params.categoryId ?? '',
        subcategory_id: params.subcategoryId ?? '',
        location_id: params.locationId ?? '',
        province_name: params.provinceName ?? '',
        min_price: params.minPrice ?? 0,
        max_price: params.maxPrice ?? 0,
        newest: params.newest ?? 0,
        cheapest: params.cheapest ?? 0,
        most_expensive: params.mostExpensive ?? 0,
        free_ongkir: params.freeOngkir ?? 0,
        trusted: params.trusted ?? 0,
        verified: params.verified ?? 0,
        vip: params.vip ?? 0,
        needed: params.needed ?? 0,
        rating: params.rating ?? 0,
        page: params.page ?? 1,
        city: params.city ?? '',
        cities: params.cities ?? [],
        location: params.location ?? '',
        lon: params.lon ?? 0.0,
        lat: params.lat ?? 0.0,
        limit: params.limit ?? SEARCH_PAGE_SIZE,
      }

      const response = await api.post<any>(API_PRODUCT_SEARCH, payload)

      if (response && response.result) {
        const result = response.result
        if (Array.isArray(result)) {
          return { docs: result, hasNextPage: false }
        }
        return {
          docs: result.docs || [],
          totalDocs: result.totalDocs,
          limit: result.limit,
          page: result.page,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          nextPage: result.nextPage,
          bd_time: result.bd_time,
        }
      }
      return { docs: [] }
    } catch (err: any) {
      error.value = err?.message || 'Gagal mencari produk'
      return { docs: [] }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    search,
  }
}
