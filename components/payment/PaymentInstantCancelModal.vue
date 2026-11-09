<script setup lang="ts">
import { AlertCircle, Trash2, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  isDelete?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  if (props.loading) return
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instant-cancel-modal-title"
      @click.self="close"
    >
      <div
        class="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <div
          class="w-14 h-14 mx-auto rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-4"
        >
          <Trash2 v-if="isDelete" class="w-7 h-7 stroke-[2.2]" />
          <AlertCircle v-else class="w-7 h-7 stroke-[2.2]" />
        </div>

        <h3 id="instant-cancel-modal-title" class="text-base sm:text-lg font-bold text-text">
          {{ isDelete ? 'Hapus Pembayaran?' : 'Batalkan Pesanan?' }}
        </h3>

        <p class="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
          {{
            isDelete
              ? 'Apakah Anda yakin ingin membatalkan dan menghapus tagihan pembayaran ini? Tindakan ini tidak dapat dibatalkan.'
              : 'Apakah Anda yakin ingin membatalkan pesanan ini secara instan? Tindakan ini tidak dapat dibatalkan.'
          }}
        </p>

        <div class="mt-6 flex items-center gap-3">
          <button
            type="button"
            :disabled="loading"
            class="flex-1 py-3 px-4 rounded-xl border border-border bg-white hover:bg-surface-2 text-text text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
            @click="close"
          >
            Kembali
          </button>
          <button
            type="button"
            :disabled="loading"
            class="flex-1 py-3 px-4 rounded-xl bg-danger hover:bg-danger-dark text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('confirm')"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ isDelete ? 'Ya, Hapus' : 'Ya, Batalkan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

