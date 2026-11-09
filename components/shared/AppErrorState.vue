<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
    <div class="w-16 h-16 mb-3 rounded-full bg-danger/10 flex items-center justify-center text-danger">
      <AlertCircle class="w-8 h-8" />
    </div>
    <h3 class="text-sm font-semibold text-text mb-1">
      {{ title }}
    </h3>
    <p class="text-xs text-text-muted max-w-xs mb-4">
      {{ message }}
    </p>
    <button
      v-if="showRetry"
      type="button"
      class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors"
      @click="emit('retry')"
    >
      <RefreshCw class="w-3.5 h-3.5" />
      <span>Coba Lagi</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    message?: string
    showRetry?: boolean
  }>(),
  {
    title: 'Gagal memuat data',
    message: 'Terjadi kendala saat menghubungi server. Silakan coba kembali.',
    showRetry: true,
  }
)

const emit = defineEmits<{
  retry: []
}>()
</script>

