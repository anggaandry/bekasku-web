<script setup lang="ts">
import { Camera, CheckCircle2, ShieldCheck } from 'lucide-vue-next'

defineEmits<{
  (e: 'start'): void
  (e: 'skip'): void
}>()

const requirements = [
  'Pegang KTP/SIM asli Anda sejajar dengan dada/dagu',
  'Pastikan wajah dan foto pada KTP terlihat jelas & tidak buram',
  'Gunakan pencahayaan yang terang dan lepas masker/kacamata gelap',
]
</script>

<template>
  <div class="p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
    <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
      <ShieldCheck class="w-8 h-8" aria-hidden="true" />
    </div>

    <div class="space-y-2 max-w-sm">
      <h3 class="text-lg sm:text-xl font-bold text-text">
        Verifikasi Selfie dengan KTP
      </h3>
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Untuk keamanan penarikan saldo, sistem kami perlu mencocokkan wajah Anda dengan foto pada kartu identitas.
      </p>
    </div>

    <div class="w-full bg-surface-2/60 border border-border-light rounded-2xl p-4 text-left space-y-2.5">
      <p class="text-xs font-bold text-text">
        Syarat Foto Selfie:
      </p>
      <ul class="space-y-2">
        <li
          v-for="req in requirements"
          :key="req"
          class="flex items-start gap-2 text-xs text-text-muted leading-relaxed"
        >
          <CheckCircle2 class="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <span>{{ req }}</span>
        </li>
      </ul>
    </div>

    <div class="w-full space-y-2.5 pt-1">
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        @click="$emit('start')"
      >
        <Camera class="w-4 h-4" aria-hidden="true" />
        <span>Ambil Foto Selfie</span>
      </button>

      <button
        type="button"
        class="w-full h-10 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
        @click="$emit('skip')"
      >
        Nanti Saja
      </button>
    </div>
  </div>
</template>
