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

        <!-- 1. Ads Section: Editorial Magazine Split Banner (Variant 3) -->
        <section id="banner" class="w-full" data-aos="fade-up">
          <Var3Banner
            :banners="banners"
            :loading="bannerLoading"
          />
        </section>

        <!-- 2. Curated Discovery: Kategori BekasKu Prominent Explorer Grid -->
        <section id="kategori" class="w-full scroll-mt-24" data-aos="fade-up">
          <div class="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <HomeCategories
              :categories="categories"
              :loading="categoryLoading"
            />
          </div>
        </section>

        <!-- 3. Combined Row: Best Deal Flash Sale (Left) + BekasKu+ Creator Influencer (Right) -->
        <section id="bestdeal-creator" class="w-full scroll-mt-24" data-aos="fade-up">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-start">
            <!-- Sisi Kiri: Best Deal Flash Sale -->
            <div class="lg:col-span-7 flex flex-col">
              <HomeBestDeal
                :products="bestDealProducts"
                :loading="bdLoading"
              />
            </div>

            <!-- Sisi Kanan: BekasKu+ Creator & Influencer (STRICTLY UNCHANGED 1/4 CARD) -->
            <div class="lg:col-span-5 flex flex-col">
              <HomeCreatorInfluencer
                :creators="creators"
                :loading="creatorLoading"
              />
            </div>
          </div>
        </section>

        <!-- 4. Creator Live & Video Showcase (Variant 3 Editorial Reels) -->
        <section id="live-creator-showcase" class="w-full scroll-mt-24" data-aos="fade-up">
          <Var3LiveShopping :sessions="liveSessions" :loading="liveLoading" />
        </section>

        <!-- 5. Jasa & Lowongan Kerja (Kiri) & Barang Dibutuhkan (Kanan) -->
        <section id="jasa-needed" class="w-full scroll-mt-24" data-aos="fade-up">
          <HomeServices
            :services="serviceProducts"
            :needed="neededProducts"
            :loading="servicesLoading"
          />
        </section>

        <!-- 6. Rekomendasi BekasKu (5-Column Core Product Grid - STRICTLY UNCHANGED PRODUCT CARD) -->
        <section id="rekomendasi" class="w-full pt-1" data-aos="fade-up">
          <HomeProductGrid
            :products="allProducts"
            :loading="recLoading"
            :has-more="hasMore"
            :title="searchQuery ? `Hasil Pencarian: &quot;${searchQuery}&quot;` : 'PILIHAN KURASI EDITOR BEKASKU'"
            @load-more="loadMore"
          />
        </section>

      </div>
    </main>

    <!-- Footer Variant 3 (Editorial Minimalist Trust Strip & Vertical Dividers) -->
    <Var3Footer class="hidden md:block" />

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
import Var3Banner from '~/components/variants/var3/Var3Banner.vue'
import Var3LiveShopping from '~/components/variants/var3/Var3LiveShopping.vue'
import Var3Footer from '~/components/variants/var3/Var3Footer.vue'

const route = useRoute()
const searchQuery = computed(() => (route.query.q as string) || '')

useHead({
  title: 'Bekasku (Varian 3) — Editorial Discovery & Curated Marketplace #1 Indonesia',
  meta: [
    { name: 'description', content: 'Varian 3 BekasKu: Kurasi editorial barang preloved pilihan dengan navigasi kategori cerdas dan proteksi rekber.' },
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
