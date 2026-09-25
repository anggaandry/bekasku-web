<template>
  <div class="min-h-screen flex flex-col bg-[#F9F9F9] text-[#1a1a1a]">
    <!-- Header Desktop (md+) - STRICTLY UNCHANGED -->
    <AppHeader class="hidden md:block" />

    <!-- Header Mobile (<md) - STRICTLY UNCHANGED -->
    <AppHeaderMobile class="md:hidden" />

    <!-- Main Content Container -->
    <main class="flex-1 pb-2 sm:pb-3">
      <!-- Mobile Story & Chips Bar -->
      <HomeMobileTopBar class="md:hidden" />

      <div class="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-6 md:space-y-8 pt-2 md:pt-6">

        <!-- 1. Ads Section: Duo Flash Promo Banner (Variant 2) -->
        <section id="banner" class="w-full" data-aos="fade-up">
          <Var2Banner
            :banners="banners"
            :loading="bannerLoading"
          />
        </section>

        <!-- 2. Deals-First Priority: Best Deal Flash Sale Full Row with Countdown -->
        <section id="bestdeal" class="w-full scroll-mt-24" data-aos="fade-up">
          <div class="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <HomeBestDeal
              :products="bestDealProducts"
              :loading="bdLoading"
            />
          </div>
        </section>

        <!-- 3. BekasKu+ Creator Influencer Showcase (STRICTLY UNCHANGED 1/4 CARD) -->
        <section id="creator" class="w-full scroll-mt-24" data-aos="fade-up">
          <div class="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <HomeCreatorInfluencer
              :creators="creators"
              :loading="creatorLoading"
            />
          </div>
        </section>

        <!-- 4. Shoppable Live Streams (Variant 2 with product bubbles) -->
        <section id="live-shopping" class="w-full scroll-mt-24" data-aos="fade-up">
          <Var2LiveShopping :sessions="liveSessions" :loading="liveLoading" />
        </section>

        <!-- 5. Kategori BekasKu Grid -->
        <section id="kategori" class="w-full scroll-mt-24" data-aos="fade-up">
          <div class="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <HomeCategories
              :categories="categories"
              :loading="categoryLoading"
            />
          </div>
        </section>

        <!-- 6. Jasa & Lowongan Kerja (Kiri) & Barang Dibutuhkan (Kanan) -->
        <section id="jasa-needed" class="w-full scroll-mt-24" data-aos="fade-up">
          <HomeServices
            :services="serviceProducts"
            :needed="neededProducts"
            :loading="servicesLoading"
          />
        </section>

        <!-- 7. Rekomendasi BekasKu (5-Column Core Product Grid - STRICTLY UNCHANGED PRODUCT CARD) -->
        <section id="rekomendasi" class="w-full pt-1" data-aos="fade-up">
          <HomeProductGrid
            :products="allProducts"
            :loading="recLoading"
            :has-more="hasMore"
            :title="searchQuery ? `Hasil Pencarian: &quot;${searchQuery}&quot;` : 'FLASH DEALS & REKOMENDASI TERBAIK'"
            @load-more="loadMore"
          />
        </section>

      </div>
    </main>

    <!-- Footer Variant 2 (Floating Elevated Card Trust Bar & Rekber Escrow Steps) -->
    <Var2Footer class="hidden md:block" />

    <!-- Bottom Nav Mobile - STRICTLY UNCHANGED -->
    <AppBottomNav class="md:hidden" />
  </div>
</template>

<script setup lang="ts">
import { useBanners } from '~/composables/useBanners'
import { useCategories } from '~/composables/useCategories'
import { useProducts, type Product } from '~/composables/useProducts'
import { useCreators } from '~/composables/useCreators'
import { useLiveShopping } from '~/composables/useLiveShopping'
import Var2Banner from '~/components/variants/var2/Var2Banner.vue'
import Var2LiveShopping from '~/components/variants/var2/Var2LiveShopping.vue'
import Var2Footer from '~/components/variants/var2/Var2Footer.vue'

const route = useRoute()
const searchQuery = computed(() => (route.query.q as string) || '')

useHead({
  title: 'Bekasku (Varian 2) — Flash Deals & Shoppable Live Streams #1 Indonesia',
  meta: [
    { name: 'description', content: 'Varian 2 BekasKu: Penawaran flash deals diskon preloved terverifikasi dan shoppable live streaming terpercaya.' },
  ],
})

// Composables & State
const { banners, loading: bannerLoading, fetchBanners } = useBanners()
const { categories, loading: categoryLoading, fetchCategories } = useCategories()
const { fetchRecommendations, fetchBestDeal, fetchServices, fetchNeeded } = useProducts()
const { creators, loading: creatorLoading, fetchCreators } = useCreators()
const { liveSessions, loading: liveLoading, fetchLiveSessions } = useLiveShopping()

const bestDealProducts = ref<Product[]>([])
const bdLoading = ref(false)

const serviceProducts = ref<Product[]>([])
const neededProducts = ref<Product[]>([])
const servicesLoading = ref(false)

const allProducts = ref<Product[]>([])
const recLoading = ref(false)
const recPage = ref(1)
const hasMore = ref(true)

async function loadInitialData() {
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

async function loadMore() {
  if (recLoading.value || !hasMore.value) return
  recPage.value++
  await fetchProductRecommendations(false)
}

onMounted(() => {
  loadInitialData()
})
</script>
