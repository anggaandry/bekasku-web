import { useSellerSearch, type SellerSortOption } from '~/composables/useSellerSearch'
import { useCategories } from '~/composables/useCategories'
import type { SellerResult } from '~/types/search'

export interface BekaskuPlusSortItem {
  key: SellerSortOption
  shortLabel: string
  label: string
}

export const BEKASKU_PLUS_SORT_OPTIONS: BekaskuPlusSortItem[] = [
  { key: 'followers', shortLabel: 'Terpopuler', label: 'Terpopuler (Pengikut Terbanyak)' },
  { key: 'rating', shortLabel: 'Rating Tertinggi', label: 'Rating Tertinggi' },
  { key: 'newest', shortLabel: 'Terbaru', label: 'Terbaru' },
]

export function useBekaskuPlusSellers() {
  const { searchSellers } = useSellerSearch()
  const { categories, fetchCategories } = useCategories()

  const sellers = ref<SellerResult[]>([])
  const totalSellers = ref(0)
  const loading = ref(true)
  const loadingMore = ref(false)
  const hasMore = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)

  const searchQuery = ref('')
  const selectedCategoryId = ref('')
  const selectedCategoryName = ref('Semua')
  const selectedSort = ref<SellerSortOption>('followers')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const categoryOptions = computed(() => {
    const base = [{ id: '', label: 'Semua Kategori' }]
    const mapped = categories.value
      .filter((c) => c.id && c.id !== 'all')
      .map((c) => ({ id: String(c.id), label: c.name }))
    return [...base, ...mapped]
  })

  const sortOptions = computed(() =>
    BEKASKU_PLUS_SORT_OPTIONS.map((item) => ({ id: item.key, label: item.label }))
  )

  const activeSortShortLabel = computed(() => {
    return (
      BEKASKU_PLUS_SORT_OPTIONS.find((item) => item.key === selectedSort.value)?.shortLabel ||
      'Terpopuler'
    )
  })

  const isCategoryFiltered = computed(() =>
    Boolean(selectedCategoryId.value && selectedCategoryId.value !== 'all')
  )

  const hasActiveFilters = computed(() =>
    Boolean(searchQuery.value.trim() || isCategoryFiltered.value || selectedSort.value !== 'followers')
  )

  async function fetchSellers(refresh = true) {
    if (refresh) {
      page.value = 1
      hasMore.value = false
      loading.value = true
      error.value = null
    } else {
      if (!hasMore.value || loadingMore.value) return
      loadingMore.value = true
    }

    try {
      const res = await searchSellers({
        page: page.value,
        limit: 10,
        bekaskuPlus: true,
        sort: selectedSort.value,
        filter: searchQuery.value.trim(),
        categoryId: isCategoryFiltered.value ? selectedCategoryId.value : '',
        saveHistory: false,
      })

      const docs = Array.isArray(res.docs) ? res.docs : []
      totalSellers.value = Number(res.totalDocs ?? docs.length) || 0
      hasMore.value = Boolean(res.hasNextPage)

      if (refresh) {
        sellers.value = docs
      } else {
        sellers.value = [...sellers.value, ...docs]
      }

      if (hasMore.value) {
        page.value += 1
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal memuat daftar penjual BekasKu+'
      if (refresh) sellers.value = []
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function onSearchInput() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchSellers(true)
    }, 400)
  }

  function clearSearch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    searchQuery.value = ''
    fetchSellers(true)
  }

  function setCategory(id: string, label: string) {
    selectedCategoryId.value = id
    selectedCategoryName.value = id ? label : 'Semua'
    fetchSellers(true)
  }

  function setSort(sortKey: SellerSortOption) {
    if (selectedSort.value === sortKey) return
    selectedSort.value = sortKey
    fetchSellers(true)
  }

  function resetFilters() {
    if (debounceTimer) clearTimeout(debounceTimer)
    searchQuery.value = ''
    selectedCategoryId.value = ''
    selectedCategoryName.value = 'Semua'
    selectedSort.value = 'followers'
    fetchSellers(true)
  }

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    sellers,
    totalSellers,
    loading,
    loadingMore,
    hasMore,
    error,
    searchQuery,
    selectedCategoryId,
    selectedCategoryName,
    selectedSort,
    categoryOptions,
    sortOptions,
    activeSortShortLabel,
    isCategoryFiltered,
    hasActiveFilters,
    fetchCategories,
    fetchSellers,
    onSearchInput,
    clearSearch,
    setCategory,
    setSort,
    resetFilters,
  }
}
