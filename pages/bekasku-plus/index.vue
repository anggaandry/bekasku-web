<script setup lang="ts">
import {
  ArrowLeft,
  ArrowUpDown,
  Bell,
  ChevronDown,
  MessageSquare,
  Search,
  ShoppingCart,
  Store,
  X,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import { useAuthModal } from '~/composables/useAuthModal'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'
import { BEKASKU_PLUS_SORT_OPTIONS, useBekaskuPlusSellers } from '~/composables/useBekaskuPlusSellers'
import type { SellerSortOption } from '~/composables/useSellerSearch'
import type { FilterSheetOption } from '~/components/bekasku-plus/BekaskuPlusFilterModal.vue'
import SearchTopSeller from '~/components/search/SearchTopSeller.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import AppMobileInfiniteTrigger from '~/components/shared/AppMobileInfiniteTrigger.vue'
import BekaskuPlusFilterModal from '~/components/bekasku-plus/BekaskuPlusFilterModal.vue'

useHead({
  title: 'BekasKu+ Creator & Influencer — BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Jelajahi daftar penjual resmi, Creator & Influencer terkurasi BekasKu+ dengan produk pilihan terpercaya.',
    },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/bekasku-plus' }],
})

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const chatStore = useChatStore()
const notifStore = useNotificationStore()
const authModal = useAuthModal()
const notificationDrawer = useNotificationDrawer()

const {
  sellers,
  totalSellers,
  loading,
  loadingMore,
  hasMore,
  error,
  searchQuery,
  selectedCategoryId,
  selectedCategoryName,
  selectedSort,
  categoryOptions,
  sortOptions,
  activeSortShortLabel,
  isCategoryFiltered,
  hasActiveFilters,
  fetchCategories,
  fetchSellers,
  onSearchInput,
  clearSearch,
  setCategory,
  setSort,
  resetFilters,
} = useBekaskuPlusSellers()

const showCategoryModal = ref(false)
const showSortModal = ref(false)

await useAsyncData('bekasku-plus-sellers-init', async () => {
  await Promise.all([fetchCategories(), fetchSellers(true)])
  return true
})

onMounted(() => {
  if (sellers.value.length === 0 && !loading.value) {
    fetchSellers(true)
  }
  fetchCategories()
})

function handleBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

function handleAuthNav(path: string, featureTitle: string) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ featureTitle, redirectPath: path })
    return
  }
  navigateTo(path)
}

function handleNotifClick() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ featureTitle: 'Notifikasi' })
    return
  }
  notificationDrawer.open()
}

function handleCategorySelect(opt: FilterSheetOption) {
  setCategory(opt.id, opt.label)
}

