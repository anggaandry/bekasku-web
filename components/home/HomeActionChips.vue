<template>
  <div class="w-full">
    <!-- Pill Lokasi Aktif (match Mobile V3 full-width soft pill) -->
    <button
      type="button"
      class="w-full flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F4F5F7] hover:bg-[#ECEEF2] text-[#1E232C] text-[13px] transition-colors cursor-pointer text-left"
      @click="emit('openLocation')"
    >
      <MapPin class="w-4 h-4 text-[#1E232C] shrink-0" />
      <span class="flex-1 min-w-0 truncate font-medium">
        {{ currentCity || 'Pilih Lokasi' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'

defineProps<{
  currentCity?: string
}>()

const emit = defineEmits<{
  openLocation: []
}>()
</script>

