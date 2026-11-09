import { API_SEARCH_KEY, SEARCH_DEBOUNCE_MS } from '~/utils/constants'
import type { SellerResult } from '~/types/search'
import { useSellerSearch } from './useSellerSearch'

export function useSearchSuggest() {
  const api = useApi()
  const { searchSellers } = useSellerSearch()

  const suggestions = ref<string[]>([])
  const sellerSuggestions = ref<SellerResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchSuggestions(params: {
    query: string
    categoryId?: string
    subcategoryId?: string
    type?: number
  }) {
    const trimmed = params.query.trim()
    if (!trimmed) {
      suggestions.value = []
      sellerSuggestions.value = []
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    try {
      const body: Record<string, any> = {
        filter: trimmed,
      }
      if (params.categoryId) body.category_id = params.categoryId
      if (params.subcategoryId) body.subcategory_id = params.subcategoryId
      if (params.type && params.type !== 0) body.type = params.type

      const [keyRes, sellerRes] = await Promise.all([
        api.post<{ message?: string; result?: string[] }>(API_SEARCH_KEY, body),
        searchSellers({ filter: trimmed, page: 1, saveHistory: false }),
      ])

      suggestions.value = Array.isArray(keyRes?.result) ? keyRes.result : []
      sellerSuggestions.value = sellerRes.docs || []
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat saran pencarian'
    } finally {
      loading.value = false
    }
  }

  function debouncedSuggest(params: {
    query: string
    categoryId?: string
    subcategoryId?: string
    type?: number
  }) {
    if (debounceTimer) clearTimeout(debounceTimer)
    const trimmed = params.query.trim()
    if (!trimmed) {
      suggestions.value = []
      sellerSuggestions.value = []
      loading.value = false
      return
    }
    loading.value = true
    debounceTimer = setTimeout(() => {
      fetchSuggestions(params)
    }, SEARCH_DEBOUNCE_MS)
  }

  function clearSuggestions() {
    if (debounceTimer) clearTimeout(debounceTimer)
    suggestions.value = []
    sellerSuggestions.value = []
    loading.value = false
  }

  return {
    suggestions,
    sellerSuggestions,
    loading,
    error,
    fetchSuggestions,
    debouncedSuggest,
    clearSuggestions,
  }
}

