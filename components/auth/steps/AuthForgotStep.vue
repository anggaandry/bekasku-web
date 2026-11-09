<script setup lang="ts">
import { Mail, ArrowRight, MessageSquareText, Check } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthForgotNewPasswordForm from '~/components/auth/steps/AuthForgotNewPasswordForm.vue'

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.forgotDraft.value)
</script>

<template>
  <div>
    <!-- STEP 1: FORGOT PASSWORD REQUEST (IDENTITAS) -->
    <template v-if="currentStep === 'forgot-request'">
      <AuthStepHeader
        title="Atur Ulang Kata Sandi"
        subtitle="Masukkan alamat email atau nomor handphone yang terdaftar pada akun BekasKu Anda."
      />

      <form class="space-y-4" @submit.prevent="authModal.submitForgotRequest()">
        <div>
          <label for="forgot-identity-input" class="block text-xs font-semibold text-text mb-1.5">
            Email atau Nomor Handphone
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="forgot-identity-input"
              v-model="draft.identity"
              type="text"
              placeholder="nama@email.com atau 08123456789"
              class="w-full h-11 pl-10 pr-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="authModal.isSubmitting.value || !draft.identity.trim()"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Memeriksa Akun...' : 'Lanjutkan' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </template>

    <!-- STEP 2: FORGOT PASSWORD SELECT OTP METHOD -->
    <template v-else-if="currentStep === 'forgot-method'">
      <AuthStepHeader
        title="Pilih Metode Verifikasi"
        subtitle="Pilih ke mana kode OTP atur ulang kata sandi akan dikirimkan."
      />

      <div class="space-y-3">
        <!-- Option Email (jika akun memiliki email) -->
        <button
          v-if="draft.email"
          type="button"
          class="w-full relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer"
          :class="
            draft.method === 'email'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-white hover:bg-surface-2 text-text'
          "
          @click="draft.method = 'email'"
        >
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :class="draft.method === 'email' ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'"
          >
            <Mail class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold leading-tight">Email</p>
            <p class="text-[11px] text-text-muted truncate mt-0.5">
              Kirim ke <strong>{{ draft.maskedEmail || draft.email }}</strong>
            </p>
          </div>
          <Check v-if="draft.method === 'email'" class="w-4 h-4 text-primary shrink-0" />
        </button>

        <!-- Option WhatsApp (jika akun memiliki nomor HP) -->
        <button
          v-if="draft.phone"
          type="button"
          :disabled="authModal.otpMethods.value.wa_lock"
          class="w-full relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          :class="
            draft.method === 'wa' && !authModal.otpMethods.value.wa_lock
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-white hover:bg-surface-2 text-text'
          "
          @click="!authModal.otpMethods.value.wa_lock && (draft.method = 'wa')"
        >
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :class="
              draft.method === 'wa' && !authModal.otpMethods.value.wa_lock
                ? 'bg-[#25D366] text-white'
                : 'bg-surface-2 text-[#25D366]'
            "
          >
            <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.35C9.34 7.35 9.04 7.42 8.78 7.7C8.53 7.98 7.81 8.65 7.81 10.03C7.81 11.41 8.81 12.74 8.95 12.93C9.09 13.12 11.02 16.1 13.98 17.37C16.44 18.43 16.94 18.22 17.47 18.17C18 18.12 19.19 17.47 19.44 16.78C19.69 16.08 19.69 15.49 19.61 15.36C19.54 15.24 19.35 15.17 19.06 15.03C18.78 14.88 17.4 14.21 17.15 14.11C16.89 14.02 16.71 13.97 16.52 14.26C16.33 14.54 15.79 15.17 15.63 15.36C15.46 15.55 15.3 15.57 15.02 15.43C14.73 15.28 13.82 14.99 12.74 14.02C11.89 13.27 11.32 12.34 11.15 12.05C10.99 11.77 11.13 11.62 11.28 11.47C11.41 11.34 11.57 11.13 11.71 10.97C11.85 10.8 11.9 10.69 11.99 10.5C12.09 10.31 12.04 10.15 11.97 10.01C11.9 9.87 11.34 8.49 11.11 7.93C10.88 7.39 10.65 7.46 10.48 7.46C10.32 7.45 10.13 7.45 9.94 7.45L9.53 7.35Z"/>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-xs font-bold leading-tight">WhatsApp</p>
              <span
                v-if="authModal.otpMethods.value.wa_lock"
                class="text-[11px] font-medium text-red-500"
              >
                Sementara tidak tersedia
              </span>
            </div>
            <p class="text-[11px] text-text-muted truncate mt-0.5">
              Kirim ke <strong>{{ draft.maskedPhone || draft.phone }}</strong>
            </p>
          </div>
          <Check v-if="draft.method === 'wa' && !authModal.otpMethods.value.wa_lock" class="w-4 h-4 text-primary shrink-0" />
        </button>

        <!-- Option SMS (jika akun memiliki nomor HP) -->
        <button
          v-if="draft.phone"
          type="button"
          :disabled="authModal.otpMethods.value.sms_lock"
          class="w-full relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          :class="
            draft.method === 'sms' && !authModal.otpMethods.value.sms_lock
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border bg-white hover:bg-surface-2 text-text'
          "
          @click="!authModal.otpMethods.value.sms_lock && (draft.method = 'sms')"
        >
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :class="
              draft.method === 'sms' && !authModal.otpMethods.value.sms_lock
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-muted'
            "
          >
            <MessageSquareText class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-xs font-bold leading-tight">SMS</p>
              <span
                v-if="authModal.otpMethods.value.sms_lock"
                class="text-[11px] font-medium text-red-500"
              >
                Sementara tidak tersedia
              </span>
            </div>
            <p class="text-[11px] text-text-muted truncate mt-0.5">
              Kirim ke <strong>{{ draft.maskedPhone || draft.phone }}</strong>
            </p>
          </div>
          <Check v-if="draft.method === 'sms' && !authModal.otpMethods.value.sms_lock" class="w-4 h-4 text-primary shrink-0" />
        </button>
      </div>

      <div class="mt-4">
        <button
          type="button"
          :disabled="authModal.isSubmitting.value || !draft.method"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          @click="authModal.dispatchForgotOtp(draft.method)"
        >
          <span>{{ authModal.isSubmitting.value ? 'Mengirim Kode OTP...' : 'Kirim Kode OTP' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </template>

    <!-- STEP 3 & 4: NEW PASSWORD & SUCCESS -->
    <AuthForgotNewPasswordForm v-else />
  </div>
</template>
