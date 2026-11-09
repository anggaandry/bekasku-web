<script setup lang="ts">
import { TRANSACTION_METHOD_COURRIER, TRANSACTION_METHOD_MEET } from '~/utils/constants'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [method: number]
}>()

const tabs = [
  { method: TRANSACTION_METHOD_COURRIER, label: 'Pengiriman' },
  { method: TRANSACTION_METHOD_MEET, label: 'Pay & Pick' },
]

function tabClass(method: number) {
  return props.modelValue === method
    ? 'border-primary text-primary'
    : 'border-transparent text-text-muted hover:text-text'
}
</script>

<template>
  <div class="bg-white border-b border-border">
    <div class="max-w-[1200px] mx-auto md:px-4">
      <div class="flex md:justify-start" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.method"
          type="button"
          role="tab"
          :aria-selected="props.modelValue === tab.method"
          class="flex-1 md:flex-none md:min-w-40 py-3 px-6 border-b-2 text-sm font-semibold bg-white transition-colors cursor-pointer"
          :class="tabClass(tab.method)"
          @click="emit('update:modelValue', tab.method)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Panduan Pay & Pick (COD) -->
    <div
      v-if="props.modelValue === TRANSACTION_METHOD_MEET"
      class="bg-surface-2 border-t border-border"
    >
      <p class="max-w-[1200px] mx-auto px-4 py-3 text-[11px] sm:text-xs text-text-muted leading-relaxed text-center md:text-left">
        Untuk transaksi COD (temu langsung), pembeli dan penjual bertemu sesuai kesepakatan di aplikasi. Lakukan pembayaran setelah barang diperiksa. Hindari transaksi di luar aplikasi dan jaga kerahasiaan data pribadi.
      </p>
    </div>
  </div>
</template>
