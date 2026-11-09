<script setup lang="ts">
import { Check, ChevronUp } from 'lucide-vue-next'
import { useFormat } from '~/composables/useFormat'

const { formatPrice } = useFormat()

const props = defineProps<{
  checkedAll: boolean
  totalPrice: number
  totalDiscount: number
  checkedCount: number
  syncing?: boolean
}>()

const emit = defineEmits<{
  toggleAll: []
  showDetail: []
  checkout: []
}>()
</script>

<template>
  <div class="bg-white border-t border-border shadow-md select-none">
    <div class="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <!-- Left: Checkbox Pilih Semua -->
      <button
        type="button"
        class="flex items-center gap-2 cursor-pointer group shrink-0"
        @click="emit('toggleAll')"
      >
        <div
          class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors"
          :class="
            props.checkedAll
              ? 'bg-primary border-primary text-white'
              : 'border-border bg-white group-hover:border-primary/50'
          "
        >
          <Check v-if="props.checkedAll" class="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <span class="text-xs sm:text-sm font-medium text-text">
          Pilih Semua
        </span>
      </button>

      <!-- Center & Right: Total Tagihan & Button Checkout -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Rincian Total Tagihan -->
        <div class="text-right flex flex-col items-end">
          <button
            type="button"
            class="flex items-center gap-1 text-[11px] text-text-muted hover:text-text cursor-pointer leading-tight"
            @click="emit('showDetail')"
          >
            <span>Total Tagihan:</span>
            <ChevronUp class="w-3 h-3" />
          </button>
          <span class="text-sm sm:text-base font-bold text-primary tabular-nums">
            {{ formatPrice(props.totalPrice) }}
          </span>
          <span
            v-if="props.totalDiscount > 0"
            class="text-[10px] sm:text-xs text-primary font-medium"
          >
            Hemat {{ formatPrice(props.totalDiscount) }}
          </span>
        </div>

        <!-- Tombol Checkout -->
        <button
          type="button"
          :disabled="props.checkedCount === 0 || props.syncing"
          class="h-11 px-5 sm:px-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold font-outfit flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          @click="emit('checkout')"
        >
          <span>Checkout ({{ props.checkedCount }})</span>
        </button>
      </div>
    </div>
  </div>
</template>
