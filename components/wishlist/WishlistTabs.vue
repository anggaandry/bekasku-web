<script setup lang="ts">
import type { WishlistFilterOption } from '~/types/wishlist'

const props = defineProps<{
  options: WishlistFilterOption[]
  selectedType: number
}>()

const emit = defineEmits<{
  select: [type: number]
}>()
</script>

<template>
  <div class="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none max-w-[1200px] mx-auto">
    <button
      v-for="opt in props.options"
      :key="opt.type"
      type="button"
      class="px-4 py-1.5 rounded-full text-xs font-semibold font-outfit whitespace-nowrap transition-all cursor-pointer shrink-0"
      :class="[
        props.selectedType === opt.type
          ? 'bg-primary text-white shadow-xs'
          : 'bg-surface-2 hover:bg-muted text-text border border-border/80'
      ]"
      @click="emit('select', opt.type)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

