<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="w-12 h-10 sm:h-11 rounded-xl border border-border-light bg-white hover:bg-surface-2 text-text flex items-center justify-center shrink-0 transition-colors cursor-pointer"
    :aria-label="label"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
