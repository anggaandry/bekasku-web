<template>
  <div class="min-h-screen flex flex-col bg-surface text-text">
    <!-- Accessible SEO H1 -->
    <h1 class="sr-only">
      {{ pageHeading }}
    </h1>

    <!-- Mobile Sticky Header: Top Bar + 2-Column Tabs (Produk | Toko) + Quick Filter/Sort Chips (Mobile Only < md, matching Flutter V3 AppBar.bottom) -->
    <div class="sticky top-0 z-40 bg-white md:hidden">
      <SearchResultHeader
        :display-query="displayQueryText"
        :placeholder="searchPlaceholder"
        :active-tab="activeTab"
        :cart-count="cartStore.totalItems"
        @back="handleBack"
        @click-search="goToSearchLanding"
        @change-tab="switchTab"
        @open-notifications="handleOpenNotifications"
        @open-cart="handleProtectedNav('/cart')"
      />

      <SearchFilterChips
        :filters="currentFilters"
        @toggle-best-deal="toggleBestDeal"
        @toggle-instant="toggleInstant"
        @toggle-rating4="toggleRating4"
        @open-location="showLocationModal = true"
        @open-filter="showFilterModal = true"
        @open-sort="showSortModal = true"
      />
    </div>

    <!-- Main Content Area (Mobile Full-Width, Desktop 12-Col with Left Filter/Sort/Tab Sidebar on md+) -->
    <main class="flex-1 w-full max-w-[1400px] min-h-[70vh] mx-auto pb-10 md:pb-12">
      <div class="md:grid md:grid-cols-12 md:gap-5 lg:gap-6 md:px-4 lg:px-6 md:pt-5">
        <!-- Desktop Permanent Left Sidebar: Tab (Produk | Toko) + Sort + Filter (md+) -->
        <div class="hidden md:block md:col-span-4 lg:col-span-3">
          <SearchDesktopSidebar
            :filters="currentFilters"
            :categories="availableCategories"
            :active-tab="activeTab"
            @change-tab="switchTab"
            @apply="applyFilterPatch"
            @reset="resetAllFilters"
            @open-location-selector="showLocationModal = true"
          />
        </div>

        <!-- Results Column (md: 8 cols, lg: 9 cols) -->
        <div class="md:col-span-8 lg:col-span-9">
          <!-- Visual Search Banner (When mode=visual) -->
          <VisualSearchBanner
            v-if="isVisualMode"
            :preview-url="searchStore.visualPreviewUrl"
            :is-empty="productList.length === 0"
            :loading="isProductLoading"
            :duration-ms="searchStore.queryDurationMs"
            @select-file="onSelectVisualFile"
          />

          <!-- BekasKu+ Program Highlight Banner (When type=10, matching SearchResultsView L575) -->
          <div
            v-if="currentFilters.type === SEARCH_TYPE_BEKASKU_PLUS && activeTab === 'product'"
            class="bg-primary text-white px-4 py-3 mb-2 flex items-center gap-3 lg:rounded-xl"
          >
            <Crown class="w-6 h-6 text-white shrink-0" />
            <div>
              <h2 class="font-outfit font-bold text-base leading-tight">
                BekasKu+
              </h2>
              <p class="font-outfit text-xs text-white/85">
                Produk pilihan dengan kualitas terbaik
              </p>
            </div>
          </div>

          <!-- Best Deal Countdown Highlight Banner (When type=2, matching Promo page) -->
          <div
            v-if="currentFilters.type === SEARCH_TYPE_BEST_DEAL && activeTab === 'product' && productList.length > 0"
            class="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-5 py-3.5 mb-3 md:rounded-2xl flex items-center justify-between gap-4 shadow-xs"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="font-outfit font-bold text-base sm:text-lg tracking-tight">
                  Best Deal BekasKu
                </span>
                <ClientOnly>
                  <div
                    v-if="bdRemainingSeconds > 0"
                    class="bg-white/15 backdrop-blur-xs text-white text-xs font-bold font-mono px-2.5 py-1 rounded-md flex items-center gap-1 tracking-wider"
                  >
                    <Clock class="w-3.5 h-3.5 mr-0.5 shrink-0" />
                    <span>{{ formatBdDigit(bdHours) }}</span>
                    <span class="text-white/80">:</span>
                    <span>{{ formatBdDigit(bdMinutes) }}</span>
                    <span class="text-white/80">:</span>
                    <span>{{ formatBdDigit(bdSeconds) }}</span>
                  </div>
                  <span
                    v-else
                    class="px-2.5 py-0.5 rounded-md bg-white/15 text-white font-outfit font-bold text-xs"
                  >
                    Promo Aktif
                  </span>
                </ClientOnly>
              </div>
              <p class="font-outfit text-xs sm:text-sm text-white/90 mt-1">
                Semua promo hanya untuk kamu!
              </p>
            </div>

            <img
              src="/images/discounttag.png"
              alt="Best Deal BekasKu"
              width="76"
              height="64"
              class="w-16 h-14 sm:w-20 sm:h-16 object-contain shrink-0 select-none"
            />
          </div>

          <!-- Shimmer Skeleton Loading State (initial load & filter/sort/tab transitions) -->
          <template v-if="isInitialResultsLoading">
            <div v-if="activeTab === 'product'" class="px-3 sm:px-4 md:px-0 pt-3 md:pt-0">
              <ProductGrid
                :products="[]"
                :loading="true"
                :columns="4"
                :skeleton-count="20"
              />
            </div>

            <div v-else class="p-4 md:p-0 space-y-4">
              <div
                v-for="n in 4"
                :key="`store-trans-skel-${n}`"
                class="bg-white rounded-xl border border-border p-4 space-y-3 animate-shimmer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full bg-border" />
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-border rounded w-1/3" />
                    <div class="h-3 bg-surface-2 rounded w-1/4" />
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2.5 pt-2">
                  <div class="aspect-square rounded-xl bg-border" />
                  <div class="aspect-square rounded-xl bg-border" />
                  <div class="aspect-square rounded-xl bg-border" />
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 1: PRODUK -->
          <template v-else-if="activeTab === 'product'">
            <!-- Highlighted Top Store Card with Products -->
            <SearchTopSeller
              v-if="topSellerWithProducts && !isVisualMode"
              :seller="topSellerWithProducts"
              button-variant="solid"
            />

            <!-- Error State -->
            <AppErrorState
              v-if="productError && productList.length === 0 && !isProductLoading"
              :message="productError"
              @retry="reloadCurrentTab"
            />

            <!-- Empty State -->
            <AppEmptyState
              v-else-if="!isProductLoading && productList.length === 0"
              title="Produk tidak ditemukan"
              description="Coba gunakan kata kunci lain atau kurangi filter pencarian Anda."
            />

            <!-- Product Grid (2 cols on mobile, 3 on tablet, 4 on lg+ with sidebar) -->
            <div v-else class="px-3 sm:px-4 md:px-0 pt-3 md:pt-0">
              <ProductGrid
                :products="productList"
                :loading="isProductLoading"
                :has-more="hasMoreProducts"
                :columns="4"
                :skeleton-count="20"
                @load-more="loadMoreProducts"
                @select="onSelectProduct"
              />
            </div>
          </template>

          <!-- TAB 2: TOKO -->
          <template v-else>
            <!-- Shimmer Loading for Store List -->
            <div v-if="sellerLoading && sellerList.length === 0" class="p-4 md:p-0 space-y-4">
              <div
                v-for="n in 4"
                :key="`store-skel-${n}`"
                class="bg-white rounded-xl border border-border p-4 space-y-3 animate-shimmer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full bg-border" />
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-border rounded w-1/3" />
                    <div class="h-3 bg-surface-2 rounded w-1/4" />
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2.5 pt-2">
                  <div class="aspect-square rounded-xl bg-border" />
                  <div class="aspect-square rounded-xl bg-border" />
                  <div class="aspect-square rounded-xl bg-border" />
                </div>
              </div>
            </div>

            <!-- Empty Store State -->
            <AppEmptyState
              v-else-if="!sellerLoading && sellerList.length === 0"
              title="Toko tidak ditemukan"
              description="Belum ada penjual yang cocok dengan kata kunci atau filter ini."
            />

            <!-- Store Cards List -->
            <div v-else class="divide-y divide-border md:divide-y-0">
              <SearchTopSeller
                v-for="(seller, sIdx) in sellerList"
                :key="seller.id || seller._id || sIdx"
                :seller="seller"
                button-variant="outline"
              />

              <!-- Load More Stores Button -->
              <div v-if="hasMoreSellers" class="flex justify-center py-5">
                <button
                  type="button"
                  :disabled="sellerLoading"
                  class="bg-white hover:bg-surface-2 border-2 border-text text-text font-outfit font-bold text-xs sm:text-sm px-8 py-2.5 rounded-full cursor-pointer"
                  @click="loadMoreSellers"
                >
                  {{ sellerLoading ? 'Memuat Toko...' : 'Muat Lebih Banyak Toko' }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- Filter Bottom Sheet / Modal -->
    <SearchFilterSheet
      v-model="showFilterModal"
      :filters="currentFilters"
      :categories="availableCategories"
      @apply="applyFilterPatch"
      @open-location-selector="openLocationFromFilter"
    />

    <!-- Sort Bottom Sheet / Modal -->
    <SearchSortSheet
      v-model="showSortModal"
      :filters="currentFilters"
      @apply="applyFilterPatch"
    />

    <!-- Province & City Location Selector Modal -->
    <SearchLocationModal
      v-model="showLocationModal"
      @select="applyFilterPatch"
    />

    <!-- Guest Auth Modal -->
    <AppGuestAuthModal v-model="showGuestModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Crown, Clock } from 'lucide-vue-next'
import {
  SEARCH_TYPE_BEST_DEAL,
  SEARCH_TYPE_BEKASKU_PLUS,
  SEARCH_TYPE_REGULAR,
  SEARCH_MAX_ITEMS,
} from '~/utils/constants'
import type { ProductCard } from '~/types/product'
import type { SearchFilters, SellerResult } from '~/types/search'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useLocationStore } from '~/stores/location'
import { useSearchStore } from '~/stores/search'
import { useSearchQuery } from '~/composables/useSearchQuery'
import { useProductSearch } from '~/composables/useProductSearch'
import { useSellerSearch } from '~/composables/useSellerSearch'
import { useVisualSearch } from '~/composables/useVisualSearch'
import { useSearchLanding } from '~/composables/useSearchLanding'
import { useCategories } from '~/composables/useCategories'

