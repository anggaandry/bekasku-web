<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-bank-title"
        @click.self="emit('update:modelValue', false)"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Drag Handle for Mobile -->
          <div class="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden -mt-1 mb-2" />

          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 id="confirm-bank-title" class="text-lg font-bold text-text">
              Konfirmasi Rekening
            </h3>
            <button
              type="button"
              class="p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup"
              @click="emit('update:modelValue', false)"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Body Card Preview -->
          <div class="p-4 sm:p-5 rounded-2xl bg-surface-2/60 border border-border space-y-3">
            <p class="text-xs text-text-muted">
              Pastikan data rekening berikut sudah benar:
            </p>

            <div class="flex items-center gap-3.5 pt-1">
              <div class="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                <img
                  v-if="bankLogo && !hasLogoError"
                  :src="bankLogo"
                  :alt="bankName"
                  class="w-full h-full object-contain"
                  @error="hasLogoError = true"
                >
                <Landmark
                  v-else
                  class="w-6 h-6 text-text-muted"
                  aria-hidden="true"
                />
              </div>

              <div class="min-w-0 flex-1">
                <h4 class="font-bold text-sm sm:text-base text-text truncate">
                  {{ bankName }}
                </h4>
                <p class="text-xs font-semibold text-text-muted mt-0.5 truncate">
                  {{ accountName }}
                </p>
                <p class="text-xs font-mono font-bold text-text mt-0.5 tracking-wider">
                  {{ accountNumber }}
                </p>
              </div>
            </div>
          </div>

          <!-- Safety Note -->
          <div class="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
            <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Dana hasil penjualan hanya dapat ditarik ke rekening yang atas nama pemiliknya sesuai dengan KTP terverifikasi.
            </p>
          </div>

          <!-- Action Buttons -->
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
import { ref, watch, onBeforeUnmount } from 'vue'
import { X, Landmark, ShieldCheck, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  bankLogo?: string
  bankName: string
  accountName: string
  accountNumber: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const hasLogoError = ref(false)

watch(
  () => props.bankLogo,
  () => {
    hasLogoError.value = false
  }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (import.meta.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
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
