import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', () => {
  // Set ID produk yang ada di wishlist pengguna
  const wishlistedIds = ref<Set<string>>(new Set())

  function setWishlistedIds(ids: string[]) {
    wishlistedIds.value = new Set(ids.filter(Boolean))
  }

  function isWishlisted(id: string): boolean {
    if (!id) return false
    return wishlistedIds.value.has(id)
  }

  function addWishlist(id: string) {
    if (!id) return
    wishlistedIds.value.add(id)
  }

  function removeWishlist(id: string) {
    if (!id) return
    wishlistedIds.value.delete(id)
  }

  function toggleLocal(id: string, isDeleted: boolean) {
    if (isDeleted) {
      removeWishlist(id)
    } else {
      addWishlist(id)
    }
  }

  function clear() {
    wishlistedIds.value.clear()
  }

  return {
    wishlistedIds,
    setWishlistedIds,
    isWishlisted,
    addWishlist,
    removeWishlist,
    toggleLocal,
    clear,
  }
})

