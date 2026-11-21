<script setup lang="ts">
import { ref, watch } from 'vue'
import { Flag, X, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  productTitle?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', reason: string): void
}>()

const REASONS = [
  'Produk Palsu / Penipuan',
  'Harga Tidak Wajar',
  'Barang Terlarang / Ilegal',
  'Spam / Iklan Duplikat',
  'Konten Tidak Pantas / Menyesatkan',
  'Lainnya',
]

const selectedReason = ref(REASONS[0])
const customNote = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedReason.value = REASONS[0]
      customNote.value = ''
    }
  }
)

function handleClose() {
  if (props.isSubmitting) return
  emit('update:modelValue', false)
}

function handleSubmit() {
  const note = customNote.value.trim()
  const finalReason = note ? `${selectedReason.value}: ${note}` : selectedReason.value
  emit('submit', finalReason)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit"
      @click.self="handleClose"
    >
      <div class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-red-50 text-danger flex items-center justify-center shrink-0">
              <Flag class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-text">Laporkan Produk</h3>
              <p v-if="productTitle" class="text-[11px] text-text-muted truncate max-w-[230px]">
                {{ productTitle }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-1.5 rounded-lg text-text-muted hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="handleClose"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4">
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-text">Pilih Alasan Laporan</label>
            <div class="space-y-1.5">
              <label
                v-for="reason in REASONS"
                :key="reason"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                :class="
                  selectedReason === reason
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border-light hover:bg-surface-2 text-text'
                "
              >
                <input
                  v-model="selectedReason"
                  type="radio"
                  name="report_reason"
                  :value="reason"
                  class="accent-primary"
                />
                <span>{{ reason }}</span>
              </label>
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="report-notes" class="block text-xs font-semibold text-text">
              Detail Tambahan <span class="font-normal text-text-muted">(Opsional)</span>
            </label>
            <textarea
              id="report-notes"
              v-model="customNote"
              rows="2"
              maxlength="300"
              placeholder="Jelaskan pelanggaran yang Anda temukan..."
              class="w-full px-3 py-2 rounded-xl border border-border text-xs text-text placeholder:text-text-subtle focus:outline-hidden focus:border-primary resize-none"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3.5 bg-surface-2/50 border-t border-border flex items-center justify-end gap-2">
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-4 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            @click="handleSubmit"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>Kirim Laporan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
