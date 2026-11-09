<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTransactionList } from '~/composables/useTransactionList'
import { useTransactionDetail } from '~/composables/useTransactionDetail'
import { useTransactionTracking } from '~/composables/useTransactionTracking'
import TransactionHeader from '~/components/transaction/TransactionHeader.vue'
import TransactionTabs from '~/components/transaction/TransactionTabs.vue'
import TransactionCard from '~/components/transaction/TransactionCard.vue'
import TransactionEmptyState from '~/components/transaction/TransactionEmptyState.vue'
import TransactionStatusHeader from '~/components/transaction/TransactionStatusHeader.vue'
import TransactionPartyCard from '~/components/transaction/TransactionPartyCard.vue'
import TransactionProducts from '~/components/transaction/TransactionProducts.vue'
import TransactionShippingInfo from '~/components/transaction/TransactionShippingInfo.vue'
import TransactionPriceDetail from '~/components/transaction/TransactionPriceDetail.vue'
import TransactionSupportBar from '~/components/transaction/TransactionSupportBar.vue'
import TransactionActionBar from '~/components/transaction/TransactionActionBar.vue'
import CancelReasonModal from '~/components/transaction/CancelReasonModal.vue'
import PickupInfoModal from '~/components/transaction/PickupInfoModal.vue'
import DropoffInfoModal from '~/components/transaction/DropoffInfoModal.vue'
import TrackingTimeline from '~/components/transaction/TrackingTimeline.vue'
import ShippingLabelViewer from '~/components/transaction/ShippingLabelViewer.vue'
import MeetModal from '~/components/transaction/MeetModal.vue'
import ReviewOrderModal from '~/components/transaction/ReviewOrderModal.vue'
import ComplainModal from '~/components/transaction/ComplainModal.vue'
import BalanceHistoryModal from '~/components/transaction/BalanceHistoryModal.vue'
import PaymentDashboardModal from '~/components/payment/PaymentDashboardModal.vue'
import PaymentDetailView from '~/components/payment/PaymentDetailView.vue'
import AppGuestPromptCard from '~/components/shared/AppGuestPromptCard.vue'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import AppProductCard from '~/components/shared/AppProductCard.vue'
import { ShoppingBag, X, Heart, ArrowLeft } from 'lucide-vue-next'
import type { TransactionListItem } from '~/types/transaction'

