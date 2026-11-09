import {
  API_DASHBOARD_NEWEST,
  API_DASHBOARD_NEEDED,
  API_DASHBOARD_BESTDEAL,
  SEARCH_TYPE_SERVICE,
} from '~/utils/constants'
import type { ProductCard } from '~/types/product'

export function useProducts() {
  const api = useApi()
  const searchComposable = useProductSearch()

  const newest = ref<ProductCard[]>([])
  const needed = ref<ProductCard[]>([])
  const bestDeals = ref<ProductCard[]>([])
  const services = ref<ProductCard[]>([])
  const recommendations = ref<ProductCard[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // 1. Postingan Terbaru (POST /dashboard/newest)
  async function fetchNewest(): Promise<ProductCard[]> {
    try {
      const res = await api.post<{ result?: ProductCard[] }>(API_DASHBOARD_NEWEST, {})
      newest.value = res?.result || []
      return newest.value
    } catch {
      newest.value = []
      return []
    }
  }

  // 2. Barang Dibutuhkan (POST /dashboard/needed)
  async function fetchNeeded(): Promise<ProductCard[]> {
    try {
      const res = await api.post<{ result?: ProductCard[] }>(API_DASHBOARD_NEEDED, {})
      needed.value = res?.result || []
      return needed.value
    } catch {
      needed.value = []
      return []
    }
  }

  // 3. Best Deal (POST /dashboard/bestdeal - sembunyi bila kosong, tanpa fallback diskon buatan)
  async function fetchBestDeal(): Promise<ProductCard[]> {
    try {
      const res = await api.post<{ result?: ProductCard[] }>(API_DASHBOARD_BESTDEAL, {})
      bestDeals.value = res?.result || []
      return bestDeals.value
    } catch {
      bestDeals.value = []
      return []
    }
  }

  // 4. Jasa dan Lowongan Kerja (POST /product/search dengan type: 6)
  async function fetchServices(): Promise<ProductCard[]> {
    try {
      const res = await searchComposable.search({ page: 1, type: SEARCH_TYPE_SERVICE, newest: 1 })
      services.value = res.docs || []
      return services.value
    } catch {
      services.value = []
      return []
    }
  }

  // 5. Rekomendasi BekasKu (infinite grid, default 30 produk per batch)
  async function fetchRecommendations(params: { page?: number; limit?: number; lat?: number; lon?: number; location?: string } = {}) {
    return await searchComposable.search({
      limit: params.limit ?? 30,
      ...params,
    })
  }

  return {
    newest,
    needed,
    bestDeals,
    services,
    recommendations,
    loading,
    error,
    fetchNewest,
    fetchNeeded,
    fetchBestDeal,
    fetchServices,
    fetchRecommendations,
  }
}
