<script setup lang="ts">
import { ArrowLeft, CheckCircle2, AlertTriangle, QrCode, ScanLine, X } from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import { useMeetTransaction } from '~/composables/useMeetTransaction'
import MeetPartnerCard from '~/components/transaction/MeetPartnerCard.vue'
import MeetQrCard from '~/components/transaction/MeetQrCard.vue'
import MeetScanner from '~/components/transaction/MeetScanner.vue'
import MeetTipsCard from '~/components/transaction/MeetTipsCard.vue'
import MeetProductsSummary from '~/components/transaction/MeetProductsSummary.vue'

const props = defineProps<{
  modelValue: boolean
  detail: TransactionDetail
  isSeller: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'completed'): void
}>()

type Step = 'start' | 'qr' | 'scan' | 'confirm'
const currentStep = ref<Step>('start')
const scannedQrCode = ref('')
const showCancelConfirmModal = ref(false)
const cancelReason = ref('Barang tidak sesuai')
const actionErrorMessage = ref<string | null>(null)

const transactionId = computed(() => props.detail?._id || props.detail?.id || '')

const {
  loading: verifyLoading,
  qrLoading,
  confirmLoading,
  error: meetError,
  qrData,
  countdown,
  generateQR,
  verifyQR,
  startStatusPolling,
  stopStatusPolling,
  confirmQR
} = useMeetTransaction()

function closeModal() {
  stopStatusPolling()
  emit('update:modelValue', false)
  currentStep.value = 'start'
  scannedQrCode.value = ''
  actionErrorMessage.value = null
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentStep.value = 'start'
      scannedQrCode.value = ''
      actionErrorMessage.value = null
    } else {
      stopStatusPolling()
    }
  }
)

async function handleGoNext() {
  if (props.isSeller) {
    currentStep.value = 'qr'
    await generateQR(transactionId.value)
    startStatusPolling(transactionId.value, () => {
      emit('completed')
      closeModal()
    })
  } else {
    currentStep.value = 'scan'
  }
}

async function handleCodeScanned(code: string) {
  scannedQrCode.value = code
  const res = await verifyQR(transactionId.value, code)
  if (res.success) {
    currentStep.value = 'confirm'
  } else {
    actionErrorMessage.value = res.message
  }
}

async function handleAccept() {
  actionErrorMessage.value = null
  const res = await confirmQR({
    transactionId: transactionId.value,
    qr: scannedQrCode.value,
    status: 1
  })

  if (res.success) {
    emit('completed')
    closeModal()
  } else {
    actionErrorMessage.value = res.message
  }
}

async function handleDecline() {
  actionErrorMessage.value = null
  const res = await confirmQR({
    transactionId: transactionId.value,
    qr: scannedQrCode.value,
    status: 0,
    cancelReason: cancelReason.value
  })

  showCancelConfirmModal.value = false
  if (res.success) {
    emit('completed')
    closeModal()
  } else {
    actionErrorMessage.value = res.message
  }
}