function handleSortSelect(opt: FilterSheetOption) {
  setSort(opt.id as SellerSortOption)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F8FAFC] text-text font-outfit pb-10 md:pb-14">
    <h1 class="sr-only">BekasKu+ Creator &amp; Influencer</h1>

    <!-- Mobile Sticky AppBar (matching Mobile V3 BekaskuPlusView) -->
    <header class="md:hidden sticky top-0 z-40 bg-primary text-white px-2.5 py-2.5 flex items-center gap-1.5">
      <button
        type="button"
        class="p-1.5 -ml-0.5 text-white hover:bg-white/10 rounded-lg shrink-0 cursor-pointer"
        aria-label="Kembali"
        @click="handleBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <form
        class="flex-1 min-w-0 h-9 bg-white rounded-full px-3 flex items-center gap-2 text-gray-800"
        @submit.prevent="fetchSellers(true)"
      >
        <Search class="w-4 h-4 text-gray-500 shrink-0" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari Nama Creator/Toko"
          aria-label="Cari Nama Creator atau Toko"
          class="flex-1 min-w-0 bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
          aria-label="Hapus pencarian"
          @click="clearSearch"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </form>

      <div class="flex items-center shrink-0">
        <button
          type="button"
          class="p-1.5 text-white hover:bg-white/10 rounded-lg relative cursor-pointer"
          aria-label="Pesan"
          @click="handleAuthNav('/chat', 'Chat & Pesan')"
        >
          <MessageSquare class="w-5 h-5" />
          <span
            v-if="chatStore.totalUnread > 0"
            class="absolute top-0.5 right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1 ring-primary"
          >
            {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
          </span>
        </button>

        <button
          type="button"
          class="p-1.5 text-white hover:bg-white/10 rounded-lg relative cursor-pointer"
          aria-label="Notifikasi"
          @click="handleNotifClick"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="notifStore.totalUnread > 0"
            class="absolute top-0.5 right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1 ring-primary"
          >
            {{ notifStore.totalUnread > 99 ? '99+' : notifStore.totalUnread }}
          </span>
        </button>

        <button
          v-if="authStore.isLoggedIn"
          type="button"
          class="p-1.5 text-white hover:bg-white/10 rounded-lg relative cursor-pointer"
          aria-label="Keranjang"
          @click="navigateTo('/cart')"
        >
          <ShoppingCart class="w-5 h-5" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-0.5 right-0.5 bg-badge-bg text-badge-text text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-primary"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>
      </div>
    </header>

    <!-- Hero Banner (Seamless gradient + cropped watermark, adapted for Desktop + Mobile) -->
    <section class="relative overflow-hidden bg-gradient-to-b from-primary to-primary-dark text-white">
      <img
        src="/images/icon_only.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none select-none absolute -right-3 -bottom-4 md:right-6 md:-bottom-6 w-28 h-28 md:w-36 md:h-36 object-contain opacity-20 brightness-0 invert"
      />

      <div class="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="min-w-0 max-w-2xl">
          <div class="flex items-center flex-wrap gap-2">
            <h2 class="text-base sm:text-lg md:text-2xl font-bold tracking-tight">
              Nikmati Keuntungan
            </h2>
            <span class="inline-flex items-center px-2.5 py-1 rounded-xl bg-white shadow-xs">
              <img
                src="/images/bekasku_plus_variant_6_horizontal.png"
                alt="BekasKu+"
                width="104"
                height="18"
                class="h-4.5 md:h-5 w-auto object-contain"
              />
            </span>
          </div>
          <p class="mt-2 text-xs sm:text-sm md:text-base text-white/95 leading-relaxed pr-16 md:pr-0">
            Badge verified, prioritas tampil, dan bebas biaya sundul produk.
          </p>
        </div>

        <!-- Desktop Controls inside Hero: Search Creator + Daftar CTA -->
        <div class="hidden md:flex items-center gap-3 shrink-0">
          <form
            class="flex items-center gap-2 h-10 w-64 lg:w-72 px-3.5 rounded-xl bg-white text-gray-800 shadow-xs"
            @submit.prevent="fetchSellers(true)"
          >
            <Search class="w-4 h-4 text-gray-500 shrink-0" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari Nama Creator/Toko..."
              aria-label="Cari Nama Creator atau Toko"
              class="flex-1 min-w-0 bg-transparent text-xs lg:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
              @input="onSearchInput"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label="Hapus pencarian"
              @click="clearSearch"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </form>

          <NuxtLink
            to="/bekasku-plus/intro"
            class="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/35 text-white text-xs lg:text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
          >
            Daftar BekasKu+
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Filter & Sort Bar -->
    <div class="bg-white border-b border-border">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Category Chip -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-colors cursor-pointer"
            :class="
              isCategoryFiltered
                ? 'bg-primary/8 border-primary text-primary font-bold'
                : 'bg-[#F1F5F9] hover:bg-slate-200/70 border-[#E2E8F0] text-[#334155] font-medium'
            "
            @click="showCategoryModal = true"
          >
            <span>{{ isCategoryFiltered ? selectedCategoryName : 'Kategori' }}</span>
            <ChevronDown class="w-3.5 h-3.5 shrink-0" />
          </button>

          <!-- Mobile Sort Chip -->
          <button
            type="button"
            class="md:hidden inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border bg-[#F1F5F9] border-[#E2E8F0] text-[#334155] font-medium cursor-pointer"
            @click="showSortModal = true"
          >
            <span>{{ activeSortShortLabel }}</span>
            <ArrowUpDown class="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>

          <!-- Desktop Inline Sort Pills -->
          <div class="hidden md:flex items-center gap-1.5">
            <button
              v-for="opt in BEKASKU_PLUS_SORT_OPTIONS"
              :key="opt.key"
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm border transition-colors cursor-pointer"
              :class="
                selectedSort === opt.key
                  ? 'bg-primary/8 border-primary text-primary font-bold'
                  : 'bg-[#F1F5F9] hover:bg-slate-200/70 border-[#E2E8F0] text-[#334155] font-medium'
              "
              @click="setSort(opt.key)"
            >
              {{ opt.shortLabel }}
            </button>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="text-xs font-semibold text-primary hover:underline px-1 cursor-pointer"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>

        <NuxtLink
          to="/bekasku-plus/intro"
          class="md:hidden text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Daftar BekasKu+
        </NuxtLink>
      </div>
    </div>

    <!-- Section Header: [BEKASKU+] Creator & Influencer | X Penjual -->
    <div class="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <img
          src="/images/bekasku_plus_variant_6_horizontal.png"
          alt="BekasKu+"
          width="88"
          height="18"
          class="h-4.5 w-auto object-contain shrink-0"
        />
        <span class="text-sm sm:text-base font-semibold text-text truncate">
          Creator &amp; Influencer
        </span>
      </div>

      <span
        v-if="totalSellers > 0"
        class="text-xs sm:text-sm font-medium text-text-muted shrink-0"
      >
        {{ totalSellers }} Penjual
      </span>
    </div>

    <!-- Seller List Body -->
    <main class="flex-1 w-full max-w-[1400px] mx-auto md:px-6 lg:px-8 mt-1">
      <AppErrorState
        v-if="error && !loading && sellers.length === 0"
        :message="error"
        @retry="fetchSellers(true)"
      />

      <!-- Shimmer Loading State -->
      <div v-else-if="loading && sellers.length === 0" class="space-y-3 md:space-y-4">
        <div
          v-for="n in 3"
          :key="`bp-skel-${n}`"
          class="bg-white p-4 md:rounded-2xl md:border md:border-border animate-pulse space-y-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 bg-gray-200 rounded" />
              <div class="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div class="h-8 w-20 bg-gray-200 rounded-lg" />
          </div>
          <div class="flex gap-2.5 overflow-hidden pt-1">
            <div v-for="k in 3" :key="k" class="w-[116px] sm:w-[148px] shrink-0 space-y-2">
              <div class="w-full aspect-square bg-gray-100 rounded-xl" />
              <div class="h-3.5 w-16 bg-gray-200 rounded" />
              <div class="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="sellers.length === 0"
        class="bg-white md:rounded-2xl md:border md:border-border py-14 px-6 flex flex-col items-center justify-center text-center"
      >
        <div class="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center text-primary mb-4">
          <Store class="w-10 h-10" />
        </div>
        <h3 class="text-base sm:text-lg font-bold text-text">
          Tidak Ada Penjual Ditemukan
        </h3>
        <p class="text-xs sm:text-sm text-text-muted mt-1.5 max-w-sm">
          Coba ubah kata kunci pencarian atau filter kategori yang dipilih.
        </p>
        <button
          type="button"
          class="mt-5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          @click="resetFilters"
        >
          Reset Filter
        </button>
      </div>

      <!-- Active Sellers Showcase List -->
      <div v-else class="md:space-y-4">
        <SearchTopSeller
          v-for="seller in sellers"
          :key="seller.id || seller._id"
          :seller="seller"
          variant="bekasku-plus"
          button-variant="outline"
        />

        <AppMobileInfiniteTrigger
          v-if="hasMore"
          :has-more="hasMore"
          :loading="loadingMore"
          loading-text="Memuat penjual lainnya..."
          @load-more="fetchSellers(false)"
        />
      </div>
    </main>

    <!-- Reusable Filter Modals (Kategori & Sort) -->
    <BekaskuPlusFilterModal
      v-model="showCategoryModal"
      title="Pilih Kategori"
      :options="categoryOptions"
      :selected-id="selectedCategoryId"
      @select="handleCategorySelect"
    />

    <BekaskuPlusFilterModal
      v-model="showSortModal"
      title="Urutkan Penjual"
      :options="sortOptions"
      :selected-id="selectedSort"
      @select="handleSortSelect"
    />
  </div>
</template>
