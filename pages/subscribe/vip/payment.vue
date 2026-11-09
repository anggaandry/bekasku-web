<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-vue-next'
import { useSubscribeVip } from '~/composables/useSubscribeVip'
import { useAuthStore } from '~/stores/auth'
import { formatRupiah } from '~/utils/format'
import { useNotification } from '~/composables/useNotification'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import PaymentChooseModal from '~/components/checkout/PaymentChooseModal.vue'
import BalancePasswordModal from '~/components/checkout/BalancePasswordModal.vue'
import SubscribeWizardStep from '~/components/subscribe/SubscribeWizardStep.vue'
import VipWalletToggleCard from '~/components/subscribe/VipWalletToggleCard.vue'
import VipPaymentMethodCard from '~/components/subscribe/VipPaymentMethodCard.vue'
import VipPaymentSummaryCard from '~/components/subscribe/VipPaymentSummaryCard.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Pilih Pembayaran — BekasKu',
  meta: [
    { name: 'description', content: 'Pilih metode pembayaran untuk langganan VIP BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const formatPrice = formatRupiah
const { showNotification } = useNotification()

const {
  packages,
  subscribeDraft,
  paymentLoading,
  myBalance,
  balanceLimit,
  canUseBalance,
  lockBalance,
  useBalanceToggle,
  selectedPayment,
  paymentFee,
  paymentInput,
  packagePrice,
  balanceDeduction,
  isFullBalance,
  finalCharge,
  allowSubmit,
  fetchSubscribePackages,
  saveSubscribeDraft,
  loadSubscribeDraft,
  toggleUseBalance,
  updatePaymentInput,
  fetchPaymentInit,
  fetchPaymentMethods,
  selectPaymentMethod,
  verifyWalletPassword,
  submitSubscribeCheckout,
} = useSubscribeVip()

const showPaymentModal = ref(false)
const showPasswordModal = ref(false)
const paymentCategories = ref<PaymentCategoryItem[]>([])
const loadingCategories = ref(false)
const submitting = ref(false)
const passwordError = ref('')
const submitError = ref('')

const packageSummaryLabel = computed(() => {
  if (!subscribeDraft.value) return 'Paket VIP 30 Hari'
  return `Paket ${subscribeDraft.value.type.toUpperCase()} ${subscribeDraft.value.days} Hari`
})

const selectedPaymentCategoryLabel = computed(() => {
  if (!selectedPayment.value) return ''
  for (const cat of paymentCategories.value) {
    if (cat.methods.some((m) => m.id === selectedPayment.value?.id)) {
      return cat.name
    }
  }
  return 'Metode Pembayaran'
})

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login?redirect=/subscribe/vip')
    return
  }

  const queryDays = Number(route.query.days || 0)
  let draft = loadSubscribeDraft(queryDays > 0 ? queryDays : undefined)

  // Jika user me-refresh halaman langsung di /subscribe/vip/payment, ambil paket dari API
  if (!draft) {
    await fetchSubscribePackages()
    const targetPkg =
      packages.value.find((p) => p.days === (queryDays || 30)) || packages.value[0]
    if (targetPkg) {
      draft = saveSubscribeDraft(targetPkg)
    }
  }

  if (!draft) {
    navigateTo('/subscribe/vip')
    return
  }

  await fetchPaymentInit()
  await reloadPaymentMethods()
})

async function reloadPaymentMethods() {
  loadingCategories.value = true
  const charge = Math.max(0, packagePrice.value - balanceDeduction.value)
  paymentCategories.value = await fetchPaymentMethods(charge > 0 ? charge : packagePrice.value)
  loadingCategories.value = false
}

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/subscribe/vip')
  }
}

async function handleToggleBalance() {
  toggleUseBalance()
  if (!isFullBalance.value) {
    await reloadPaymentMethods()
  }
}

function handleSelectMethod(method: PaymentMethodItem) {
  selectPaymentMethod(method)
}

async function handlePayNowClick() {
  if (!allowSubmit.value || submitting.value) return

  // Jika menggunakan saldo wallet, tampilkan modal verifikasi password
  if (balanceDeduction.value > 0) {
    passwordError.value = ''
    showPasswordModal.value = true
    return
  }

  await executeCheckout('')
}

async function handlePasswordSubmit(password: string) {
  submitting.value = true
  passwordError.value = ''

  const valid = await verifyWalletPassword(password)
  if (!valid) {
    submitting.value = false
    passwordError.value = 'Password yang Anda masukkan salah.'
    return
  }

  showPasswordModal.value = false
  await executeCheckout(password)
}

