<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Headset,
  Inbox,
  RotateCcw,
} from 'lucide-vue-next'
import {
  useBalance,
  BALANCE_FILTER_TYPES,
  BALANCE_FILTER_TIMES,
} from '~/composables/useBalance'
import { useHelpChatStore } from '~/stores/helpChat'
import type { BalanceMutation } from '~/types/balance'
import BalanceHeaderCard from '~/components/balance/BalanceHeaderCard.vue'
import BalanceMutationItem from '~/components/balance/BalanceMutationItem.vue'
import BalanceFilterSheet from '~/components/balance/BalanceFilterSheet.vue'
import BalanceTransactionDetailModal from '~/components/balance/BalanceTransactionDetailModal.vue'
import BalanceWithdrawModal from '~/components/balance/BalanceWithdrawModal.vue'
import BalanceDesktopGuide from '~/components/balance/BalanceDesktopGuide.vue'
import { useIdentityKycModal } from '~/composables/useIdentityKyc'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Saldo Saya — BekasKu',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Kelola saldo dan pantau riwayat mutasi dompet digital BekasKu.' },
  ],
})

const router = useRouter()

const {
  balance,
  isBalanceLoading,
  historyList,
  isLoading,
  isLoadingMore,
  hasNextPage,
  errorMessage,
  filterType,
  filterTime,
  fetchBalance,
  fetchHistory,
  loadMore,
  setFilterType,
  setFilterTime,
} = useBalance()

const { identityInfo, fetchIdentityInfo } = useProfile()
const kycModal = useIdentityKycModal()
const helpChatStore = useHelpChatStore()

const isUserVerified = computed(() =>
  Boolean(identityInfo.value?.identity_number || identityInfo.value?.identity)
)

// Withdraw Modal visibility (Wide 2-column on desktop, bottom-sheet on mobile)
const showWithdrawModal = ref(false)

// Filter sheets & detail modal
const showTypeFilterSheet = ref(false)
const showTimeFilterSheet = ref(false)
const selectedMutation = ref<BalanceMutation | null>(null)
const showDetailModal = ref(false)

function handleOpenWithdraw() {
  if (!isUserVerified.value) {
    kycModal.open({
      reason: 'withdraw',
      featureName: 'Tarik Saldo',
      onSuccess: () => {
        showWithdrawModal.value = true
      },
    })
    return
  }
  showWithdrawModal.value = true
}

function handleOpenBank() {
  if (!isUserVerified.value) {
    kycModal.open({
      reason: 'bank',
      featureName: 'Rekening Bank',
      onSuccess: () => {
        navigateTo('/account?tab=bank')
      },
    })
    return
  }
  navigateTo('/account?tab=bank')
}

function handleRequireVerification() {
  kycModal.open({
    reason: 'withdraw',
    featureName: 'Tarik Saldo',
  })
}

function handleBackMobile() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/account')
  }
}

function openCsHelp() {
  helpChatStore.openHelpChat({
    topic: 'balance',
    referenceTitle: 'Saldo & Dompet BekasKu',
    initialMessage: 'Halo Tim CS BekasKu, saya butuh bantuan terkait saldo dan dompet akun saya.',
  })
}

function handleClickMutation(item: BalanceMutation) {
  selectedMutation.value = item
  showDetailModal.value = true
}

function handleWithdrawSuccess() {
  fetchBalance()
  fetchHistory(true)
}

onMounted(async () => {
  await Promise.all([
    fetchBalance(),
    fetchHistory(true),
    fetchIdentityInfo(),
  ])
})
</script>

