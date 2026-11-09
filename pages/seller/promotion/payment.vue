<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, ChevronRight, AlertCircle, ArrowRight } from 'lucide-vue-next'
import { usePromotion } from '~/composables/usePromotion'
import { useNotification } from '~/composables/useNotification'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import { formatRupiah } from '~/utils/format'
import PaymentChooseModal from '~/components/checkout/PaymentChooseModal.vue'
import BalancePasswordModal from '~/components/checkout/BalancePasswordModal.vue'
import PromotionWizardStep from '~/components/promotion/PromotionWizardStep.vue'
import PromotionWalletToggleCard from '~/components/promotion/PromotionWalletToggleCard.vue'
import PromotionPaymentMethodCard from '~/components/promotion/PromotionPaymentMethodCard.vue'
import PromotionPaymentSummaryCard from '~/components/promotion/PromotionPaymentSummaryCard.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Pilih Pembayaran Promosi — BekasKu',
  meta: [
    { name: 'description', content: 'Tingkatkan penjualan produk bekas Anda dengan fitur Sundul, Highlight, dan Spotlight di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const router = useRouter()
const promotion = usePromotion()
const { showNotification } = useNotification()

const showPaymentModal = ref(false)
const showPasswordModal = ref(false)
const paymentCategories = ref<PaymentCategoryItem[]>([])
const isSubmitting = ref(false)
const pageError = ref<string | null>(null)

onMounted(async () => {
  const draft = promotion.initPromotionDraft()
  if (!draft || !draft.package || !draft.product) {
    showNotification('Silakan pilih produk dan paket promosi terlebih dahulu.', 'warning')
    router.replace('/seller/promotion')
    return
  }

  await promotion.fetchPaymentInit()
  paymentCategories.value = await promotion.fetchPaymentMethods()
})

async function openPaymentModal() {
  paymentCategories.value = await promotion.fetchPaymentMethods()
  showPaymentModal.value = true
}

function onSelectPayment(item: PaymentMethodItem) {
  promotion.selectPaymentMethod(item)
  showPaymentModal.value = false
}

function handleStartPayment() {
  if (!promotion.allowSubmit.value) return
  if (promotion.balanceDeduction.value > 0) {
    showPasswordModal.value = true
  } else {
    executeCheckout()
  }
}

async function onPasswordConfirmed(password: string) {
  showPasswordModal.value = false
  await executeCheckout(password)
}

async function executeCheckout(password = '') {
  isSubmitting.value = true
  pageError.value = null

  const res = await promotion.submitPromotionCheckout(password)
  isSubmitting.value = false

  if (res.success) {
    if (res.result === 'DIRECT') {
      showNotification('Pembayaran berhasil! Promosi telah aktif.', 'success')
      router.replace('/seller/promotion/success')
    } else if (res.result) {
      showNotification('Instruksi pembayaran berhasil dibuat.', 'info')
      router.replace(`/payment/detail/${res.result}`)
    } else {
      router.replace('/seller/promotion/success')
    }
  } else {
    pageError.value = res.message || 'Pembayaran paket promosi gagal.'
    showNotification(pageError.value, 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-2 py-6 px-4 sm:px-6 pb-28 lg:pb-8">
    <div class="max-w-4xl mx-auto space-y-5">
      <!-- Checkout Wizard Step Indicator (Desktop) -->
      <PromotionWizardStep :current-step="3" />

      <!-- Breadcrumb & Back Button -->
      <div class="flex items-center justify-between gap-3">
        <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
          <NuxtLink to="/seller/promotion" class="hover:text-primary transition-colors">Pusat Promosi</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-text font-medium">Pilih Pembayaran</span>
        </nav>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          Kembali
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="pageError"
        class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-red-600" />
        <span>{{ pageError }}</span>
      </div>

      <!-- Main Payment Layout: Two Columns on Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Payment Sources & Methods -->
        <div class="lg:col-span-7 space-y-4">
          <!-- BekasKu Wallet Toggle -->
          <PromotionWalletToggleCard
            :my-balance="promotion.myBalance.value"
            :balance-limit="promotion.balanceLimit.value"
            :can-use-balance="promotion.canUseBalance.value"
            :lock-balance="promotion.lockBalance.value"
            :use-balance-toggle="promotion.useBalanceToggle.value"
            @toggle="promotion.toggleUseBalance()"
          />

          <!-- Payment Method Selector Card -->
          <PromotionPaymentMethodCard
            :selected-payment="promotion.selectedPayment.value"
            :is-full-balance="promotion.isFullBalance.value"
            :payment-input="promotion.paymentInput.value"
            @open-choose="openPaymentModal"
            @update-input="promotion.updatePaymentInput"
          />
        </div>

        <!-- Right: Order Summary Card -->
        <div class="lg:col-span-5">
          <PromotionPaymentSummaryCard
            :draft="promotion.promotionDraft.value"
            :package-price="promotion.packagePrice.value"
            :payment-fee="promotion.paymentFee.value"
            :balance-deduction="promotion.balanceDeduction.value"
            :final-charge="promotion.finalCharge.value"
            :allow-submit="promotion.allowSubmit.value"
            :loading="isSubmitting"
            @submit="handleStartPayment"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Fixed Bottom Action Bar -->
    <div class="fixed lg:hidden bottom-0 inset-x-0 z-30 bg-white border-t border-border p-4 shadow-lg flex items-center justify-between gap-4">
      <div class="min-w-0">
        <div class="text-[11px] text-text-muted">Total Pembayaran</div>
        <div class="text-base font-bold text-primary font-outfit">
          {{ formatRupiah(promotion.finalCharge.value) }}
        </div>
      </div>

      <button
        type="button"
        :disabled="!promotion.allowSubmit.value || isSubmitting"
        class="shrink-0 inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
        @click="handleStartPayment"
      >
        <span v-if="isSubmitting">Memproses...</span>
        <span v-else>Bayar Sekarang</span>
        <ArrowRight v-if="!isSubmitting" class="w-4 h-4" />
      </button>
    </div>

    <!-- Payment Method Chooser Modal -->
    <PaymentChooseModal
      :model-value="showPaymentModal"
      :categories="paymentCategories"
      :selected-method="promotion.selectedPayment.value"
      @update:model-value="showPaymentModal = $event"
      @select="onSelectPayment"
    />

    <!-- Balance Verification Password Modal -->
    <BalancePasswordModal
      :model-value="showPasswordModal"
      @update:model-value="showPasswordModal = $event"
      @submit="onPasswordConfirmed"
    />
  </div>
</template>
