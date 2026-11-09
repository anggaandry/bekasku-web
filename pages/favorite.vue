<script setup lang="ts">
import { useWishlist } from '~/composables/useWishlist'
import { useAuthStore } from '~/stores/auth'
import { useProducts } from '~/composables/useProducts'
import WishlistHeader from '~/components/wishlist/WishlistHeader.vue'
import WishlistTabs from '~/components/wishlist/WishlistTabs.vue'
import WishlistEmptyState from '~/components/wishlist/WishlistEmptyState.vue'
import AppProductCard from '~/components/shared/AppProductCard.vue'
import type { ProductCard } from '~/types/product'

useHead({
  title: 'Wishlist — BekasKu',
  meta: [
    { name: 'description', content: 'Daftar produk favorit Anda di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const {
  items: wishlistItems,
  loading: wishlistLoading,
  searchLoading,
  error: wishlistError,
  filterQuery,
  filterType,
  filterOptions,
  fetchWishlist,
  onSearchInput,
  setFilterType,
} = useWishlist()

const { fetchRecommendations } = useProducts()

const recommendations = ref<ProductCard[]>([])
const loadingRecom = ref(false)
const recomPage = ref(1)
const hasNextRecom = ref(true)

watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      fetchWishlist()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (authStore.isLoggedIn && wishlistItems.value.length === 0) {
    await fetchWishlist()
  }
  await loadRecommendations(true)
})

async function loadRecommendations(reset = false) {
  if (loadingRecom.value) return
  if (reset) {
    recomPage.value = 1
    hasNextRecom.value = true
  }

  loadingRecom.value = true
  try {
    const res = await fetchRecommendations({
      page: recomPage.value,
      limit: 15,
    })

    const docs = res.docs || []
    if (reset) {
      recommendations.value = docs
    } else {
      recommendations.value = [...recommendations.value, ...docs]
    }

    if (docs.length < 15 || res.hasNextPage === false) {
      hasNextRecom.value = false
    }
  } catch {
    // Non-blocking
  } finally {
    loadingRecom.value = false
  }
}

async function handleLoadMore() {
  if (!hasNextRecom.value || loadingRecom.value) return
  recomPage.value += 1
  await loadRecommendations(false)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <!-- Header Sticky (Mobile AppBar & Search Input) -->
    <WishlistHeader
      v-model="filterQuery"
      :loading="searchLoading"
      @search="onSearchInput"
    />

    <!-- Tab Pilihan (Semua, Best Deal, Dibutuhkan) Sesuai Gambar 1 & 2 -->
    <div class="bg-white border-b border-border">
      <WishlistTabs
        :options="filterOptions"
        :selected-type="filterType"
        @select="setFilterType"
      />
    </div>

    <!-- Main Container -->
    <main class="flex-1 pb-16">
      <div class="max-w-[1200px] mx-auto px-4 py-4 space-y-6">
        <!-- ── SECTION 1: Wishlist Items / Empty / Guest ── -->
        <section>
          <!-- State Guest -->
          <div v-if="!authStore.isLoggedIn" class="bg-white rounded-2xl border border-border p-6 shadow-2xs">
            <WishlistEmptyState :is-guest="true" />
          </div>

          <!-- State Loading Awal Shimmer -->
          <div
            v-else-if="wishlistLoading && wishlistItems.length === 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
            >
              <div class="w-full aspect-square bg-muted rounded-lg" />
              <div class="h-4 bg-muted rounded w-2/3" />
              <div class="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>

          <!-- State Empty Wishlist (Sesuai Screenshot Mobile V3) -->
          <div
            v-else-if="wishlistItems.length === 0"
            class="bg-white rounded-2xl border border-border p-6 shadow-2xs"
          >
            <WishlistEmptyState />
          </div>

          <!-- State Wishlist Ada Produk (Sesuai Gambar 3) -->
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-semibold text-text font-outfit">
                {{ wishlistItems.length }} Barang Wishlist
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              <AppProductCard
                v-for="product in wishlistItems"
                :key="product._id || product.id"
                :product="product"
                :show-wishlist-button="true"
              />
            </div>
          </div>
        </section>

        <!-- Divider Halus Sesuai Mobile V3 -->
        <div class="h-2 bg-surface-2 -mx-4 sm:mx-0 sm:rounded-full border-y sm:border border-border/60" />

        <!-- ── SECTION 2: Sesuai Kesukaan Kamu (Rekomendasi) ── -->
        <section class="space-y-3.5">
          <h2 class="text-sm sm:text-base font-bold text-text font-outfit">
            Sesuai kesukaan kamu
          </h2>

          <div
            v-if="recommendations.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            <AppProductCard
              v-for="product in recommendations"
              :key="`recom_${product._id || product.id}`"
              :product="product"
              :show-wishlist-button="true"
            />
          </div>

          <!-- Loading Shimmer Rekomendasi -->
          <div
            v-if="loadingRecom"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-2"
          >
            <div
              v-for="i in (recommendations.length === 0 ? 10 : 5)"
              :key="`recom_shimmer_${i}`"
              class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
            >
              <div class="w-full aspect-square bg-muted rounded-lg" />
              <div class="h-4 bg-muted rounded w-2/3" />
              <div class="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>

          <!-- Tombol Load More Rekomendasi -->
          <div v-if="hasNextRecom && !loadingRecom" class="pt-4 flex justify-center">
            <button
              type="button"
              class="px-6 py-2.5 rounded-full border border-border-light bg-white hover:bg-surface-2 text-xs font-semibold text-text transition-colors cursor-pointer shadow-2xs font-outfit"
              @click="handleLoadMore"
            >
              Muat Lebih Banyak
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
