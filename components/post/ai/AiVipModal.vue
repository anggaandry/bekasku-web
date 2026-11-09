<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { Crown, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    message?: string
  }>(),
  {
    message: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

function handleUpgrade() {
  close()
  navigateTo('/subscribe/vip')
}

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
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Close button on top-right -->
        <div class="flex justify-end -mt-2 -mr-2">
          <button
            type="button"
            class="p-1.5 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Crown Icon Badge -->
        <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
          <Crown class="w-10 h-10" aria-hidden="true" />
        </div>

        <!-- Title -->
        <h3 class="text-xl font-bold text-text">
          Fitur Khusus VIP
        </h3>

        <!-- Description -->
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
          {{
            message ||
            'Fitur AI Post Creator hanya tersedia untuk pengguna VIP. Upgrade sekarang untuk menikmati posting iklan tanpa batas, listing prioritas, analisis AI, dan badge eksklusif!'
          }}
        </p>

        <!-- Actions -->
        <div class="pt-4 flex items-center gap-3">
          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl bg-white border border-border-light hover:bg-surface-2 text-text text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            @click="close"
          >
            Nanti
          </button>

          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            @click="handleUpgrade"
          >
            Upgrade VIP
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

