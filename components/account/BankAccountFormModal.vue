<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-form-title"
        @click.self="handleClose"
      >
        <div
          class="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[86vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Header -->
          <div class="px-5 sm:px-7 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="sm:hidden p-1.5 -ml-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                aria-label="Kembali"
                @click="handleClose"
              >
                <ArrowLeft class="w-5 h-5" aria-hidden="true" />
              </button>
              <h2
                id="bank-form-title"
                class="text-base sm:text-lg font-bold text-text"
              >
                Tambah Rekening Bank
              </h2>
            </div>

            <button
              type="button"
              class="hidden sm:flex p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup form"
              @click="handleClose"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Form Body -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-5">
            <!-- 1. Pilihan Bank -->
            <div>
              <label class="block text-xs font-bold text-text mb-1.5">
                Nama Bank <span class="text-primary">*</span>
              </label>
              <button
                type="button"
                class="w-full h-12 px-4 rounded-xl border border-border bg-surface-2/40 hover:bg-surface-2 transition-colors flex items-center justify-between gap-3 text-left cursor-pointer group"
                @click="showBankChooser = true"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      v-if="selectedBankLogo && !hasLogoError"
                      :src="selectedBankLogo"
                      :alt="selectedBankName"
                      class="w-full h-full object-contain"
                      @error="hasLogoError = true"
                    >
                    <Landmark
                      v-else
                      class="w-4 h-4 text-text-muted"
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    class="text-xs sm:text-sm font-semibold truncate"
                    :class="selectedBankId ? 'text-text' : 'text-text-muted'"
                  >
                    {{ displayBankName || 'Pilih nama bank' }}
                  </span>
                </div>

                <ChevronDown class="w-4 h-4 text-text-muted group-hover:text-text transition-colors shrink-0" aria-hidden="true" />
              </button>
            </div>

            <!-- 2. Nama Bank Kustom (Jika Bank Lainnya) -->
            <div v-if="isOtherBank">
              <label for="custom-bank-name" class="block text-xs font-bold text-text mb-1.5">
                Nama Bank Lainnya <span class="text-primary">*</span>
              </label>
              <input
                id="custom-bank-name"
                v-model="customBankName"
                type="text"
                placeholder="Misal: Bank Aceh, Bank Nagari, dll."
                class="w-full h-11 px-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
              >
              <p class="text-[11px] text-text-muted mt-1">
                Tuliskan nama lengkap bank penerbit rekening Anda.
              </p>
            </div>

            <!-- 3. Nomor Rekening -->
            <div>
              <label for="bank-account-number" class="block text-xs font-bold text-text mb-1.5">
                Nomor Rekening <span class="text-primary">*</span>
              </label>
              <input
                id="bank-account-number"
                v-model="accountNumber"
                type="tel"
                placeholder="Contoh: 8470752067"
                class="w-full h-11 px-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm font-mono tracking-wider text-text placeholder:text-text-muted transition-colors bg-white"
                @input="handleAccountNumberInput"
              >
              <p class="text-[11px] text-text-muted mt-1">
                Masukkan angka tanpa spasi atau tanda hubung (-).
              </p>
            </div>

            <!-- 4. Nama Pemilik Rekening -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="bank-account-name" class="block text-xs font-bold text-text">
                  Nama Pemilik Rekening <span class="text-primary">*</span>
                </label>
                <button
                  v-if="verifiedKtpName && accountName !== verifiedKtpName"
                  type="button"
                  class="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="accountName = verifiedKtpName"
                >
                  Gunakan nama KTP
                </button>
              </div>

              <div class="relative">
                <input
                  id="bank-account-name"
                  v-model="accountName"
                  type="text"
                  placeholder="Masukkan nama pemilik rekening"
                  class="w-full h-11 pl-3.5 pr-10 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
                >
                <User class="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              </div>

              <!-- Note nama harus sama dengan KTP -->
              <div class="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p class="font-bold">Wajib sesuai dengan identitas (KTP) terverifikasi:</p>
                  <p class="mt-0.5 text-amber-800">
                    Nama terdaftar: <strong class="text-text">{{ verifiedKtpName || 'Belum ada nama KTP' }}</strong>.
                    Pencairan dana otomatis ditolak jika nama pemilik rekening tidak cocok dengan data KTP Anda.
                  </p>
                </div>
              </div>
            </div>

            <!-- Syarat & Ketentuan -->
            <div class="pt-1 text-[11px] text-text-muted leading-relaxed">
              Dengan menyimpan rekening ini, kamu menyetujui bahwa rekening bank yang didaftarkan adalah rekening yang sah atas nama pribadi kamu untuk keperluan penerimaan pencairan saldo penjualan di BekasKu.
            </div>
          </div>

          <!-- Fixed Footer Action Bar -->
          <div
            class="px-5 sm:px-7 py-3.5 border-t border-border bg-white sm:bg-surface-2/40 flex items-center justify-between gap-3 shrink-0"
          >
            <button
              type="button"
              class="h-11 px-5 rounded-xl border border-border text-text font-semibold text-xs sm:text-sm hover:bg-surface-2 transition-colors cursor-pointer"
              :disabled="isChecking"
              @click="handleClose"
            >
              Batal
            </button>

            <button
              type="button"
              :disabled="!isFormValid || isChecking"
              class="flex-1 sm:flex-none h-11 px-7 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleCheckSimilarity"
            >
              <Loader2 v-if="isChecking" class="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Simpan Rekening</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Chooser Bank (z-[90]) -->
    <BankChooserModal
      v-model="showBankChooser"
      :selected-bank-id="selectedBankId"
      @select="handleSelectBank"
    />

    <!-- Modal Confirm Bank (z-[95]) -->
    <BankConfirmModal
      v-model="showConfirmModal"
      :bank-logo="selectedBankLogo"
      :bank-name="displayBankName"
      :account-name="accountName"
      :account-number="accountNumber"
      :is-loading="isSubmitting"
      @confirm="executeSubmit"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  X,
  ArrowLeft,
  Landmark,
  ChevronDown,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'