const modalTitle = computed(() => {
  if (currentStep.value === 'qr') return 'QR Code Transaksi'
  if (currentStep.value === 'scan') return 'Scan QR Code'
  if (currentStep.value === 'confirm') return 'Konfirmasi Serah Terima'
  return props.isSeller ? 'Temui Pembeli' : 'Temui Penjual'
})

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
      @click.self="closeModal"
    >
    <div class="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2">
          <button
            v-if="currentStep !== 'start'"
            type="button"
            class="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-text hover:bg-surface-2 transition-colors cursor-pointer"
            @click="currentStep = 'start'"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <h3 class="font-outfit font-bold text-base sm:text-lg text-text">
            {{ modalTitle }}
          </h3>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          @click="closeModal"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
        <div v-if="actionErrorMessage || meetError" class="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm font-outfit">
          {{ actionErrorMessage || meetError }}
        </div>

        <!-- 1. Step Start -->
        <template v-if="currentStep === 'start'">
          <MeetProductsSummary
            :detail="detail"
            :is-seller="isSeller"
          >
            <MeetTipsCard :is-seller="isSeller" />
          </MeetProductsSummary>
        </template>

        <!-- 2. Step QR (Seller) -->
        <template v-else-if="currentStep === 'qr'">
          <MeetPartnerCard
            :name="isSeller ? (qrData?.buyer_name || detail.buyer_name || 'Pembeli') : (qrData?.seller_name || detail.seller_name || 'Penjual')"
            :avatar="isSeller ? (qrData?.buyer_avatar || detail.buyer_avatar) : (qrData?.seller_avatar || detail.seller_avatar)"
            :city="isSeller ? (qrData?.buyer_city || detail.destination_city) : (qrData?.seller_city || detail.seller_city)"
            :rate="qrData?.seller_rate || detail.seller_rate"
            :is-seller="isSeller"
          />

          <MeetQrCard
            :qr-content="qrData?.content || ''"
            :countdown="countdown"
            :is-seller="isSeller"
            :loading="qrLoading"
            @refresh="generateQR(transactionId)"
          />
        </template>

        <!-- 3. Step Scan (Buyer) -->
        <template v-else-if="currentStep === 'scan'">
          <MeetScanner
            :loading="verifyLoading"
            @scanned="handleCodeScanned"
          />
        </template>

        <!-- 4. Step Confirm (Buyer/Seller) -->
        <template v-else-if="currentStep === 'confirm'">
          <MeetProductsSummary
            :detail="detail"
            :is-seller="isSeller"
          >
            <MeetTipsCard
              :is-seller="isSeller"
              mode="confirm"
            />
          </MeetProductsSummary>
        </template>
      </div>

      <!-- Modal Footer Action -->
      <div class="p-4 border-t border-border bg-white shrink-0">
        <!-- Action on Step Start -->
        <button
          v-if="currentStep === 'start'"
          type="button"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-outfit font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          @click="handleGoNext"
        >
          <component :is="isSeller ? QrCode : ScanLine" class="w-4 h-4" />
          <span>{{ isSeller ? 'Buka QR Code' : 'Scan QR Code' }}</span>
        </button>

        <!-- Action on Step QR -->
        <button
          v-else-if="currentStep === 'qr'"
          type="button"
          class="w-full h-10 rounded-xl border border-border text-text font-outfit font-semibold text-xs sm:text-sm hover:bg-surface-2 transition-colors cursor-pointer"
          @click="closeModal"
        >
          Tutup
        </button>

        <!-- Action on Step Confirm -->
        <div v-else-if="currentStep === 'confirm'" class="flex flex-col gap-2">
          <button
            type="button"
            :disabled="confirmLoading"
            class="w-full py-2 text-danger font-outfit font-bold text-xs sm:text-sm hover:bg-danger/5 rounded-xl transition-colors cursor-pointer text-center"
            @click="showCancelConfirmModal = true"
          >
            Batalkan Transaksi
          </button>

          <button
            type="button"
            :disabled="confirmLoading"
            class="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-outfit font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            @click="handleAccept"
          >
            <div v-if="confirmLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <CheckCircle2 v-else class="w-4 h-4" />
            <span>Selesaikan Transaksi</span>
          </button>
        </div>
      </div>

      <!-- Nested Cancel Confirmation Dialog -->
      <div
        v-if="showCancelConfirmModal"
        class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click.self="showCancelConfirmModal = false"
      >
        <div class="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-border animate-in fade-in zoom-in duration-200">
          <div class="flex items-center gap-2 text-danger font-outfit font-bold text-sm">
            <AlertTriangle class="w-4 h-4" />
            <span>Batalkan Transaksi?</span>
          </div>

          <p class="font-outfit text-xs text-text-muted leading-relaxed">
            Apakah Anda yakin ingin membatalkan transaksi ini? Transaksi yang dibatalkan tidak dapat dikembalikan.
          </p>

          <div>
            <label class="block font-outfit font-semibold text-xs text-text mb-1.5">Alasan Pembatalan</label>
            <input
              v-model="cancelReason"
              type="text"
              class="w-full h-9 px-3 rounded-lg border border-border bg-surface-2 text-xs text-text font-outfit focus:outline-none focus:border-primary"
              placeholder="Alasan pembatalan..."
            />
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              class="flex-1 h-9 rounded-xl border border-border text-text font-outfit font-semibold text-xs hover:bg-surface-2 transition-colors cursor-pointer"
              @click="showCancelConfirmModal = false"
            >
              Kembali
            </button>
            <button
              type="button"
              :disabled="confirmLoading || !cancelReason.trim()"
              class="flex-1 h-9 rounded-xl bg-danger text-white font-outfit font-semibold text-xs hover:bg-danger/90 transition-colors cursor-pointer"
              @click="handleDecline"
            >
              Ya, Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>
