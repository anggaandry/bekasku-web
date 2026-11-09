<template>
  <Teleport to="body" v-if="isMounted">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        :class="zIndex || 'z-[85]'"
        role="dialog"
        aria-modal="true"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full overflow-hidden bg-surface rounded-2xl shadow-modal animate-scale-in"
          :class="[maxWidth || 'max-w-md', customClass]"
        >
          <div v-if="$slots.header || title" class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3.5 border-b border-border">
            <slot name="header">
              <h3 class="text-base sm:text-lg font-bold text-text">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="showCloseButton"
              type="button"
              class="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup modal"
              @click="emit('update:modelValue', false)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 sm:p-6">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-5 sm:px-6 pb-5 pt-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    customClass?: string
    maxWidth?: string
    showCloseButton?: boolean
    zIndex?: string
  }>(),
  {
    showCloseButton: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in {
  animation: scaleIn 0.15s ease-out forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

