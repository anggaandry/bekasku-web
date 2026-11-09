<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { PaymentGuideItem } from '~/types/payment'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

defineProps<{
  guides: PaymentGuideItem[]
}>()

const openIndex = ref<number | null>(0)

function toggleItem(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>

<template>
  <div v-if="guides && guides.length > 0" class="w-full space-y-2 font-outfit">
    <h3 class="text-xs sm:text-sm font-bold text-text px-1">
      Petunjuk Pembayaran
    </h3>

    <div class="rounded-2xl border border-border bg-white divide-y divide-border/60 overflow-hidden shadow-2xs">
      <div v-for="(item, idx) in guides" :key="idx" class="transition-colors">
        <button
          type="button"
          class="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-surface-2 transition-colors cursor-pointer"
          :aria-expanded="openIndex === idx"
          @click="toggleItem(idx)"
        >
          <span class="text-xs sm:text-sm font-semibold text-text leading-snug">
            {{ item.title }}
          </span>
          <ChevronDown
            class="w-4 h-4 text-text-muted shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180 text-primary': openIndex === idx }"
          />
        </button>

        <div
          v-show="openIndex === idx"
          class="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-text-muted leading-relaxed prose-guide"
        >
          <div v-html="sanitizeHtml(item.description)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.prose-guide ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
}
:deep(.prose-guide ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
}
:deep(.prose-guide li) {
  margin-bottom: 0.35rem;
  line-height: 1.5;
}
:deep(.prose-guide p) {
  margin-bottom: 0.35rem;
}
</style>