useHead({
  title: 'Transaksi Saya — BekasKu',
  meta: [
    { name: 'description', content: 'Daftar dan status transaksi Anda di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()

const {
  selectedStep,
  steps,
  transactions,
  isLoading,
  isLoadingMore,
  isRefreshing,
  hasMore,
  tabCounts,
  recommendations,
  recomLoading,
  recomHasMore,
  changeStep,
  fetchData,
  fetchTabCounts,
  onRefresh,
  onLoadMore,
  fetchRecommendations,
  loadMoreRecommendations,
} = useTransactionList()

// Active transaction selected on desktop master-detail
const selectedTransactionId = ref<string>('')
const isPaymentSelected = ref<boolean>(false)

// Transaction detail for desktop right panel
const {
  detail,
  isLoading: isDetailLoading,
  isActionLoading,
  errorMessage: detailError,
  labelUrl,
  isSeller,
  isBuyer,
  isMeet,
  canConfirm,
  canCancel,
  canRequestPickup,
  canRequestDropoff,
  canPrintLabel,
  canFinish,
  canTrack,
  fetchDetail,
  cancelTransaction,
  confirmTransaction,
  requestPickup,
  reschedulePickup,
  requestDropoff,
  finishTransaction,
  fetchShippingLabel,
} = useTransactionDetail(selectedTransactionId)

// Tracking
const showTrackingModal = ref(false)
const {
  tracking,
  isLoading: isTrackingLoading,
  fetchTracking,
} = useTransactionTracking(selectedTransactionId)

// Modal states
const showCancelModal = ref(false)
const showPickupModal = ref(false)
const showDropoffModal = ref(false)
const showLabelModal = ref(false)
const showConfirmFinishModal = ref(false)
const showConfirmAcceptModal = ref(false)
const showMeetModal = ref(false)
const showReviewModal = ref(false)
const showComplainModal = ref(false)
const complainModalMode = ref<'select' | 'form' | 'detail' | 'waybill'>('detail')
const showBalanceModal = ref(false)
const showMobileDetail = ref(false)
const showPaymentDashboardModal = ref(false)
const activePaymentId = ref('')
const activePaymentSource = ref('transaction')

function closeMobileDetail() {
  showMobileDetail.value = false
  const q = { ...route.query }
  delete q.id
  delete q.open_review
  delete q.open_complain
  delete q.open_meet
  delete q.mode
  router.replace({ query: q })
}

// Resolve initial tab from route query
function resolveTabFromQuery() {
  if (route.query.open_balance === 'true' || route.query.balance === 'true') {
    showBalanceModal.value = true
  }
  if (route.query.id) {
    selectedTransactionId.value = String(route.query.id)
    showMobileDetail.value = true
  }
  if (route.query.open_meet === 'true' || route.query.meet === 'true') {
    showMeetModal.value = true
  }
  if (route.query.open_review === 'true' || route.query.review === 'true') {
    showReviewModal.value = true
  }
  if (route.query.open_complain === 'true' || route.query.complain === 'true') {
    showComplainModal.value = true
    if (route.query.mode === 'select' || route.query.mode === 'form' || route.query.mode === 'waybill') {
      complainModalMode.value = route.query.mode as any
    }
  }
  const q = route.query.tab
  if (!q) return
  const s = String(q).toLowerCase().trim()
  if (s === 'all' || s === 'semua' || s === '0') changeStep(0)
  else if (s === 'unpaid' || s === 'bayar' || s === 'belum_bayar' || s === '1') changeStep(1)
  else if (s === 'dikemas' || s === 'process' || s === 'packing' || s === '2') changeStep(2)
  else if (s === 'dikirim' || s === 'sent' || s === 'shipping' || s === '3') changeStep(3)
  else if (s === 'selesai' || s === 'done' || s === 'finish' || s === '4') changeStep(4)
  else if (s === 'return' || s === 'pengembalian' || s === 'complain' || s === '5') changeStep(5)
  else if (s === 'cancel' || s === 'dibatalkan' || s === '6') changeStep(6)
  else if (s === 'paid' || s === 'sudah_bayar' || s === '7') changeStep(7)
}

watch(
  () => route.query.tab,
  () => {
    resolveTabFromQuery()
  }
)

watch(selectedTransactionId, (id) => {
  if (id && authStore.isLoggedIn && !isPaymentSelected.value) {
    fetchDetail()
  }
})

watch(
  () => authStore.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) {
      await Promise.all([
        fetchData(),
        fetchTabCounts(),
      ])
    }
  },
  { immediate: true }
)

onMounted(async () => {
  resolveTabFromQuery()
  await fetchRecommendations()
  if (authStore.isLoggedIn) {
    if (transactions.value.length === 0) {
      await Promise.all([
        fetchData(),
        fetchTabCounts(),
      ])
    }

    // On desktop, auto-select first transaction if available
    if (window.innerWidth >= 1024 && transactions.value.length > 0 && !selectedTransactionId.value) {
      const first = transactions.value[0]
      if (first) {
        isPaymentSelected.value = Boolean(first.isPayment)
        selectedTransactionId.value = first.id
        if (first.isPayment) {
          activePaymentId.value = first.id
          activePaymentSource.value = first.paymentType || 'transaction'
        } else {
          await fetchDetail()
        }
      }
    }
  }
})

// When switching tabs, clear selected transaction on desktop
watch(selectedStep, () => {
  selectedTransactionId.value = ''
  isPaymentSelected.value = false
})

// Auto select first transaction after data loads on desktop if none selected
watch(transactions, (list) => {
  if (selectedTransactionId.value && list.length > 0) {
    const matched = list.find(t => t.id === selectedTransactionId.value)
    if (matched) {
      isPaymentSelected.value = Boolean(matched.isPayment)
      if (matched.isPayment) {
        activePaymentId.value = matched.id
        activePaymentSource.value = matched.paymentType || 'transaction'
      }
    } else if (selectedStep.value === 1 || selectedStep.value === 7) {
      isPaymentSelected.value = true
    }
  }

  if (import.meta.client && window.innerWidth >= 1024 && list.length > 0 && !selectedTransactionId.value) {
    const first = list[0]
    if (first) {
      isPaymentSelected.value = Boolean(first.isPayment)
      selectedTransactionId.value = first.id
      if (first.isPayment) {
        activePaymentId.value = first.id
        activePaymentSource.value = first.paymentType || 'transaction'
      } else {
        fetchDetail()
      }
    }
  }
})

function handleCardClick(item: TransactionListItem) {
  isPaymentSelected.value = Boolean(item.isPayment)
  selectedTransactionId.value = item.id

  if (item.isPayment) {
    activePaymentId.value = item.id
    activePaymentSource.value = item.paymentType || 'transaction'
  } else {
    fetchDetail()
  }

  if (import.meta.client && window.innerWidth < 1024) {
    showMobileDetail.value = true
  }
}

function handlePayClick(item: TransactionListItem) {
  activePaymentId.value = item.id
  activePaymentSource.value = item.paymentType || 'transaction'
  showPaymentDashboardModal.value = true
}

function handlePaymentDetailToDashboard() {
  const matched = transactions.value.find(t => t.id === selectedTransactionId.value)
  activePaymentId.value = selectedTransactionId.value
  activePaymentSource.value = matched?.paymentType || activePaymentSource.value || 'transaction'
  showPaymentDashboardModal.value = true
}

function handlePaymentDashboardToDetail() {
  showPaymentDashboardModal.value = false
  if (import.meta.client && window.innerWidth < 1024) {
    showMobileDetail.value = true
  }
}

async function handlePaymentSuccess() {
  showPaymentDashboardModal.value = false
  showMobileDetail.value = false
  selectedTransactionId.value = ''
  isPaymentSelected.value = false
  await Promise.all([
    fetchData(),
    fetchTabCounts(),
  ])
}

async function handlePaymentCancelled() {
  showPaymentDashboardModal.value = false
  showMobileDetail.value = false
  selectedTransactionId.value = ''
  isPaymentSelected.value = false
  await Promise.all([
    fetchData(),
    fetchTabCounts(),
  ])
}

// Action triggers
async function handleConfirmSubmit() {
  try {
    await confirmTransaction()
    showConfirmAcceptModal.value = false
    await fetchTabCounts()
  } catch (err: any) {
    alert(err?.message || 'Gagal konfirmasi pesanan')
  }
}

async function handleCancelSubmit(reason: string) {
  try {
    await cancelTransaction(reason)
    showCancelModal.value = false
    await fetchTabCounts()
  } catch (err: any) {
    alert(err?.message || 'Gagal batalkan pesanan')
  }
}

async function handlePickupConfirm() {
  try {
    await requestPickup()
    showPickupModal.value = false
    await fetchTabCounts()
  } catch (err: any) {
    alert(err?.message || 'Gagal ajukan pickup')
  }
}

async function handleDropoffConfirm() {
  try {
    await requestDropoff()
    showDropoffModal.value = false
    await fetchTabCounts()
  } catch (err: any) {
    alert(err?.message || 'Gagal alihkan ke dropoff')
  }
}

async function handlePrintLabel() {
  try {
    const url = await fetchShippingLabel()
    if (url) {
      showLabelModal.value = true
    }
  } catch (err: any) {
    alert(err?.message || 'Gagal memuat label pengiriman')
  }
}

async function handleFinishConfirm() {
  try {
    await finishTransaction()
    showConfirmFinishModal.value = false
    await fetchTabCounts()
  } catch (err: any) {
    alert(err?.message || 'Gagal menyelesaikan pesanan')
  }
}

async function handleOpenTracking() {
  if (!selectedTransactionId.value) return
  showTrackingModal.value = true
  await fetchTracking()
}

async function handleMeetCompleted() {
  await Promise.all([
    fetchDetail(),
    fetchData(),
    fetchTabCounts()
  ])
}

function openComplainCreate() {
  complainModalMode.value = 'select'
  showComplainModal.value = true
}

function openComplainDetail() {
  complainModalMode.value = 'detail'
  showComplainModal.value = true
}

function openComplainWaybill() {
  complainModalMode.value = 'waybill'
  showComplainModal.value = true
}

async function handleReviewCompleted() {
  await Promise.all([
    fetchDetail(),
    fetchData(),
    fetchTabCounts()
  ])
}

async function handleComplainCompleted() {
  await Promise.all([
    fetchDetail(),
    fetchData(),
    fetchTabCounts()
  ])
}
</script>

<template>
  <div class="min-h-screen lg:min-h-0 lg:h-[calc(100dvh-105px)] lg:max-h-[calc(100dvh-105px)] flex flex-col bg-bg lg:overflow-hidden">
    <!-- Header -->
    <TransactionHeader title="Transaksi saya" mode="list" />

    <!-- Guest Prompt if not logged in -->
    <div v-if="!authStore.isLoggedIn" class="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <AppGuestPromptCard
        feature-title="Transaksi Saya"
        message="Masuk atau daftar akun BekasKu untuk melihat riwayat transaksi dan melacak pesanan Anda."
        action-label="Login atau Registrasi"
        @action="authModal.openLogin({ redirectPath: '/transaction' })"
      />

      <!-- Recommendations for guest -->
      <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12">
        <h3 class="font-outfit font-bold text-base sm:text-lg text-text mb-4">
          Sesuai kesukaan kamu
        </h3>

        <!-- Shimmer Loading -->
        <div
          v-if="recomLoading && recommendations.length === 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          <div
            v-for="i in 10"
            :key="`guest_shimmer_${i}`"
            class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
          >
            <div class="w-full aspect-square bg-surface-2 rounded-lg" />
            <div class="h-4 bg-surface-2 rounded w-3/4" />
            <div class="h-3 bg-surface-2 rounded w-1/2" />
          </div>
        </div>

        <!-- Product Cards -->
        <div
          v-else-if="recommendations.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          <AppProductCard
            v-for="product in recommendations"
            :key="product.id || product._id"
            :product="product"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="recomHasMore && !recomLoading" class="pt-6 text-center">
          <button
            type="button"
            class="px-6 py-2.5 rounded-full border border-border bg-white hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer shadow-2xs"
            @click="loadMoreRecommendations"
          >
            Muat Produk Lainnya
          </button>
        </div>
      </div>
    </div>

    <!-- Logged In Layout -->
    <div v-else class="flex-1 flex flex-col lg:overflow-hidden">
      <!-- Full-Width Sticky Tabs (Desktop & Mobile) -->
      <div class="bg-white border-b border-border sticky top-14 md:top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <!-- Status Tabs (Semua sampai Sudah Bayar) -->
          <div class="flex-1 min-w-0">
            <TransactionTabs
              :steps="steps"
              :selected-step="selectedStep"
              :tab-counts="tabCounts"
              @select="changeStep"
            />
          </div>

          <!-- Wishlist Button Sejajar Tabs on Desktop -->
          <div class="hidden md:flex items-center shrink-0">
            <NuxtLink
              to="/favorite"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-xs font-outfit font-medium text-text hover:text-primary transition-colors cursor-pointer bg-white hover:bg-surface-2 shadow-2xs"
            >
              <Heart class="w-3.5 h-3.5 text-primary" />
              <span>Wishlist</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile List View (< lg) -->
      <div class="lg:hidden flex-1 p-3 sm:p-4 space-y-3 pb-24">
        <!-- Loading Skeletons -->
        <div v-if="isLoading && transactions.length === 0" class="space-y-3">
          <div
            v-for="n in 3"
            :key="n"
            class="bg-white rounded-xl border border-border p-4 space-y-3"
          >
            <div class="flex items-center justify-between">
              <AppSkeleton class="w-28 h-4 rounded" />
              <AppSkeleton class="w-20 h-5 rounded" />
            </div>
            <div class="flex items-start gap-3">
              <AppSkeleton class="w-16 h-16 rounded-lg" />
              <div class="flex-1 space-y-2">
                <AppSkeleton class="w-full h-4 rounded" />
                <AppSkeleton class="w-3/4 h-4 rounded" />
                <AppSkeleton class="w-24 h-4 rounded ml-auto" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State with Recommendations -->
        <div
          v-else-if="!isLoading && transactions.length === 0"
          class="space-y-6"
        >
          <div class="bg-white rounded-xl border border-border">
            <TransactionEmptyState />
          </div>

          <!-- Sesuai Kesukaan Kamu (Recommendation Grid) -->
          <div class="pt-2">
            <h3 class="font-outfit font-bold text-sm sm:text-base text-text mb-3">
              Sesuai kesukaan kamu
            </h3>

            <!-- Shimmer Loading -->
            <div
              v-if="recomLoading && recommendations.length === 0"
              class="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <div
                v-for="i in 6"
                :key="`mob_empty_shimmer_${i}`"
                class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
              >
                <div class="w-full aspect-square bg-surface-2 rounded-lg" />
                <div class="h-4 bg-surface-2 rounded w-3/4" />
                <div class="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            </div>

            <!-- Recommendation Grid -->
            <div
              v-else-if="recommendations.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <AppProductCard
                v-for="product in recommendations"
                :key="product.id || product._id"
                :product="product"
              />
            </div>

            <!-- Shimmer More Loading -->
            <div
              v-if="recomLoading && recommendations.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3"
            >
              <div
                v-for="i in 4"
                :key="`mob_empty_shimmer_more_${i}`"
                class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
              >
                <div class="w-full aspect-square bg-surface-2 rounded-lg" />
                <div class="h-4 bg-surface-2 rounded w-3/4" />
                <div class="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="recomHasMore && !recomLoading" class="pt-4 text-center">
              <button
                type="button"
                class="px-5 py-2 rounded-full border border-border bg-white hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer shadow-2xs"
                @click="loadMoreRecommendations"
              >
                Muat Produk Lainnya
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile List Cards -->
        <div v-else class="space-y-3">
          <TransactionCard
            v-for="item in transactions"
            :key="item.id"
            :item="item"
            :is-selected="false"
            @click="handleCardClick"
            @pay="handlePayClick"
          />

          <!-- Load More Button -->
          <div v-if="hasMore" class="pt-2 text-center">
            <button
              type="button"
              :disabled="isLoadingMore"
              class="px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer disabled:opacity-50"
              @click="onLoadMore"
            >
              <span v-if="isLoadingMore">Memuat transaksi...</span>
              <span v-else>Muat Transaksi Lainnya</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile In-Place Detail Overlay (< lg) -->
      <div
        v-if="showMobileDetail && selectedTransactionId"
        class="fixed inset-0 z-40 bg-bg lg:hidden flex flex-col overflow-hidden animate-in fade-in duration-150"
      >
        <!-- IF PAYMENT IS SELECTED -->
        <PaymentDetailView
          v-if="isPaymentSelected"
          :key="`mob_payment_detail_${selectedTransactionId}`"
          :payment-id="selectedTransactionId"
          :is-mobile-overlay="true"
          @close="closeMobileDetail"
          @pay="handlePaymentDetailToDashboard"
          @paid="handlePaymentSuccess"
          @cancelled="handlePaymentCancelled"
        />

        <!-- ELSE REGULAR TRANSACTION -->
        <template v-else>
          <!-- Mobile Detail Header with Back Button -->
          <div class="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center justify-between shadow-2xs">
            <button
              type="button"
              class="flex items-center gap-2 text-text font-outfit font-semibold text-sm cursor-pointer"
              @click="closeMobileDetail"
            >
              <ArrowLeft class="w-5 h-5 text-text" />
              <span>Detail Pesanan</span>
            </button>
            <span v-if="detail?.invoice_no" class="text-xs text-text-muted font-mono font-medium">
              {{ detail.invoice_no }}
            </span>
          </div>

          <!-- Mobile Detail Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
            <!-- Loading State -->
            <div v-if="isDetailLoading" class="space-y-4">
              <AppSkeleton class="w-full h-24 rounded-2xl" />
              <AppSkeleton class="w-full h-28 rounded-2xl" />
              <AppSkeleton class="w-full h-32 rounded-2xl" />
            </div>

            <template v-else-if="detail">
              <!-- 1. Status Header -->
              <TransactionStatusHeader
                :detail="detail"
                :is-seller="isSeller"
                @track="handleOpenTracking"
                @meet="showMeetModal = true"
                @open-balance="showBalanceModal = true"
                @open-complain="openComplainDetail"
              />

              <!-- 2. Party Card (If Meetup / Pay & Pick) -->
              <TransactionPartyCard
                v-if="isMeet"
                :detail="detail"
                :is-seller="isSeller"
              />

              <!-- 3. Products -->
              <TransactionProducts :detail="detail" />

              <!-- 4. Shipping Info (For courier delivery) -->
              <TransactionShippingInfo
                v-if="!isMeet"
                :detail="detail"
                :can-track="canTrack"
                @track="handleOpenTracking"
              />

              <!-- 5. Party Card for Courier (if not meetup) -->
              <TransactionPartyCard
                v-if="!isMeet"
                :detail="detail"
                :is-seller="isSeller"
              />

              <!-- 6. Payment & Price Breakdown -->
              <TransactionPriceDetail
                :detail="detail"
                :is-seller="isSeller"
                @open-balance="showBalanceModal = true"
              />

              <!-- 7. Support Bar (BekasKu Center) -->
              <TransactionSupportBar />
            </template>

            <div v-else class="py-12 text-center text-text-muted text-xs">
              Gagal memuat detail transaksi.
            </div>
          </div>

          <!-- Mobile Sticky Bottom Action Bar -->
          <div v-if="detail" class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-border p-3 shadow-lg">
            <TransactionActionBar
              :detail="detail"
              :is-seller="isSeller"
              :is-action-loading="isActionLoading"
              :can-confirm="canConfirm"
              :can-cancel="canCancel"
              :can-request-pickup="canRequestPickup"
              :can-request-dropoff="canRequestDropoff"
              :can-print-label="canPrintLabel"
              :can-finish="canFinish"
              :can-track="canTrack"
              @confirm="showConfirmAcceptModal = true"
              @cancel="showCancelModal = true"
              @pickup="showPickupModal = true"
              @dropoff="showDropoffModal = true"
              @print="handlePrintLabel"
              @finish="showConfirmFinishModal = true"
              @track="handleOpenTracking"
              @meet="showMeetModal = true"
              @review="showReviewModal = true"
              @complain="openComplainCreate"
              @complain-detail="openComplainDetail"
              @waybill="openComplainWaybill"
              @finish-return="openComplainDetail"
            />
          </div>
        </template>
      </div>

      <!-- Desktop Master-Detail View (lg+) with Independent Scroll -->
      <div class="hidden lg:flex flex-1 overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 gap-6">
        <!-- Left Master Column (Transaction List) -->
        <div class="w-[420px] xl:w-[460px] shrink-0 h-full flex flex-col bg-white rounded-2xl border border-border/80 overflow-hidden shadow-2xs">
          <!-- Independent Scrollable Cards Container -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <!-- Loading Skeletons -->
            <div v-if="isLoading && transactions.length === 0" class="space-y-3">
              <div
                v-for="n in 3"
                :key="n"
                class="bg-white rounded-xl border border-border p-4 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <AppSkeleton class="w-28 h-4 rounded" />
                  <AppSkeleton class="w-20 h-5 rounded" />
                </div>
                <div class="flex items-start gap-3">
                  <AppSkeleton class="w-16 h-16 rounded-lg" />
                  <div class="flex-1 space-y-2">
                    <AppSkeleton class="w-full h-4 rounded" />
                    <AppSkeleton class="w-3/4 h-4 rounded" />
                    <AppSkeleton class="w-24 h-4 rounded ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State with Recommendations -->
            <div
              v-else-if="!isLoading && transactions.length === 0"
              class="space-y-6"
            >
              <div class="bg-white rounded-xl border border-border">
                <TransactionEmptyState />
              </div>

              <!-- Sesuai Kesukaan Kamu (Recommendation Grid) -->
              <div class="pt-2">
                <h3 class="font-outfit font-bold text-sm text-text mb-3">
                  Sesuai kesukaan kamu
                </h3>

                <!-- Shimmer Loading -->
                <div
                  v-if="recomLoading && recommendations.length === 0"
                  class="grid grid-cols-2 gap-3"
                >
                  <div
                    v-for="i in 4"
                    :key="`desk_empty_shimmer_${i}`"
                    class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
                  >
                    <div class="w-full aspect-square bg-surface-2 rounded-lg" />
                    <div class="h-4 bg-surface-2 rounded w-3/4" />
                    <div class="h-3 bg-surface-2 rounded w-1/2" />
                  </div>
                </div>

                <!-- Recommendation Grid -->
                <div
                  v-else-if="recommendations.length > 0"
                  class="grid grid-cols-2 gap-3"
                >
                  <AppProductCard
                    v-for="product in recommendations"
                    :key="product.id || product._id"
                    :product="product"
                  />
                </div>

                <!-- Shimmer More Loading -->
                <div
                  v-if="recomLoading && recommendations.length > 0"
                  class="grid grid-cols-2 gap-3 pt-3"
                >
                  <div
                    v-for="i in 2"
                    :key="`desk_empty_shimmer_more_${i}`"
                    class="rounded-xl border border-border bg-white overflow-hidden p-2.5 space-y-2 animate-pulse shadow-2xs"
                  >
                    <div class="w-full aspect-square bg-surface-2 rounded-lg" />
                    <div class="h-4 bg-surface-2 rounded w-3/4" />
                    <div class="h-3 bg-surface-2 rounded w-1/2" />
                  </div>
                </div>

                <!-- Load More Button -->
                <div v-if="recomHasMore && !recomLoading" class="pt-4 text-center pb-4">
                  <button
                    type="button"
                    class="px-4 py-2 rounded-full border border-border bg-white hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer shadow-2xs"
                    @click="loadMoreRecommendations"
                  >
                    Muat Produk Lainnya
                  </button>
                </div>
              </div>
            </div>

            <!-- List Cards -->
            <div v-else class="space-y-3">
              <TransactionCard
                v-for="item in transactions"
                :key="item.id"
                :item="item"
                :is-selected="selectedTransactionId === item.id"
                @click="handleCardClick"
                @pay="handlePayClick"
              />

              <!-- Load More Button -->
              <div v-if="hasMore" class="pt-2 text-center pb-4">
                <button
                  type="button"
                  :disabled="isLoadingMore"
                  class="px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer disabled:opacity-50"
                  @click="onLoadMore"
                >
                  <span v-if="isLoadingMore">Memuat transaksi...</span>
                  <span v-else>Muat Transaksi Lainnya</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Detail Column (Detail Panel with 100% Independent Scroll, Full Width) -->
        <div class="flex-1 h-full overflow-y-auto bg-surface-2 rounded-2xl border border-border/80 flex flex-col relative custom-scrollbar shadow-2xs">
          <!-- IF PAYMENT IS SELECTED -->
          <PaymentDetailView
            v-if="isPaymentSelected && selectedTransactionId"
            :key="`desk_payment_detail_${selectedTransactionId}`"
            :payment-id="selectedTransactionId"
            @pay="handlePaymentDetailToDashboard"
            @paid="handlePaymentSuccess"
            @cancelled="handlePaymentCancelled"
          />

          <!-- Loading State -->
          <div
            v-else-if="isDetailLoading"
            class="w-full pt-0 px-3 pb-3 space-y-3"
          >
            <AppSkeleton class="w-48 h-6 rounded" />
            <AppSkeleton class="w-full h-32 rounded-2xl" />
            <AppSkeleton class="w-full h-40 rounded-2xl" />
          </div>

          <!-- Selected Transaction Detail Matching 4 Screenshots (Full Width) -->
          <div
            v-else-if="detail && selectedTransactionId"
            class="flex-1 flex flex-col"
          >
            <!-- Content Wrapper (Aligned with List Box, reduced margins) -->
            <div class="w-full pt-0 px-3 pb-3 space-y-3 flex-1">
              <!-- 1. Status Header -->
              <TransactionStatusHeader
                :detail="detail"
                :is-seller="isSeller"
                @track="handleOpenTracking"
                @meet="showMeetModal = true"
                @open-balance="showBalanceModal = true"
                @open-complain="openComplainDetail"
              />

              <!-- 2. Party Card (If Meetup / Pay & Pick, appears right after status) -->
              <TransactionPartyCard
                v-if="isMeet"
                :detail="detail"
                :is-seller="isSeller"
              />

              <!-- 3. Products -->
              <TransactionProducts :detail="detail" />

              <!-- 4. Shipping Info (For courier delivery) -->
              <TransactionShippingInfo
                v-if="!isMeet"
                :detail="detail"
                :can-track="canTrack"
                @track="handleOpenTracking"
              />

              <!-- 5. Party Card for Courier (if not meetup) -->
              <TransactionPartyCard
                v-if="!isMeet"
                :detail="detail"
                :is-seller="isSeller"
              />

              <!-- 6. Payment & Price Breakdown -->
              <TransactionPriceDetail
                :detail="detail"
                :is-seller="isSeller"
                @open-balance="showBalanceModal = true"
              />

              <!-- 7. Support Bar (BekasKu Center) -->
              <TransactionSupportBar />
            </div>

            <!-- Sticky Bottom Action Bar at the Bottom of Detail Panel -->
            <div class="sticky bottom-0 z-20 bg-white border-t border-border px-4 py-3 shadow-sm mt-auto rounded-b-2xl">
              <TransactionActionBar
                :detail="detail"
                :is-seller="isSeller"
                :is-action-loading="isActionLoading"
                :can-confirm="canConfirm"
                :can-cancel="canCancel"
                :can-request-pickup="canRequestPickup"
                :can-request-dropoff="canRequestDropoff"
                :can-print-label="canPrintLabel"
                :can-finish="canFinish"
                :can-track="canTrack"
                @confirm="showConfirmAcceptModal = true"
                @cancel="showCancelModal = true"
                @pickup="showPickupModal = true"
                @dropoff="showDropoffModal = true"
                @print="handlePrintLabel"
                @finish="showConfirmFinishModal = true"
                @track="handleOpenTracking"
                @meet="showMeetModal = true"
                @review="showReviewModal = true"
                @complain="openComplainCreate"
                @complain-detail="openComplainDetail"
                @waybill="openComplainWaybill"
                @finish-return="openComplainDetail"
              />
            </div>
          </div>

          <!-- Empty Detail Selection -->
          <div
            v-else
            class="flex-1 flex flex-col items-center justify-center p-12 text-center"
          >
            <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center text-text-muted mb-4 border border-border shadow-2xs">
              <ShoppingBag class="w-8 h-8 text-primary" />
            </div>
            <h3 class="font-outfit font-bold text-base text-text">
              Pilih Transaksi
            </h3>
            <p class="font-outfit text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
              Klik salah satu transaksi di sebelah kiri untuk melihat rincian lengkap pesanan.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Meetup QR Flow Modal -->
    <MeetModal
      v-if="detail"
      v-model="showMeetModal"
      :detail="detail"
      :is-seller="isSeller"
      @completed="handleMeetCompleted"
    />

    <!-- Review Modal -->
    <ReviewOrderModal
      v-if="detail"
      v-model="showReviewModal"
      :detail="detail"
      @success="handleReviewCompleted"
    />

    <!-- Complain Modal -->
    <ComplainModal
      v-if="detail"
      v-model="showComplainModal"
      :detail="detail"
      :is-seller="isSeller"
      :initial-mode="complainModalMode"
      @success="handleComplainCompleted"
    />

    <!-- Cancellation Reason Modal -->
    <CancelReasonModal
      v-model="showCancelModal"
      :is-seller="isSeller"
      :loading="isActionLoading"
      @submit="handleCancelSubmit"
    />

    <!-- Pickup Info Modal -->
    <PickupInfoModal
      v-if="detail"
      v-model="showPickupModal"
      :courier-name="detail.courier_name"
      :courier-logo="detail.courier_logo"
      :service-name="detail.waybill_service"
      :loading="isActionLoading"
      @confirm="handlePickupConfirm"
    />

    <!-- Dropoff Info Modal -->
    <DropoffInfoModal
      v-if="detail"
      v-model="showDropoffModal"
      :courier-name="detail.courier_name"
      :courier-logo="detail.courier_logo"
      :service-name="detail.waybill_service"
      :waybill="detail.waybill"
      :loading="isActionLoading"
      @confirm="handleDropoffConfirm"
    />

    <!-- Tracking Modal -->
    <div
      v-if="showTrackingModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="showTrackingModal = false"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden">
        <div class="p-4 border-b border-border flex items-center justify-between">
          <h3 class="font-outfit font-bold text-base text-text">
            Status Pengiriman
          </h3>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            @click="showTrackingModal = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 sm:p-5">
          <TrackingTimeline
            :tracking="tracking"
            :loading="isTrackingLoading"
          />
        </div>
      </div>
    </div>

    <!-- Shipping Label Viewer Modal -->
    <ShippingLabelViewer
      v-if="labelUrl"
      v-model="showLabelModal"
      :pdf-url="labelUrl"
    />

    <!-- Finish Confirm Modal -->
    <AppConfirmModal
      v-model="showConfirmFinishModal"
      title="Selesaikan Pesanan?"
      description="Pastikan barang yang Anda terima sudah lengkap dan sesuai pesanan. Setelah selesai, dana akan diteruskan ke penjual dan tidak dapat dibatalkan."
      confirm-label="Ya, Selesaikan"
      cancel-label="Periksa Kembali"
      :loading="isActionLoading"
      @confirm="handleFinishConfirm"
    />

    <!-- Accept Order Confirm Modal (Seller) -->
    <AppConfirmModal
      v-model="showConfirmAcceptModal"
      title="Konfirmasi Pesanan Ini?"
      description="Dengan mengonfirmasi pesanan, Anda menyetujui untuk menyiapkan barang dan mengatur jadwal pengiriman kepada pembeli."
      confirm-label="Konfirmasi Pesanan"
      cancel-label="Kembali"
      :loading="isActionLoading"
      @confirm="handleConfirmSubmit"
    />

    <!-- Balance History Modal (Web Saldo & Mutasi) -->
    <BalanceHistoryModal
      v-model="showBalanceModal"
    />

    <!-- Payment Dashboard Modal (Popup Modal Bayar Sekarang) -->
    <PaymentDashboardModal
      v-if="activePaymentId"
      :key="`dash_${activePaymentId}`"
      v-model="showPaymentDashboardModal"
      :payment-id="activePaymentId"
      :source="activePaymentSource"
      @paid="handlePaymentSuccess"
      @cancelled="handlePaymentCancelled"
      @open-detail="handlePaymentDashboardToDetail"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
