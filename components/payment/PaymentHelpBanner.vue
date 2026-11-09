<script setup lang="ts">
import { Headset, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-border hover:border-primary/40 hover:bg-surface-2 transition-all flex items-center justify-between gap-3 text-left shadow-2xs cursor-pointer font-outfit active:scale-99"
    @click="emit('click')"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-9 h-9 rounded-xl bg-surface-2 border border-border-light flex items-center justify-center text-text-muted shrink-0"
      >
        <Headset class="w-4 h-4 stroke-[2]" />
      </div>
      <div class="min-w-0">
        <p class="text-xs sm:text-sm font-semibold text-text truncate">
          Butuh bantuan seputar pembayaran ini?
        </p>
        <p class="text-[11px] text-text-muted truncate">
          Hubungi tim layanan bantuan Bekasku Center
        </p>
      </div>
    </div>

    <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" />
  </button>
</template>

