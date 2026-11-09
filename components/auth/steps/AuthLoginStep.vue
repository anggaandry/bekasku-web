<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthSocialButtons from '~/components/auth/AuthSocialButtons.vue'
import AuthConsentNote from '~/components/auth/AuthConsentNote.vue'
import AuthLoginCredentialsForm from '~/components/auth/steps/AuthLoginCredentialsForm.vue'

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.loginDraft.value)

function handleSocialClick(provider: 'google' | 'apple') {
  authModal.submitSocialAuth(provider)
}
</script>

<template>
  <div>
    <template v-if="currentStep === 'login'">
      <AuthStepHeader
        title="Selamat datang di BekasKu!"
        :subtitle="
          authModal.customMessage.value ||
          'Masukkan email atau nomor HP kamu untuk masuk atau mendaftar akun baru.'
        "
      />

      <form class="space-y-4" @submit.prevent="authModal.submitLoginCheck()">
        <div>
          <label for="auth-login-identity" class="block text-xs font-semibold text-text mb-1.5">
            Email atau Nomor HP
          </label>
          <input
            id="auth-login-identity"
            v-model="draft.identity"
            type="text"
            autocomplete="username"
            placeholder="Cth. namakamu@domain.com atau 08123456789"
            class="w-full h-11 px-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
            @input="authModal.clearMessages()"
          />
        </div>

        <button
          type="submit"
          :disabled="authModal.isSubmitting.value || !(draft.identity || '').trim()"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Memeriksa Akun...' : 'Lanjut' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <AuthSocialButtons :loading="authModal.isSubmitting.value" @select="handleSocialClick" />

      <div class="mt-4 pt-3 border-t border-border text-center text-xs text-text-muted">
        Belum punya akun BekasKu?
        <button
          type="button"
          class="ml-1 font-bold text-primary hover:underline cursor-pointer"
          @click="authModal.switchToStep('register-email')"
        >
          Daftar Sekarang
        </button>
      </div>

      <AuthConsentNote @navigate="authModal.closeModal()" />
    </template>

    <AuthLoginCredentialsForm v-else />
  </div>
</template>
