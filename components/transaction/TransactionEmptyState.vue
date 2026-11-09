<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
  showAction?: boolean
}>()
</script>

<template>
  <div class="py-14 sm:py-20 flex flex-col items-center justify-center text-center px-4">
    <div class="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mb-4">
      <ShoppingBag class="w-8 h-8" />
    </div>

    <h3 class="font-outfit font-bold text-base sm:text-lg text-text">
      {{ title || 'Belum ada transaksi' }}
    </h3>

    <p class="font-outfit text-sm text-text-muted mt-1 max-w-sm">
      {{ description || 'Ayo mulai belanja produk impianmu!' }}
    </p>

    <div v-if="showAction !== false" class="mt-5">
      <NuxtLink
        to="/"
        class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-colors shadow-xs"
      >
        Mulai Belanja
      </NuxtLink>
    </div>
  </div>
</template>

