<script setup lang="ts">
import { Eye, EyeOff, ArrowRight, Lock } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { usePasswordRules } from '~/composables/usePasswordRules'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthPasswordRules from '~/components/auth/AuthPasswordRules.vue'

const authModal = useAuthModal()
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.loginDraft.value)

const newPasswordRef = computed(() => draft.value.newPassword)
const { isValid: isNewPasswordValid } = usePasswordRules(newPasswordRef)
</script>

<template>
  <div>
    <!-- STEP B: PASSWORD INPUT (Sesuai LoginPasswordView di bekasku_v3) -->
    <template v-if="currentStep === 'login-password'">
      <AuthStepHeader
        title="Masukkan Password"
        subtitle="Silakan masukkan password akun Anda untuk melanjutkan."
      />

      <form class="space-y-4" @submit.prevent="authModal.submitLoginPassword()">
        <div>
          <div class="relative">
            <Lock class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="auth-password-input"
              v-model="draft.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Password"
              class="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-surface-2 focus:bg-white text-xs sm:text-sm text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
              @input="authModal.clearMessages()"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
              :aria-label="showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>

          <div class="flex justify-end mt-2">
            <button
              type="button"
              class="text-xs font-semibold text-primary hover:underline cursor-pointer"
              @click="authModal.openForgotPassword(draft.identity)"
            >
              Lupa Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authModal.isSubmitting.value || !draft.password"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Memproses...' : 'Masuk' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </template>

    <!-- STEP C: MAKE PASSWORD FOR OLD ACCOUNT -->
    <template v-else-if="currentStep === 'make-password'">
      <AuthStepHeader
        title="Buat Kata Sandi Akun"
        subtitle="Untuk keamanan akun Anda, silakan buat kata sandi baru."
      />

      <form class="space-y-3.5" @submit.prevent="authModal.submitMakePassword()">
        <div>
          <label for="make-new-password" class="block text-xs font-semibold text-text mb-1.5">Kata Sandi Baru</label>
          <div class="relative">
            <input
              id="make-new-password"
              v-model="draft.newPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Minimal 8 karakter"
              class="w-full h-11 px-3.5 pr-10 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
              :aria-label="showPassword ? 'Sembunyikan sandi baru' : 'Lihat sandi baru'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <AuthPasswordRules :password="draft.newPassword" />

        <div>
          <label for="make-confirm-password" class="block text-xs font-semibold text-text mb-1.5">Ulangi Kata Sandi</label>
          <div class="relative">
            <input
              id="make-confirm-password"
              v-model="draft.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ketik ulang kata sandi baru"
              class="w-full h-11 px-3.5 pr-10 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
              :aria-label="showConfirmPassword ? 'Sembunyikan konfirmasi sandi' : 'Lihat konfirmasi sandi'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="
            authModal.isSubmitting.value ||
            !isNewPasswordValid ||
            draft.newPassword !== draft.confirmPassword
          "
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Menyimpan...' : 'Simpan Kata Sandi & Masuk' }}</span>
        </button>
      </form>
    </template>
  </div>
</template>
