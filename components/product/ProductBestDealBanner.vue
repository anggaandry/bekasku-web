<script setup lang="ts">
import { Clock, Zap } from 'lucide-vue-next'

defineProps<{
  countdown: string
}>()
</script>

<template>
  <div
    class="rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs"
    role="timer"
    aria-live="off"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
        <Zap class="w-3.5 h-3.5 text-white fill-white" aria-hidden="true" />
      </span>
      <div class="flex items-baseline gap-1.5 min-w-0 flex-wrap">
        <span class="font-outfit font-extrabold text-xs tracking-wide uppercase">
          BEST DEAL
        </span>
        <span class="text-white/90 text-xs font-medium truncate">
          akan berakhir dalam
        </span>
      </div>
    </div>

    <div class="flex items-center gap-1.5 shrink-0 bg-white text-primary font-mono font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-lg tracking-wider shadow-2xs tabular-nums">
      <Clock class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{{ countdown }}</span>
    </div>
  </div>
</template>
