<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-save-title"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Drag Handle for Mobile -->
          <div class="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden -mt-1 mb-2" />

          <!-- Header / Illustration / Icon -->
          <div class="space-y-2 text-center sm:text-left">
            <h3 id="confirm-save-title" class="text-lg font-bold text-text">
              Simpan Data alamat?
            </h3>
            <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
              Pastikan data alamat kamu lengkap dan titik lokasi sudah sesuai, ya.
            </p>
          </div>

          <!-- Actions: Cek Kembali vs Simpan -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              class="flex-1 h-11 px-4 rounded-xl border border-border text-xs sm:text-sm font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
              :disabled="isLoading"
              @click="emit('update:modelValue', false)"
            >
              Cek Kembali
            </button>
            <button
              type="button"
              class="flex-1 h-11 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              :disabled="isLoading"
              @click="emit('confirm')"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

