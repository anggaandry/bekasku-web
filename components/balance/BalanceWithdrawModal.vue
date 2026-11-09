<script setup lang="ts">
import {
  X,
  Banknote,
  CircleX,
  Landmark,
  Plus,
  Info,
  Headset,
  Wallet,
} from 'lucide-vue-next'
import { formatRupiah, formatNumber } from '~/utils/format'
import {
  WITHDRAW_MIN_AMOUNT,
  BALANCE_PRESET_AMOUNTS,
} from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'
import BankAccountFormModal from '~/components/account/BankAccountFormModal.vue'
import BalancePasswordModal from '~/components/checkout/BalancePasswordModal.vue'

const props = defineProps<{
  modelValue: boolean
  balance: number
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  success: []
}>()

function close() {
  emit('update:modelValue', false)
}

const {
  bankAccounts,
  loading: isBankLoading,
  fetchBankAccounts,
} = useBankAccount()

const { verifyPassword, submitWithdraw, isSubmittingWithdraw } = useBalance()
const { identityInfo, fetchIdentityInfo } = useProfile()
const { showNotification } = useNotification()
const helpChatStore = useHelpChatStore()

// State
const rawAmount = ref<number>(0)
const displayAmount = ref<string>('')
const isWithdrawAll = ref(false)
const selectedBankId = ref<string>('')

const showAddBankModal = ref(false)
const showPasswordModal = ref(false)
const passwordError = ref('')
const isVerifyingPassword = ref(false)

// Formatting
function formatThousand(val: number): string {
  if (!val || val <= 0) return ''
  return formatNumber(val)
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  if (!digits) {
    rawAmount.value = 0
    displayAmount.value = ''
    isWithdrawAll.value = false
    return
  }
  const parsed = parseInt(digits, 10)
  rawAmount.value = parsed
  displayAmount.value = formatThousand(parsed)
  isWithdrawAll.value = props.balance > 0 && parsed === props.balance
}

function setPresetAmount(val: number) {
  if (props.balance < val) return
  rawAmount.value = val
  displayAmount.value = formatThousand(val)
  isWithdrawAll.value = props.balance > 0 && val === props.balance
}

function clearAmount() {
  rawAmount.value = 0
  displayAmount.value = ''
  isWithdrawAll.value = false
}

function toggleWithdrawAll() {
  if (isWithdrawAll.value) {
    clearAmount()
  } else {
    if (props.balance < WITHDRAW_MIN_AMOUNT) {
      showNotification({
        type: 'warning',
        message: 'Saldo Anda di bawah minimum penarikan Rp10.000',
      })
      return
    }
    rawAmount.value = props.balance
    displayAmount.value = formatThousand(props.balance)
    isWithdrawAll.value = true
  }
}

// Validation
const isBelowMin = computed(
  () => rawAmount.value > 0 && rawAmount.value < WITHDRAW_MIN_AMOUNT
)
const isExceedBalance = computed(() => rawAmount.value > props.balance)
const isValidAmount = computed(
  () =>
    rawAmount.value >= WITHDRAW_MIN_AMOUNT && rawAmount.value <= props.balance
)

const validationMessage = computed(() => {
  if (isExceedBalance.value) {
    return 'Jumlah penarikan melebihi saldo tersedia'
  }
  if (isBelowMin.value) {
    return `Minimum penarikan saldo adalah ${formatRupiah(WITHDRAW_MIN_AMOUNT)}`
  }
  return `Minimum penarikan saldo adalah ${formatRupiah(WITHDRAW_MIN_AMOUNT)}`
})

const selectedBank = computed(() =>
  bankAccounts.value.find((b) => b.id === selectedBankId.value)
)

const isFormValid = computed(() => {
  return (
    isValidAmount.value &&
    Boolean(selectedBankId.value) &&
    !isSubmittingWithdraw.value
  )
})

// Identity check
const isKycVerified = computed(() =>
  Boolean(identityInfo.value?.identity_number)
)
const isSelfieVerified = computed(() =>
  Boolean(identityInfo.value?.selfie_identity)
)
const verifiedKtpName = computed(
  () => identityInfo.value?.identity_name || ''
)

function handleInitiateWithdraw() {
  if (!isFormValid.value) return

  // Check identity
  if (!isKycVerified.value) {
    showNotification({
      type: 'warning',
      message:
        'Silakan verifikasi kartu identitas (KTP/SIM) terlebih dahulu di Pengaturan Akun.',
    })
    close()
    navigateTo('/account?tab=identity')
    return
  }

  if (!isSelfieVerified.value) {
    showNotification({
      type: 'warning',
      message:
        'Silakan lengkapi verifikasi selfie identitas terlebih dahulu di Pengaturan Akun.',
    })
    close()
    navigateTo('/account?tab=identity')
    return
  }

  if (!selectedBank.value) {
    showNotification({
      type: 'warning',
      message: 'Pilih rekening tujuan penarikan terlebih dahulu.',
    })
    return
  }

  passwordError.value = ''
  showPasswordModal.value = true
}

