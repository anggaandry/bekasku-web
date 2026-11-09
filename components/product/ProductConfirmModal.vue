<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  description: string
  confirmLabel: string
  isDanger?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 shadow-xl"
        @click.stop
      >
        <!-- Drag handle -->
        <div class="w-11 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>

        <h3 class="font-outfit font-semibold text-lg text-text mb-2">
          {{ title }}
        </h3>
        <p class="font-outfit text-sm text-text-muted leading-relaxed mb-5">
          {{ description }}
        </p>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="close"
            class="flex-1 h-12 rounded-xl border border-border-light bg-white hover:bg-surface-2 font-outfit font-semibold text-sm text-text transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            :disabled="loading"
            @click="emit('confirm')"
            class="flex-1 h-12 rounded-xl font-outfit font-semibold text-sm text-white flex items-center justify-center transition-colors cursor-pointer"
            :class="isDanger ? 'bg-danger hover:opacity-90' : 'bg-primary hover:bg-primary-dark'"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else class="text-white">{{ confirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