import SearchResultHeader from '~/components/search/SearchResultHeader.vue'
import SearchFilterChips from '~/components/search/SearchFilterChips.vue'
import SearchTopSeller from '~/components/search/SearchTopSeller.vue'
import VisualSearchBanner from '~/components/search/VisualSearchBanner.vue'
import SearchFilterSheet from '~/components/search/SearchFilterSheet.vue'
import SearchSortSheet from '~/components/search/SearchSortSheet.vue'
import SearchLocationModal from '~/components/search/SearchLocationModal.vue'
import SearchDesktopSidebar from '~/components/search/SearchDesktopSidebar.vue'
import ProductGrid from '~/components/shared/ProductGrid.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import AppGuestAuthModal from '~/components/shared/AppGuestAuthModal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const locationStore = useLocationStore()
const searchStore = useSearchStore()
const notificationDrawer = useNotificationDrawer()
const { parseFiltersFromRoute, buildQueryFromFilters, updateRouteFilters } = useSearchQuery()
const { search: searchProducts, loading: productSearchLoading, error: productError } = useProductSearch()
const {
  searchSellers,
  fetchFirstSellerWithProducts,
  topSellerWithProducts,
  loading: sellerLoading,
} = useSellerSearch()
const { searchByImage, loading: visualLoading } = useVisualSearch()
const { addLastViewedProduct } = useSearchLanding()
const { filterCategories: availableCategories, fetchFilterCategories } = useCategories()

