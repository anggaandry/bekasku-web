<script setup lang="ts">
import { ref } from 'vue'
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  KeyRound,
} from 'lucide-vue-next'
import { usePasswordChange } from '~/composables/usePasswordChange'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import AccountNewPasswordForm from '~/components/account/AccountNewPasswordForm.vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const authStore = useAuthStore()
const authModal = useAuthModal()
const {
  isVerifyingOld,
  isSubmittingNew,
  oldPasswordError,
  formError,
  isOldPasswordVerified,
  verifiedOldPassword,
  verifyOldPassword,
  submitNewPassword,
  resetState,
} = usePasswordChange()

const oldPasswordInput = ref('')
const showOldPassword = ref(false)
const successNotification = ref(false)
const newPasswordFormRef = ref<InstanceType<typeof AccountNewPasswordForm> | null>(null)

async function handleVerifyOldPassword() {
  if (!oldPasswordInput.value.trim() || isVerifyingOld.value) return
  await verifyOldPassword(oldPasswordInput.value)
}

function handleOpenForgotPassword() {
  const identifier = authStore.user?.email || authStore.user?.phone || ''
  authModal.openForgotPassword(identifier)
}

function handleResetOldPasswordVerification() {
  resetState()
  oldPasswordInput.value = ''
  newPasswordFormRef.value?.clearFields()
}

async function handleSaveNewPassword(newPassword: string) {
  const success = await submitNewPassword(newPassword)
  if (success) {
    successNotification.value = true
    oldPasswordInput.value = ''
    newPasswordFormRef.value?.clearFields()
    emit('success')
  }
}
</script>

<template>
  <div class="space-y-6 font-outfit select-none">
    <!-- Main Card Container -->
    <div class="bg-white rounded-2xl p-5 sm:p-7 border border-border shadow-2xs space-y-6">
      <!-- Header -->
      <div class="pb-4 border-b border-border/70 flex items-start justify-between gap-3">
        <div>
          <h3 class="font-bold text-lg text-text flex items-center gap-2">
            <KeyRound class="w-5 h-5 text-primary shrink-0" />
            <span>Ubah Password Akun</span>
          </h3>
          <p class="text-xs text-text-muted mt-1 leading-relaxed">
            Untuk menjaga keamanan akun Anda, masukkan password lama terlebih dahulu sebelum membuat password baru.
          </p>
        </div>
      </div>

      <!-- Success Alert Banner -->
      <div
        v-if="successNotification"
        class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-fade-in"
      >
        <div class="flex items-center gap-2.5">
          <CheckCircle class="w-5 h-5 text-emerald-600 shrink-0" />
          <span class="font-semibold">Password akun Anda berhasil diperbarui!</span>
        </div>
        <button
          type="button"
          class="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          @click="successNotification = false"
        >
          Tutup
        </button>
      </div>

      <!-- Error Alert Banner -->
      <div
        v-if="formError"
        class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
      >
        <AlertTriangle class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ formError }}</span>
      </div>

      <!-- ============================================== -->
      <!-- SECTION 1: MASUKKAN PASSWORD LAMA               -->
      <!-- ============================================== -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label for="account-old-password" class="block text-xs font-bold text-text">
            Password Lama <span class="text-red-500">*</span>
          </label>
          <button
            type="button"
            class="text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors"
            @click="handleOpenForgotPassword"
          >
            Lupa Password?
          </button>
        </div>

        <div class="relative">
          <input
            id="account-old-password"
            v-model="oldPasswordInput"
            name="old_password"
            autocomplete="current-password"
            :type="showOldPassword ? 'text' : 'password'"
            :disabled="isOldPasswordVerified || isVerifyingOld"
            placeholder="Masukkan password lama Anda"
            class="w-full px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors pr-24 focus:outline-hidden"
            :class="[
              isOldPasswordVerified
                ? 'bg-emerald-50/40 border-emerald-300 text-emerald-900 cursor-not-allowed'
                : oldPasswordError
                ? 'border-red-400 bg-red-50/20 text-text focus:border-red-500'
                : 'border-border bg-white text-text focus:border-primary',
            ]"
            @keydown.enter.prevent="handleVerifyOldPassword"
          />

          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              v-if="!isOldPasswordVerified"
              type="button"
              class="text-text-muted hover:text-text cursor-pointer p-1"
              aria-label="Tampilkan atau sembunyikan password lama"
              @click="showOldPassword = !showOldPassword"
            >
              <Eye v-if="showOldPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>

            <div
              v-if="isOldPasswordVerified"
              class="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md"
            >
              <CheckCircle class="w-3.5 h-3.5" />
              <span>Sesuai</span>
            </div>
          </div>
        </div>

        <p v-if="oldPasswordError" class="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ oldPasswordError }}</span>
        </p>

        <div v-if="!isOldPasswordVerified" class="flex justify-end pt-1">
          <button
            type="button"
            :disabled="!oldPasswordInput.trim() || isVerifyingOld"
            class="px-5 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            @click="handleVerifyOldPassword"
          >
            <Loader2 v-if="isVerifyingOld" class="w-4 h-4 animate-spin" />
            <span>Verifikasi Password Lama</span>
          </button>
        </div>

        <div v-else class="flex justify-between items-center text-xs">
          <span class="text-emerald-700 font-medium">
            Password lama terverifikasi. Silakan masukkan password baru di bawah ini.
          </span>
          <button
            type="button"
            class="text-text-muted hover:text-red-600 underline cursor-pointer shrink-0"
            @click="handleResetOldPasswordVerification"
          >
            Ganti Input
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-border/70 my-2"></div>

      <!-- ============================================== -->
      <!-- SECTION 2: MASUKKAN PASSWORD BARU (Lapis 2)    -->
      <!-- ============================================== -->
      <AccountNewPasswordForm
        ref="newPasswordFormRef"
        :disabled="!isOldPasswordVerified"
        :is-submitting="isSubmittingNew"
        :verified-old-password="verifiedOldPassword"
        @submit="handleSaveNewPassword"
      />
    </div>
  </div>
</template>
