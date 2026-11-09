<template>
  <div class="bg-white rounded-2xl border border-border-light p-4 sm:p-6 shadow-xs space-y-5">
    <div class="flex items-center justify-between pb-3 border-b border-border-light">
      <h3 class="text-base font-bold text-text-primary">
        {{ isNeeded ? 'Budget & Jumlah Kebutuhan' : isService ? 'Tarif Jasa' : 'Harga & Pengelolaan Stok' }}
      </h3>
      <span class="text-xs text-text-muted">
        {{ isNeeded ? 'Atur budget wajar & jumlah barang yang dibutuhkan' : isService ? 'Tentukan tarif jasa atau upah kerja' : 'Atur harga wajar & ketersediaan' }}
      </span>
    </div>

    <!-- Stok (Hidden for Services, renamed for Needed) -->
    <div v-if="!isService">
      <label class="block text-xs font-semibold text-text-primary mb-1.5">
        {{ isNeeded ? 'Jumlah Dibutuhkan' : 'Stok' }} <span class="text-danger">*</span>
      </label>
      <div class="flex items-center gap-2 max-w-xs">
        <button
          type="button"
          class="w-10 h-10 rounded-xl border border-border-light bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-primary font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          :disabled="stock <= 1"
          @click="$emit('update:stock', Math.max(1, stock - 1))"
        >
          -
        </button>
        <input
          :value="stock"
          type="number"
          min="1"
          class="w-24 text-center bg-white border border-border-light rounded-xl py-2 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all"
          @input="$emit('update:stock', Math.max(1, parseInt(($event.target as HTMLInputElement).value || '1', 10)))"
        />
        <button
          type="button"
          class="w-10 h-10 rounded-xl border border-border-light bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-primary font-bold transition-colors cursor-pointer"
          @click="$emit('update:stock', stock + 1)"
        >
          +
        </button>
      </div>
      <p v-if="errors.stock" class="mt-1 text-xs text-danger font-medium">{{ errors.stock }}</p>
    </div>

    <!-- Harga Barang / Budget / Tarif -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="block text-xs font-semibold text-text-primary">
          {{ isNeeded ? 'Budget' : isService ? 'Harga Jasa' : 'Harga barang' }} <span class="text-danger">*</span>
        </label>

        <!-- AI Price quick trigger button in header (Only for regular sell) -->
        <button
          v-if="!isNeeded && !isService"
          type="button"
          class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          :disabled="isAiPriceLoading"
          @click="$emit('ask-ai-price')"
        >
          <Sparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': isAiPriceLoading }" />
          <span>{{ isAiPriceLoading ? 'Menganalisis...' : 'AI Price' }}</span>
        </button>
      </div>

      <div class="relative flex items-center">
        <!-- Rp Prefix box -->
        <span
          class="inline-flex items-center px-4 py-2.5 rounded-l-xl border border-r-0 border-border-light bg-surface-2 text-text-muted text-sm font-semibold select-none"
        >
          Rp
        </span>

        <!-- Price Input -->
        <input
          :value="displayPrice"
          type="text"
          inputmode="numeric"
          placeholder="0"
          class="w-full bg-white border py-2.5 px-3.5 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
          :class="[
            errors.price ? 'border-danger bg-danger/5' : 'border-border-light',
            (isNeeded || isService) ? 'rounded-r-xl border-l-0' : 'rounded-none'
          ]"
          @input="onPriceInput"
        />

        <!-- Sparkle AI Button on right (Only for regular sell) -->
        <button
          v-if="!isNeeded && !isService"
          type="button"
          class="px-4 py-2.5 rounded-r-xl border border-l-0 border-rose-200 bg-red-50 hover:bg-red-100 text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          title="Tanya Rekomendasi Harga Gemini AI"
          :disabled="isAiPriceLoading"
          @click="$emit('ask-ai-price')"
        >
          <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isAiPriceLoading }" />
        </button>
      </div>

      <p v-if="errors.price" class="mt-1 text-xs text-danger font-medium">{{ errors.price }}</p>
      <p v-else class="mt-1 text-[11px] text-text-muted">
        <template v-if="isNeeded">
          Tentukan batas budget yang bersedia Anda bayarkan untuk mendapatkan barang ini.
        </template>
        <template v-else-if="isService">
          Tentukan estimasi tarif jasa atau biaya pengerjaan layanan Anda.
        </template>
        <template v-else>
          Gunakan AI Price untuk mendapatkan estimasi harga pasar wajar berdasarkan judul & deskripsi.
        </template>
      </p>
    </div>

    <!-- Fee & Net Earnings Breakdown (Hidden for Needed, shown for Direct and Service) -->
    <div
      v-if="!isNeeded && price > 0"
      class="rounded-xl border border-border-light bg-surface-2 p-3.5 space-y-2 text-xs"
    >
      <div class="flex items-center justify-between text-text-muted">
        <span>{{ isService ? 'Tarif Jasa' : 'Harga Jual Produk' }}</span>
        <span class="font-semibold text-text-primary">Rp {{ formatNumber(price) }}</span>
      </div>

      <div class="flex items-center justify-between text-text-muted">
        <span class="flex items-center gap-1">
          Biaya Layanan Kategori ({{ serviceFeePercent }}%)
          <Info class="w-3.5 h-3.5 text-text-muted cursor-help" />
        </span>
        <span class="font-semibold text-danger">- Rp {{ formatNumber(estimatedServiceFee) }}</span>
      </div>

      <div class="pt-2 border-t border-border-light flex items-center justify-between">
        <span class="font-bold text-text-primary">Estimasi Pendapatan Bersih</span>
        <span class="text-sm font-extrabold text-success">
          Rp {{ formatNumber(estimatedNetEarnings) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Info } from 'lucide-vue-next'
import {
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import { formatNumber } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    price: number
    stock: number
    sellMethod?: number
    serviceFeePercent: number
    subcategoryName: string
    estimatedServiceFee: number
    estimatedNetEarnings: number
    isAiPriceLoading: boolean
    errors: Record<string, string>
  }>(),
  {
    sellMethod: SELL_METHOD_DIRECT,
  }
)

const emit = defineEmits<{
  (e: 'update:price', val: number): void
  (e: 'update:stock', val: number): void
  (e: 'ask-ai-price'): void
}>()

const isNeeded = computed(() => props.sellMethod === SELL_METHOD_NEEDED)
const isService = computed(() => props.sellMethod === SELL_METHOD_SERVICE)

const displayPrice = computed(() => {
  if (!props.price || props.price === 0) return ''
  return formatNumber(props.price)
})

function onPriceInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  emit('update:price', num)
}
</script>
