<template>
  <div class="flex items-center gap-2 py-1.5 overflow-x-auto scrollbar-none">
    <!-- Chip Lokasi Aktif -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary/40 text-text text-xs transition-colors shrink-0"
      @click="emit('openLocation')"
    >
      <MapPin class="w-3.5 h-3.5 text-primary shrink-0" />
      <span class="max-w-[160px] md:max-w-[200px] truncate font-medium">
        {{ currentCity || 'Pilih Lokasi' }}
      </span>
      <ChevronDown class="w-3 h-3 text-text-muted shrink-0" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { MapPin, ChevronDown } from 'lucide-vue-next'

defineProps<{
  currentCity?: string
}>()

const emit = defineEmits<{
  openLocation: []
}>()
</script>

