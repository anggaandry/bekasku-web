<template>
  <div>
    <!-- 1. MODE: COMING SOON -->
    <AppComingSoon v-if="appStore.isComingSoon" />

    <!-- 2. MODE: FULL ECOMMERCE MARKETPLACE -->
    <div v-else class="min-h-screen flex flex-col bg-[#F9F9F9] text-text">
      <!-- Hidden H1 for SEO Hierarchy -->
      <h1 class="sr-only">
        BekasKu — Marketplace Jual Beli Barang Bekas & Preloved #1 Indonesia
      </h1>

      <!-- Header Mobile (<md) -->
      <AppHeaderMobile class="md:hidden" />

      <!-- Main Content Container -->
      <main class="flex-1 pb-6">
        <!-- Mobile Story & Chips Bar (Mobile <md) -->
        <HomeMobileTopBar
          class="md:hidden"
          :live-sessions="liveSessions"
        />

        <div class="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-6 md:space-y-7 pt-2 md:pt-4">

          <!-- S0: Guest Login Prompt with Official Mascot -->
          <HomeGuestPrompt />

          <!-- S1: Multi-Banner Sliding Peeking Stage -->
          <section id="banner" class="w-full">
            <HomeBanner
              :banners="banners"
              :loading="bannerPending"
            />
          </section>

          <!-- S2: Row 2-Kolom (Kiri: Kategori BekasKu | Kanan: Sedang Tayang / Live & Video) -->
          <section id="kategori-live" class="w-full scroll-mt-24">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
              <!-- Sisi Kiri: Kategori BekasKu (2 baris scrollable track) -->
              <div class="lg:col-span-6 flex flex-col">
                <HomeCategories
                  :categories="categories"
                  :loading="categoryPending"
                />
              </div>

              <!-- Sisi Kanan: Sedang Tayang (Live & Video Feed Cards) -->
              <div class="lg:col-span-6 flex flex-col">
                <HomeLiveShopping
                  :sessions="liveSessions"
                  :loading="livePending"
                />
              </div>
            </div>
          </section>

          <!-- S3: Row 2-Kolom (Kiri: Best Deal Flash Sale | Kanan: BekasKu+ Creator & Influencer) -->
          <section id="bestdeal-creator" class="w-full scroll-mt-24">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
              <!-- Sisi Kiri: Best Deal Flash Sale (Scroll horizontal dengan countdown) -->
              <div class="lg:col-span-7 flex flex-col">
                <HomeBestDeal
                  :products="bestDeals"
                  :loading="bestDealPending"
                  :bd-time="bdTime"
                />
              </div>

              <!-- Sisi Kanan: BekasKu+ Creator & Influencer (dengan asset logo horizontal) -->
              <div class="lg:col-span-5 flex flex-col">
                <HomeBekaskuPlus
                  :sellers="bekaskuPlusSellers"
                  :loading="sellerPending"
                />
              </div>
            </div>
          </section>

          <!-- S3b: Postingan Terbaru (Sembunyi bila kosong sesuai Flow 00 Section 3 #7) -->
          <section v-if="newest && newest.length > 0" id="newest-products" class="w-full scroll-mt-24">
            <div class="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs">
              <HomeProductRow
                title="POSTINGAN TERBARU"
                :products="newest"
                :loading="newestPending"
                view-all-to="/product/search?type=1&newest=1"
              />
            </div>
          </section>

          <!-- S4: Row 2-Kolom (Kiri: Jasa & Lowongan Kerja | Kanan: Barang Dibutuhkan) -->
          <section id="jasa-needed" class="w-full scroll-mt-24">
            <HomeServices
              :services="services"
              :needed="needed"
              :loading="servicesPending || neededPending"
            />
          </section>

          <!-- S5: Rekomendasi BekasKu (Full-width Core Product Grid 5-kolom) -->
          <section id="rekomendasi" class="w-full pt-2">
            <ClientOnly>
              <HomeProductGrid
                :products="recommendationList"
                :loading="recLoading || (initialRecPending && recommendationList.length === 0)"
                :has-more="hasMore"
                title="REKOMENDASI BEKASKU"
                @load-more="loadMore"
              />
              <template #fallback>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-base sm:text-lg font-black text-text tracking-tight font-outfit uppercase">
                      REKOMENDASI BEKASKU
                    </h3>
                  </div>
                  <div class="grid gap-3 sm:gap-3.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    <div
                      v-for="n in 10"
                      :key="`home-rec-fallback-${n}`"
                      class="bg-white rounded-xl border border-border overflow-hidden shadow-2xs animate-shimmer flex flex-col justify-between"
                    >
                      <div class="w-full aspect-square bg-border" />
                      <div class="p-2.5 space-y-2">
                        <div class="h-4 bg-border rounded w-2/3" />
                        <div class="h-3 bg-border rounded w-full" />
                        <div class="h-3 bg-border rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </section>

        </div>
      </main>

      <!-- Bottom Nav Mobile -->
      <AppBottomNav class="md:hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { useLocationStore } from '~/stores/location'
import { useBanners } from '~/composables/useBanners'
import { useCategories } from '~/composables/useCategories'
import { useProducts } from '~/composables/useProducts'
import { useBekaskuPlus } from '~/composables/useBekaskuPlus'
import { useLiveShopping } from '~/composables/useLiveShopping'
import type { ProductCard } from '~/types/product'

import HomeGuestPrompt from '~/components/home/HomeGuestPrompt.vue'
import HomeMobileTopBar from '~/components/home/HomeMobileTopBar.vue'
import HomeBanner from '~/components/home/HomeBanner.vue'
import HomeCategories from '~/components/home/HomeCategories.vue'
import HomeLiveShopping from '~/components/home/HomeLiveShopping.vue'
import HomeBestDeal from '~/components/home/HomeBestDeal.vue'
import HomeBekaskuPlus from '~/components/home/HomeBekaskuPlus.vue'
import HomeProductRow from '~/components/home/HomeProductRow.vue'
import HomeServices from '~/components/home/HomeServices.vue'
import HomeProductGrid from '~/components/home/HomeProductGrid.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'

// Stores
const appStore = useAppStore()
const locationStore = useLocationStore()

// SEO Metadata & Schema.org JSON-LD
useHead({
  title: 'BekasKu — Marketplace Jual Beli Barang Bekas & Preloved #1 Indonesia',
  meta: [
    {
      name: 'description',
      content: 'BekasKu adalah marketplace jual beli barang bekas dan preloved terpercaya di Indonesia. Transaksi aman dengan Rekening Bersama BekasKu, perlindungan garansi, COD Pay & Pick, serta ribuan produk berkualitas.',
    },
    { property: 'og:title', content: 'BekasKu — Marketplace Preloved #1 Indonesia' },
    { property: 'og:description', content: 'Jual beli barang bekas dan preloved aman, mudah, dan terpercaya di BekasKu.' },
    { property: 'og:image', content: 'https://bekasku.id/images/mascot.png' },
    { property: 'og:url', content: 'https://bekasku.id' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [
    { rel: 'canonical', href: 'https://bekasku.id' },
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BekasKu',
        url: 'https://bekasku.id',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bekasku.id/search/result?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
})

// Composables
const { fetchBanners } = useBanners()
const { fetchCategories } = useCategories()
const { fetchBekaskuPlus } = useBekaskuPlus()
const { fetchLiveSessions } = useLiveShopping()
const {
  fetchNewest,
  fetchNeeded,
  fetchBestDeal,
  fetchServices,
  fetchRecommendations,
} = useProducts()

// SSR Data Fetching (Strategi SSR Section 6 Flow 00)
// 1. Prioritas SSR
const { data: banners, pending: bannerPending } = await useAsyncData(
  'home-banners',
  () => fetchBanners(),
  { default: () => [] }
)

const { data: categories, pending: categoryPending } = await useAsyncData(
  'home-categories',
  () => fetchCategories(),
  { default: () => [] }
)

const { data: bekaskuPlusSellers, pending: sellerPending } = useAsyncData(
  'home-bekasku-plus',
  () => fetchBekaskuPlus(),
  { default: () => [], lazy: true }
)

const { data: newest, pending: newestPending } = useAsyncData(
  'home-newest',
  () => fetchNewest(),
  { default: () => [], lazy: true }
)

const { data: initialRecResponse, pending: initialRecPending } = useAsyncData(
  'home-recom-page-1',
  () => fetchRecommendations({ page: 1, limit: 30 }),
  { default: () => ({ docs: [] }), lazy: true }
)

// 2. Data Lazy Client
const { data: liveSessions, pending: livePending } = useAsyncData(
  'home-live',
  () => fetchLiveSessions(),
  { default: () => [], lazy: true }
)

const { data: bestDeals, pending: bestDealPending } = useAsyncData(
  'home-bestdeal',
  () => fetchBestDeal(),
  { default: () => [], lazy: true }
)

const { data: services, pending: servicesPending } = useAsyncData(
  'home-services',
  () => fetchServices(),
  { default: () => [], lazy: true }
)

const { data: needed, pending: neededPending } = useAsyncData(
  'home-needed',
  () => fetchNeeded(),
  { default: () => [], lazy: true }
)

// Paginasi Rekomendasi (30 produk per batch)
const recommendationList = ref<ProductCard[]>(initialRecResponse.value?.docs || [])
const recPage = ref(1)
const recLoading = ref(false)
const hasMore = ref(true)
const bdTime = ref<string | number>(0)

watch(
  () => initialRecResponse.value,
  (val) => {
    if (val?.docs && val.docs.length > 0) {
      recommendationList.value = [...val.docs]
      if (val.hasNextPage === false || val.docs.length < 30) {
        hasMore.value = val.hasNextPage ?? false
      }
      if (val.bd_time) {
        bdTime.value = val.bd_time
      }
    }
  },
  { immediate: true }
)

async function loadMore() {
  if (recLoading.value || !hasMore.value) return
  recLoading.value = true
  try {
    recPage.value++
    const res = await fetchRecommendations({
      page: recPage.value,
      limit: 30,
      lat: locationStore.lat,
      lon: locationStore.lon,
      location: locationStore.location,
    })
    if (res.docs && res.docs.length > 0) {
      recommendationList.value.push(...res.docs)
      hasMore.value = res.hasNextPage ?? (res.docs.length >= 30)
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Failed to load more products:', err)
  } finally {
    recLoading.value = false
  }
}

onMounted(() => {
  locationStore.initFromStorage()
})
</script>
