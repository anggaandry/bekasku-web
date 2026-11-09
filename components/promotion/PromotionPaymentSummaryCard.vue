<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck, ArrowRight } from 'lucide-vue-next'
import type { PromotionDraft } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  draft: PromotionDraft | null
  packagePrice: number
  paymentFee: number
  balanceDeduction: number
  finalCharge: number
  allowSubmit: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit'): void
}>()

function getProductImage(img?: string[] | string): string {
  if (Array.isArray(img) && img.length > 0) return img[0]
  if (typeof img === 'string' && img.length > 0) return img
  return '/images/empty-product.png'
}

const packageLabel = computed(() => {
  const rawName = props.draft?.package?.name || ''
  if (rawName) {
    return /^(paket|fitur)\s/i.test(rawName) ? rawName : `Paket ${rawName}`
  }
  const type = props.draft?.type || 'Promosi'
  return `Paket ${type.charAt(0).toUpperCase() + type.slice(1)}`
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-4">
    <h3 class="text-sm font-bold font-outfit text-text pb-2 border-b border-border-light">
      Ringkasan Pemesanan
    </h3>

    <div v-if="props.draft?.product" class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2 border border-border-light">
      <NuxtImg
        :src="getProductImage(props.draft.product.image)"
        :alt="props.draft.product.title"
        class="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
        width="48"
        height="48"
      />
      <div class="min-w-0 flex-1">
        <div class="text-[10px] text-text-muted font-medium uppercase tracking-wider">
          Produk yang dipromosikan
        </div>
        <div class="text-xs font-semibold text-text truncate font-outfit">
          {{ props.draft.product.title }}
        </div>
        <div class="text-xs font-bold text-primary">
          {{ formatRupiah(props.draft.product.price) }}
        </div>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex items-center justify-between text-text-muted">
        <span>{{ packageLabel }}</span>
        <span class="font-semibold text-text">{{ formatRupiah(props.packagePrice) }}</span>
      </div>

      <div v-if="props.paymentFee > 0" class="flex items-center justify-between text-text-muted">
        <span>Biaya Transaksi</span>
        <span class="font-semibold text-text">{{ formatRupiah(props.paymentFee) }}</span>
      </div>

      <div v-if="props.balanceDeduction > 0" class="flex items-center justify-between text-emerald-700">
        <span>Potongan BekasKu Wallet</span>
        <span class="font-semibold">-{{ formatRupiah(props.balanceDeduction) }}</span>
      </div>

      <div class="pt-2 border-t border-border-light flex items-center justify-between font-bold text-sm">
        <span class="text-text font-outfit">Total Pembayaran</span>
        <span class="text-primary text-base font-outfit">{{ formatRupiah(props.finalCharge) }}</span>
      </div>
    </div>

    <button
      type="button"
      :disabled="!props.allowSubmit || props.loading"
      class="w-full py-3 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-2xs"
      @click="emit('submit')"
    >
      <span v-if="props.loading">Memproses Pembayaran...</span>
      <span v-else>Bayar Sekarang ({{ formatRupiah(props.finalCharge) }})</span>
      <ArrowRight v-if="!props.loading" class="w-4 h-4" />
    </button>

    <div class="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
      <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
      <span>Aktivasi otomatis &amp; aman seketika</span>
    </div>
  </div>
</template>
