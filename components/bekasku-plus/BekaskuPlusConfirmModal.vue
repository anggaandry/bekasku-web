<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="emit('update:modelValue', false)"
    >
      <div class="w-full max-w-md bg-white rounded-2xl border border-border shadow-2xl p-6 space-y-5 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-primary mx-auto flex items-center justify-center">
          <AlertCircle class="w-6 h-6" />
        </div>

        <div class="space-y-2">
          <h3 class="text-base sm:text-lg font-bold text-text font-outfit">
            Kirim Pengajuan BekasKu+?
          </h3>
          <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
            Pastikan seluruh data diri dan informasi toko yang Anda masukkan sudah benar dan valid. Tim kurator BekasKu akan meninjau pengajuan Anda dalam 3x24 jam kerja.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            class="h-11 rounded-xl border border-border text-text font-outfit font-semibold text-xs sm:text-sm hover:bg-surface-2 transition-colors cursor-pointer"
            :disabled="props.loading"
            @click="emit('update:modelValue', false)"
          >
            Periksa Lagi
          </button>
          <button
            type="button"
            class="h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            :disabled="props.loading"
            @click="emit('confirm')"
          >
            <span v-if="props.loading">Mengirim...</span>
            <span v-else>Kirim Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

