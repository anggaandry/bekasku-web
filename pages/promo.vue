<template>
  <div class="min-h-screen flex flex-col bg-[#F9F9F9] text-text font-outfit pb-20 md:pb-12">
    <h1 class="sr-only">Promo Spesial &amp; Best Deal — BekasKu</h1>

    <!-- Mobile Sticky Top Bar (matching PromoAppBar in Mobile V3) -->
    <header class="md:hidden sticky top-0 z-40 bg-primary text-white px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <BadgePercent class="w-5 h-5 text-white" />
        <span class="text-base font-bold tracking-tight">Promo BekasKu</span>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cari promo"
          @click="navigateTo('/search/result?type=2')"
        >
          <Search class="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          class="relative p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Keranjang belanja"
          @click="handleCartClick"
        >
          <ShoppingCart class="w-5 h-5 text-white" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 bg-white text-primary text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center"
          >
            {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
          </span>
        </button>
      </div>
    </header>

    <!-- Primary Promo Banner (matching _buildPromoBanner in Mobile V3) -->
    <section class="bg-primary text-white">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 md:py-7 flex items-center justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
            Promo spesial hari ini
          </h2>
          <p class="text-sm text-white/90 mt-1">
            Semua promo hanya untuk kamu!
          </p>
        </div>

        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
          <BadgePercent class="w-9 h-9 sm:w-11 sm:h-11 text-white" />
        </div>
      </div>
    </section>

    <!-- Main White Content Area -->
    <main class="flex-1 bg-white">
      <div class="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-5 md:py-7">
        <!-- Error State -->
        <AppErrorState
          v-if="error && !loading && products.length === 0"
          :message="error"
          @retry="fetchPromos(true)"
        />

        <!-- Loading Shimmer -->
        <template v-else-if="loading && products.length === 0">
          <div class="flex items-center justify-between mb-4">
            <div class="h-6 w-36 bg-gray-200 rounded-md animate-pulse" />
            <div class="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <ProductGrid :products="[]" :loading="true" :skeleton-count="8" />
        </template>

        <!-- Empty State (matching _buildEmptyState in Mobile V3) -->
        <div
          v-else-if="products.length === 0"
          class="py-16 px-6 flex flex-col items-center justify-center text-center"
        >
          <div class="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-5">
            <BadgePercent class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-lg font-bold text-text">
            Belum ada promo disini
          </h3>
          <p class="text-sm text-text-muted mt-1.5 max-w-sm">
            Cek kembali nanti untuk mendapatkan promo menarik lainnya
          </p>
          <NuxtLink
            to="/"
            class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
          >
            <span>Jelajahi Beranda</span>
          </NuxtLink>
        </div>

        <!-- Best Deal Header + Countdown + Grid -->
        <template v-else>
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h3 class="text-lg sm:text-xl font-bold text-text tracking-tight">
                Best Deal
              </h3>
              <div
                v-if="remainingSeconds > 0"
                class="bg-primary text-white text-xs font-bold font-mono px-2.5 py-1 rounded-md flex items-center gap-1 tracking-wider"
              >
                <span>{{ formatDigit(hours) }}</span>
                <span class="text-white/80">:</span>
                <span>{{ formatDigit(minutes) }}</span>
                <span class="text-white/80">:</span>
                <span>{{ formatDigit(seconds) }}</span>
              </div>
            </div>

            <NuxtLink
              to="/search/result?type=2"
              class="text-sm font-medium text-primary hover:underline shrink-0"
            >
              Lihat semua
            </NuxtLink>
          </div>

          <ProductGrid
            :products="products"
            :loading="loadingMore"
          />

          <div v-if="hasMore" class="mt-6 flex justify-center">
            <button
              type="button"
              :disabled="loadingMore"
              class="px-6 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs sm:text-sm font-bold text-text transition-colors cursor-pointer disabled:opacity-50"
              @click="fetchPromos(false)"
            >
              {{ loadingMore ? 'Memuat promo lainnya...' : 'Muat Lebih Banyak' }}
            </button>
          </div>
        </template>
      </div>
    </main>

    <!-- Bottom Navigation Mobile -->
    <AppBottomNav class="md:hidden" />
  </div>
</template>

<script setup lang="ts">
import { BadgePercent, Search, ShoppingCart } from 'lucide-vue-next'
import { usePromo } from '~/composables/usePromo'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import ProductGrid from '~/components/shared/ProductGrid.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'

useHead({
  title: 'Promo Spesial & Best Deal — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Temukan promo Best Deal dan penawaran harga terbaik barang bekas & preloved di BekasKu.',
    },
  ],
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const authModal = useAuthModal()
const { products, bdTime, loading, loadingMore, error, hasMore, fetchPromos } = usePromo()

const remainingSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const hours = computed(() => Math.floor(remainingSeconds.value / 3600))
const minutes = computed(() => Math.floor((remainingSeconds.value % 3600) / 60))
const seconds = computed(() => remainingSeconds.value % 60)

function formatDigit(val: number): string {
  return String(Math.max(0, val)).padStart(2, '0')
}

function startCountdown(secs: number) {
  if (countdownTimer) clearInterval(countdownTimer)
  remainingSeconds.value = Math.max(0, secs)
  if (remainingSeconds.value <= 0) return
  countdownTimer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value -= 1
    } else if (countdownTimer) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

function handleCartClick() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ featureTitle: 'Keranjang Belanja', redirectPath: '/cart' })
  } else {
    navigateTo('/cart')
  }
}

await useAsyncData('promo-page-init', async () => {
  await fetchPromos(true)
  return true
})

onMounted(() => {
  if (bdTime.value > 0) {
    startCountdown(bdTime.value)
  }
  if (products.value.length === 0 && !loading.value) {
    fetchPromos(true).then(() => {
      if (bdTime.value > 0) startCountdown(bdTime.value)
    })
  }
})

watch(bdTime, (val) => {
  if (val > 0) startCountdown(val)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
