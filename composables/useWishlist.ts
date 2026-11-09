import {
  API_FAVORITE_LIST,
  API_WISHLIST_UPDATE,
  WISHLIST_TYPE_ALL,
  WISHLIST_TYPE_BEST_DEAL,
  WISHLIST_TYPE_NEEDED,
  SEARCH_DEBOUNCE_MS,
} from '~/utils/constants'
import type { ProductCard } from '~/types/product'
import type { WishlistFilterOption } from '~/types/wishlist'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

function productKey(p: ProductCard): string {
  return String(p._id || p.id || '')
}

export function useWishlist() {
  const api = useApi()
  const authStore = useAuthStore()
  const wishlistStore = useWishlistStore()

  const items = ref<ProductCard[]>([])
  const loading = ref<boolean>(false)
  const searchLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const filterQuery = ref<string>('')
  const filterType = ref<number>(WISHLIST_TYPE_ALL)

  // 3 Opsi Filter persis mobile V3: Semua (0), Best Deal (2), Dibutuhkan (4)
  const filterOptions: WishlistFilterOption[] = [
    { label: 'Semua', type: WISHLIST_TYPE_ALL },
    { label: 'Best Deal', type: WISHLIST_TYPE_BEST_DEAL },
    { label: 'Dibutuhkan', type: WISHLIST_TYPE_NEEDED },
  ]

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Fetch daftar produk wishlist dari backend
  async function fetchWishlist(isSearch = false) {
    if (!authStore.isLoggedIn) {
      items.value = []
      loading.value = false
      searchLoading.value = false
      return
    }

    if (isSearch) {
      searchLoading.value = true
    } else {
      loading.value = true
    }
    error.value = null

    try {
      const res = await api.post<{ result?: ProductCard[] }>(API_FAVORITE_LIST, {
        filter: filterQuery.value.trim(),
        type: filterType.value,
      })

      const data = res?.result || []
      items.value = data

      // Sinkronkan kumpulan ID ke Pinia wishlistStore
      const ids = data.map(productKey).filter(Boolean)
      wishlistStore.setWishlistedIds(ids)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat wishlist'
      items.value = []
    } finally {
      loading.value = false
      searchLoading.value = false
    }
  }

  // Handle Search Input dengan Debounce 500ms
  function onSearchInput(query: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    filterQuery.value = query
    searchLoading.value = true
    debounceTimer = setTimeout(() => {
      fetchWishlist(true)
    }, SEARCH_DEBOUNCE_MS)
  }

  // Handle Perubahan Tab Filter
  function setFilterType(type: number) {
    if (filterType.value === type) return
    filterType.value = type
    fetchWishlist()
  }

  // Toggle Wishlist (Hapus/Tambah)
  // Backend mengembalikan result: true jika DELETED, result: false jika ADDED
  async function toggleWishlist(productId: string): Promise<{ success: boolean; isDeleted?: boolean }> {
    if (!authStore.isLoggedIn) {
      return { success: false }
    }

    try {
      const res = await api.post<{ result?: boolean }>(API_WISHLIST_UPDATE, {
        product_id: productId,
      })

      const isDeleted = res?.result === true
      wishlistStore.toggleLocal(productId, isDeleted)

      // Jika dihapus saat di halaman wishlist, update list lokal secara optimistis
      if (isDeleted) {
        items.value = items.value.filter(p => productKey(p) !== productId)
      }

      return { success: true, isDeleted }
    } catch {
      return { success: false }
    }
  }

  return {
    items,
    loading,
    searchLoading,
    error,
    filterQuery,
    filterType,
    filterOptions,
    fetchWishlist,
    onSearchInput,
    setFilterType,
    toggleWishlist,
    isWishlisted: wishlistStore.isWishlisted,
  }
}

