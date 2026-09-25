<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none cursor-pointer select-none',
      sizeClasses[size],
      variantClasses[variant],
      rounded ? 'rounded-full' : 'rounded-lg',
      block ? 'w-full' : '',
      (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]',
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
  rounded: false,
})

defineEmits<{
  click: [e: MouseEvent]
}>()

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
}

const variantClasses = {
  primary: 'bg-[#E31B23] text-white hover:bg-[#B91219] shadow-sm',
  secondary: 'bg-[#ebad25] text-white hover:bg-[#d69b18] shadow-sm',
  outline: 'border border-[#E31B23] text-[#E31B23] hover:bg-[#E31B23]/10',
  ghost: 'text-[#E31B23] hover:bg-[#E31B23]/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  white: 'bg-white text-[#1a1a1a] hover:bg-gray-50 border border-gray-200 shadow-sm',
}
</script>

<style scoped>
/* Scoped isolation */
</style>