const currentFilters = computed<SearchFilters>(() => parseFiltersFromRoute())
const activeTab = computed<'product' | 'store'>(() => currentFilters.value.tab || 'product')
const isVisualMode = computed(() => currentFilters.value.mode === 'visual')

const productList = ref<ProductCard[]>([])
const sellerList = ref<SellerResult[]>([])
const productPage = ref(1)
const sellerPage = ref(1)
const hasMoreProducts = ref(false)
const hasMoreSellers = ref(false)

const showFilterModal = ref(false)
const showSortModal = ref(false)
const showLocationModal = ref(false)
const showGuestModal = ref(false)
const isTransitionLoading = ref(false)

const isProductLoading = computed(() => productSearchLoading.value || visualLoading.value)

const isInitialResultsLoading = computed(() => {
  if (isTransitionLoading.value) return true
  if (activeTab.value === 'product') {
    return (ssrPending.value || isProductLoading.value) && productList.value.length === 0
  }
  return (ssrPending.value || sellerLoading.value) && sellerList.value.length === 0
})

const displayQueryText = computed(() => {
  if (isVisualMode.value) return 'Hasil Pencarian Foto'
  const f = currentFilters.value
  if (f.q) {
    if (f.categoryName) return `${f.q} di ${f.categoryName}`
    if (f.type === SEARCH_TYPE_BEST_DEAL) return `${f.q} di Best Deal`
    return f.q
  }
  if (f.categoryName) return f.categoryName
  if (f.type === SEARCH_TYPE_BEKASKU_PLUS) return 'BekasKu+ di BekasKu'
  if (f.type === SEARCH_TYPE_BEST_DEAL) return 'Best Deal'
  return ''
})

