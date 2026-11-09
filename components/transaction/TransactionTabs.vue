<script setup lang="ts">
import type { TransactionStepItem } from '~/composables/useTransactionList'

const props = defineProps<{
  steps: TransactionStepItem[]
  selectedStep: number
  tabCounts: Record<number, number>
}>()

const emit = defineEmits<{
  (e: 'select', step: number): void
}>()

const tabListRef = ref<HTMLElement | null>(null)

function onTabClick(step: number, event: MouseEvent) {
  emit('select', step)
  // Auto scroll active tab into view
  const target = event.currentTarget as HTMLElement | null
  if (target && tabListRef.value) {
    const container = tabListRef.value
    const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="w-full bg-white select-none">
    <div
      ref="tabListRef"
      class="flex items-center overflow-x-auto no-scrollbar scroll-smooth px-0"
    >
      <button
        v-for="step in steps"
        :key="step.value"
        type="button"
        class="relative shrink-0 flex items-center gap-1.5 px-3 py-3 text-sm font-outfit whitespace-nowrap transition-colors cursor-pointer"
        :class="selectedStep === step.value ? 'text-primary font-semibold' : 'text-text-muted font-normal hover:text-text'"
        @click="onTabClick(step.value, $event)"
      >
        <span>{{ step.label }}</span>

        <!-- Badge Count -->
        <span
          v-if="(tabCounts[step.value] || 0) > 0"
          class="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-bold rounded-full leading-none transition-colors"
          :class="selectedStep === step.value ? 'bg-primary text-white' : 'bg-text-subtle text-white'"
        >
          {{ tabCounts[step.value] > 99 ? '99+' : tabCounts[step.value] }}
        </span>

        <!-- Active Bottom Line Indicator -->
        <span
          v-if="selectedStep === step.value"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
