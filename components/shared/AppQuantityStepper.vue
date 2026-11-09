<script setup lang="ts">
import { Minus, Plus, Trash2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    disabled?: boolean
    size?: 'sm' | 'md'
  }>(),
  {
    min: 1,
    max: 99,
    disabled: false,
    size: 'sm',
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: number]
  delete: []
}>()

function decrement() {
  if (props.disabled) return
  if (props.modelValue <= props.min) {
    emit('delete')
    return
  }
  emit('update:modelValue', props.modelValue - 1)
}

function increment() {
  if (props.disabled) return
  if (props.modelValue >= props.max) return
  emit('update:modelValue', props.modelValue + 1)
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-lg border border-border bg-white select-none transition-colors"
    :class="props.size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm'"
  >
    <!-- Decrement / Trash Button -->
    <button
      type="button"
      :disabled="props.disabled"
      class="px-2 h-full inline-flex items-center justify-center transition-colors hover:bg-surface-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      :class="props.modelValue <= props.min ? 'text-primary hover:text-primary-dark' : 'text-text'"
      :aria-label="props.modelValue <= props.min ? 'Hapus barang' : 'Kurangi jumlah'"
      @click="decrement"
    >
      <Trash2 v-if="props.modelValue <= props.min" class="w-3.5 h-3.5" />
      <Minus v-else class="w-3.5 h-3.5" />
    </button>

    <!-- Value Indicator -->
    <span
      class="w-8 text-center font-semibold text-text tabular-nums"
      :class="{ 'opacity-50': props.disabled }"
    >
      {{ props.modelValue }}
    </span>

    <!-- Increment Button -->
    <button
      type="button"
      :disabled="props.disabled || props.modelValue >= props.max"
      class="px-2 h-full inline-flex items-center justify-center text-text transition-colors hover:bg-surface-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      aria-label="Tambah jumlah"
      @click="increment"
    >
      <Plus class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