const searchPlaceholder = computed(() => {
  const f = currentFilters.value
  if (f.categoryName) return `Cari di ${f.categoryName}`
  if (f.type === SEARCH_TYPE_BEST_DEAL) return 'Cari di Best Deal'
  return 'Cari di BekasKu'
})

const pageHeading = computed(() => {
  if (isVisualMode.value) return 'Hasil Pencarian Foto — BekasKu'
  if (currentFilters.value.q) return `Hasil pencarian "${currentFilters.value.q}" — BekasKu`
  if (currentFilters.value.categoryName) return `Kategori ${currentFilters.value.categoryName} — BekasKu`
  return 'Hasil Pencarian Produk & Toko — BekasKu'
})

const hasOnlyCleanQuery = computed(() => {
  const f = currentFilters.value
  return Boolean(
    f.q &&
    !isVisualMode.value &&
    !f.minPrice &&
    !f.maxPrice &&
    !f.freeOngkir &&
    !f.trusted &&
    !f.verified &&
    !f.vip &&
    !f.rating
  )
})

useHead(() => ({
  title: currentFilters.value.q
    ? `Hasil pencarian "${currentFilters.value.q}" — BekasKu`
    : `${pageHeading.value}`,
  meta: [
    {
      name: 'description',
      content: currentFilters.value.q
        ? `Jual beli ${currentFilters.value.q} bekas dan preloved berkualitas dengan harga terbaik di BekasKu.`
        : 'Temukan ribuan produk barang bekas dan preloved berkualitas di BekasKu.',
    },
    {
      name: 'robots',
      content: hasOnlyCleanQuery.value ? 'index, follow' : 'noindex, follow',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: currentFilters.value.q
        ? `https://bekasku.id/search/result?q=${encodeURIComponent(currentFilters.value.q)}`
        : 'https://bekasku.id/search/result',
    },
  ],
}))

