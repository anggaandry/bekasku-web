<template>
  <!-- Product Card Skeleton -->
  <div
    v-if="type === 'product-card'"
    class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs animate-shimmer"
  >
    <div class="w-full aspect-square bg-gray-200" />
    <div class="p-3 space-y-2">
      <div class="h-4 bg-gray-200 rounded w-2/3" />
      <div class="h-3.5 bg-gray-200 rounded w-full" />
      <div class="h-3 bg-gray-200 rounded w-1/2" />
      <div class="pt-1 flex gap-1.5">
        <div class="h-4 bg-gray-200 rounded-md w-14" />
        <div class="h-4 bg-gray-200 rounded-md w-12" />
      </div>
    </div>
  </div>

  <!-- Banner Skeleton -->
  <div
    v-else-if="type === 'banner'"
    class="w-full aspect-[16/7] md:aspect-[16/6] bg-gray-200 rounded-2xl animate-shimmer"
  />

  <!-- Category Circle Skeleton -->
  <div
    v-else-if="type === 'category'"
    class="flex flex-col items-center gap-1.5 p-2"
  >
    <div class="w-12 h-12 rounded-full bg-gray-200 animate-shimmer" />
    <div class="h-2.5 bg-gray-200 rounded w-10 animate-shimmer" />
  </div>

  <!-- Generic / Custom Skeleton -->
  <div
    v-else
    :class="[
      'bg-gray-200 animate-shimmer',
      rounded ? 'rounded-full' : 'rounded-md',
      customClass,
    ]"
    :style="{ width, height }"
  />
</template>

<script setup lang="ts">
interface Props {
  type?: 'product-card' | 'banner' | 'category' | 'text' | 'custom'
  width?: string
  height?: string
  rounded?: boolean
  customClass?: string
}

withDefaults(defineProps<Props>(), {
  type: 'custom',
  width: '100%',
  height: '1rem',
  rounded: false,
  customClass: '',
})
</script>

<style scoped>
/* Scoped isolation */
</style>
