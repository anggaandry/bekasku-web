<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  isSeller?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'submit', reason: string): void
}>()

const buyerReasons = [
  'Ingin mengubah alamat pengiriman',
  'Ingin mengubah rincian pesanan',
  'Menemukan harga yang lebih murah',
  'Penjual tidak merespons chat',
  'Lainnya / berubah pikiran',
]

const sellerReasons = [
  'Stok produk habis / rusak',
  'Tidak dapat memenuhi jadwal pengiriman',
  'Alamat pembeli di luar jangkauan kurir',
  'Pembeli meminta pembatalan',
  'Lainnya',
]

const reasons = computed(() => (props.isSeller ? sellerReasons : buyerReasons))
const selectedReason = ref(reasons.value[0])
const customReason = ref('')

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  const finalReason = selectedReason.value.includes('Lainnya') && customReason.value.trim()
    ? customReason.value.trim()
    : selectedReason.value

  emit('submit', finalReason)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="handleClose"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden"></div>

        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle class="w-5 h-5" />
          </div>
          <h3 class="font-outfit font-bold text-lg text-text">
            Pilih Alasan Pembatalan
          </h3>
        </div>

        <p class="font-outfit text-xs text-text-muted mb-4 leading-relaxed">
          Pilih alasan yang paling sesuai. Pesanan yang telah dibatalkan tidak dapat dipulihkan kembali.
        </p>

        <!-- Options -->
        <div class="space-y-2 mb-4">
          <label
            v-for="r in reasons"
            :key="r"
            class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
            :class="selectedReason === r ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-surface-2 text-text'"
          >
            <input
              v-model="selectedReason"
              type="radio"
              :value="r"
              name="cancelReason"
              class="w-4 h-4 text-primary focus:ring-primary"
            />
            <span class="text-xs font-outfit">{{ r }}</span>
          </label>
        </div>

        <!-- Custom Reason if 'Lainnya' -->
        <div v-if="selectedReason.includes('Lainnya')" class="mb-5">
          <textarea
            v-model="customReason"
            rows="3"
            placeholder="Tuliskan alasan pembatalan Anda secara singkat..."
            class="w-full p-3 rounded-xl border border-border text-xs font-outfit text-text focus:outline-none focus:border-primary resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="loading"
            class="flex-1 h-11 rounded-xl border border-border font-outfit font-semibold text-xs text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="loading || (selectedReason.includes('Lainnya') && !customReason.trim())"
            class="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 font-outfit font-semibold text-xs text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            @click="handleSubmit"
          >
            <span>Batalkan Pesanan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