const ssrKey = computed(() => `search-ssr-${JSON.stringify(route.query)}`)
const { data: initialSsrData, pending: ssrPending } = await useAsyncData(
  ssrKey.value,
  async () => {
    const f = parseFiltersFromRoute()
    if (f.mode === 'visual') {
      return null
    }
    if (f.tab === 'store') {
      const sRes = await searchSellers({
        filter: f.q || '',
        type: f.type,
        rating: f.rating,
        cities: f.cities,
        city: f.city,
        categoryId: f.categoryId,
        locationId: f.locationId,
        provinceName: f.provinceName,
        verified: f.verified,
        trusted: f.trusted,
        vip: f.vip,
        page: 1,
      })
      return { tab: 'store' as const, sellers: sRes }
    }
    const pRes = await searchProducts({
      filter: f.filter,
      type: f.type,
      categoryId: f.categoryId,
      subcategoryId: f.subcategoryId,
      locationId: f.locationId,
      provinceName: f.provinceName,
      city: f.city,
      cities: f.cities,
      minPrice: f.minPrice,
      maxPrice: f.maxPrice,
      newest: f.newest,
      cheapest: f.cheapest,
      mostExpensive: f.mostExpensive,
      freeOngkir: f.freeOngkir,
      trusted: f.trusted,
      verified: f.verified,
      vip: f.vip,
      needed: f.needed,
      rating: f.rating,
      page: 1,
    })
    return { tab: 'product' as const, products: pRes }
  },
  { lazy: true }
)

const bdRemainingSeconds = ref(0)
let bdCountdownTimer: ReturnType<typeof setInterval> | null = null

const bdHours = computed(() => Math.floor(bdRemainingSeconds.value / 3600))
const bdMinutes = computed(() => Math.floor((bdRemainingSeconds.value % 3600) / 60))
const bdSeconds = computed(() => bdRemainingSeconds.value % 60)

function formatBdDigit(val: number): string {
  return String(Math.max(0, val)).padStart(2, '0')
}

function startBdCountdown(secs: number) {
  if (bdCountdownTimer) clearInterval(bdCountdownTimer)
  bdRemainingSeconds.value = Math.max(0, Math.floor(secs))
  if (!import.meta.client || bdRemainingSeconds.value <= 0) return
  bdCountdownTimer = setInterval(() => {
    if (bdRemainingSeconds.value > 0) {
      bdRemainingSeconds.value -= 1
    } else if (bdCountdownTimer) {
      clearInterval(bdCountdownTimer)
    }
  }, 1000)
}

watch(
  initialSsrData,
  (val) => {
    if (val?.tab === 'product' && val.products?.docs) {
      productList.value = [...val.products.docs]
      hasMoreProducts.value = Boolean(
        val.products.hasNextPage && productList.value.length < SEARCH_MAX_ITEMS
      )
      const initialBdTime = Number(val.products.bd_time || 0)
      if (initialBdTime > 0) {
        if (import.meta.client) startBdCountdown(initialBdTime)
        else bdRemainingSeconds.value = initialBdTime
      }
    } else if (val?.tab === 'store' && val.sellers?.docs) {
      sellerList.value = [...val.sellers.docs]
      hasMoreSellers.value = Boolean(
        val.sellers.hasNextPage && sellerList.value.length < SEARCH_MAX_ITEMS
      )
    }
  },
  { immediate: true }
)

