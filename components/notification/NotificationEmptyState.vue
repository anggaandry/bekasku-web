<script setup lang="ts">
import { Bell } from 'lucide-vue-next'

defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="py-16 px-4 flex flex-col items-center justify-center text-center">
    <div class="w-16 h-16 rounded-full bg-surface-2 border border-border-light flex items-center justify-center text-text-subtle mb-3.5 shadow-2xs">
      <Bell class="w-8 h-8" />
    </div>
    <h3 class="font-outfit font-semibold text-base text-text">
      {{ title || 'Tidak ada notifikasi' }}
    </h3>
    <p class="font-outfit text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
      {{ subtitle || 'Belum ada notifikasi saat ini.' }}
    </p>
  </div>
</template>

