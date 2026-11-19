<template>
  <div class="min-h-screen flex flex-col bg-[#F9F9F9] text-text font-outfit pb-20 md:pb-12">
    <h1 class="sr-only">Promo Spesial &amp; Best Deal — BekasKu</h1>

    <!-- Mobile Sticky Top Bar (matching PromoAppBar in Mobile V3) -->
    <header class="md:hidden sticky top-0 z-40 bg-primary text-white px-3 py-2.5 flex items-center gap-2">
      <button
        type="button"
        class="flex-1 min-w-0 h-10 bg-white rounded-xl px-3 flex items-center gap-2 text-left text-gray-500 text-sm cursor-pointer"
        @click="navigateTo('/search/result?type=2')"
      >
        <Search class="w-4 h-4 text-gray-500 shrink-0" />
        <span class="truncate">Cari di Best Deal</span>
      </button>

      <div class="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          aria-label="Chat"
          @click="handleAuthAction('/chat', 'Chat & Pesan')"
        >
          <MessageSquare class="w-5 h-5" />
          <span
            v-if="chatStore.totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
          </span>
        </button>

        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          aria-label="Notifikasi"
          @click="handleNotificationClick"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="notifStore.totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ notifStore.totalUnread > 99 ? '99+' : notifStore.totalUnread }}
          </span>
        </button>

        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          aria-label="Keranjang belanja"
          @click="handleAuthAction('/cart', 'Keranjang Belanja')"
        >
          <ShoppingCart class="w-5 h-5" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>
      </div>
    </header>

    <!-- Primary Promo Banner (matching _buildPromoBanner in Mobile V3) -->
    <section class="bg-primary text-white">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-1.5 pb-5 md:py-7 flex items-center justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
            Promo spesial hari ini
          </h2>
          <p class="text-sm text-white/90 mt-1">
            Semua promo hanya untuk kamu!
          </p>
        </div>

        <img
          src="/images/discounttag.png"
          alt="Promo spesial hari ini"
          class="w-24 h-20 sm:w-28 sm:h-24 object-contain shrink-0 select-none"
        />
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
          <img
            src="/images/nocart.png"
            alt="Belum ada promo disini"
            class="w-44 h-44 object-contain mb-6 select-none"
          />
          <h3 class="text-lg font-bold text-text">
            Belum ada promo disini
          </h3>
          <p class="text-sm text-text-muted mt-1.5 max-w-xs">
            Cek kembali nanti untuk mendapatkan promo menarik lainnya
          </p>
          <NuxtLink
            to="/"
            class="hidden md:inline-flex mt-6 items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
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

          <AppMobileInfiniteTrigger
            v-if="hasMore"
            :has-more="hasMore"
            :loading="loadingMore"
            loading-text="Memuat promo lainnya..."
            button-class="px-6 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs sm:text-sm font-bold text-text transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            @load-more="fetchPromos(false)"
          />
        </template>
      </div>
    </main>

    <!-- Bottom Navigation Mobile -->
    <AppBottomNav class="md:hidden" />
  </div>
</template>

<script setup lang="ts">
import { Bell, MessageSquare, Search, ShoppingCart } from 'lucide-vue-next'
import { usePromo } from '~/composables/usePromo'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'
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
const chatStore = useChatStore()
const notifStore = useNotificationStore()
const notificationDrawer = useNotificationDrawer()
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

function handleAuthAction(path: string, featureTitle: string) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ featureTitle, redirectPath: path })
  } else {
    navigateTo(path)
  }
}

function handleNotificationClick() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ featureTitle: 'Notifikasi' })
  } else {
    notificationDrawer.open()
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
