<script setup lang="ts">
import { formatRupiah } from '~/utils/format'

defineProps<{
  packageLabel: string
  packagePrice: number
  paymentFee: number
  balanceDeduction: number
  finalCharge: number
}>()
</script>

<template>
  <div class="bg-white px-4 py-5 md:p-5 md:rounded-2xl md:border md:border-border md:shadow-2xs space-y-4">
    <h2 class="text-sm font-semibold text-text">Ringkasan Pembayaran</h2>

    <div class="space-y-2.5 text-sm">
      <div class="flex items-center justify-between text-text-muted">
        <span>{{ packageLabel }}</span>
        <span class="font-medium text-text tabular-nums">{{ formatRupiah(packagePrice) }}</span>
      </div>

      <div v-if="paymentFee > 0" class="flex items-center justify-between text-text-muted">
        <span>Biaya Transaksi</span>
        <span class="font-medium text-text tabular-nums">{{ formatRupiah(paymentFee) }}</span>
      </div>

      <div v-if="balanceDeduction > 0" class="flex items-center justify-between text-text-muted">
        <span>Saldo BekasKu</span>
        <span class="font-medium text-success-text tabular-nums">- {{ formatRupiah(balanceDeduction) }}</span>
      </div>

      <div class="h-px bg-border/80 my-3" />

      <div class="flex items-center justify-between pt-1">
        <span class="text-base font-semibold text-text">Total Bersih</span>
        <span class="text-base font-bold text-primary tabular-nums">{{ formatRupiah(finalCharge) }}</span>
      </div>
    </div>
  </div>
</template>

