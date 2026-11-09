<script setup lang="ts">
import { ShoppingCart, Check } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  status: 0 | 1 // 0: loading, 1: success
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'view-cart'): void
  (e: 'continue'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('continue')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="status === 1 ? close() : undefined"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl px-6 pt-3 pb-7 shadow-2xl flex flex-col items-center text-center"
        @click.stop
      >
        <!-- Drag Handle -->
        <div class="w-11 h-1.5 rounded-full bg-gray-200 mb-7"></div>

        <!-- Step 0: Loading -->
        <template v-if="status === 0">
          <div class="relative w-20 h-20 flex items-center justify-center mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <ShoppingCart class="w-7 h-7 text-primary" />
          </div>

          <h3 class="text-base sm:text-lg font-semibold text-gray-900 tracking-tight mb-2">
            Menambahkan ke Keranjang...
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mb-6">
            Menyiapkan pesanan spesial untuk Anda
          </p>
        </template>

        <!-- Step 1: Success -->
        <template v-else>
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
            <Check class="w-10 h-10 text-white" />
          </div>

          <h3 class="text-xl font-bold text-gray-900 tracking-tight mb-2">
            Berhasil Ditambahkan!
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed max-w-xs mb-7">
            Produk pilihan Anda sudah aman di dalam keranjang belanja.
          </p>

          <!-- Primary CTA: Lihat Keranjang -->
          <button
            type="button"
            @click="emit('view-cart')"
            class="w-full h-13 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-base shadow-xs transition-all active:scale-[0.98] cursor-pointer mb-3"
          >
            <span class="text-white">Lihat Keranjang</span>
          </button>

          <!-- Secondary CTA: Lanjut Belanja -->
          <button
            type="button"
            @click="close"
            class="py-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            Lanjut Belanja
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

