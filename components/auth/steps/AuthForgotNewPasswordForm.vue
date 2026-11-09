<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { usePasswordRules } from '~/composables/usePasswordRules'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthPasswordRules from '~/components/auth/AuthPasswordRules.vue'
import AuthSuccessState from '~/components/auth/AuthSuccessState.vue'

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.forgotDraft.value)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordRef = computed(() => draft.value.password)
const { isValid: isPasswordValid } = usePasswordRules(passwordRef)
</script>

<template>
  <div>
    <!-- STEP 3: FORGOT PASSWORD NEW PASSWORD -->
    <template v-if="currentStep === 'forgot-new'">
      <AuthStepHeader
        title="Buat Kata Sandi Baru"
        subtitle="Pastikan kata sandi baru Anda kuat dan mudah diingat."
      />

      <form class="space-y-3.5" @submit.prevent="authModal.submitForgotNewPassword()">
        <div>
          <label for="forgot-new-password" class="block text-xs font-semibold text-text mb-1.5">
            Kata Sandi Baru
          </label>
          <div class="relative">
            <input
              id="forgot-new-password"
              v-model="draft.password"
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

        <AuthPasswordRules :password="draft.password" />

        <div>
          <label for="forgot-confirm-password" class="block text-xs font-semibold text-text mb-1.5">
            Konfirmasi Kata Sandi Baru
          </label>
          <div class="relative">
            <input
              id="forgot-confirm-password"
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
            !isPasswordValid ||
            draft.password !== draft.confirmPassword
          "
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Menyimpan...' : 'Simpan Kata Sandi Baru' }}</span>
        </button>
      </form>
    </template>

    <!-- STEP 4: FORGOT PASSWORD SUCCESS -->
    <template v-else-if="currentStep === 'forgot-success'">
      <AuthSuccessState
        title="Kata Sandi Berhasil Diperbarui!"
        description="Kata sandi akun Anda telah diperbarui. Silakan masuk kembali menggunakan kata sandi baru Anda."
        button-text="Masuk Sekarang"
        @action="authModal.switchToStep('login')"
      />
    </template>
  </div>
</template>

