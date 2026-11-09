<script setup lang="ts">
import { ArrowLeft, ChevronRight, Wallet, CreditCard, AlertCircle, X } from 'lucide-vue-next'
import { useCheckout } from '~/composables/useCheckout'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/composables/useFormat'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import PaymentChooseModal from '~/components/checkout/PaymentChooseModal.vue'
import BalancePasswordModal from '~/components/checkout/BalancePasswordModal.vue'
import CheckoutWizardStep from '~/components/checkout/CheckoutWizardStep.vue'
import { sanitizeMediaUrl } from '~/utils/media'

useHead({
  title: 'Pilih Pembayaran - BekasKu',
  meta: [
    { name: 'description', content: 'Pilih metode pembayaran aman di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const { formatPrice } = useFormat()
const router = useRouter()

const {
  draft,
  serviceFee,
  myBalance,
  balanceLimit,
  canUseBalance,
  useBalance,
  selectedPayment,
  paymentPhone,
  paymentFee,
  totalProductPrice,
  totalShippingFee,
  totalShippingDiscount,
  totalInsuranceFee,
  totalCheckoutAmount,
  balanceDeduction,
  finalPaymentAmount,
  initFromDraft,
  fetchOrderInit,
  fetchPaymentInit,
  fetchPaymentMethods,
  selectPaymentMethod,
  verifyWalletPassword,
  submitCheckout,
} = useCheckout()

const showPaymentModal = ref(false)
const showPasswordModal = ref(false)
const paymentCategories = ref<PaymentCategoryItem[]>([])
const loadingCategories = ref(false)
const submitting = ref(false)
const passwordError = ref('')
const submitError = ref('')

const isMeet = computed(() => draft.value?.transactionMethod === 0)
const totalItemsCount = computed(() => {
  let count = 0
  for (const s of draft.value?.items || []) count += s.product.total_product || 1
  return count
})

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    navigateTo('/cart')
    return
  }

  const hasDraft = initFromDraft()
  if (!hasDraft) {
    navigateTo('/cart')
    return
  }

  await fetchOrderInit()
  await fetchPaymentInit()

  // Ambil daftar metode pembayaran
  loadingCategories.value = true
  paymentCategories.value = await fetchPaymentMethods(totalCheckoutAmount.value)
  loadingCategories.value = false
})

function goBack() {
  router.back()
}

// Apakah tombol Bayar Sekarang aktif
const canSubmit = computed(() => {
  // Jika saldo menutup seluruh tagihan
  if (useBalance.value && finalPaymentAmount.value === 0) {
    return true
  }
  // Jika masih ada sisa pembayaran, wajib pilih metode pembayaran
  return Boolean(selectedPayment.value)
})

async function handlePayNowClick() {
  if (!canSubmit.value || submitting.value) return

  // Jika menggunakan saldo wallet, wajib verifikasi password
  if (useBalance.value && balanceDeduction.value > 0) {
    passwordError.value = ''
    showPasswordModal.value = true
    return
  }

  // Submit langsung tanpa password
  await executeCheckout()
}

async function handlePasswordSubmit(password: string) {
  submitting.value = true
  passwordError.value = ''

  const isPasswordValid = await verifyWalletPassword(password)
  if (!isPasswordValid) {
    submitting.value = false
    passwordError.value = 'Password akun yang Anda masukkan salah.'
    return
  }

  showPasswordModal.value = false
  await executeCheckout(password)
}

async function executeCheckout(password?: string) {
  submitting.value = true
  submitError.value = ''
  const res = await submitCheckout(password)
  submitting.value = false

  if (res.success && res.result) {
    // Navigasi ke halaman sukses / gateway
    if (res.result === 'DIRECT') {
      navigateTo('/checkout/success')
    } else {
      navigateTo(`/payment/${res.result}?source=checkout`)
    }
  } else {
    submitError.value = res.message || 'Gagal memproses pembayaran.'
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <!-- Header Mobile (<md) Sesuai Gambar 2 "Pilih Pembayaran" -->
    <div class="md:hidden bg-white border-b border-border sticky top-0 z-30">
      <div class="px-4 h-14 flex items-center gap-2.5">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali ke pesanan"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-text font-outfit">
          Pilih Pembayaran
        </h1>
      </div>
    </div>

    <!-- Main Container -->
    <main class="flex-1 pb-28 md:pb-16">
      <!-- Step Wizard Minimalis untuk Alur Checkout (Desktop md+) -->
      <CheckoutWizardStep :current-step="3" />

      <!-- Container Content -->
      <div class="max-w-[1200px] mx-auto px-4 py-2 sm:py-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Kolom Kiri: Opsi Pembayaran -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Pesan gagal checkout (pengganti alert) -->
            <div
              v-if="submitError"
              role="alert"
              class="flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-xs sm:text-sm text-danger"
            >
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <p class="flex-1">{{ submitError }}</p>
              <button
                type="button"
                class="shrink-0 cursor-pointer"
                aria-label="Tutup pesan"
                @click="submitError = ''"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- 1. BekasKu Wallet Switch Card (Sesuai Gambar 2) -->
            <div
              v-if="canUseBalance"
              class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Wallet class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <h4 class="text-sm font-bold text-text">
                    BekasKu Wallet
                  </h4>
                  <p class="text-xs text-text-muted mt-0.5 truncate">
                    {{ formatPrice(myBalance) }} (Maks. {{ formatPrice(balanceLimit) }})
                  </p>
                </div>
              </div>

              <!-- Switch Toggle -->
              <button
                type="button"
                role="switch"
                :aria-checked="useBalance"
                class="w-12 h-7 rounded-full p-1 transition-colors cursor-pointer focus:outline-hidden shrink-0"
                :class="useBalance ? 'bg-primary' : 'bg-surface-2 border border-border-light'"
                @click="useBalance = !useBalance"
              >
                <div
                  class="w-5 h-5 rounded-full bg-white shadow-xs transition-transform"
                  :class="useBalance ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- 2. Metode Pembayaran Card (Sesuai Gambar 2) -->
            <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-sm font-bold text-text">
                  Metode Pembayaran
                </h4>
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  @click="showPaymentModal = true"
                >
                  Pilih Pembayaran &gt;
                </button>
              </div>

              <!-- Box Pilihan Metode -->
              <div
                class="rounded-xl border border-border p-4 bg-white transition-colors cursor-pointer hover:border-primary/50"
                @click="showPaymentModal = true"
              >
                <!-- State Terpilih -->
                <div v-if="selectedPayment" class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-12 h-8 rounded-md border border-border bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        v-if="selectedPayment.image"
                        :src="sanitizeMediaUrl(selectedPayment.image, '')"
                        :alt="selectedPayment.name"
                        width="40"
                        height="24"
                        class="max-w-full max-h-full object-contain"
                      />
                      <CreditCard v-else class="w-5 h-5 text-text-muted" />
                    </div>
                    <span class="text-xs sm:text-sm font-bold text-text truncate">
                      {{ selectedPayment.name }}
                    </span>
                  </div>
                  <span class="text-xs text-text-muted shrink-0">Ganti</span>
                </div>

                <!-- State Belum Ada Pilihan (Sesuai Gambar 2) -->
                <div v-else class="flex items-center gap-3 text-text-muted">
                  <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                    <CreditCard class="w-5 h-5 text-text-muted" />
                  </div>
                  <div class="min-w-0">
                    <h5 class="text-xs sm:text-sm font-semibold text-text">
                      Belum ada metode pembayaran
                    </h5>
                    <p class="text-[11px] sm:text-xs text-text-muted mt-0.5">
                      Silakan pilih metode pembayaran di atas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Ringkasan Pembayaran (Sesuai Gambar 2) -->
            <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
              <h4 class="text-sm font-bold text-text">
                Ringkasan Pembayaran
              </h4>

              <div class="space-y-2.5 text-xs sm:text-sm">
                <div class="flex justify-between text-text">
                  <span>Total Harga ({{ totalItemsCount }} Barang)</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalProductPrice) }}</span>
                </div>

                <div v-if="!isMeet && totalShippingFee > 0" class="flex justify-between text-text">
                  <span>Total Ongkos Kirim</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalShippingFee) }}</span>
                </div>

                <div v-if="totalShippingDiscount > 0" class="flex justify-between text-primary">
                  <span>Diskon Ongkir</span>
                  <span class="font-semibold tabular-nums">-{{ formatPrice(totalShippingDiscount) }}</span>
                </div>

                <div v-if="totalInsuranceFee > 0" class="flex justify-between text-text">
                  <span>Asuransi Pengiriman</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalInsuranceFee) }}</span>
                </div>

                <div class="flex justify-between text-text">
                  <span>Biaya Layanan</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(serviceFee) }}</span>
                </div>

                <div v-if="paymentFee > 0" class="flex justify-between text-text">
                  <span>Biaya Transaksi Pembayaran</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(paymentFee) }}</span>
                </div>

                <div v-if="balanceDeduction > 0" class="flex justify-between text-primary font-medium">
                  <span>Potongan Saldo Wallet</span>
                  <span class="font-semibold tabular-nums">-{{ formatPrice(balanceDeduction) }}</span>
                </div>

                <div class="pt-3 border-t border-border flex justify-between text-base font-bold text-text">
                  <span>Total Bersih</span>
                  <span class="text-primary tabular-nums">{{ formatPrice(finalPaymentAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan (Desktop lg+): Sticky Summary Card -->
          <div class="hidden lg:block lg:col-span-4 sticky top-20">
            <div class="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
              <h3 class="text-base font-bold text-text pb-3 border-b border-border">
                Total Pembayaran
              </h3>
              <div class="flex items-baseline justify-between text-lg font-bold text-primary">
                <span>Total Tagihan</span>
                <span class="tabular-nums">{{ formatPrice(finalPaymentAmount) }}</span>
              </div>
              <button
                type="button"
                :disabled="!canSubmit || submitting"
                class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                @click="handlePayNowClick"
              >
                <span v-if="submitting">Memproses Transaksi...</span>
                <span v-else>Bayar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Bottom Bar Khusus Mobile (< lg) Sesuai Gambar 2 -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-md">
      <div class="px-4 py-3 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-muted">Total Pembayaran</span>
          <span class="text-base font-bold text-text tabular-nums">
            {{ formatPrice(finalPaymentAmount) }}
          </span>
        </div>
        <button
          type="button"
          :disabled="!canSubmit || submitting"
          class="w-full h-11 rounded-xl text-white text-xs sm:text-sm font-semibold font-outfit transition-colors cursor-pointer flex items-center justify-center disabled:cursor-not-allowed shadow-xs"
          :class="canSubmit ? 'bg-primary hover:bg-primary-dark' : 'bg-primary/40'"
          @click="handlePayNowClick"
        >
          <span v-if="submitting">Memproses...</span>
          <span v-else>Bayar Sekarang</span>
        </button>
      </div>
    </div>

    <!-- Modal Pilih Metode Pembayaran (Sesuai Gambar 5) -->
    <PaymentChooseModal
      v-model="showPaymentModal"
      :categories="paymentCategories"
      :selected-method="selectedPayment"
      :loading="loadingCategories"
      @select="selectPaymentMethod"
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

