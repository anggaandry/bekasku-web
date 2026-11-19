import { API_PRODUCT_SEARCH, SEARCH_TYPE_BEST_DEAL } from '~/utils/constants'
import { useLocationStore } from '~/stores/location'
import type { ProductCard } from '~/types/product'

export function usePromo() {
  const api = useApi()
  const locationStore = useLocationStore()

  const products = useState<ProductCard[]>('promo_products', () => [])
  const bdTime = useState<number>('promo_bd_time', () => 0)
  const hasActivePromo = useState<boolean>('promo_has_active', () => false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const hasMore = ref(false)

  async function fetchPromos(reset = true): Promise<void> {
    if (reset) {
      loading.value = true
      page.value = 1
      error.value = null
    } else {
      if (loadingMore.value || !hasMore.value) return
      loadingMore.value = true
      page.value += 1
    }

    try {
      const res = await api.post<{
        result?: {
          docs?: ProductCard[]
          hasNextPage?: boolean
          bd_time?: number
        }
      }>(API_PRODUCT_SEARCH, {
        type: SEARCH_TYPE_BEST_DEAL,
        newest: 1,
        page: page.value,
        limit: 20,
        location: locationStore.city || '',
        lat: locationStore.lat || 0,
        lon: locationStore.lon || 0,
        filter: [],
      })

      const result = res?.result || {}
      const docs = Array.isArray(result.docs) ? result.docs : []

      if (reset) {
        products.value = docs
        bdTime.value = Number(result.bd_time || 0)
        hasActivePromo.value = docs.length > 0
      } else {
        products.value = [...products.value, ...docs]
      }

      hasMore.value = Boolean(result.hasNextPage)
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar promo Best Deal'
      if (reset) {
        products.value = []
        hasActivePromo.value = false
      }
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  return {
    products,
    bdTime,
    hasActivePromo,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchPromos,
  }
}
