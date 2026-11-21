<script setup lang="ts">
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-vue-next'
import type { SelfieVerifyResult } from '~/types/identity'

defineProps<{
  isVerifying: boolean
  result: SelfieVerifyResult | null
  errorMessage: string
}>()

defineEmits<{
  (e: 'retake'): void
  (e: 'done'): void
}>()
</script>

<template>
  <div class="p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
    <template v-if="isVerifying">
      <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin" aria-hidden="true" />
      </div>
      <div class="space-y-1.5 max-w-sm">
        <h3 class="text-base sm:text-lg font-bold text-text">
          Menganalisa Kesesuaian Wajah...
        </h3>
        <p class="text-xs text-text-muted leading-relaxed">
          Sistem keamanan sedang mencocokkan wajah selfie dengan foto kartu identitas Anda.
        </p>
      </div>
    </template>

    <template v-else-if="result?.is_match">
      <div class="w-16 h-16 rounded-full bg-success-soft text-success-text flex items-center justify-center">
        <CheckCircle2 class="w-9 h-9" aria-hidden="true" />
      </div>
      <div class="space-y-1.5 max-w-sm">
        <h3 class="text-lg font-bold text-text">
          Verifikasi Selfie Berhasil!
        </h3>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
          Wajah Anda cocok dengan kartu identitas
          <span v-if="result.confidence_score > 0" class="font-bold text-text">
            (Skor {{ result.confidence_score }}%)
          </span>.
          Anda sekarang dapat melanjutkan penarikan saldo.
        </p>
      </div>
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer"
        @click="$emit('done')"
      >
        Lanjutkan
      </button>
    </template>

    <template v-else>
      <div class="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center">
        <AlertCircle class="w-9 h-9" aria-hidden="true" />
      </div>
      <div class="space-y-1.5 max-w-sm">
        <h3 class="text-lg font-bold text-text">
          Verifikasi Selfie Belum Berhasil
        </h3>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
          {{ errorMessage || result?.reason || 'Wajah pada foto selfie belum dapat dicocokkan dengan kartu identitas. Silakan ambil foto ulang.' }}
        </p>
      </div>
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        @click="$emit('retake')"
      >
        <RefreshCw class="w-4 h-4" aria-hidden="true" />
        <span>Foto Ulang Selfie</span>
      </button>
    </template>
  </div>
</template>
