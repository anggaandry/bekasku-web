<template>
  <span
    :class="[
      'inline-flex items-center font-medium leading-none select-none',
      sizeClasses[size],
      variantClasses[variant],
      rounded ? 'rounded-full' : 'rounded-md',
    ]"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full mr-1"
      :class="dotClasses[variant]"
    />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'neutral',
  size: 'sm',
  dot: false,
  rounded: false,
})

const sizeClasses = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
}

const variantClasses = {
  primary: 'bg-[#E31B23]/10 text-[#E31B23]',
  secondary: 'bg-[#ebad25]/15 text-[#ebad25]',
  success: 'bg-[#16bf54]/10 text-[#16bf54]',
  warning: 'bg-[#f59f07]/10 text-[#f59f07]',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
  neutral: 'bg-gray-100 text-gray-600',
}

const dotClasses = {
  primary: 'bg-[#E31B23]',
  secondary: 'bg-[#ebad25]',
  success: 'bg-[#16bf54]',
  warning: 'bg-[#f59f07]',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  neutral: 'bg-gray-400',
}
</script>

<style scoped>
/* Scoped isolation */
</style>
