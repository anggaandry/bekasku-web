import { ref, computed } from 'vue'
import {
  API_DASHBOARD_CATEGORY_ALL,
  API_DASHBOARD_SUBCATEGORY,
  API_PRODUCT_FILTER_CATEGORY,
  CATEGORY_LANG_DEFAULT,
} from '~/utils/constants'
import type { Category, Subcategory } from '~/types/category'
import type { SearchCategoryItem } from '~/types/search'

export type { Category, Subcategory }

export function useCategories() {
  const api = useApi()
  const categories = useState<Category[]>('home_categories', () => [])
  const filterCategories = useState<SearchCategoryItem[]>('search_filter_categories', () => [])
  const subcategories = ref<Subcategory[]>([])
  const loading = ref(false)
  const subcategoryLoading = ref(false)
  const error = ref<string | null>(null)
  const subcategoryError = ref<string | null>(null)

  const mainCategories = computed(() => {
    return categories.value.slice(0, 10)
  })

  async function fetchCategories(lang = CATEGORY_LANG_DEFAULT): Promise<Category[]> {
    if (categories.value.length > 0) return categories.value

    loading.value = true
    error.value = null
    try {
      const res = await api.post<{ result?: Category[]; message?: string }>(
        API_DASHBOARD_CATEGORY_ALL,
        { lang }
      )
      const list = Array.isArray(res?.result)
        ? res.result.map((c) => ({
            ...c,
            id: String(c.id || c._id || ''),
          }))
        : []
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

  async function fetchSubcategories(
    categoryId: string,
    lang = CATEGORY_LANG_DEFAULT
  ): Promise<Subcategory[]> {
    if (!categoryId) {
      subcategories.value = []
      return []
    }

    subcategoryLoading.value = true
    subcategoryError.value = null
    try {
      const res = await api.post<{ result?: Subcategory[]; message?: string }>(
        API_DASHBOARD_SUBCATEGORY,
        { category_id: categoryId, lang }
      )
      const list = Array.isArray(res?.result)
        ? res.result.map((sub) => ({
            id: String(sub.id || sub._id || ''),
            _id: String(sub._id || sub.id || ''),
            category: sub.category || '',
            name: sub.name || '',
            products: Array.isArray(sub.products) ? sub.products : [],
          }))
        : []
      subcategories.value = list
      return list
    } catch (err: any) {
      console.warn('[useCategories] Failed to fetch subcategories:', err)
      subcategoryError.value = err?.message || 'Gagal memuat subkategori'
      subcategories.value = []
      return []
    } finally {
      subcategoryLoading.value = false
    }
  }

  async function fetchFilterCategories(): Promise<SearchCategoryItem[]> {
    try {
      const [res] = await Promise.all([
        api.post<{
          status?: boolean
          result?: { docs?: SearchCategoryItem[] }
        }>(API_PRODUCT_FILTER_CATEGORY, {}).catch(() => null),
        categories.value.length === 0 ? fetchCategories() : Promise.resolve(categories.value),
      ])

      const map = new Map<string, SearchCategoryItem>()
      for (const c of categories.value) {
        const key = (c.name || '').toLowerCase().trim()
        if (key) {
          map.set(key, {
            id: c.id || c._id || '',
            _id: c._id || c.id || '',
            name: c.name,
            image: c.image,
          })
        }
      }
      if (Array.isArray(res?.result?.docs)) {
        for (const c of res!.result!.docs) {
          const key = (c.name || '').toLowerCase().trim()
          if (key && !map.has(key)) {
            map.set(key, c)
          }
        }
      }
      filterCategories.value = Array.from(map.values())
      return filterCategories.value
    } catch {
      return filterCategories.value
    }
  }

  function resolveCategory(paramIdOrSlug: string, list: Category[] = categories.value): Category | null {
    if (!list || list.length === 0) return null
    const raw = (paramIdOrSlug || '').trim()
    if (!raw || raw === 'all' || raw === 'semua') {
      return list[0] || null
    }

    // 1. Direct ID match
    const byId = list.find((c) => String(c.id || c._id) === raw)
    if (byId) return byId

    // 2. Normalized name / slug match (e.g. 'fesyen_wanita', 'fashion-wanita', 'elektronik')
    const normalized = raw.toLowerCase().replace(/[-_]+/g, ' ').trim()
    const byName = list.find((c) => {
      const cName = (c.name || '').toLowerCase().trim()
      return (
        cName === normalized ||
        cName.includes(normalized) ||
        normalized.includes(cName)
      )
    })
    return byName || null
  }

  return {
    categories,
    filterCategories,
    subcategories,
    mainCategories,
    loading,
    subcategoryLoading,
    error,
    subcategoryError,
    fetchCategories,
    fetchSubcategories,
    fetchFilterCategories,
    resolveCategory,
  }
}
