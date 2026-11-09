<script setup lang="ts">
import { Mail, ArrowRight } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthOtpMethodPicker from '~/components/auth/AuthOtpMethodPicker.vue'
import AuthConsentNote from '~/components/auth/AuthConsentNote.vue'
import AuthRegisterSecurityForm from '~/components/auth/steps/AuthRegisterSecurityForm.vue'

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.registerDraft.value)

function handlePhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  let digits = input.value.replace(/\D/g, '')
  if (digits.startsWith('62')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  draft.value.phone = digits.slice(0, 13)
}
</script>

<template>
  <div>
    <!-- STEP 1: REGISTER EMAIL -->
    <template v-if="currentStep === 'register-email'">
      <AuthStepHeader
        title="Daftar Akun Baru"
        subtitle="Masukkan alamat email aktif untuk menerima kode verifikasi pendaftaran."
      />

      <form class="space-y-4" @submit.prevent="authModal.submitRegisterEmail()">
        <div>
          <label for="reg-email-input" class="block text-xs font-semibold text-text mb-1.5">
            Email
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="reg-email-input"
              v-model="draft.email"
              type="email"
              autocomplete="email"
              placeholder="Cth. namakamu@domain.com"
              class="w-full h-11 pl-10 pr-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="authModal.isSubmitting.value || !draft.email.trim()"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Memeriksa Email...' : 'Lanjut' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <div class="mt-4 pt-3 border-t border-border text-center text-xs text-text-muted">
        Sudah punya akun BekasKu?
        <button
          type="button"
          class="ml-1 font-bold text-primary hover:underline cursor-pointer"
          @click="authModal.switchToStep('login')"
        >
          Masuk di Sini
        </button>
      </div>

      <AuthConsentNote @navigate="authModal.closeModal()" />
    </template>

    <!-- STEP 2: REGISTER PHONE NUMBER (Direct from Email, Mobile V3 Standard) -->
    <template v-else-if="currentStep === 'register-phone'">
      <AuthStepHeader
        title="Verifikasi Nomor Handphone"
        subtitle="Nomor HP digunakan untuk menerima kode OTP, notifikasi rekber, dan keamanan akun."
      />

      <form class="space-y-4" @submit.prevent="authModal.submitRegisterPhone()">
        <div>
          <label for="reg-phone-input" class="block text-xs font-semibold text-text mb-1.5">
            Nomor Handphone Aktif
          </label>
          <div class="flex items-center h-11 rounded-xl border border-border bg-white overflow-hidden focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 transition-all">
            <span class="px-3.5 h-full inline-flex items-center bg-surface-2 border-r border-border text-xs font-bold text-text select-none">
              +62
            </span>
            <input
              id="reg-phone-input"
              :value="draft.phone"
              type="tel"
              inputmode="numeric"
              placeholder="81234567890"
              class="flex-1 h-full px-3.5 text-xs sm:text-sm text-text outline-none bg-transparent"
              @input="handlePhoneInput"
            />
          </div>
        </div>

        <AuthOtpMethodPicker
          v-model="draft.otpMethod"
          :methods="authModal.otpMethods.value"
          label="Kirim Kode OTP Melalui"
        />

        <button
          type="submit"
          :disabled="authModal.isSubmitting.value || draft.phone.length < 9"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Mengirim OTP...' : 'Kirim Kode OTP' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </template>

    <AuthRegisterSecurityForm v-else />
  </div>
</template>
