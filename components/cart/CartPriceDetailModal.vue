<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useFormat } from '~/composables/useFormat'

const { formatPrice } = useFormat()

const props = defineProps<{
  modelValue: boolean
  totalPrice: number
  totalDiscount: number
  checkedCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 font-outfit overscroll-contain"
        @click.self="close"
      >
        <div class="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-border">
          <!-- Header Modal -->
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-sm sm:text-base font-bold text-text font-outfit">
              Rincian Pembayaran
            </h3>
            <button
              type="button"
              class="p-1 rounded-full text-text-muted hover:text-text transition-colors cursor-pointer"
              aria-label="Tutup"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- List Rincian Harga -->
          <div class="py-4 space-y-2.5 text-xs sm:text-sm">
            <div class="flex justify-between text-text">
              <span>Total Harga ({{ props.checkedCount }} Barang)</span>
              <span class="font-semibold tabular-nums">
                {{ formatPrice(props.totalPrice + props.totalDiscount) }}
              </span>
            </div>

            <div v-if="props.totalDiscount > 0" class="flex justify-between text-primary">
              <span>Total Diskon Produk</span>
              <span class="font-semibold tabular-nums">
                -{{ formatPrice(props.totalDiscount) }}
              </span>
            </div>

            <div class="pt-3 border-t border-border flex justify-between text-sm sm:text-base font-bold text-text">
              <span>Total Tagihan Belanja</span>
              <span class="text-primary tabular-nums">
                {{ formatPrice(props.totalPrice) }}
              </span>
            </div>
          </div>

          <!-- Button Tutup -->
          <button
            type="button"
            class="w-full h-11 rounded-xl bg-surface-2 hover:bg-muted text-text text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            @click="close"
          >
            Tutup
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

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
