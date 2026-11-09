<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { usePasswordRules } from '~/composables/usePasswordRules'
import AuthPasswordRules from '~/components/auth/AuthPasswordRules.vue'

const props = defineProps<{
  disabled: boolean
  isSubmitting: boolean
  verifiedOldPassword: string
}>()

const emit = defineEmits<{
  (e: 'submit', newPassword: string): void
}>()

const newPasswordInput = ref('')
const showNewPassword = ref(false)

const confirmPasswordInput = ref('')
const showConfirmPassword = ref(false)

const newPasswordRef = computed(() => newPasswordInput.value)
const { isValid: isNewPasswordValid } = usePasswordRules(newPasswordRef)

const isSameAsOldPassword = computed(() => {
  return (
    Boolean(props.verifiedOldPassword) &&
    newPasswordInput.value.trim().length > 0 &&
    newPasswordInput.value.trim() === props.verifiedOldPassword
  )
})

const isConfirmMatched = computed(() => {
  return (
    confirmPasswordInput.value.length > 0 &&
    confirmPasswordInput.value === newPasswordInput.value
  )
})

const isReady = computed(() => {
  return (
    !props.disabled &&
    isNewPasswordValid.value &&
    !isSameAsOldPassword.value &&
    isConfirmMatched.value &&
    !props.isSubmitting
  )
})

function handleSave() {
  if (!isReady.value) return
  emit('submit', newPasswordInput.value)
}

function clearFields() {
  newPasswordInput.value = ''
  confirmPasswordInput.value = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
}

defineExpose({ clearFields })
</script>

<template>
  <form
    class="space-y-5 transition-opacity"
    :class="disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'"
    @submit.prevent="handleSave"
  >
    <div>
      <h4 class="font-bold text-sm text-text">Buat Password Baru</h4>
      <p class="text-xs text-text-muted mt-0.5">
        Password baru harus berbeda dari password sebelumnya dan memenuhi ketentuan keamanan.
      </p>
    </div>

    <!-- Input Password Baru -->
    <div class="space-y-2">
      <label for="account-new-password" class="block text-xs font-bold text-text">
        Password Baru <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          id="account-new-password"
          v-model="newPasswordInput"
          name="new_password"
          autocomplete="new-password"
          :type="showNewPassword ? 'text' : 'password'"
          :disabled="disabled || isSubmitting"
          placeholder="Masukkan password baru"
          class="w-full px-4 py-3 rounded-xl border border-border bg-white text-xs sm:text-sm text-text font-medium transition-colors pr-10 focus:border-primary focus:outline-hidden"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer p-1"
          aria-label="Tampilkan atau sembunyikan password baru"
          @click="showNewPassword = !showNewPassword"
        >
          <Eye v-if="showNewPassword" class="w-4 h-4" />
          <EyeOff v-else class="w-4 h-4" />
        </button>
      </div>
      <p
        v-if="isSameAsOldPassword"
        class="text-xs text-red-500 font-medium"
      >
        Password baru harus berbeda dari password lama Anda.
      </p>
    </div>

    <!-- Aturan Password Checklist (Component Reuse) -->
    <AuthPasswordRules :password="newPasswordInput" />

    <!-- Input Konfirmasi Password Baru -->
    <div class="space-y-2">
      <label for="account-confirm-password" class="block text-xs font-bold text-text">
        Konfirmasi Password Baru <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          id="account-confirm-password"
          v-model="confirmPasswordInput"
          name="confirm_password"
          autocomplete="new-password"
          :type="showConfirmPassword ? 'text' : 'password'"
          :disabled="disabled || isSubmitting"
          placeholder="Masukkan ulang password baru"
          class="w-full px-4 py-3 rounded-xl border border-border bg-white text-xs sm:text-sm text-text font-medium transition-colors pr-10 focus:border-primary focus:outline-hidden"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer p-1"
          aria-label="Tampilkan atau sembunyikan konfirmasi password"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <Eye v-if="showConfirmPassword" class="w-4 h-4" />
          <EyeOff v-else class="w-4 h-4" />
        </button>
      </div>
      <p
        v-if="confirmPasswordInput && !isConfirmMatched"
        class="text-xs text-red-500 font-medium"
      >
        Konfirmasi password tidak cocok dengan password baru.
      </p>
      <p v-else class="text-[11px] text-text-muted">
        Pastikan password konfirmasi sama persis dengan password baru.
      </p>
    </div>

    <!-- Tombol Simpan Password Baru -->
    <div class="pt-3">
      <button
        type="submit"
        :disabled="!isReady"
        class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-[0.99]"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        <Lock v-else class="w-4 h-4" />
        <span>Simpan Password Baru</span>
      </button>
    </div>
  </form>
</template>