<template>
  <div class="min-h-screen bg-surface-1 font-outfit select-none">
    <!-- ========================================== -->
    <!-- 1. MOBILE VIEW (< lg)                     -->
    <!-- ========================================== -->
    <div class="lg:hidden flex flex-col min-h-screen">
      <!-- Mobile Sticky Top Header -->
      <header class="bg-primary text-white sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="p-1 -ml-1 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
            aria-label="Kembali"
            @click="handleBackMobile"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <h1 class="text-base sm:text-lg font-bold text-white tracking-tight">
            Saldo Saya
          </h1>
        </div>

        <!-- Right Action: CS BekasKu Center -->
        <button
          type="button"
          class="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Bantuan Bekasku Center"
          @click="openCsHelp"
        >
          <Headset class="w-5 h-5" />
        </button>
      </header>

      <!-- Mobile Content: Overview View -->
      <main class="flex-1 pb-16">
        <!-- Balance Header Card -->
        <BalanceHeaderCard
          :balance="balance"
          :is-loading="isBalanceLoading"
          :is-verified="isUserVerified"
          @open-withdraw="handleOpenWithdraw"
          @open-bank="handleOpenBank"
          @require-verification="handleRequireVerification"
        />

        <!-- Riwayat Transaksi Section -->
        <section class="mt-6 px-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold text-text">
              Riwayat Transaksi
            </h2>
          </div>

          <!-- Filter Chips -->
          <div class="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
            <!-- Tipe Filter Chip -->
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full bg-white border border-border hover:border-primary/50 text-xs font-semibold text-text flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              @click="showTypeFilterSheet = true"
            >
              <span>{{ BALANCE_FILTER_TYPES[filterType] }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-text-muted" />
            </button>

            <!-- Waktu Filter Chip -->
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full bg-white border border-border hover:border-primary/50 text-xs font-semibold text-text flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              @click="showTimeFilterSheet = true"
            >
              <span>{{ BALANCE_FILTER_TIMES[filterTime] }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>

          <!-- History Mutation List -->
          <div class="space-y-2.5">
            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="space-y-2.5">
              <div
                v-for="i in 4"
                :key="i"
                class="bg-white rounded-2xl p-4 border border-border/70 flex items-center justify-between gap-3 animate-pulse"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-surface-2" />
                  <div class="space-y-1.5">
                    <div class="h-4 w-32 bg-surface-2 rounded-md" />
                    <div class="h-3 w-20 bg-surface-2 rounded-md" />
                  </div>
                </div>
                <div class="h-4 w-16 bg-surface-2 rounded-md" />
              </div>
            </div>

            <!-- Error State -->
            <div
              v-else-if="errorMessage"
              class="bg-white rounded-2xl p-6 border border-border text-center space-y-3"
            >
              <p class="text-xs sm:text-sm text-danger font-medium">
                {{ errorMessage }}
              </p>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark transition-colors"
                @click="fetchHistory(true)"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="historyList.length === 0"
              class="bg-white rounded-2xl p-8 border border-border/80 text-center flex flex-col items-center justify-center"
            >
              <div class="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mb-3">
                <Inbox class="w-7 h-7" />
              </div>
              <p class="text-sm font-bold text-text">
                Gak ada transaksi nih
              </p>
              <p class="text-xs text-text-muted mt-1 max-w-xs">
                Mutasi saldo masuk dan keluar dompet akan tercatat otomatis di sini.
              </p>
            </div>

            <!-- Mutation Item List -->
            <template v-else>
              <BalanceMutationItem
                v-for="item in historyList"
                :key="item.id"
                :item="item"
                @click="handleClickMutation"
              />

              <!-- Load More Button -->
              <div v-if="hasNextPage" class="pt-2 text-center">
                <button
                  type="button"
                  :disabled="isLoadingMore"
                  class="w-full py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-bold text-text transition-colors cursor-pointer disabled:opacity-50"
                  @click="loadMore"
                >
                  <span v-if="isLoadingMore">Memuat lebih banyak...</span>
                  <span v-else>Muat Lebih Banyak</span>
                </button>
              </div>
            </template>
          </div>
        </section>
      </main>
    </div>

    <!-- ========================================== -->
    <!-- 2. DESKTOP VIEW (lg+)                      -->
    <!-- ========================================== -->
    <div class="hidden lg:block max-w-6xl mx-auto px-6 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">
          Beranda
        </NuxtLink>
        <ChevronRight class="w-3.5 h-3.5 text-text-muted/60" />
        <span class="text-text font-bold">Saldo Saya</span>
      </nav>

      <!-- Two-Column Desktop Layout -->
      <div class="grid grid-cols-12 gap-8 items-start">
        <!-- Left Column: Balance Overview & Desktop Guide Cards -->
        <!-- sticky top-32 with 32px breathing room below header when scrolled -->
        <div class="col-span-5 space-y-5 sticky top-32">
          <!-- Total Balance Header Card -->
          <BalanceHeaderCard
            :balance="balance"
            :is-loading="isBalanceLoading"
            :is-verified="isUserVerified"
            @open-withdraw="handleOpenWithdraw"
            @open-bank="handleOpenBank"
            @require-verification="handleRequireVerification"
          />

          <!-- Desktop Guide & Help Sidebar -->
          <BalanceDesktopGuide
            :is-verified="isUserVerified"
          />
        </div>

        <!-- Right Column: Riwayat Transaksi -->
        <div class="col-span-7 bg-white rounded-3xl border border-border/80 p-6 shadow-sm">
          <div class="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
            <div>
              <h2 class="text-lg font-bold text-text">
                Riwayat Transaksi
              </h2>
              <p class="text-xs text-text-muted mt-0.5">
                Pantau mutasi masuk dan keluar dompet BekasKu
              </p>
            </div>

            <!-- Filter Controls -->
            <div class="flex items-center gap-2">
              <!-- Type Filter -->
              <div class="relative">
                <select
                  :value="filterType"
                  class="h-9 pl-3 pr-8 rounded-xl border border-border bg-surface-1 text-xs font-semibold text-text focus:outline-hidden focus:border-primary transition-colors appearance-none cursor-pointer"
                  @change="setFilterType(Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="(label, idx) in BALANCE_FILTER_TYPES"
                    :key="idx"
                    :value="idx"
                  >
                    {{ label }}
                  </option>
                </select>
                <ChevronDown class="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Time Filter -->
              <div class="relative">
                <select
                  :value="filterTime"
                  class="h-9 pl-3 pr-8 rounded-xl border border-border bg-surface-1 text-xs font-semibold text-text focus:outline-hidden focus:border-primary transition-colors appearance-none cursor-pointer"
                  @change="setFilterTime(Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="(label, idx) in BALANCE_FILTER_TIMES"
                    :key="idx"
                    :value="idx"
                  >
                    {{ label }}
                  </option>
                </select>
                <ChevronDown class="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- History List Container -->
          <div class="space-y-3">
            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="space-y-3">
              <div
                v-for="i in 5"
                :key="i"
                class="bg-white rounded-2xl p-4 border border-border/70 flex items-center justify-between gap-3 animate-pulse"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-surface-2" />
                  <div class="space-y-1.5">
                    <div class="h-4 w-40 bg-surface-2 rounded-md" />
                    <div class="h-3 w-24 bg-surface-2 rounded-md" />
                  </div>
                </div>
                <div class="h-4 w-20 bg-surface-2 rounded-md" />
              </div>
            </div>

            <!-- Error State -->
            <div
              v-else-if="errorMessage"
              class="rounded-2xl p-8 border border-border text-center space-y-3"
            >
              <p class="text-sm text-danger font-medium">
                {{ errorMessage }}
              </p>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark transition-colors"
                @click="fetchHistory(true)"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="historyList.length === 0"
              class="rounded-2xl p-12 border border-dashed border-border text-center flex flex-col items-center justify-center bg-surface-1"
            >
              <div class="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mb-3">
                <Inbox class="w-8 h-8" />
              </div>
              <p class="text-base font-bold text-text">
                Gak ada transaksi nih
              </p>
              <p class="text-xs text-text-muted mt-1 max-w-sm">
                Mutasi saldo masuk dan keluar dompet akan tercatat otomatis di sini.
              </p>
            </div>

            <!-- Mutation Item List -->
            <template v-else>
              <BalanceMutationItem
                v-for="item in historyList"
                :key="item.id"
                :item="item"
                @click="handleClickMutation"
              />

              <!-- Load More Button -->
              <div v-if="hasNextPage" class="pt-3 text-center">
                <button
                  type="button"
                  :disabled="isLoadingMore"
                  class="px-6 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-bold text-text transition-colors cursor-pointer disabled:opacity-50"
                  @click="loadMore"
                >
                  <span v-if="isLoadingMore">Memuat lebih banyak...</span>
                  <span v-else>Muat Lebih Banyak</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 3. GLOBAL SHEETS & MODALS                  -->
    <!-- ========================================== -->
    <!-- Wide Two-Column Withdraw Modal (Desktop & Mobile) -->
    <BalanceWithdrawModal
      v-model="showWithdrawModal"
      :balance="balance"
      @success="handleWithdrawSuccess"
    />

    <!-- Tipe Transaksi Filter Sheet (Mobile) -->
    <BalanceFilterSheet
      v-model="showTypeFilterSheet"
      title="Tipe Transaksi"
      :options="BALANCE_FILTER_TYPES"
      :selected-index="filterType"
      @select="setFilterType"
    />

    <!-- Waktu Filter Sheet (Mobile) -->
    <BalanceFilterSheet
      v-model="showTimeFilterSheet"
      title="Waktu"
      :options="BALANCE_FILTER_TIMES"
      :selected-index="filterTime"
      @select="setFilterTime"
    />

    <!-- Transaction Detail Modal -->
    <BalanceTransactionDetailModal
      v-model="showDetailModal"
      :item="selectedMutation"
    />
  </div>
</template>
