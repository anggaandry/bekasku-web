<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-24 h-24 mb-4 rounded-full bg-surface-2 flex items-center justify-center text-text-subtle">
      <PackageOpen class="w-12 h-12" />
    </div>
    <h3 class="text-base font-semibold text-text mb-1">
      {{ title }}
    </h3>
    <p v-if="description" class="text-xs text-text-muted max-w-xs mb-4">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { PackageOpen } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Belum ada produk',
    description: 'Produk untuk kategori atau bagian ini belum tersedia saat ini.',
  }
)
</script>

