<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

defineProps<{
  durationText: string
}>()
</script>

<template>
  <div
    class="w-full bg-[#FEF9C3] border-b border-[#FEF08A] py-2.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#854D0E] select-none"
    role="status"
    aria-live="polite"
  >
    <Clock class="w-4 h-4 shrink-0 text-[#854D0E]" />
    <span>Pembayaran berakhir dalam {{ durationText }}</span>
  </div>
</template>

