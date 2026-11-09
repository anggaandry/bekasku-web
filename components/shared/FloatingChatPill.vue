<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label: string
    badgeCount?: number
    online?: boolean
    openTitle?: string
    dismissTitle?: string
  }>(),
  {
    badgeCount: 0,
    online: false,
    openTitle: '',
    dismissTitle: 'Sembunyikan tombol',
  },
)

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'dismiss'): void
}>()
</script>

<template>
  <div
    class="pointer-events-auto h-11 rounded-full bg-white border border-border-light shadow-[0_8px_28px_rgba(0,0,0,0.14)] flex items-center overflow-hidden font-outfit transition-all hover:shadow-[0_10px_34px_rgba(0,0,0,0.18)] shrink-0"
  >
    <button
      type="button"
      class="h-full pl-3.5 pr-3 hover:bg-surface-2 text-primary flex items-center gap-2 font-bold text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
      :title="openTitle || label"
      :aria-label="openTitle || label"
      @click="emit('open')"
    >
      <span class="relative flex items-center justify-center shrink-0">
        <slot name="icon" />
        <span
          v-if="online"
          class="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-0.5 -right-0.5"
        />
        <span
          v-else-if="badgeCount > 0"
          class="w-2 h-2 rounded-full bg-primary ring-2 ring-white absolute -top-0.5 -right-0.5"
        />
      </span>

      <span class="text-text font-bold whitespace-nowrap">{{ label }}</span>

      <span
        v-if="badgeCount > 0"
        class="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white font-outfit font-bold text-xs flex items-center justify-center leading-none"
      >
        {{ badgeCount > 99 ? '99+' : badgeCount }}
      </span>
    </button>

    <div class="w-px h-5 bg-border-light shrink-0" />

    <button
      type="button"
      class="h-full px-2.5 hover:bg-red-50 text-text-muted hover:text-primary flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
      :title="dismissTitle"
      :aria-label="dismissTitle"
      @click.stop="emit('dismiss')"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

