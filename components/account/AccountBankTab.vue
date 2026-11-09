<template>
  <div class="space-y-4 font-outfit">
    <!-- ==================================================== -->
    <!-- LAPIS KUNCI 1: LOGIN LOCK (Guest State)              -->
    <!-- ==================================================== -->
    <div
      v-if="!authStore.isLoggedIn"
      class="bg-white rounded-2xl p-6 sm:p-10 border border-border shadow-2xs text-center"
    >
      <AppGuestPromptCard
        feature-title="Rekening Bank"
        message="Silakan masuk atau daftar akun BekasKu untuk melihat dan mengelola rekening bank pencairan saldo Anda."
        action-label="Masuk / Daftar Sekarang"
        @action="handleOpenLoginModal"
      />
    </div>

    <!-- User Logged In Content -->
    <template v-else>
      <!-- Main Bank Account Manager Container -->
      <div class="bg-white rounded-2xl p-5 sm:p-7 border border-border shadow-2xs space-y-5">
        <!-- Header: Title & Tambah Rekening Button -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base sm:text-lg text-text">
                Rekening Bank
              </h3>
              <span
                v-if="!loading"
                class="px-2 py-0.5 rounded-md bg-surface-2 text-text-muted text-xs font-semibold"
              >
                {{ bankAccounts.length }}/3
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              Daftar rekening bank untuk penarikan saldo hasil penjualan kamu.
            </p>
          </div>

          <!-- Tambah Rekening Button -->
          <button
            type="button"
            :disabled="isMaxReached || !isKycVerified"
            class="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="isMaxReached ? 'Maksimal 3 rekening' : (!isKycVerified ? 'Wajib verifikasi KTP terlebih dahulu' : '')"
            @click="handleOpenAddModal"
          >
            <Plus class="w-4 h-4" aria-hidden="true" />
            <span>Tambah Rekening</span>
          </button>
        </div>

        <!-- ==================================================== -->
        <!-- LAPIS KUNCI 2: KTP LOCK (KYC Gate Warning)           -->
        <!-- ==================================================== -->
        <div
          v-if="!isKycLoading && !isKycVerified"
          class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/70 space-y-3"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert class="w-5 h-5" aria-hidden="true" />
            </div>

            <div class="space-y-1 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-bold text-sm text-text">
                  Verifikasi Identitas (KTP) Diperlukan
                </h4>
                <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Belum Lengkap
                </span>
              </div>
              <p class="text-xs text-text-muted leading-relaxed">
                Sesuai regulasi perbankan dan perlindungan keamanan dana, kamu wajib melengkapi dan memverifikasi identitas KTP sebelum dapat menambahkan rekening bank pencairan saldo di BekasKu.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-1">
            <button
              type="button"
              class="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              @click="handleOpenKyc"
            >
              <CreditCard class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verifikasi KTP Sekarang</span>
            </button>
          </div>
        </div>

        <!-- Info Banner (Maksimal 3 rekening) -->
        <div
          v-if="isKycVerified"
          class="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed"
        >
          <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Maksimal <strong>3 rekening bank aktif</strong> dapat disimpan untuk pencairan saldo penjualan kamu. Pastikan nama pemilik rekening sama dengan nama KTP terdaftar.
          </p>
        </div>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="py-12 flex flex-col items-center justify-center space-y-2 text-text-muted text-xs"
        >
          <Loader2 class="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p>Memuat rekening bank...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="bankAccounts.length === 0"
          class="py-12 sm:py-16 text-center space-y-4 max-w-sm mx-auto"
        >
          <div class="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
            <Landmark class="w-10 h-10" aria-hidden="true" />
          </div>
          <div class="space-y-1.5">
            <h4 class="text-base font-bold text-text">
              Belum Ada Rekening Bank
            </h4>
            <p class="text-xs text-text-muted leading-relaxed">
              Tambahkan rekening bank untuk mempermudah pencairan saldo hasil penjualan kamu di BekasKu.
            </p>
          </div>
          <button
            type="button"
            :disabled="!isKycVerified"
            class="inline-flex px-6 h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-colors items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleOpenAddModal"
          >
            <Plus class="w-4 h-4" aria-hidden="true" />
            <span>Tambah Rekening Pertama</span>
          </button>
        </div>

        <!-- Bank Accounts List -->
        <div
          v-else
          class="space-y-3.5"
        >
          <BankAccountCard
            v-for="(bank, index) in bankAccounts"
            :key="bank.id"
            :bank="bank"
            :is-primary="index === 0"
            :selectable="selectable"
            :selected="selectedBankId === bank.id"
            :disabled-actions="disabledActions"
            @select="$emit('select', bank)"
            @delete="handleRequestDelete"
          />
        </div>
      </div>
    </template>

    <!-- Modal Form Tambah Rekening (z-[80]) -->
    <BankAccountFormModal
      v-model="showAddModal"
      :verified-ktp-name="verifiedKtpName"
      @saved="handleBankAdded"
    />

    <!-- Modal Konfirmasi Hapus Rekening (z-[95]) -->
    <AppModal
      v-model="showDeleteModal"
      title="Hapus Rekening Bank"
      z-index="z-[95]"
    >
      <div class="space-y-4 font-outfit">
        <p class="text-sm sm:text-base text-text leading-relaxed">
          Apakah kamu yakin ingin menghapus rekening <strong>{{ bankToDelete?.bank_name }}</strong> ({{ bankToDelete?.bank_account }})?
        </p>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
          Rekening yang dihapus tidak dapat digunakan lagi untuk penarikan dana sampai didaftarkan kembali.
        </p>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            class="flex-1 h-11 px-4 rounded-xl border border-border text-xs sm:text-sm text-text font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            :disabled="isSubmitting"
            @click="showDeleteModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 h-11 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            :disabled="isSubmitting"
            @click="executeDelete"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Landmark,
  ShieldAlert,
  CreditCard,
  Info,
  Loader2,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useBankAccount } from '~/composables/useBankAccount'
