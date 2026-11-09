<script setup lang="ts">
import { ChevronRight, Wallet } from 'lucide-vue-next'

defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="mt-3 w-full text-left bg-success-soft border border-success-border/80 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-success-soft-strong/60 active:scale-[0.99] transition-all group select-none"
    @click="emit('click')"
  >
    <span class="flex items-center gap-3">
      <span class="w-9 h-9 rounded-full bg-success-soft-strong flex items-center justify-center shrink-0">
        <Wallet class="w-4 h-4 text-success-text" />
      </span>
      <span>
        <span class="block font-outfit font-bold text-xs sm:text-sm text-success-title leading-tight">
          {{ title }}
        </span>
        <span class="block font-outfit text-xs text-success-text mt-0.5 leading-snug">
          {{ message }}
        </span>
      </span>
    </span>
    <ChevronRight class="w-4 h-4 text-success-text shrink-0 group-hover:translate-x-0.5 transition-transform" />
  </button>
</template>

