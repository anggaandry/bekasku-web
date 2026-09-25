<template>
  <div>
    <!-- 1. MODE: COMING SOON -->
    <AppComingSoon v-if="appStore.isComingSoon" />

    <!-- 2. MODE: FULL ECOMMERCE MARKETPLACE -->
    <div v-else class="min-h-screen flex flex-col bg-[#F9F9F9] text-[#1a1a1a]">
      <!-- Header Desktop (md+) -->
      <AppHeader class="hidden md:block" />

      <!-- Header Mobile (<md) -->
      <AppHeaderMobile class="md:hidden" />

      <!-- Main Content Container -->
      <main class="flex-1 pb-2 sm:pb-3">
        <!-- Mobile Story & Chips Bar (Visible on mobile <md matching home_red.png) -->
        <HomeMobileTopBar class="md:hidden" />

        <div class="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-6 md:space-y-8 pt-2 md:pt-6">

          <!-- Section 1: Banner Iklan (Mobile V3 style cards) -->
          <section id="banner" class="w-full" data-aos="fade-up">
            <HomeBanner
              :banners="banners"
              :loading="bannerLoading"
            />
          </section>

          <!-- Section 2: Combined Row (Left: Kategori BekasKu [2 rows] | Right: BekasKu Live & Video [4 cards]) -->
          <section id="kategori-live" class="w-full scroll-mt-24" data-aos="fade-up">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
              <!-- Sisi Kiri: Kategori BekasKu (2 Rows) -->
              <div class="lg:col-span-6 flex flex-col">
                <HomeCategories
                  :categories="categories"
                  :loading="categoryLoading"
                />
              </div>

              <!-- Sisi Kanan: BekasKu Live & Video (4 Compact Cards) -->
              <div class="lg:col-span-6 flex flex-col">
                <HomeLiveShopping
                  :sessions="liveSessions"
                  :loading="liveLoading"
                />
              </div>
            </div>
          </section>

          <!-- Section 3: Combined Row (Left: Best Deal Flash Sale with Sideways Scroll | Right: BekasKu+ Creator Influencer 1 row) -->
          <section id="bestdeal-creator" class="w-full scroll-mt-24" data-aos="fade-up">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-start">
              <!-- Sisi Kiri: Best Deal Flash Sale (Scroll ke samping dengan panah kiri/kanan) -->
              <div class="lg:col-span-7 flex flex-col">
                <HomeBestDeal
                  :products="bestDealProducts"
                  :loading="bdLoading"
                />
              </div>

              <!-- Sisi Kanan: BekasKu+ Creator & Influencer (1 Row Layout featuring Anne Paris) -->
              <div class="lg:col-span-5 flex flex-col">
                <HomeCreatorInfluencer
                  :creators="creators"
                  :loading="creatorLoading"
                />
              </div>
            </div>
          </section>

          <!-- Section 4: Jasa & Lowongan Kerja (Kiri) & Barang Dibutuhkan (Kanan) Inline Side-by-Side -->
          <section id="jasa-needed" class="w-full scroll-mt-24" data-aos="fade-up">
            <HomeServices
              :services="serviceProducts"
              :needed="neededProducts"
              :loading="servicesLoading"
            />
          </section>

          <!-- Section 6: Rekomendasi Bekasku (5-Column Core Product Grid) -->
          <section id="rekomendasi" class="w-full pt-1" data-aos="fade-up">
            <HomeProductGrid
              :products="allProducts"
              :loading="recLoading"
              :has-more="hasMore"
              :title="searchQuery ? `Hasil Pencarian: &quot;${searchQuery}&quot;` : (selectedCategory ? `Kategori: ${selectedCategory}` : 'REKOMENDASI BEKASKU')"
              @load-more="loadMore"
            />
          </section>

        </div>
      </main>

      <!-- Footer Desktop -->
      <AppFooter class="hidden md:block" />

      <!-- Bottom Nav Mobile -->
      <AppBottomNav class="md:hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { useBanners } from '~/composables/useBanners'
import { useCategories } from '~/composables/useCategories'
import { useProducts, type Product } from '~/composables/useProducts'
import { useCreators } from '~/composables/useCreators'
import { useLiveShopping } from '~/composables/useLiveShopping'

