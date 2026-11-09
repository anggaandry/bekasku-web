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
    <main class="flex-1 w-full max-w-[1400px] mx-auto pb-10 md:pb-12">
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

          <!-- Best Deal Countdown Highlight Banner (When type=2, matching SearchResultsView L613) -->
          <div
            v-if="currentFilters.type === SEARCH_TYPE_BEST_DEAL && activeTab === 'product' && productList.length > 0"
            class="bg-primary/8 border-b border-primary/20 px-4 py-2.5 mb-2 flex items-center justify-between lg:rounded-xl"
          >
            <div class="flex items-center gap-2 text-primary font-outfit font-semibold text-sm">
              <Clock class="w-5 h-5" />
              <span>Best Deal BekasKu</span>
            </div>
            <span class="px-2.5 py-1 rounded-md bg-primary text-white font-outfit font-bold text-xs">
              Promo Aktif
            </span>
          </div>

          <!-- Centered Transition Loading State (Shown in middle of right column on any filter/sort/type/tab/category change) -->
          <div
            v-if="isTransitionLoading"
            class="min-h-[420px] bg-white md:rounded-2xl md:border md:border-border flex flex-col items-center justify-center py-16 px-4 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 class="w-10 h-10 text-primary animate-spin mb-3" />
            <p class="font-outfit font-semibold text-sm text-text">
              {{ activeTab === 'store' ? 'Memuat daftar toko...' : 'Memuat hasil pencarian...' }}
            </p>
            <p class="font-outfit text-xs text-text-muted mt-1">
              Mohon tunggu sebentar
            </p>
          </div>

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
                :skeleton-count="12"
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
import { Crown, Clock, Loader2 } from 'lucide-vue-next'
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
const { data: initialSsrData } = await useAsyncData(
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
  }
)

if (initialSsrData.value?.tab === 'product' && initialSsrData.value.products?.docs) {
  productList.value = [...initialSsrData.value.products.docs]
  hasMoreProducts.value = Boolean(
    initialSsrData.value.products.hasNextPage && productList.value.length < SEARCH_MAX_ITEMS
  )
} else if (initialSsrData.value?.tab === 'store' && initialSsrData.value.sellers?.docs) {
  sellerList.value = [...initialSsrData.value.sellers.docs]
  hasMoreSellers.value = Boolean(
    initialSsrData.value.sellers.hasNextPage && sellerList.value.length < SEARCH_MAX_ITEMS
  )
}

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
  const query: Record<string, string> = {}
  if (currentFilters.value.q) query.q = currentFilters.value.q
  if (currentFilters.value.categoryId) query.category_id = currentFilters.value.categoryId
  if (currentFilters.value.categoryName) query.category_name = currentFilters.value.categoryName
  navigateTo({ path: '/search', query })
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
    navigateTo('/search')
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
</script>