import { useProfile } from '~/composables/useProfile'
import { useIdentityKycModal } from '~/composables/useIdentityKyc'
import { useNotification } from '~/composables/useNotification'
import type { UserBankAccount } from '~/types/bank'
import BankAccountCard from '~/components/account/BankAccountCard.vue'
import BankAccountFormModal from '~/components/account/BankAccountFormModal.vue'
import AppModal from '~/components/shared/AppModal.vue'
import AppGuestPromptCard from '~/components/shared/AppGuestPromptCard.vue'

const props = withDefaults(
  defineProps<{
    selectable?: boolean
    selectedBankId?: string
    disabledActions?: boolean
    asModal?: boolean
  }>(),
  {
    selectable: false,
    selectedBankId: '',
    disabledActions: false,
    asModal: false,
  }
)

defineEmits<{
  (e: 'select', bank: UserBankAccount): void
}>()

const authStore = useAuthStore()
const authModal = useAuthModal()
const { showNotification } = useNotification()
const {
  bankAccounts,
  loading,
  isSubmitting,
  isMaxReached,
  fetchBankAccounts,
  deleteBankAccount,
} = useBankAccount()

const { identityInfo, fetchIdentityInfo } = useProfile()
const kycModal = useIdentityKycModal()
const isKycLoading = ref(false)

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const bankToDelete = ref<UserBankAccount | null>(null)

const isKycVerified = computed(() => {
  return Boolean(identityInfo.value?.identity_number)
})

const verifiedKtpName = computed(() => {
  return identityInfo.value?.identity_name || authStore.displayName || ''
})

function handleOpenLoginModal() {
  authModal.openLogin({
    redirectPath: '/account?tab=bank',
    featureTitle: 'Rekening Bank',
  })
}

function handleOpenAddModal() {
  if (!isKycVerified.value) {
    showNotification({
      type: 'warning',
      message: 'Kamu wajib melengkapi identitas (KTP) sebelum menambahkan rekening bank.',
    })
    return
  }
  if (isMaxReached.value) {
    showNotification({
      type: 'warning',
      message: 'Maksimal 3 rekening bank aktif telah tercapai.',
    })
    return
  }
  showAddModal.value = true
}

function handleOpenKyc() {
  kycModal.open({
    reason: 'bank',
    onSuccess: () => {
      fetchIdentityInfo()
    },
  })
}

function handleRequestDelete(bank: UserBankAccount) {
  bankToDelete.value = bank
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!bankToDelete.value?.id) return
  const id = bankToDelete.value.id
  try {
    const res = await deleteBankAccount(id)
    if (res.success) {
      showDeleteModal.value = false
      showNotification({
        type: 'success',
        message: 'Rekening bank berhasil dihapus',
      })
    } else {
      showNotification({
        type: 'error',
        message: res.message || 'Gagal menghapus rekening bank',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal menghapus rekening bank',
    })
  }
}

function handleBankAdded() {
  fetchBankAccounts()
}

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    handleOpenLoginModal()
    return
  }

  isKycLoading.value = true
  await Promise.allSettled([
    fetchBankAccounts(),
    fetchIdentityInfo(),
  ])
  isKycLoading.value = false
})
</script>