import { BANK_OTHER_ID } from '~/utils/constants'
import { useBankAccount } from '~/composables/useBankAccount'
import { useNotification } from '~/composables/useNotification'
import type { BankItem } from '~/types/bank'
import BankChooserModal from '~/components/account/BankChooserModal.vue'
import BankConfirmModal from '~/components/account/BankConfirmModal.vue'

const props = defineProps<{
  modelValue: boolean
  verifiedKtpName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const { checkSimilarity, addBankAccount } = useBankAccount()
const { showNotification } = useNotification()

const showBankChooser = ref(false)
const showConfirmModal = ref(false)
const isChecking = ref(false)
const isSubmitting = ref(false)
const hasLogoError = ref(false)

const selectedBankId = ref('')
const selectedBankName = ref('')
const selectedBankLogo = ref('')
const isOtherBank = ref(false)
const customBankName = ref('')
const accountNumber = ref('')
const accountName = ref('')

const displayBankName = computed(() => {
  if (isOtherBank.value && customBankName.value.trim()) {
    return customBankName.value.trim()
  }
  return selectedBankName.value
})

const isFormValid = computed(() => {
  if (!selectedBankId.value) return false
  if (isOtherBank.value && !customBankName.value.trim()) return false
  if (!accountNumber.value.trim() || accountNumber.value.trim().length < 5) return false
  if (!accountName.value.trim() || accountName.value.trim().length < 2) return false
  return true
})

function handleSelectBank(bank: BankItem) {
  const idStr = String(bank._id || bank.id || '')
  selectedBankId.value = idStr
  selectedBankLogo.value = bank.image || ''
  hasLogoError.value = false
  const isOther = bank.code === 'other' || idStr === BANK_OTHER_ID || bank.name.toLowerCase().includes('lainnya')
  isOtherBank.value = isOther
  selectedBankName.value = isOther ? 'Bank Lainnya' : bank.name
}

function handleAccountNumberInput(e: Event) {
  const target = e.target as HTMLInputElement
  accountNumber.value = target.value.replace(/\D/g, '')
}

async function handleCheckSimilarity() {
  if (!isFormValid.value) return

  isChecking.value = true
  try {
    const res = await checkSimilarity(accountName.value)
    if (res.success) {
      showConfirmModal.value = true
    } else {
      showNotification({
        type: 'error',
        message:
          res.message ||
          'Nama rekening tidak sesuai dengan identitas (KTP) terverifikasi Anda. Mohon pastikan ejaan nama sama persis dengan KTP.',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal memverifikasi kecocokan nama pemilik rekening',
    })
  } finally {
    isChecking.value = false
  }
}

async function executeSubmit() {
  isSubmitting.value = true
  try {
    const res = await addBankAccount({
      bank_id: selectedBankId.value,
      number: accountNumber.value,
      name: accountName.value,
      custom_bank_name: isOtherBank.value ? customBankName.value.trim() : undefined,
    })

    if (res.success) {
      showConfirmModal.value = false
      showNotification({
        type: 'success',
        message: 'Rekening bank berhasil ditambahkan',
      })
      emit('saved')
      handleClose()
    } else {
      showNotification({
        type: 'error',
        message: res.message || 'Gagal menambahkan rekening bank',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Terjadi kesalahan sistem saat menyimpan rekening',
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  selectedBankId.value = ''
  selectedBankName.value = ''
  selectedBankLogo.value = ''
  hasLogoError.value = false
  isOtherBank.value = false
  customBankName.value = ''
  accountNumber.value = ''
  accountName.value = props.verifiedKtpName || ''
}

function handleClose() {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (isOpen, wasOpen) => {
    if (import.meta.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else if (wasOpen) {
        document.body.style.overflow = ''
      }
    }
    if (isOpen) {
      resetForm()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
