<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-[1px]"
      @click.self="close"
    >
      <div
        class="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] font-outfit pb-[env(safe-area-inset-bottom)]"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="px-5 py-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
          <h3 class="text-base font-bold text-text">
            {{ title }}
          </h3>
          <button
            type="button"
            class="p-1.5 -mr-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 py-2">
          <button
            v-for="opt in options"
            :key="opt.id"
            type="button"
            class="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-surface-2 transition-colors cursor-pointer"
            @click="handleSelect(opt)"
          >
            <span
              class="text-sm sm:text-[15px]"
              :class="selectedId === opt.id ? 'font-bold text-primary' : 'font-medium text-text'"
            >
              {{ opt.label }}
            </span>
            <Check
              v-if="selectedId === opt.id"
              class="w-4 h-4 text-primary shrink-0 stroke-[2.5]"
            />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'

export interface FilterSheetOption {
  id: string
  label: string
}

defineProps<{
  modelValue: boolean
  title: string
  options: FilterSheetOption[]
  selectedId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  select: [opt: FilterSheetOption]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleSelect(opt: FilterSheetOption) {
  emit('select', opt)
  close()
}
</script>
