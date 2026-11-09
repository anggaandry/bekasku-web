<script setup lang="ts">
import { Wallet, ExternalLink } from 'lucide-vue-next'
import PaymentLogo from '~/components/payment/PaymentLogo.vue'
import type { TransactionDetail } from '~/types/transaction'
import { formatRupiah } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'
import { calcSellerIncome, isTransactionFinished } from '~/utils/transactionStatus'

const props = defineProps<{
  detail: TransactionDetail
  isSeller: boolean
}>()

const emit = defineEmits<{
  (e: 'open-balance'): void
}>()

const isFinish = computed(() => isTransactionFinished(props.detail))

const subtotal = computed(() => {
  return props.detail.total_order || props.detail.price || 0
})

const shipping = computed(() => {
  return props.detail.shipping_price || 0
})

const insurance = computed(() => {
  return props.detail.insurance || 0
})

const totalItemCount = computed(() => {
  if (Array.isArray(props.detail.order?.products)) {
    return props.detail.order.products.length
  }
  if (Array.isArray(props.detail.products)) {
    return props.detail.products.length
  }
  return props.detail.total_item || 1
})

const grandTotal = computed(() => {
  const directTotal = props.detail.total_order
    ? props.detail.total_order + (props.detail.shipping_price || 0) + (props.detail.insurance || 0) - (props.detail.discount_shipping_price || 0)
    : props.detail.price
  return directTotal || props.detail.price || 0
})

const income = computed(() => calcSellerIncome(props.detail))

const paymentName = computed(() => {
  const m = props.detail.payment_method?.name || ''
  if (m) return m
  if (props.detail.meet || props.detail.type === 2) return 'Bayar di Tempat (COD)'
  return 'QRIS'
})

const paymentSubtitle = computed(() => {
  const t = props.detail.payment_method?.type || ''
  if (t) return t
  const name = paymentName.value.toLowerCase()
  if (name.includes('bni') || name.includes('bca') || name.includes('mandiri') || name.includes('bri')) {
    return 'Virtual Account'
  }
  if (name.includes('qris')) return 'QRIS'
  if (name.includes('saldo')) return 'Saldo Akun'
  return 'Metode Pembayaran'
})

const paymentLogo = computed(() => {
  const img = props.detail.payment_method?.image
  return img ? sanitizeMediaUrl(img, '') : ''
})
</script>

<template>
  <div class="space-y-4">
    <!-- Metode Pembayaran Section -->
    <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-3">
      <h3 class="font-outfit font-bold text-sm text-text">
        Metode Pembayaran
      </h3>

      <div class="flex items-center gap-3">
        <!-- Logo / Icon Container -->
        <PaymentLogo
          :payment-name="paymentName"
          :logo-url="detail.payment_method?.image || detail.payment_method?.logo"
          :width="48"
          :height="32"
        />

        <!-- Name & Type -->
        <div>
          <h4 class="font-outfit font-bold text-sm text-text leading-tight">
            {{ paymentName }}
          </h4>
          <p class="font-outfit text-xs text-text-muted mt-0.5">
            {{ paymentSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Ringkasan Pemesanan Section (Buyer View) -->
    <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-2.5">
      <h3 class="font-outfit font-bold text-sm text-text mb-2">
        Ringkasan Pemesanan
      </h3>

      <!-- Subtotal -->
      <div class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Total Harga ({{ totalItemCount }})</span>
        <span class="font-normal">{{ formatRupiah(subtotal) }}</span>
      </div>

      <!-- Ongkir -->
      <div v-if="shipping > 0" class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Biaya Ongkir</span>
        <span class="font-normal">{{ formatRupiah(shipping) }}</span>
      </div>

      <!-- Asuransi -->
      <div v-if="insurance > 0" class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Biaya Asuransi</span>
        <span class="font-normal">{{ formatRupiah(insurance) }}</span>
      </div>

      <!-- Divider -->
      <div class="border-t border-border/80 my-2 pt-1"></div>

      <!-- Total Pemesanan (Bold label and bold value) -->
      <div class="flex items-center justify-between text-sm font-outfit font-bold text-text">
        <span>Total Pemesanan</span>
        <span>{{ formatRupiah(grandTotal) }}</span>
      </div>
    </div>

    <!-- Estimasi Pendapatan Penjual Section (Matching Flutter _buildSellerIncomeSection) -->
    <div
      v-if="isSeller"
      class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-2.5"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-outfit font-bold text-sm text-text">
          {{ isFinish ? 'Rincian Pendapatan Penjual' : 'Estimasi Pendapatan Penjual' }}
        </h3>
        <span
          v-if="isFinish"
          class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          Masuk ke Saldo
        </span>
      </div>

      <!-- Total Harga Produk (Gross) -->
      <div class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Total Harga Produk</span>
        <span class="font-normal">{{ formatRupiah(income.gross) }}</span>
      </div>

      <!-- Biaya Platform -->
      <div v-if="income.fee > 0" class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Biaya Platform ({{ income.feePercent }}%)</span>
        <span class="font-normal text-danger">-{{ formatRupiah(income.fee) }}</span>
      </div>

      <!-- Gratis Ongkir Subsidi Penjual -->
      <div v-if="income.freeDeliveryDeduct > 0" class="flex items-center justify-between text-xs font-outfit text-text">
        <span>Gratis Ongkir (ditanggung penjual)</span>
        <span class="font-normal text-danger">-{{ formatRupiah(income.freeDeliveryDeduct) }}</span>
      </div>

      <!-- Divider -->
      <div class="border-t border-border/80 my-2 pt-1"></div>

      <!-- Pendapatan Bersih -->
      <div class="flex items-center justify-between text-sm font-outfit font-bold text-text">
        <span>Pendapatan Bersih</span>
        <span class="text-primary font-bold text-base">{{ formatRupiah(income.net) }}</span>
      </div>

      <!-- Footnote -->
      <div class="pt-1 flex items-center justify-between gap-2">
        <p class="font-outfit text-[11px] text-text-muted leading-relaxed">
          {{ isFinish ? '* Dana telah berhasil masuk ke Saldo BekasKu Anda.' : '* Nominal masuk ke saldo setelah transaksi selesai.' }}
        </p>
        <button
          v-if="isFinish"
          type="button"
          class="inline-flex items-center gap-1 text-[11px] font-outfit font-semibold text-primary hover:underline cursor-pointer shrink-0"
          @click="emit('open-balance')"
        >
          <span>Cek Saldo</span>
          <ExternalLink class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
