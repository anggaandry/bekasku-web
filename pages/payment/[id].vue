<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  FileText,
  CircleX,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next'
import { usePaymentDashboard } from '~/composables/usePaymentDashboard'
import PaymentTimerBanner from '~/components/payment/PaymentTimerBanner.vue'
import PaymentMethodCard from '~/components/payment/PaymentMethodCard.vue'
import PaymentInstructionAccordion from '~/components/payment/PaymentInstructionAccordion.vue'
import PaymentHelpBanner from '~/components/payment/PaymentHelpBanner.vue'
import PaymentQrDownloadModal from '~/components/payment/PaymentQrDownloadModal.vue'
import PaymentInstantCancelModal from '~/components/payment/PaymentInstantCancelModal.vue'
import PaymentDetailModal from '~/components/payment/PaymentDetailModal.vue'
import SubscribeWizardStep from '~/components/subscribe/SubscribeWizardStep.vue'
import CheckoutWizardStep from '~/components/checkout/CheckoutWizardStep.vue'
import { useHelpChatStore } from '~/stores/helpChat'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const paymentId = computed(() => String(route.params.id || ''))
const initialSource = computed(() => String(route.query.source || ''))

useHead({
  title: 'Pembayaran — BekasKu',
  meta: [
    { name: 'description', content: 'Instruksi pembayaran pesanan di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const {
  loading,
  error,
  data,
  source,
  isNonTransaction,
  formattedDuration,
  checkingStatus,
  sendingMakePayment,
  isCanceling,
  showQrModal,
  qrCompleted,
  qrProgress,
  qrError,
  qrBlobUrl,
  qrFileName,
  fetchDashboard,
  checkPaymentStatus,
  makePayment,
  downloadQr,
  cancelOrderInstant,
} = usePaymentDashboard(paymentId.value, initialSource.value)

const showCancelConfirmModal = ref(false)
const showDetailModal = ref(false)
const helpChatStore = useHelpChatStore()

const isSubscriptionFlow = computed(() => {
  const src = (source.value || '').toLowerCase()
  const pType = (data.value?.payment_type || '').toLowerCase()
  return (
    src === 'subscription' ||
    src === 'vip' ||
    pType === 'subscription' ||
    Boolean(data.value?.type_subscribe)
  )
})

const isCheckoutFlow = computed(() => {
  if (isSubscriptionFlow.value) return false
  const src = (source.value || '').toLowerCase()
  return src === 'checkout' || src === 'transaction' || !isNonTransaction.value
})

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo(isSubscriptionFlow.value ? '/subscribe/vip' : '/transaction')
  }
}

function handleHelpCenterClick() {
  const inv = data.value?.invoice_no
  const text = inv
    ? `Halo Bekasku Center, saya butuh bantuan seputar pembayaran nomor tagihan ${inv}`
    : 'Halo Bekasku Center, saya butuh bantuan seputar pembayaran di BekasKu'
  helpChatStore.openHelpChat({
    topic: 'payment',
    referenceId: paymentId.value,
    referenceTitle: inv ? `Tagihan #${inv}` : 'Pembayaran BekasKu',
    initialMessage: text,
  })
}

function goToDetail() {
  showDetailModal.value = true
}

function handlePrimaryBottomAction() {
  if (isSubscriptionFlow.value) {
    navigateTo('/subscribe/vip')
    return
  }

  if (isNonTransaction.value) {
    navigateTo('/')
    return
  }

  if (source.value === 'transaction') {
    showDetailModal.value = true
  } else {
    navigateTo('/')
  }
}

async function handleConfirmCancel() {
  const success = await cancelOrderInstant()
  if (success) {
    showCancelConfirmModal.value = false
  }
}

function handleDetailPaid() {
  showDetailModal.value = false
  navigateTo(isSubscriptionFlow.value ? '/subscribe/vip' : '/transaction')
}

function handleDetailCancelled() {
  showDetailModal.value = false
  navigateTo(isSubscriptionFlow.value ? '/subscribe/vip' : '/transaction')
}
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col font-outfit">
    <!-- Mobile Header (< md) -->
    <header class="md:hidden sticky top-0 z-40 bg-white border-b border-border shadow-2xs">
      <div class="max-w-xl mx-auto h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 class="text-base sm:text-lg font-bold text-text truncate">
          Pembayaran
        </h1>

        <div class="w-9" />
      </div>
    </header>

    <!-- Desktop Step Wizard (md+) -->
    <SubscribeWizardStep
      v-if="isSubscriptionFlow"
      :current-step="3"
      :can-navigate-back="false"
    />
    <CheckoutWizardStep
      v-else-if="isCheckoutFlow"
      :current-step="3"
      :can-navigate-back="false"
    />

    <!-- Top Timer Banner -->
    <div class="max-w-xl w-full mx-auto md:px-4 md:pt-2">
      <div class="md:rounded-xl overflow-hidden">
        <PaymentTimerBanner
          v-if="data && !loading && !error"
          :duration-text="formattedDuration"
        />
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 space-y-5 pb-28">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="py-20 flex flex-col items-center justify-center text-center space-y-3"
      >
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <p class="text-xs sm:text-sm text-text-muted">
          Memuat instruksi pembayaran...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error || !data"
        class="py-16 bg-white rounded-3xl border border-border p-6 text-center space-y-4"
      >
        <div
          class="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center"
        >
          <AlertTriangle class="w-7 h-7 stroke-[2]" />
        </div>
        <div>
          <h2 class="text-base font-bold text-text">Gagal Memuat Tagihan</h2>
          <p class="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
            {{ error || 'Informasi pembayaran tidak ditemukan.' }}
          </p>
        </div>
        <button
          type="button"
          class="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          @click="fetchDashboard"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Success Loaded View -->
      <template v-else>
        <!-- Main Unified Payment Card (QRIS, VA, OVO, Cashless) -->
        <PaymentMethodCard
          :data="data"
          :checking-status="checkingStatus"
          :sending-make-payment="sendingMakePayment"
          @check-status="checkPaymentStatus(true)"
          @download-qr="downloadQr"
          @make-payment="makePayment"
        />

        <!-- Petunjuk Pembayaran Accordion -->
        <PaymentInstructionAccordion :guides="data.guide || []" />

        <!-- Card Bantuan Bekasku Center -->
        <PaymentHelpBanner @click="handleHelpCenterClick" />
      </template>
    </main>

    <!-- Bottom Action Bar (Fixed Sticky) -->
    <footer
      v-if="data && !loading && !error"
      class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-lg font-outfit"
    >
      <div class="max-w-xl mx-auto p-3 sm:p-4 flex items-center gap-2.5">
        <!-- Transaksi Barang (!isNonTransaction): 3 Tombol Sesuai Screenshot Mobile -->
        <template v-if="!isNonTransaction">
          <!-- Icon Button: Detail Pesanan -->
          <button
            type="button"
            class="w-12 h-12 rounded-xl border border-primary/25 bg-primary/8 text-primary hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Detail Pesanan"
            aria-label="Detail Pesanan"
            @click="goToDetail"
          >
            <FileText class="w-5 h-5 stroke-[2]" />
          </button>

          <!-- Tombol Batalkan -->
          <button
            type="button"
            class="flex-2 py-3 px-3 rounded-xl border border-danger hover:bg-danger/5 text-danger text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
            @click="showCancelConfirmModal = true"
          >
            <CircleX class="w-4 h-4 stroke-[2]" />
            <span>Batalkan</span>
          </button>

          <!-- Tombol Kanan (Kembali ke Beranda atau Detail Pesanan) -->
          <button
            type="button"
            class="flex-3 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer active:scale-98 text-center truncate"
            @click="handlePrimaryBottomAction"
          >
            {{ source === 'transaction' ? 'Detail Pesanan' : 'Kembali ke Beranda' }}
          </button>
        </template>

        <!-- Layanan Digital (Subscription / Promosi): Icon Detail + Hapus + Kembali -->
        <template v-else>
          <!-- Icon Button: Detail Tagihan -->
          <button
            type="button"
            class="w-12 h-12 rounded-xl border border-primary/25 bg-primary/8 text-primary hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Detail Tagihan"
            aria-label="Detail Tagihan"
            @click="goToDetail"
          >
            <FileText class="w-5 h-5 stroke-[2]" />
          </button>

          <!-- Tombol Hapus Tagihan -->
          <button
            type="button"
            class="flex-2 py-3 px-3 rounded-xl border border-danger hover:bg-danger/5 text-danger text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
            @click="showCancelConfirmModal = true"
          >
            <Trash2 class="w-4 h-4 stroke-[2]" />
            <span>Hapus</span>
          </button>

          <!-- Tombol Kembali -->
          <button
            type="button"
            class="flex-3 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer active:scale-98 text-center"
            @click="handlePrimaryBottomAction"
          >
            {{ isSubscriptionFlow ? 'Kembali ke Paket VIP' : 'Kembali ke Beranda' }}
          </button>
        </template>
      </div>
    </footer>

    <!-- Modal Detail Pesanan / Tagihan -->
    <PaymentDetailModal
      v-model="showDetailModal"
      :payment-id="paymentId"
      @pay="showDetailModal = false"
      @paid="handleDetailPaid"
      @cancelled="handleDetailCancelled"
    />

    <!-- Modal Unduh Kode QR -->
    <PaymentQrDownloadModal
      v-model="showQrModal"
      :is-completed="qrCompleted"
      :error-message="qrError"
      :progress="qrProgress"
      :file-name="qrFileName"
      :blob-url="qrBlobUrl"
    />

    <!-- Modal Konfirmasi Batal / Hapus Tagihan -->
    <PaymentInstantCancelModal
      v-model="showCancelConfirmModal"
      :is-delete="isNonTransaction"
      :loading="isCanceling"
      @confirm="handleConfirmCancel"
    />
  </div>
</template>
