<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

defineEmits<{
  (e: 'done'): void
}>()
</script>

<template>
  <div class="p-8 sm:p-10 flex flex-col items-center text-center space-y-5">
    <div class="w-16 h-16 rounded-full bg-success-soft text-success-text flex items-center justify-center">
      <CheckCircle2 class="w-9 h-9" aria-hidden="true" />
    </div>
    <div class="space-y-1.5 max-w-sm">
      <h3 class="text-lg font-bold text-text">
        Verifikasi Berhasil
      </h3>
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Identitas Anda telah tersimpan dan terverifikasi secara aman. Sekarang Anda dapat menggunakan seluruh layanan transaksi dan pencairan saldo BekasKu.
      </p>
    </div>
    <div class="w-full pt-4">
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer"
        @click="$emit('done')"
      >
        Selesai
      </button>
    </div>
  </div>
</template>

