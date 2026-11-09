import { ref } from 'vue'
import {
  API_PRODUCT_MYPOST,
  API_POST_SELL_DELETE,
  API_POST_SELLED,
  API_POST_SELL_CANCEL,
  CATALOG_STATUS_ALL,
  CATALOG_STATUS_ACTIVE,
  CATALOG_STATUS_CANCELED,
  CATALOG_STATUS_SOLD,
} from '~/utils/constants'
import type {
  MyCatalogItem,
  MyCatalogCounts,
  MyCatalogResponse,
  StatusFilterItem,
} from '~/types/catalog'
import { useAuthStore } from '~/stores/auth'

export function useMyCatalog() {
  const api = useApi()
  const authStore = useAuthStore()
  const { showNotification } = useNotification()

  const items = ref<MyCatalogItem[]>([])
  const loading = ref<boolean>(true)
  const loadingMore = ref<boolean>(false)
  const error = ref<string | null>(null)

  const page = ref<number>(1)
  const hasMore = ref<boolean>(false)
  const totalDocs = ref<number>(0)

  const selectedStatus = ref<number>(CATALOG_STATUS_ALL)
  const selectedType = ref<number>(0) // 0: Semua, 1: Jual, 2: Dibutuhkan
  const searchQuery = ref<string>('')

  const counts = ref<MyCatalogCounts>({
    all: 0,
    active: 0,
    canceled: 0,
    sold: 0,
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const statusList: StatusFilterItem[] = [
    { status: CATALOG_STATUS_ALL, label: 'Semua' },
    { status: CATALOG_STATUS_ACTIVE, label: 'Aktif' },
    { status: CATALOG_STATUS_CANCELED, label: 'Dibatalkan' },
    { status: CATALOG_STATUS_SOLD, label: 'Terjual' },
  ]

  function getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) return err.message
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message
    }
    return fallback
  }

  function extractStep(item: MyCatalogItem): number {
    if (item.step !== undefined && item.step !== null) {
      return Number(item.step)
    }
    const name = (item.status?.name || '').toLowerCase()
    if (name.includes('tayang') || name.includes('verifikasi') || name.includes('aktif')) {
      return 1
    }
    if (name.includes('terjual') || name.includes('ditemukan')) {
      return 2
    }
    if (name.includes('batal') || name.includes('tolak') || name.includes('kadaluarsa') || name.includes('nonaktif')) {
      return 3
    }
    return 1
  }

  function recalculateCountsFromMemory() {
    let active = 0
    let canceled = 0
    let sold = 0
    for (const item of items.value) {
      const step = extractStep(item)
      if (step === 0 || step === 1) active++
      else if (step === 3 || step === 4 || step === 5) canceled++
      else if (step === 2) sold++
    }
    counts.value = {
      all: totalDocs.value || items.value.length,
      active,
      canceled,
      sold,
    }
  }

  async function fetchMyPosts(isRefresh = false) {
    if (!authStore.isLoggedIn) {
      loading.value = false
      return
    }

    if (isRefresh) {
      page.value = 1
      loading.value = true
      error.value = null
    } else {
      loadingMore.value = true
    }

    try {
      let apiType: number | undefined
      if (selectedType.value === 1) {
        apiType = 0 // Jual (Direct, Auction, Service)
      } else if (selectedType.value === 2) {
        apiType = 1 // Dibutuhkan (Needed)
      }

      const body: Record<string, unknown> = {
        page: page.value,
        filter: searchQuery.value.trim(),
        status: selectedStatus.value,
        lang: 'id',
      }
      if (apiType !== undefined) {
        body.type = apiType
      }

      const res = await api.post<MyCatalogResponse>(API_PRODUCT_MYPOST, body)

      const result = res?.result
      const docs = result?.docs || []

      if (isRefresh || page.value === 1) {
        items.value = docs
      } else {
        items.value = [...items.value, ...docs]
      }

      hasMore.value = Boolean(result?.hasNextPage)
      totalDocs.value = result?.totalDocs || 0

      if (result?.counts) {
        counts.value = {
          all: Number(result.counts.all) || 0,
          active: Number(result.counts.active) || 0,
          canceled: Number(result.counts.canceled) || 0,
          sold: Number(result.counts.sold) || 0,
        }
      } else if (isRefresh) {
        recalculateCountsFromMemory()
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Gagal memuat katalog iklan Anda.')
      showNotification({
        type: 'error',
        message: 'Gagal memuat katalog iklan Anda.',
      })
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    page.value += 1
    await fetchMyPosts(false)
  }

  function onSearch(query: string) {
    searchQuery.value = query
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchMyPosts(true)
    }, 400)
  }

  function setStatus(status: number) {
    if (selectedStatus.value !== status) {
      selectedStatus.value = status
      fetchMyPosts(true)
    }
  }

  function setType(typeNum: number) {
    if (selectedType.value !== typeNum) {
      selectedType.value = typeNum
      fetchMyPosts(true)
    }
  }

  async function deleteProduct(productId: string): Promise<boolean> {
    try {
      await api.post(API_POST_SELL_DELETE, { product_id: productId })
      showNotification({
        type: 'success',
        message: 'Iklan berhasil dihapus.',
      })
      await fetchMyPosts(true)
      return true
    } catch (err: unknown) {
      showNotification({
        type: 'error',
        message: getErrorMessage(err, 'Gagal menghapus iklan.'),
      })
      return false
    }
  }

  async function markAsSold(productId: string): Promise<boolean> {
    try {
      await api.post(API_POST_SELLED, { product_id: productId })
      showNotification({
        type: 'success',
        message: 'Iklan berhasil ditandai terjual.',
      })
      await fetchMyPosts(true)
      return true
    } catch (err: unknown) {
      showNotification({
        type: 'error',
        message: getErrorMessage(err, 'Gagal mengubah status iklan.'),
      })
      return false
    }
  }

  async function cancelProduct(productId: string): Promise<boolean> {
    try {
      await api.post(API_POST_SELL_CANCEL, { product_id: productId })
      showNotification({
        type: 'success',
        message: 'Iklan berhasil dinonaktifkan/dibatalkan tayang.',
      })
      await fetchMyPosts(true)
      return true
    } catch (err: unknown) {
      showNotification({
        type: 'error',
        message: getErrorMessage(err, 'Gagal menonaktifkan iklan.'),
      })
      return false
    }
  }

  return {
    items,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    totalDocs,
    selectedStatus,
    selectedType,
    searchQuery,
    counts,
    statusList,
    fetchMyPosts,
    loadMore,
    onSearch,
    setStatus,
    setType,
    deleteProduct,
    markAsSold,
    cancelProduct,
  }
}

