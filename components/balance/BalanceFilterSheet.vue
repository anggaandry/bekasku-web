<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  title: string
  options: string[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  select: [index: number]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleSelect(index: number) {
  emit('select', index)
  close()
}

// Lock scroll
watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center font-outfit overscroll-contain"
        @click.self="close"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 sm:zoom-in-95"
        >
          <!-- Drag Handle -->
          <div class="flex justify-center mb-4 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-border" />
          </div>

          <!-- Header -->
          <h3 class="text-base sm:text-lg font-bold text-text mb-2">
            {{ title }}
          </h3>

          <!-- Options List -->
          <div class="divide-y divide-border/60">
            <button
              v-for="(option, idx) in options"
              :key="idx"
              type="button"
              class="w-full py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer group"
              @click="handleSelect(idx)"
            >
              <span
                class="text-sm transition-colors"
                :class="
                  idx === selectedIndex
                    ? 'font-semibold text-primary'
                    : 'text-text group-hover:text-primary'
                "
              >
                {{ option }}
              </span>
              <Check
                v-if="idx === selectedIndex"
                class="w-4 h-4 text-primary shrink-0"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

