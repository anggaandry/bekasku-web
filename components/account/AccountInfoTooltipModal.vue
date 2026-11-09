<template>
  <AppModal
    :model-value="modelValue"
    max-width="max-w-md"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4 font-outfit select-none">
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        {{ description }}
      </p>

      <div class="pt-2">
        <button
          type="button"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          @click="$emit('update:modelValue', false)"
        >
          Mengerti
        </button>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '~/components/shared/AppModal.vue'

defineProps<{
  modelValue: boolean
  title: string
  description: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

