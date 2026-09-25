import { API_DASHBOARD_CATEGORY_ALL } from '~/utils/constants'

export interface Category {
  id: string
  _id?: string
  name: string
  image: string
  total_product?: number
}

export function useCategories() {
  const api = useApi()
  const categories = useState<Category[]>('home_categories', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const mainCategories = computed(() => {
    // Top 10 categories for mobile grid (5 cols x 2 rows) and desktop bar
    return categories.value.slice(0, 10)
  })

  async function fetchCategories(): Promise<Category[]> {
    if (categories.value.length > 0) return categories.value

    loading.value = true
    error.value = null
    try {
      const res = await api.post<{ result?: Category[]; message?: string }>(
        API_DASHBOARD_CATEGORY_ALL,
        { lang: 'id' }
      )
      const list = res?.result || []
      categories.value = list
      return list
    } catch (err: any) {
      console.warn('[useCategories] Failed to fetch categories:', err)
      error.value = err?.message || 'Gagal memuat kategori'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    mainCategories,
    loading,
    error,
    fetchCategories,
  }
}
