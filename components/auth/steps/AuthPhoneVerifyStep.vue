<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { normalizePhoneTo62 } from '~/composables/usePasswordRules'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthOtpMethodPicker from '~/components/auth/AuthOtpMethodPicker.vue'
import AuthOtpInput from '~/components/auth/AuthOtpInput.vue'

const authModal = useAuthModal()
const draft = computed(() => authModal.phoneVerifyDraft.value)

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
    <AuthStepHeader
      title="Verifikasi Nomor Handphone"
      subtitle="Tautkan dan verifikasi nomor HP aktif Anda untuk mengaktifkan fitur jual barang, penarikan saldo, dan keamanan ekstra."
    />

    <!-- Sub-state 1: Input Phone Number -->
    <form
      v-if="!draft.otpSent"
      class="space-y-4"
      @submit.prevent="authModal.requestPhoneVerifyOtp(draft.method)"
    >
      <div>
        <label for="phone-verify-input" class="block text-xs font-semibold text-text mb-1.5">
          Nomor Handphone
        </label>
        <div class="flex items-center h-11 rounded-xl border border-border bg-white overflow-hidden focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 transition-all">
          <span class="px-3.5 h-full inline-flex items-center bg-surface-2 border-r border-border text-xs font-bold text-text select-none">
            +62
          </span>
          <input
            id="phone-verify-input"
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
        v-model="draft.method"
        :methods="authModal.otpMethods.value"
        label="Pilih Metode Penerimaan OTP"
      />

      <button
        type="submit"
        :disabled="authModal.isSubmitting.value || draft.phone.length < 9"
        class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
      >
        <span>{{ authModal.isSubmitting.value ? 'Mengirim OTP...' : 'Kirim Kode Verifikasi' }}</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </form>

    <!-- Sub-state 2: Verify OTP Code -->
    <div v-else class="space-y-3">
      <AuthOtpInput
        :target-label="`+${normalizePhoneTo62(draft.phone)}`"
        :channel="draft.method"
        :methods="authModal.otpMethods.value"
        allow-channel-switch
        :loading="authModal.isSubmitting.value"
        @verify="authModal.verifyOtpCode"
        @resend="(ch) => authModal.resendCurrentOtp(ch)"
      />

      <div class="text-center pt-1">
        <button
          type="button"
          class="text-xs font-semibold text-text-muted hover:text-primary cursor-pointer"
          @click="draft.otpSent = false; authModal.clearMessages()"
        >
          Ganti Nomor Handphone
        </button>
      </div>
    </div>
  </div>
</template>

