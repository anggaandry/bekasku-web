<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useFormat } from '~/composables/useFormat'

const { formatPrice } = useFormat()

const props = defineProps<{
  totalProductPrice: number
  totalProductCount: number
  totalShippingFee: number
  totalShippingDiscount: number
  totalInsuranceFee: number
  serviceFee: number
  totalCheckoutAmount: number
  isReady: boolean
  isMeet?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  proceed: []
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
    <h3 class="text-base font-bold text-text pb-3 border-b border-border">
      Ringkasan Pemesanan
    </h3>

    <!-- Baris Rincian Harga -->
    <div class="space-y-2.5 text-xs sm:text-sm">
      <!-- Total Harga Barang -->
      <div class="flex justify-between text-text">
        <span>Total harga ({{ props.totalProductCount }})</span>
        <span class="font-semibold tabular-nums">
          {{ formatPrice(props.totalProductPrice) }}
        </span>
      </div>

      <!-- Total Ongkir jika mode kurir -->
      <div v-if="!props.isMeet && props.totalShippingFee > 0" class="flex justify-between text-text">
        <span>Biaya Ongkir</span>
        <span class="font-semibold tabular-nums">
          {{ formatPrice(props.totalShippingFee) }}
        </span>
      </div>

      <!-- Diskon Ongkir jika gratis ongkir aktif -->
      <div v-if="props.totalShippingDiscount > 0" class="flex justify-between text-primary">
        <span>Diskon Ongkir</span>
        <span class="font-semibold tabular-nums">
          -{{ formatPrice(props.totalShippingDiscount) }}
        </span>
      </div>

      <!-- Asuransi Pengiriman -->
      <div v-if="props.totalInsuranceFee > 0" class="flex justify-between text-text">
        <span>Asuransi Pengiriman</span>
        <span class="font-semibold tabular-nums">
          {{ formatPrice(props.totalInsuranceFee) }}
        </span>
      </div>

      <!-- Biaya Layanan -->
      <div class="flex items-center justify-between text-text">
        <span class="flex items-center gap-1 text-text">
          <Info class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Biaya Layanan</span>
        </span>
        <span class="font-semibold tabular-nums">
          {{ formatPrice(props.serviceFee) }}
        </span>
      </div>

      <!-- Total Pemesanan -->
      <div class="pt-3 border-t border-border flex justify-between text-base font-bold text-text">
        <span>Total Pemesanan</span>
        <span class="text-text tabular-nums">
          {{ formatPrice(props.totalCheckoutAmount) }}
        </span>
      </div>
    </div>

    <!-- CTA Desktop -->
    <button
      type="button"
      :disabled="!props.isReady || props.loading"
      class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
      @click="emit('proceed')"
    >
      <span v-if="props.loading">Memproses...</span>
      <span v-else>Pilih Pembayaran</span>
    </button>
  </div>
</template>

