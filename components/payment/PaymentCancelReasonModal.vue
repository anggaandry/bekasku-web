<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { PAYMENT_CANCEL_REASONS } from '~/utils/constants'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', reason: string): void
}>()

const selectedReason = ref<string>('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedReason.value = ''
    }
  }
)

function close() {
  if (props.loading) return
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (!selectedReason.value || props.loading) return
  emit('confirm', selectedReason.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-reason-modal-title"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Mobile drag handle -->
        <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-border-light" />
        </div>

        <!-- Header -->
        <div
          class="px-5 pt-3 sm:pt-4 pb-3 border-b border-border-light flex items-center justify-between shrink-0"
        >
          <div>
            <h2 id="cancel-reason-modal-title" class="text-base sm:text-lg font-bold text-text">
              Batalkan Pembayaran
            </h2>
            <p class="text-xs text-text-muted mt-0.5">
              Pilih alasan pembatalan pembayaran:
            </p>
          </div>

          <button
            type="button"
            class="p-1.5 -mr-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body / Reasons List -->
        <div class="overflow-y-auto p-5 space-y-2 flex-1">
          <label
            v-for="reason in PAYMENT_CANCEL_REASONS"
            :key="reason"
            class="flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none"
            :class="[
              selectedReason === reason
                ? 'border-primary bg-primary/5 text-text font-semibold'
                : 'border-border bg-white hover:bg-surface-2 text-text',
            ]"
          >
            <span class="text-xs sm:text-sm">{{ reason }}</span>
            <input
              v-model="selectedReason"
              type="radio"
              :value="reason"
              name="cancel_payment_reason"
              class="w-4 h-4 text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-5 border-t border-border-light bg-surface-1 shrink-0">
          <button
            type="button"
            :disabled="!selectedReason || loading"
            class="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              selectedReason && !loading
                ? 'bg-danger hover:bg-danger-dark text-white'
                : 'bg-surface-3 text-text-subtle',
            ]"
            @click="handleConfirm"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>Konfirmasi Pembatalan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

