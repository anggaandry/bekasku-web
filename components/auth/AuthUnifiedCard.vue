<script setup lang="ts">
import { X, ArrowLeft, AlertCircle, Info } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { normalizePhoneTo62 } from '~/composables/usePasswordRules'
import AuthIntroCarousel from '~/components/auth/AuthIntroCarousel.vue'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthOtpInput from '~/components/auth/AuthOtpInput.vue'
import AuthLocationAsk from '~/components/auth/AuthLocationAsk.vue'
import AuthLoginStep from '~/components/auth/steps/AuthLoginStep.vue'
import AuthRegisterStep from '~/components/auth/steps/AuthRegisterStep.vue'
import AuthForgotStep from '~/components/auth/steps/AuthForgotStep.vue'
import AuthPhoneVerifyStep from '~/components/auth/steps/AuthPhoneVerifyStep.vue'

defineProps<{
  showCloseButton?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)

const canGoBack = computed(() =>
  [
    'login-password',
    'login-otp',
    'make-password',
    'register-email',
    'register-name',
    'register-phone',
    'register-otp',
    'register-password',
    'forgot-request',
    'forgot-method',
    'forgot-otp',
    'forgot-new',
  ].includes(currentStep.value),
)

const stepProgressLabel = computed(() => {
  switch (currentStep.value) {
    case 'register-email':
      return 'Langkah 1 / 5'
    case 'register-name':
      return 'Langkah 2 / 5'
    case 'register-phone':
    case 'register-otp':
      return 'Langkah 3 / 5'
    case 'register-password':
      return 'Langkah 4 / 5'
    case 'register-avatar':
      return 'Langkah 5 / 5'
    default:
      return ''
  }
})

const isLoginStep = computed(() =>
  ['login', 'login-password', 'make-password'].includes(currentStep.value),
)
const isRegisterStep = computed(() =>
  ['register-email', 'register-name', 'register-phone', 'register-password', 'register-avatar'].includes(
    currentStep.value,
  ),
)
const isForgotStep = computed(() =>
  ['forgot-request', 'forgot-method', 'forgot-new', 'forgot-success'].includes(currentStep.value),
)
const isSharedOtpStep = computed(() =>
  ['login-otp', 'register-otp', 'forgot-otp'].includes(currentStep.value),
)

const otpTargetLabel = computed(() => {
  const origin = authModal.otpOrigin.value
  if (origin === 'login_otp') {
    return authModal.loginDraft.value.otpMethod === 'email'
      ? authModal.loginDraft.value.email
      : `+${normalizePhoneTo62(authModal.loginDraft.value.phone)}`
  }
  if (origin === 'register_email') {
    return authModal.registerDraft.value.email
  }
  if (origin === 'register_phone') {
    return `+${normalizePhoneTo62(authModal.registerDraft.value.phone)}`
  }
  if (origin === 'forgot_password') {
    const raw = authModal.forgotDraft.value.maskedTarget
    return raw.includes('@') ? raw : `+${raw}`
  }
  return `+${normalizePhoneTo62(authModal.phoneVerifyDraft.value.phone)}`
})

const otpChannel = computed(() => {
  const origin = authModal.otpOrigin.value
  if (origin === 'login_otp') return authModal.loginDraft.value.otpMethod
  if (origin === 'register_email') return 'email'
  if (origin === 'register_phone') return authModal.registerDraft.value.otpMethod
  if (origin === 'forgot_password') return authModal.forgotDraft.value.method
  return authModal.phoneVerifyDraft.value.method
})

const allowOtpChannelSwitch = computed(() => otpChannel.value !== 'email')
</script>

<template>
  <div
    class="relative w-full max-w-[880px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden grid grid-cols-1 md:grid-cols-12"
  >
    <!-- Mobile Drag Handle -->
    <div class="mx-auto mt-2.5 mb-1 h-1 w-10 rounded-full bg-border sm:hidden" />

    <!-- LEFT COLUMN: Intro Illustrations & Value Proposition (Desktop md+) -->
    <div class="hidden md:block md:col-span-5 min-h-[540px]">
      <AuthIntroCarousel />
    </div>

    <!-- RIGHT COLUMN: Global Top Action Bar + Dynamic Auth Step Engine -->
    <div
      class="md:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col min-h-[460px] md:min-h-[540px] max-h-[88vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-7"
    >
      <!-- GLOBAL TOP ACTION BAR (Sejajar Horizontal: Kembali / Logo Mobile di Kiri, Step & X di Kanan) -->
      <div class="flex items-center justify-between gap-3 min-h-[36px] shrink-0 mb-4">
        <div class="flex items-center">
          <button
            v-if="canGoBack"
            type="button"
            class="inline-flex items-center gap-1.5 h-9 px-3 -ml-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            @click="authModal.goBack()"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <img
            v-else
            src="/images/logo_red.png"
            alt="BekasKu"
            width="108"
            height="28"
            class="h-6 w-auto object-contain md:hidden"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <span
            v-if="stepProgressLabel"
            class="text-xs font-semibold text-text-muted"
          >
            {{ stepProgressLabel }}
          </span>

          <button
            v-if="showCloseButton"
            type="button"
            class="w-9 h-9 rounded-full bg-surface-2 hover:bg-border/60 text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- FORM CONTENT (Consistent Top-Aligned Position Across All Steps) -->
      <div class="w-full pt-1">
        <!-- Alert Banner: Error -->
        <div
          v-if="authModal.errorMsg.value"
          class="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700"
          role="alert"
        >
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ authModal.errorMsg.value }}</span>
        </div>

        <!-- Alert Banner: Info -->
        <div
          v-if="authModal.infoMsg.value"
          class="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2.5 text-xs text-blue-800"
        >
          <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ authModal.infoMsg.value }}</span>
        </div>

        <!-- Active Step View -->
        <AuthLoginStep v-if="isLoginStep" />
        <AuthRegisterStep v-else-if="isRegisterStep" />
        <AuthForgotStep v-else-if="isForgotStep" />

        <div v-else-if="isSharedOtpStep">
          <AuthStepHeader
            title="Masukkan Kode Verifikasi OTP"
            subtitle="Jangan berikan kode rahasia ini kepada siapa pun termasuk pihak yang mengaku dari BekasKu."
          />
          <AuthOtpInput
            :target-label="otpTargetLabel"
            :channel="otpChannel"
            :methods="authModal.otpMethods.value"
            :allow-channel-switch="allowOtpChannelSwitch"
            :loading="authModal.isSubmitting.value"
            @verify="authModal.verifyOtpCode"
            @resend="(ch) => authModal.resendCurrentOtp(ch)"
          />
        </div>

        <AuthPhoneVerifyStep v-else-if="currentStep === 'phone-verify'" />
        <AuthLocationAsk v-else-if="currentStep === 'location-ask'" />
      </div>

      <!-- Bottom Spacer for Balanced Vertical Centering -->
      <div class="h-2 shrink-0" />
    </div>
  </div>
</template>
