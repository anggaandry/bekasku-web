<script setup lang="ts">
import { CheckCircle2, ThumbsDown, ThumbsUp } from 'lucide-vue-next'

const props = defineProps<{
  faqId: string
  submitted?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'vote', payload: { faqId: string; isSatisfied: boolean }): void
}>()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 font-outfit"
    :class="compact ? 'pt-3 border-t border-border/70' : ''"
  >
    <div v-if="props.submitted" class="flex items-center gap-2 text-success-text">
      <CheckCircle2 class="w-4 h-4 shrink-0" aria-hidden="true" />
      <p class="text-xs sm:text-sm font-semibold">
        Terima kasih atas masukan Anda!
      </p>
    </div>

    <template v-else>
      <p class="text-xs sm:text-sm font-semibold text-text">
        Apakah kamu puas dengan artikel ini?
      </p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-chip-soft-bg text-text hover:text-primary font-outfit text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Ya, artikel ini membantu"
          @click="emit('vote', { faqId: props.faqId, isSatisfied: true })"
        >
          <ThumbsUp class="w-4 h-4" aria-hidden="true" />
          <span>Ya</span>
        </button>

        <button
          type="button"
          class="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl border border-border bg-white hover:border-danger/50 hover:bg-red-50 text-text hover:text-danger font-outfit text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Tidak, artikel belum membantu"
          @click="emit('vote', { faqId: props.faqId, isSatisfied: false })"
        >
          <ThumbsDown class="w-4 h-4" aria-hidden="true" />
          <span>Tidak</span>
        </button>
      </div>
    </template>
  </div>
</template>

