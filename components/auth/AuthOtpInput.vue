<script setup lang="ts">
import { RefreshCw, Clock, ShieldCheck } from 'lucide-vue-next'
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '~/utils/constants'
import { useOtpTimer } from '~/composables/useOtpTimer'
import type { OtpChannel, OtpMethodStatus } from '~/types/auth'

const props = defineProps<{
  targetLabel: string
  channel: OtpChannel
  methods?: OtpMethodStatus
  allowChannelSwitch?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  verify: [code: string]
  resend: [channel?: OtpChannel]
}>()

const digits = ref<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const { isRunning, formattedTime, start } = useOtpTimer(OTP_RESEND_SECONDS)

const fullCode = computed(() => digits.value.join(''))
const isComplete = computed(() => fullCode.value.length === OTP_LENGTH && /^\d+$/.test(fullCode.value))

const channelLabel = computed(() => {
  if (props.channel === 'email') return 'Email'
  if (props.channel === 'sms') return 'SMS'
  return 'WhatsApp'
})

function setInputRef(el: any, idx: number) {
  inputRefs.value[idx] = el as HTMLInputElement | null
}

function focusBox(idx: number) {
  nextTick(() => {
    const target = inputRefs.value[idx]
    if (target) {
      target.focus()
      target.select()
    }
  })
}

function handleInput(idx: number, event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  if (!raw) {
    digits.value[idx] = ''
    return
  }
  digits.value[idx] = raw.slice(-1)
  if (idx < OTP_LENGTH - 1) {
    focusBox(idx + 1)
  } else if (isComplete.value) {
    emit('verify', fullCode.value)
  }
}

function handleKeydown(idx: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (digits.value[idx]) {
      digits.value[idx] = ''
    } else if (idx > 0) {
      digits.value[idx - 1] = ''
      focusBox(idx - 1)
    }
    event.preventDefault()
  } else if (event.key === 'ArrowLeft' && idx > 0) {
    focusBox(idx - 1)
  } else if (event.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
    focusBox(idx + 1)
  } else if (event.key === 'Enter' && isComplete.value) {
    emit('verify', fullCode.value)
  }
}

function handlePaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') || ''
  if (!pasted) return
  event.preventDefault()
  for (let i = 0; i < OTP_LENGTH; i++) {
    digits.value[i] = pasted[i] || ''
  }
  const nextIdx = Math.min(pasted.length, OTP_LENGTH - 1)
  focusBox(nextIdx)
  if (isComplete.value) {
    emit('verify', fullCode.value)
  }
}

function handleResend(overrideChannel?: OtpChannel) {
  if (isRunning.value || props.loading) return
  digits.value = Array.from({ length: OTP_LENGTH }, () => '')
  start(OTP_RESEND_SECONDS)
  emit('resend', overrideChannel)
  focusBox(0)
}

onMounted(() => {
  start(OTP_RESEND_SECONDS)
  focusBox(0)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Target Info Box -->
    <div class="rounded-xl bg-surface-2 border border-border p-3 text-xs text-text-muted leading-relaxed">
      Masukkan <span class="font-bold text-text">{{ OTP_LENGTH }} digit</span> kode verifikasi yang dikirim melalui
      <span class="font-bold text-primary">{{ channelLabel }}</span> ke
      <span class="font-bold text-text break-all">{{ targetLabel }}</span>.
    </div>

    <!-- 4-Digit PIN Input Grid -->
    <div class="flex items-center justify-center gap-3 py-1" @paste="handlePaste">
      <input
        v-for="(_, idx) in digits"
        :key="idx"
        :ref="(el) => setInputRef(el, idx)"
        :value="digits[idx]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :disabled="loading"
        :aria-label="`Digit OTP ke-${idx + 1}`"
        class="w-13 h-14 sm:w-14 sm:h-15 text-center text-xl font-bold font-outfit rounded-2xl border transition-all outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
        :class="digits[idx] ? 'border-primary bg-primary/5 text-text' : 'border-border bg-white text-text'"
        @input="handleInput(idx, $event)"
        @keydown="handleKeydown(idx, $event)"
      />
    </div>

    <!-- Verify Submit Button -->
    <button
      type="button"
      :disabled="!isComplete || loading"
      class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      @click="emit('verify', fullCode)"
    >
      <ShieldCheck class="w-4 h-4" />
      <span>{{ loading ? 'Memverifikasi...' : 'Verifikasi Kode OTP' }}</span>
    </button>

    <!-- Countdown Timer & Resend Controls -->
    <div class="pt-1 flex flex-col items-center gap-2 text-xs">
      <div v-if="isRunning" class="inline-flex items-center gap-1.5 text-text-muted">
        <Clock class="w-3.5 h-3.5 text-primary" />
        <span>Kirim ulang kode dalam <strong class="text-text font-semibold">{{ formattedTime }}</strong></span>
      </div>

      <div v-else class="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer"
          @click="handleResend()"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Kirim Ulang via {{ channelLabel }}</span>
        </button>

        <button
          v-if="allowChannelSwitch && channel === 'wa' && methods && !methods.sms_lock"
          type="button"
          :disabled="loading"
          class="text-text-muted hover:text-primary font-semibold underline cursor-pointer"
          @click="handleResend('sms')"
        >
          Kirim via SMS
        </button>

        <button
          v-if="allowChannelSwitch && channel === 'sms' && methods && !methods.wa_lock"
          type="button"
          :disabled="loading"
          class="text-text-muted hover:text-primary font-semibold underline cursor-pointer"
          @click="handleResend('wa')"
        >
          Kirim via WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

