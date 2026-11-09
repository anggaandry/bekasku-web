<script setup lang="ts">
import { MessageSquareText, Mail, Check } from 'lucide-vue-next'
import type { OtpChannel, OtpMethodStatus } from '~/types/auth'

const props = defineProps<{
  modelValue: OtpChannel
  methods: OtpMethodStatus
  includeEmail?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [channel: OtpChannel]
}>()

function selectChannel(channel: OtpChannel, locked: boolean) {
  if (locked) return
  emit('update:modelValue', channel)
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="label" class="text-xs font-semibold text-text">
      {{ label }}
    </p>

    <div class="grid gap-2" :class="props.includeEmail ? 'grid-cols-3' : 'grid-cols-2'">
      <!-- WhatsApp Option -->
      <button
        type="button"
        :disabled="methods.wa_lock"
        class="relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
        :class="
          modelValue === 'wa' && !methods.wa_lock
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-white hover:bg-surface-2 text-text'
        "
        @click="selectChannel('wa', methods.wa_lock)"
      >
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="modelValue === 'wa' && !methods.wa_lock ? 'bg-[#25D366] text-white' : 'bg-surface-2 text-[#25D366]'"
        >
          <!-- Official WhatsApp SVG Vector Icon -->
          <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.35C9.34 7.35 9.04 7.42 8.78 7.7C8.53 7.98 7.81 8.65 7.81 10.03C7.81 11.41 8.81 12.74 8.95 12.93C9.09 13.12 11.02 16.1 13.98 17.37C16.44 18.43 16.94 18.22 17.47 18.17C18 18.12 19.19 17.47 19.44 16.78C19.69 16.08 19.69 15.49 19.61 15.36C19.54 15.24 19.35 15.17 19.06 15.03C18.78 14.88 17.4 14.21 17.15 14.11C16.89 14.02 16.71 13.97 16.52 14.26C16.33 14.54 15.79 15.17 15.63 15.36C15.46 15.55 15.3 15.57 15.02 15.43C14.73 15.28 13.82 14.99 12.74 14.02C11.89 13.27 11.32 12.34 11.15 12.05C10.99 11.77 11.13 11.62 11.28 11.47C11.41 11.34 11.57 11.13 11.71 10.97C11.85 10.8 11.9 10.69 11.99 10.5C12.09 10.31 12.04 10.15 11.97 10.01C11.9 9.87 11.34 8.49 11.11 7.93C10.88 7.39 10.65 7.46 10.48 7.46C10.32 7.45 10.13 7.45 9.94 7.45L9.53 7.35Z"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-tight truncate">WhatsApp</p>
          <p class="text-[10px] truncate" :class="methods.wa_lock ? 'text-red-500 font-medium' : 'text-text-muted'">
            {{ methods.wa_lock ? 'Sementara tidak tersedia' : 'Kirim instan' }}
          </p>
        </div>
        <Check v-if="modelValue === 'wa' && !methods.wa_lock" class="w-4 h-4 text-primary shrink-0" />
      </button>

      <!-- SMS Option -->
      <button
        type="button"
        :disabled="methods.sms_lock"
        class="relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
        :class="
          modelValue === 'sms' && !methods.sms_lock
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-white hover:bg-surface-2 text-text'
        "
        @click="selectChannel('sms', methods.sms_lock)"
      >
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="modelValue === 'sms' && !methods.sms_lock ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'"
        >
          <!-- Message Square Text (Sesuai mobile v3 LucideIcons.messageSquareText) -->
          <MessageSquareText class="w-4.5 h-4.5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-tight truncate">SMS</p>
          <p class="text-[10px] truncate" :class="methods.sms_lock ? 'text-red-500 font-medium' : 'text-text-muted'">
            {{ methods.sms_lock ? 'Sementara tidak tersedia' : 'Pesan teks' }}
          </p>
        </div>
        <Check v-if="modelValue === 'sms' && !methods.sms_lock" class="w-4 h-4 text-primary shrink-0" />
      </button>

      <!-- Email Option -->
      <button
        v-if="includeEmail"
        type="button"
        class="relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer"
        :class="
          modelValue === 'email'
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-white hover:bg-surface-2 text-text'
        "
        @click="selectChannel('email', false)"
      >
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="modelValue === 'email' ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'"
        >
          <Mail class="w-4 h-4" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-tight truncate">Email</p>
          <p class="text-[10px] text-text-muted truncate">Kode OTP via inbox</p>
        </div>
        <Check v-if="modelValue === 'email'" class="w-4 h-4 text-primary shrink-0" />
      </button>
    </div>
  </div>
</template>

