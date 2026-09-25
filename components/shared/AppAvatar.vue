<template>
  <div class="relative inline-flex items-center justify-center shrink-0">
    <NuxtImg
      v-if="src"
      :src="src"
      :alt="name || 'User'"
      :class="[
        'object-cover rounded-full bg-gray-100 ring-2 ring-white shadow-xs',
        sizeClasses[size],
      ]"
      loading="lazy"
      @error="handleImgError"
    />
    <div
      v-else
      :class="[
        'flex items-center justify-center rounded-full bg-[#E31B23]/10 text-[#E31B23] font-semibold ring-2 ring-white select-none',
        sizeClasses[size],
      ]"
    >
      {{ initials }}
    </div>

    <!-- Live Badge -->
    <span
      v-if="isLive"
      class="absolute -bottom-1 -right-1 bg-[#E31B23] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white uppercase tracking-tighter"
    >
      LIVE
    </span>

    <!-- Verified Badge -->
    <span
      v-else-if="isVerified"
      class="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 ring-2 ring-white"
    >
      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isVerified?: boolean
  isLive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  name: '',
  size: 'md',
  isVerified: false,
  isLive: false,
})

const imgFailed = ref(false)

function handleImgError() {
  imgFailed.value = true
}

const initials = computed(() => {
  if (!props.name) return 'BK'
  const parts = props.name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.slice(0, 2).toUpperCase()
})

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}
</script>

<style scoped>
/* Scoped isolation */
</style>