async function handleConfirmPassword(password: string) {
  isVerifyingPassword.value = true
  passwordError.value = ''

  try {
    const isMatched = await verifyPassword(password)
    if (!isMatched) {
      passwordError.value = 'Password akun yang Anda masukkan salah'
      isVerifyingPassword.value = false
      return
    }

    // Password correct -> submit withdraw
    const res = await submitWithdraw({
      bank_user_id: selectedBankId.value,
      name: `withdraw ${selectedBank.value?.bank_name || 'Bank'}`,
      substract: rawAmount.value,
      password: password,
    })

    if (res.success) {
      showPasswordModal.value = false
      showNotification({
        type: 'success',
        message: res.message,
      })
      clearAmount()
      emit('success')
      close()
    } else {
      passwordError.value = res.message
    }
  } catch (err: unknown) {
    const errObj = err as { data?: { message?: string }; message?: string }
    passwordError.value =
      errObj?.data?.message || errObj?.message || 'Terjadi kesalahan sistem'
  } finally {
    isVerifyingPassword.value = false
  }
}

function openBekaskuCenterHelp() {
  const bankName = selectedBank.value?.bank_name || 'Belum dipilih'
  const accNo = selectedBank.value?.bank_account || '-'
  const amount = rawAmount.value > 0 ? formatRupiah(rawAmount.value) : 'Saldo'
  close()
  helpChatStore.openHelpChat({
    topic: 'balance',
    referenceTitle: 'Penarikan Saldo',
    initialMessage: `Halo Tim Bekasku Center, saya butuh bantuan terkait penarikan saldo (${amount}) ke rekening ${bankName} (${accNo}).`,
  })
}

