<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, FileText, Ban, Trash2 } from 'lucide-vue-next'
import { usePaymentDashboard } from '~/composables/usePaymentDashboard'
import PaymentTimerBanner from '~/components/payment/PaymentTimerBanner.vue'
import PaymentMethodCard from '~/components/payment/PaymentMethodCard.vue'
import PaymentInstructionAccordion from '~/components/payment/PaymentInstructionAccordion.vue'
import PaymentHelpBanner from '~/components/payment/PaymentHelpBanner.vue'
import PaymentQrDownloadModal from '~/components/payment/PaymentQrDownloadModal.vue'
import PaymentInstantCancelModal from '~/components/payment/PaymentInstantCancelModal.vue'
import PaymentCancelReasonModal from '~/components/payment/PaymentCancelReasonModal.vue'
import { useHelpChatStore } from '~/stores/helpChat'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    paymentId: string
    source?: string
  }>(),
  {
    source: 'transaction',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  paid: []
  cancelled: []
  'open-detail': []
}>()

const isMounted = ref(import.meta.client)
const showInstantCancelModal = ref(false)
const showReasonCancelModal = ref(false)
const helpChatStore = useHelpChatStore()

const {
  loading,
  error,
  data,
  limitPayment,
  formattedDuration,
  checkingStatus,
  sendingMakePayment,
  isCanceling,
  isNonTransaction,
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
  stopPolling,
  stopCountdown,
} = usePaymentDashboard(
  () => props.paymentId,
  () => props.source,
  {
    isModal: true,
    onSuccess: () => {
      emit('paid')
      emit('update:modelValue', false)
    },
    onCancel: () => {
      emit('cancelled')
      emit('update:modelValue', false)
    },
    onExpire: () => {
      emit('cancelled')
      emit('update:modelValue', false)
    },
  }
)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => [props.modelValue, props.paymentId],
  ([isOpen, id]) => {
    if (isOpen && id) {
      fetchDashboard()
      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      stopPolling()
      stopCountdown()
      if (import.meta.client) {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopPolling()
  stopCountdown()
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

function closeModal() {
  emit('update:modelValue', false)
}

function handleOpenCancel() {
  if (isNonTransaction.value) {
    showInstantCancelModal.value = true
  } else {
    showReasonCancelModal.value = true
  }
}

async function handleConfirmInstantCancel() {
  const ok = await cancelOrderInstant()
  if (ok) {
    showInstantCancelModal.value = false
  }
}

async function handleConfirmReasonCancel(reason: string) {
  const ok = await cancelOrderInstant(reason)
  if (ok) {
    showReasonCancelModal.value = false
  }
}

function openHelpCenter() {
  const inv = data.value?.invoice_no
  const text = inv
    ? `Halo Bekasku Center, saya butuh bantuan seputar pembayaran nomor tagihan ${inv}`
    : 'Halo Bekasku Center, saya butuh bantuan seputar pembayaran di BekasKu'
  closeModal()
  helpChatStore.openHelpChat({
    topic: 'payment',
    referenceId: props.paymentId,
    referenceTitle: inv ? `Tagihan #${inv}` : 'Pembayaran BekasKu',
    initialMessage: text,
  })
}
</script>

<template>
  <Teleport to="body" v-if="isMounted">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scale-in"
        >
          <!-- Sticky Modal Header -->
          <div class="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center justify-between shadow-2xs">
            <h2 class="font-outfit font-bold text-base text-text">
              Pembayaran
            </h2>
            <button
              type="button"
              class="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup pembayaran"
              @click="closeModal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Sticky Yellow Timer Banner -->
          <PaymentTimerBanner
            v-if="data && !loading && !error"
            :duration-text="formattedDuration"
          />

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Loading Skeleton -->
            <div v-if="loading" class="space-y-4">
              <AppSkeleton class="w-full h-12 rounded-xl" />
              <AppSkeleton class="w-full h-64 rounded-2xl" />
              <AppSkeleton class="w-full h-32 rounded-xl" />
            </div>

            <!-- Error State -->
            <div
              v-else-if="error"
              class="bg-white border border-border rounded-2xl p-6 text-center space-y-3"
            >
              <div class="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Ban class="w-6 h-6" />
              </div>
              <h3 class="font-outfit font-bold text-base text-text">
                Gagal Memuat Tagihan
              </h3>
              <p class="text-xs text-text-muted">
                {{ error }}
              </p>
              <button
                type="button"
                class="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
                @click="fetchDashboard"
              >
                Coba Lagi
              </button>
            </div>

            <template v-else-if="data">
              <!-- Main Unified Payment Card -->
              <PaymentMethodCard
                :data="data"
                :checking-status="checkingStatus"
                :sending-make-payment="sendingMakePayment"
                @download-qr="downloadQr"
                @check-status="checkPaymentStatus(true)"
                @make-payment="makePayment"
              />

              <!-- Accordion Petunjuk Pembayaran -->
              <PaymentInstructionAccordion
                v-if="data.guide && data.guide.length > 0"
                :guides="data.guide"
              />

              <!-- Bantuan Bekasku Center Banner -->
              <PaymentHelpBanner @click="openHelpCenter" />
            </template>
          </div>

          <!-- Sticky Footer Actions -->
          <div
            v-if="!loading && data"
            class="sticky bottom-0 z-10 bg-white border-t border-border p-3 flex items-center gap-2 shadow-lg"
          >
            <!-- Tombol Icon Detail Pesanan -->
            <button
              v-if="!isNonTransaction"
              type="button"
              class="w-11 h-11 shrink-0 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors cursor-pointer"
              title="Detail Pesanan"
              aria-label="Detail Pesanan"
              @click="emit('open-detail')"
            >
              <FileText class="w-5 h-5" />
            </button>

            <!-- Tombol Batalkan Pesanan / Hapus Tagihan -->
            <button
              type="button"
              :disabled="isCanceling"
              class="flex-1 h-11 px-3 rounded-xl border border-danger text-danger hover:bg-danger/5 text-xs sm:text-sm font-outfit font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              @click="handleOpenCancel"
            >
              <Trash2 v-if="isNonTransaction" class="w-4 h-4 shrink-0" />
              <Ban v-else class="w-4 h-4 shrink-0" />
              <span>{{ isNonTransaction ? 'Hapus' : 'Batalkan' }}</span>
            </button>

            <!-- Tombol Selesai / Cek Status -->
            <button
              type="button"
              :disabled="checkingStatus"
              class="flex-1 h-11 px-3 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs sm:text-sm font-outfit font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              @click="closeModal"
            >
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Submodal Unduh QR Code -->
    <PaymentQrDownloadModal
      v-model="showQrModal"
      :is-completed="qrCompleted"
      :progress="qrProgress"
      :error-message="qrError"
      :file-name="qrFileName"
      :blob-url="qrBlobUrl"
    />

    <!-- Submodal Batal Instan (Produk Digital / Subscription) -->
    <PaymentInstantCancelModal
      v-model="showInstantCancelModal"
      :loading="isCanceling"
      :is-delete="isNonTransaction"
      @confirm="handleConfirmInstantCancel"
    />

    <!-- Submodal Pilih Alasan Batal (Pesanan Barang Fisik) -->
    <PaymentCancelReasonModal
      v-model="showReasonCancelModal"
      :loading="isCanceling"
      @confirm="handleConfirmReasonCancel"
    />
  </Teleport>
</template>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in {
  animation: scaleIn 0.15s ease-out forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