async function executeCheckout(password: string) {
  submitting.value = true
  submitError.value = ''

  const res = await submitSubscribeCheckout(password)
  submitting.value = false

  if (res.success && res.result) {
    if (res.result === 'DIRECT') {
      showNotification({
        type: 'success',
        message: 'Pembayaran sukses! Status VIP Anda telah aktif.',
      })
      await authStore.fetchProfile()
      navigateTo('/subscribe/vip')
    } else {
      navigateTo(`/payment/${res.result}?source=subscription`)
    }
  } else {
    submitError.value = res.message || 'Transaksi gagal. Silakan coba lagi.'
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white md:bg-bg font-outfit">
    <!-- ================================================================= -->
    <!-- Mobile Sticky AppBar (< md) — 1:1 Gambar 1 & Gambar 2             -->
    <!-- ================================================================= -->
    <header class="md:hidden sticky top-0 z-30 bg-white border-b border-border/60">
      <div class="px-4 h-14 flex items-center gap-3">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
        </button>
        <h1 class="text-base sm:text-lg font-semibold text-text">
          Pilih Pembayaran
        </h1>
      </div>
    </header>

    <!-- ================================================================= -->
    <!-- Main Content                                                      -->
    <!-- ================================================================= -->
    <main class="flex-1 pb-28 md:pb-16">
      <!-- Step Wizard Minimalis untuk Alur Pembelian VIP (Desktop md+) -->
      <SubscribeWizardStep :current-step="2" />

      <div class="max-w-[1200px] mx-auto md:px-4 md:py-4">
        <!-- Initial Loading State -->
        <div
          v-if="paymentLoading"
          class="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white md:rounded-3xl md:border md:border-border"
        >
          <Loader2 class="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <p class="text-xs sm:text-sm text-text-muted">
            Memuat metode pembayaran...
          </p>
        </div>

        <!-- Loaded Content Grid (Mobile 1 Column with 8px gray dividers / Desktop 8:4 Grid) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-6 items-start">
          <!-- ============================================================= -->
          <!-- Kolom Kiri (lg:col-span-8)                                    -->
          <!-- ============================================================= -->
          <div class="lg:col-span-8 md:space-y-4">
            <!-- Error Alert -->
            <div
              v-if="submitError"
              role="alert"
              class="mx-4 my-3 md:mx-0 md:my-0 flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-xs sm:text-sm text-danger"
            >
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p class="flex-1">{{ submitError }}</p>
              <button
                type="button"
                class="shrink-0 cursor-pointer"
                aria-label="Tutup pesan"
                @click="submitError = ''"
              >
                <X class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <template v-if="canUseBalance">
              <VipWalletToggleCard
                :balance="myBalance"
                :balance-limit="balanceLimit"
                :active="useBalanceToggle"
                :locked="lockBalance"
                @toggle="handleToggleBalance"
              />
              <div class="h-2 bg-surface-2 md:hidden" />
            </template>

            <VipPaymentMethodCard
              :selected-payment="selectedPayment"
              :category-label="selectedPaymentCategoryLabel"
              :is-full-balance="isFullBalance"
              :phone-input="paymentInput"
              @open="showPaymentModal = true"
              @update:phone-input="updatePaymentInput"
            />

            <div class="h-2 bg-surface-2 md:hidden" />

            <VipPaymentSummaryCard
              :package-label="packageSummaryLabel"
              :package-price="packagePrice"
              :payment-fee="paymentFee"
              :balance-deduction="balanceDeduction"
              :final-charge="finalCharge"
            />
          </div>

          <!-- ============================================================= -->
          <!-- Kolom Kanan Desktop (lg:col-span-4): Sticky Total & Submit    -->
          <!-- ============================================================= -->
          <aside class="hidden lg:block lg:col-span-4 sticky top-20">
            <div class="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
              <h3 class="text-base font-bold text-text pb-3 border-b border-border">
                Total Pembayaran
              </h3>

              <div class="flex items-baseline justify-between text-lg font-bold text-primary">
                <span>Total Tagihan</span>
                <span class="tabular-nums">{{ formatPrice(finalCharge) }}</span>
              </div>

              <button
                type="button"
                :disabled="!allowSubmit || submitting"
                class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                @click="handlePayNowClick"
              >
                <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{{ submitting ? 'Memproses Transaksi...' : 'Bayar Sekarang' }}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <!-- ================================================================= -->
    <!-- Mobile Sticky Bottom Bar (< lg) — 1:1 Gambar 1 & Gambar 2         -->
    <!-- ================================================================= -->
    <div
      v-if="!paymentLoading"
      class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border/70 px-4 pt-3 pb-5"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-text-muted">Total Pembayaran</span>
        <span class="text-lg font-bold text-text tabular-nums">
          {{ formatPrice(finalCharge) }}
        </span>
      </div>

      <button
        type="button"
        :disabled="!allowSubmit || submitting"
        class="w-full py-3.5 rounded-xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
        :class="
          allowSubmit && !submitting
            ? 'bg-primary hover:bg-primary-dark'
            : 'bg-primary/35'
        "
        @click="handlePayNowClick"
      >
        <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{{ submitting ? 'Memproses pembayaran...' : 'Bayar Sekarang' }}</span>
      </button>
    </div>

    <!-- Modal Pilih Metode Pembayaran -->
    <PaymentChooseModal
      v-model="showPaymentModal"
      :categories="paymentCategories"
      :selected-method="selectedPayment"
      :loading="loadingCategories"
      @select="handleSelectMethod"
    />

    <!-- Modal Verifikasi Password Saldo Wallet -->
    <BalancePasswordModal
      v-model="showPasswordModal"
      :loading="submitting"
      :error="passwordError"
      @submit="handlePasswordSubmit"
    />
  </div>
</template>