// Stores
const appStore = useAppStore()
const route = useRoute()

// Query Filters
const searchQuery = computed(() => (route.query.q as string) || '')
const selectedCategory = computed(() => (route.query.category as string) || '')

// SEO Metadata & Schema.org JSON-LD
useHead({
  title: 'Bekasku — Marketplace Jual Beli Barang Bekas & Preloved #1 Indonesia',
  meta: [
    {
      name: 'description',
      content: 'Bekasku adalah marketplace jual beli barang bekas dan preloved terpercaya di Indonesia. Transaksi aman dengan Rekening Bersama Bekasku, perlindungan garansi, COD Pay & Pick, serta ribuan produk berkualitas.',
    },
    { property: 'og:title', content: 'Bekasku — Marketplace Preloved #1 Indonesia' },
    { property: 'og:description', content: 'Jual beli barang bekas dan preloved aman, mudah, dan terpercaya.' },
    { property: 'og:image', content: 'https://bekasku.id/images/icon_only.png' },
    { property: 'og:url', content: 'https://bekasku.id' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [
    { rel: 'canonical', href: 'https://bekasku.id' },
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Bekasku',
        url: 'https://bekasku.id',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bekasku.id/?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
})

// Composables & State
const { banners, loading: bannerLoading, fetchBanners } = useBanners()
const { categories, loading: categoryLoading, fetchCategories } = useCategories()
const { fetchRecommendations, fetchBestDeal, fetchServices, fetchNeeded } = useProducts()
const { creators, loading: creatorLoading, fetchCreators } = useCreators()
const { liveSessions, loading: liveLoading, fetchLiveSessions } = useLiveShopping()

// Recommendation & Best Deal States
const bestDealProducts = ref<Product[]>([])
const bdLoading = ref(false)

// Jasa & Lowongan Kerja + Barang Dibutuhkan States
const serviceProducts = ref<Product[]>([])
const neededProducts = ref<Product[]>([])
const servicesLoading = ref(false)

const allProducts = ref<Product[]>([])
const recLoading = ref(false)
const recPage = ref(1)
const hasMore = ref(true)

// Fetch initial data
async function loadInitialData() {
  if (appStore.isComingSoon) return

  const promises: Promise<any>[] = [
    fetchBanners(),
    fetchCategories(),
    fetchCreators(),
    fetchLiveSessions(),
  ]

  servicesLoading.value = true
  promises.push(
    fetchServices(10).then((res) => {
      serviceProducts.value = res
    }),
    fetchNeeded(10).then((res) => {
      neededProducts.value = res
    }).finally(() => {
      servicesLoading.value = false
    })
  )

  bdLoading.value = true
  promises.push(
    fetchBestDeal(5).then((res) => {
      bestDealProducts.value = res
      bdLoading.value = false
    })
  )

  await Promise.allSettled(promises)
  await fetchProductRecommendations(true)
}

// Fetch Recommendations
async function fetchProductRecommendations(reset = false) {
  if (reset) {
    recPage.value = 1
    hasMore.value = true
    allProducts.value = []
  }

  recLoading.value = true
  try {
    const docs = await fetchRecommendations({
      page: recPage.value,
      limit: 20,
      query: searchQuery.value,
      category: selectedCategory.value,
    })

    if (reset) {
      allProducts.value = docs
    } else {
      allProducts.value.push(...docs)
    }

    if (docs.length < 20) {
      hasMore.value = false
    }
  } catch (err) {
    console.warn('Error fetching recommendations:', err)
  } finally {
    recLoading.value = false
  }
}

// Load more trigger
async function loadMore() {
  if (recLoading.value || !hasMore.value) return
  recPage.value++
  await fetchProductRecommendations(false)
}

// Watch query changes (search or category click)
watch([searchQuery, selectedCategory], () => {
  fetchProductRecommendations(true)
})

// Lifecycle
onMounted(() => {
  loadInitialData()
})

watch(() => appStore.mode, (newMode) => {
  if (newMode !== 'coming_soon') {
    loadInitialData()
  }
})
</script>