async function fetchProductsPage(page = 1) {
  const f = currentFilters.value
  if (isVisualMode.value) {
    if (!searchStore.visualFile) {
      productList.value = []
      hasMoreProducts.value = false
      return
    }
    const vRes = await searchByImage({
      file: searchStore.visualFile,
      page,
      categoryId: f.categoryId,
      subcategoryId: f.subcategoryId,
      minPrice: f.minPrice,
      maxPrice: f.maxPrice,
    })
    if (page === 1) productList.value = vRes.docs
    else productList.value.push(...vRes.docs)
    hasMoreProducts.value = Boolean(vRes.hasNextPage && productList.value.length < SEARCH_MAX_ITEMS)
    return
  }

  const res = await searchProducts({
    filter: f.filter,
    type: f.type,
    categoryId: f.categoryId,
    subcategoryId: f.subcategoryId,
    locationId: f.locationId,
    provinceName: f.provinceName,
    city: f.city,
    cities: f.cities,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    newest: f.newest,
    cheapest: f.cheapest,
    mostExpensive: f.mostExpensive,
    freeOngkir: f.freeOngkir,
    trusted: f.trusted,
    verified: f.verified,
    vip: f.vip,
    needed: f.needed,
    rating: f.rating,
    location: locationStore.location,
    lat: locationStore.lat,
    lon: locationStore.lon,
    page,
  })

  if (page === 1) {
    productList.value = res.docs
    const nextBdTime = Number(res.bd_time || 0)
    if (nextBdTime > 0) {
      startBdCountdown(nextBdTime)
    }
    if (f.q) {
      fetchFirstSellerWithProducts({
        filter: f.q,
        type: f.type,
        rating: f.rating,
        cities: f.cities,
        city: f.city,
        categoryId: f.categoryId,
        locationId: f.locationId,
        provinceName: f.provinceName,
        verified: f.verified,
        trusted: f.trusted,
        vip: f.vip,
      })
    } else {
      topSellerWithProducts.value = null
    }
  } else {
    const remaining = SEARCH_MAX_ITEMS - productList.value.length
    productList.value.push(...res.docs.slice(0, remaining))
  }

  hasMoreProducts.value = Boolean(res.hasNextPage && productList.value.length < SEARCH_MAX_ITEMS)
}

async function fetchSellersPage(page = 1) {
  const f = currentFilters.value
  const res = await searchSellers({
    filter: f.q || '',
    type: f.type,
    rating: f.rating,
    cities: f.cities,
    city: f.city,
    categoryId: f.categoryId,
    locationId: f.locationId,
    provinceName: f.provinceName,
    verified: f.verified,
    trusted: f.trusted,
    vip: f.vip,
    page,
  })

  if (page === 1) {
    sellerList.value = res.docs
  } else {
    const remaining = SEARCH_MAX_ITEMS - sellerList.value.length
    sellerList.value.push(...res.docs.slice(0, remaining))
  }
  hasMoreSellers.value = Boolean(res.hasNextPage && sellerList.value.length < SEARCH_MAX_ITEMS)
}

async function reloadCurrentTab() {
  isTransitionLoading.value = true
  topSellerWithProducts.value = null
  const minDelay = new Promise((resolve) => setTimeout(resolve, 260))
  try {
    if (activeTab.value === 'store') {
      sellerPage.value = 1
      await Promise.all([fetchSellersPage(1), minDelay])
    } else {
      productPage.value = 1
      await Promise.all([fetchProductsPage(1), minDelay])
    }
  } finally {
    isTransitionLoading.value = false
  }
}

async function loadMoreProducts() {
  if (isProductLoading.value || !hasMoreProducts.value) return
  productPage.value++
  await fetchProductsPage(productPage.value)
}

async function loadMoreSellers() {
  if (sellerLoading.value || !hasMoreSellers.value) return
  sellerPage.value++
  await fetchSellersPage(sellerPage.value)
}

function applyFilterPatch(patch: Partial<SearchFilters>) {
  const merged: SearchFilters = {
    ...currentFilters.value,
    ...patch,
  }
  const nextQuery = buildQueryFromFilters(merged)
  const isSameQuery = JSON.stringify(nextQuery) === JSON.stringify(route.query)
  isTransitionLoading.value = true
  if (isSameQuery) {
    reloadCurrentTab()
  } else {
    updateRouteFilters(merged)
  }
}

