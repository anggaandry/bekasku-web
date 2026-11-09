<script setup lang="ts">
import { Crown, Clock } from 'lucide-vue-next'

defineProps<{
  displayName: string
  remainingDays: number
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-7 text-white shadow-sm border border-primary/20 font-outfit"
  >
    <!-- Watermark logo halus sesuai standar main.css & Fase 4 -->
    <img
      src="/images/icon_only.png"
      alt=""
      width="160"
      height="160"
      aria-hidden="true"
      class="w-36 h-36 object-contain opacity-[0.06] absolute -right-4 -bottom-4 pointer-events-none select-none"
    />

    <div class="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
          <Crown class="w-4 h-4 text-amber-300 shrink-0 stroke-[2.2]" aria-hidden="true" />
          <span>Status Langganan</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {{ displayName }}
        </h2>
      </div>

      <div class="pt-2 sm:pt-0 sm:text-right border-t sm:border-t-0 border-white/15">
        <div class="inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
          <Clock class="w-3.5 h-3.5 text-white/85 shrink-0 stroke-[2]" aria-hidden="true" />
          <span>Sisa Masa Aktif</span>
        </div>
        <p class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums mt-0.5">
          {{ remainingDays }} Hari
        </p>
      </div>
    </div>
  </div>
</template>
