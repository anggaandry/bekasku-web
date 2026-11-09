import {
  API_PRODUCT_SEARCH_EMPTY,
  API_MYSEARCH_DELETE,
  STORAGE_KEY_RECENT_SEARCH,
  STORAGE_KEY_LAST_VIEWED,
} from '~/utils/constants'
import type { ProductCard } from '~/types/product'
import type { SearchHistoryItem, SearchCategoryItem } from '~/types/search'
import { useAuthStore } from '~/stores/auth'

export function useSearchLanding() {
  const api = useApi()
  const authStore = useAuthStore()

  const categoryData = useState<SearchCategoryItem[]>('search_landing_categories', () => [])
  const lastSearch = useState<SearchHistoryItem[]>('search_landing_history', () => [])
  const lastView = useState<ProductCard[]>('search_landing_last_view', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function loadLocalHistory() {
    if (!import.meta.client) return
    try {
      const rawHistory = localStorage.getItem(STORAGE_KEY_RECENT_SEARCH)
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory)
        if (Array.isArray(parsed) && lastSearch.value.length === 0) {
          lastSearch.value = parsed
        }
      }
      const rawViewed = localStorage.getItem(STORAGE_KEY_LAST_VIEWED)
      if (rawViewed) {
        const parsedView = JSON.parse(rawViewed)
        if (Array.isArray(parsedView) && lastView.value.length === 0) {
          lastView.value = parsedView
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  function saveLocalHistory(items: SearchHistoryItem[]) {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY_RECENT_SEARCH, JSON.stringify(items.slice(0, 30)))
    } catch {
      // ignore
    }
  }

  function addRecentKeyword(keyword: string) {
    const clean = keyword.trim()
    if (!clean) return
    const filtered = lastSearch.value.filter(
      (item) => item.keyword.toLowerCase() !== clean.toLowerCase()
    )
    const updated: SearchHistoryItem[] = [
      { id: `${Date.now()}`, keyword: clean, createdAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 30)
    lastSearch.value = updated
    saveLocalHistory(updated)
  }

  function addLastViewedProduct(product: ProductCard) {
    if (!product || (!product.id && !product._id)) return
    const prodId = product.id || product._id
    const filtered = lastView.value.filter((p) => (p.id || p._id) !== prodId)
    const updated = [product, ...filtered].slice(0, 12)
    lastView.value = updated
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_LAST_VIEWED, JSON.stringify(updated))
      } catch {
        // ignore
      }
    }
  }

  async function fetchEmptyLanding() {
    loading.value = true
    error.value = null
    loadLocalHistory()
    try {
      const res = await api.post<{
        status?: boolean
        message?: string
        result?: {
          category_data?: SearchCategoryItem[]
          last_search?: SearchHistoryItem[]
          last_view?: ProductCard[]
        }
      }>(API_PRODUCT_SEARCH_EMPTY, {})

      const data = res?.result
      if (data) {
        if (Array.isArray(data.category_data)) {
          categoryData.value = data.category_data
        }
        if (Array.isArray(data.last_search) && data.last_search.length > 0) {
          lastSearch.value = data.last_search
          saveLocalHistory(data.last_search)
        }
        if (Array.isArray(data.last_view) && data.last_view.length > 0) {
          lastView.value = data.last_view
        }
      }
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat riwayat pencarian'
    } finally {
      loading.value = false
    }
  }

  async function deleteKeyword(keyword: string) {
    const clean = keyword.trim()
    lastSearch.value = lastSearch.value.filter((item) => item.keyword !== clean)
    saveLocalHistory(lastSearch.value)
    if (authStore.isLoggedIn) {
      try {
        await api.post(API_MYSEARCH_DELETE, { keyword: clean })
      } catch {
        // ignore
      }
    }
  }

  async function deleteAllKeywords() {
    lastSearch.value = []
    saveLocalHistory([])
    if (authStore.isLoggedIn) {
      try {
        await api.post(API_MYSEARCH_DELETE, { all: true })
      } catch {
        // ignore
      }
    }
  }

  return {
    categoryData,
    lastSearch,
    lastView,
    loading,
    error,
    fetchEmptyLanding,
    addRecentKeyword,
    addLastViewedProduct,
    deleteKeyword,
    deleteAllKeywords,
    loadLocalHistory,
  }
}