function resetAllFilters() {
  const clean: SearchFilters = {
    q: currentFilters.value.q,
    type: currentFilters.value.q ? SEARCH_TYPE_REGULAR : 0,
    tab: currentFilters.value.tab,
    mode: currentFilters.value.mode,
  }
  const nextQuery = buildQueryFromFilters(clean)
  const isSameQuery = JSON.stringify(nextQuery) === JSON.stringify(route.query)
  isTransitionLoading.value = true
  if (isSameQuery) {
    reloadCurrentTab()
  } else {
    updateRouteFilters(clean)
  }
}

function switchTab(tab: 'product' | 'store') {
  if (activeTab.value === tab) return
  applyFilterPatch({ tab })
}

function toggleBestDeal() {
  const nextType =
    currentFilters.value.type === SEARCH_TYPE_BEST_DEAL
      ? SEARCH_TYPE_REGULAR
      : SEARCH_TYPE_BEST_DEAL
  applyFilterPatch({ type: nextType })
}

function toggleInstant() {
  const isCurrentlyOn = currentFilters.value.freeOngkir === 1
  const userCity = (locationStore.city || 'Medan').split(',')[0]?.trim() || 'Medan'
  let updatedCities = [...(currentFilters.value.cities || [])]

  if (isCurrentlyOn) {
    updatedCities = updatedCities.filter((c) => c !== userCity)
  } else if (!updatedCities.includes(userCity)) {
    updatedCities.push(userCity)
  }

  applyFilterPatch({
    freeOngkir: isCurrentlyOn ? 0 : 1,
    cities: updatedCities,
    city: updatedCities[0] || '',
  })
}

function toggleRating4() {
  const nextRating = currentFilters.value.rating === 4 ? 0 : 4
  applyFilterPatch({ rating: nextRating })
}

function openLocationFromFilter() {
  showFilterModal.value = false
  showLocationModal.value = true
}

function onSelectVisualFile(file: File) {
  searchStore.setVisualFile(file)
  productPage.value = 1
  fetchProductsPage(1)
}

function onSelectProduct(product: ProductCard) {
  addLastViewedProduct(product)
}

function goToSearchLanding() {
  if (import.meta.client) {
    const input = document.getElementById('mobile-search-input') || document.getElementById('desktop-search-input')
    if (input) {
      input.focus()
      return
    }
  }
  navigateTo('/')
}

function handleOpenNotifications() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
  } else {
    notificationDrawer.open()
  }
}

function handleProtectedNav(target: string) {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
  } else {
    navigateTo(target)
  }
}

function handleBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

watch(
  () => route.query,
  () => {
    reloadCurrentTab()
  },
  { deep: true }
)

onMounted(() => {
  locationStore.initFromStorage()
  fetchFilterCategories()
  if (bdRemainingSeconds.value > 0) {
    startBdCountdown(bdRemainingSeconds.value)
  }

  if (activeTab.value === 'store') {
    fetchSellersPage(1)
  } else if (isVisualMode.value) {
    fetchProductsPage(1)
  } else if (currentFilters.value.q) {
    fetchFirstSellerWithProducts({
      filter: currentFilters.value.q,
      type: currentFilters.value.type,
      rating: currentFilters.value.rating,
      cities: currentFilters.value.cities,
      city: currentFilters.value.city,
      categoryId: currentFilters.value.categoryId,
      locationId: currentFilters.value.locationId,
      provinceName: currentFilters.value.provinceName,
      verified: currentFilters.value.verified,
      trusted: currentFilters.value.trusted,
      vip: currentFilters.value.vip,
    })
  }
})

onUnmounted(() => {
  if (bdCountdownTimer) clearInterval(bdCountdownTimer)
})
</script>
