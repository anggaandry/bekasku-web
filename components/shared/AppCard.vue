<template>
  <div
    :class="[
      'bg-white border border-gray-200 transition-all duration-200',
      roundedClasses[rounded],
      paddingClasses[padding],
      hoverable ? 'hover:shadow-md hover:border-gray-300' : 'shadow-sm',
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  padding: 'md',
  rounded: 'lg',
})

const paddingClasses = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const roundedClasses = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
}
</script>

<style scoped>
/* Scoped isolation */
</style>