// Lifecycle
watch(
  () => props.modelValue,
  async (open, wasOpen) => {
    if (open) {
      await Promise.all([fetchBankAccounts(), fetchIdentityInfo()])
      if (bankAccounts.value.length > 0 && !selectedBankId.value) {
        selectedBankId.value = bankAccounts.value[0].id
      }
      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
      }
    } else if (wasOpen && import.meta.client) {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

// Restore scroll lock if sub-modals close while this modal remains open
watch([showAddBankModal, showPasswordModal], ([addBankOpen, pwdOpen]) => {
  if (!addBankOpen && !pwdOpen && props.modelValue && import.meta.client) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click.self="close"
      >
        <div
          class="w-full sm:max-w-3xl lg:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        >
          <!-- Drag Handle (Mobile) -->
          <div class="flex justify-center mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-border" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-border/80 shrink-0">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-text">
                Tarik Saldo
              </h2>
              <p class="text-xs text-text-muted mt-0.5">
                Cairkan dana dompet ke rekening bank Anda dengan aman
              </p>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable Body: Dual Column on Desktop (sm:grid sm:grid-cols-2) -->
          <div class="flex-1 overflow-y-auto py-5 pr-1 space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:items-start">
            <!-- ===================================== -->
            <!-- LEFT COLUMN: Saldo & Nominal Input    -->
            <!-- ===================================== -->
            <div class="space-y-4">
              <!-- Available Balance Hero Card -->
              <div class="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <Wallet class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="text-xs text-text-muted block">Saldo Tersedia</span>
                    <strong class="text-base sm:text-lg font-bold text-primary">
                      {{ formatRupiah(balance) }}
                    </strong>
                  </div>
                </div>
              </div>

              <!-- Input Amount Section -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs sm:text-sm font-bold text-text">
                    Jumlah Penarikan
                  </label>
                  <button
                    type="button"
                    class="px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border"
                    :class="
                      isWithdrawAll
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-2 text-text border-border hover:border-primary/50'
                    "
                    @click="toggleWithdrawAll"
                  >
                    Tarik Semua
                  </button>
                </div>

                <!-- Currency Input -->
                <div class="relative">
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <Banknote class="w-5 h-5 text-primary" />
                    <span class="text-base sm:text-lg font-bold text-text">Rp</span>
                  </div>
                  <input
                    :value="displayAmount"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full h-12 pl-16 pr-10 rounded-2xl border bg-surface-1 text-base sm:text-lg font-bold text-text focus:outline-hidden focus:bg-white transition-colors"
                    :class="
                      isBelowMin || isExceedBalance
                        ? 'border-danger focus:border-danger'
                        : 'border-border focus:border-primary'
                    "
                    @input="handleInput"
                  />
                  <button
                    v-if="rawAmount > 0"
                    type="button"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer p-1"
                    @click="clearAmount"
                  >
                    <CircleX class="w-4 h-4" />
                  </button>
                </div>

                <!-- Preset Quick Chips -->
                <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    v-for="preset in BALANCE_PRESET_AMOUNTS"
                    :key="preset"
                    type="button"
                    :disabled="balance < preset"
                    class="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="
                      rawAmount === preset
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-white border-border text-text hover:border-border-hover'
                    "
                    @click="setPresetAmount(preset)"
                  >
                    {{ formatRupiah(preset) }}
                  </button>
                </div>

                <!-- Validation Message -->
                <p
                  class="text-xs transition-colors"
                  :class="
                    isBelowMin || isExceedBalance
                      ? 'text-danger font-semibold'
                      : 'text-text-muted'
                  "
                >
                  {{ validationMessage }}
                </p>
              </div>
            </div>

            <!-- ===================================== -->
            <!-- RIGHT COLUMN: Rekening & Submit Action -->
            <!-- ===================================== -->
            <div class="space-y-4">
              <!-- Rekening Tujuan Section -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs sm:text-sm font-bold text-text">
                    Rekening Tujuan
                  </h4>
                  <button
                    type="button"
                    class="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer"
                    @click="showAddBankModal = true"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>

                <!-- Empty State -->
                <div
                  v-if="!isBankLoading && bankAccounts.length === 0"
                  class="p-5 rounded-2xl border border-dashed border-border text-center bg-surface-1 cursor-pointer hover:bg-surface-2 transition-colors"
                  @click="showAddBankModal = true"
                >
                  <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <Landmark class="w-4 h-4" />
                  </div>
                  <p class="text-xs sm:text-sm font-bold text-text">
                    Belum ada rekening terdaftar
                  </p>
                  <p class="text-xs text-primary font-semibold mt-1">
                    Klik untuk tambah rekening bank
                  </p>
                </div>

                <!-- Bank Account Selectable List -->
                <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                  <div
                    v-for="bank in bankAccounts"
                    :key="bank.id"
                    class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3"
                    :class="
                      selectedBankId === bank.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-white hover:border-border-hover'
                    "
                    @click="selectedBankId = bank.id"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        <img
                          v-if="bank.logo"
                          :src="bank.logo"
                          :alt="bank.bank_name"
                          class="w-full h-full object-contain"
                          loading="lazy"
                        />
                        <Landmark v-else class="w-4 h-4 text-text-muted" />
                      </div>
                      <div class="min-w-0">
                        <h5 class="text-xs sm:text-sm font-bold text-text truncate">
                          {{ bank.bank_name || 'Bank' }}
                        </h5>
                        <p class="text-[11px] text-text-muted truncate mt-0.5">
                          {{ bank.name }} • {{ bank.bank_account }}
                        </p>
                      </div>
                    </div>

                    <!-- Radio Circle -->
                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                      :class="
                        selectedBankId === bank.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-light bg-white'
                      "
                    >
                      <div
                        v-if="selectedBankId === bank.id"
                        class="w-2 h-2 rounded-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info Penarikan -->
              <div class="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/60 space-y-2">
                <div class="flex items-center gap-1.5 text-primary font-bold text-xs">
                  <Info class="w-3.5 h-3.5 shrink-0" />
                  <span>Info Penarikan</span>
                </div>
                <ul class="text-[11px] text-sky-950 space-y-1 list-disc list-inside leading-relaxed pl-0.5">
                  <li>Proses penarikan membutuhkan 1-3 hari kerja</li>
                  <li>Pastikan data rekening sudah benar dan aktif</li>
                  <li>Penarikan dana tidak dapat dibatalkan jika sudah diproses</li>
                </ul>

                <button
                  type="button"
                  class="pt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="openBekaskuCenterHelp"
                >
                  <Headset class="w-3 h-3" />
                  <span>Butuh bantuan penarikan? Hubungi CS</span>
                </button>
              </div>

              <!-- Submit CTA -->
              <div class="pt-1">
                <button
                  type="button"
                  :disabled="!isFormValid || isSubmittingWithdraw"
                  class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  @click="handleInitiateWithdraw"
                >
                  <span v-if="isSubmittingWithdraw">Memproses...</span>
                  <span v-else>Tarik Saldo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sub-Modal: Tambah Rekening Bank -->
    <BankAccountFormModal
      v-model="showAddBankModal"
      :verified-ktp-name="verifiedKtpName"
      @saved="fetchBankAccounts"
    />

    <!-- Sub-Modal: Konfirmasi Password Penarikan -->
    <BalancePasswordModal
      v-model="showPasswordModal"
      title="Konfirmasi Penarikan"
      description="Masukkan password akun untuk konfirmasi penarikan saldo ke rekening tujuan Anda."
      :loading="isVerifyingPassword"
      :error="passwordError"
      @submit="handleConfirmPassword"
    />
  </Teleport>
</template>

