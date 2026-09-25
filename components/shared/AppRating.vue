<template>
  <div class="inline-flex items-center gap-1">
    <Star class="w-3.5 h-3.5 fill-[#f59f07] text-[#f59f07] shrink-0" />
    <span class="text-xs font-semibold text-gray-700">
      {{ formattedRating }}
    </span>
    <span v-if="count !== undefined && count > 0" class="text-[11px] text-gray-400">
      ({{ count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'

interface Props {
  value: number | string | undefined | null
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
})

const formattedRating = computed(() => {
  const num = Number(props.value)
  if (isNaN(num) || num <= 0) return '5.0'
  return num.toFixed(1)
})
</script>

<style scoped>
/* Scoped isolation */
</style>
