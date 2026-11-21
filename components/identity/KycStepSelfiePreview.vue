<script setup lang="ts">
import { RefreshCw, Send } from 'lucide-vue-next'

defineProps<{
  selfieImage: string
}>()

defineEmits<{
  (e: 'retake'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div class="p-5 sm:p-6 space-y-5">
    <div class="space-y-1">
      <h3 class="text-base sm:text-lg font-bold text-text">
        Pratinjau Foto Selfie
      </h3>
      <p class="text-xs text-text-muted leading-relaxed">
        Pastikan wajah dan KTP terlihat tajam dan tidak terpotong sebelum dikirim untuk verifikasi.
      </p>
    </div>

    <div class="w-full aspect-[4/4] max-h-80 rounded-2xl overflow-hidden border border-border bg-surface-2 flex items-center justify-center">
      <img
        v-if="selfieImage"
        :src="selfieImage"
        alt="Pratinjau Foto Selfie"
        class="w-full h-full object-contain"
      />
    </div>

    <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
      <button
        type="button"
        class="flex-1 h-11 rounded-2xl border border-border bg-white hover:bg-surface-2 text-text font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        @click="$emit('retake')"
      >
        <RefreshCw class="w-4 h-4" aria-hidden="true" />
        <span>Foto Ulang</span>
      </button>

      <button
        type="button"
        class="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        @click="$emit('submit')"
      >
        <Send class="w-4 h-4" aria-hidden="true" />
        <span>Lanjutkan Pengiriman KYC</span>
      </button>
    </div>
  </div>
</template>
