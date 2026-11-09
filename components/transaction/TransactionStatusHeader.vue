<script setup lang="ts">
import { ChevronRight, ShieldAlert, BadgeCheck, PackageCheck } from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import { formatDate, formatRupiah } from '~/utils/format'
import {
  calcBuyerRefund,
  calcSellerIncome,
  isTransactionCanceled,
  isTransactionFinished,
  resolveStatusBadgeStyle,
} from '~/utils/transactionStatus'
import TransactionWalletBanner from '~/components/transaction/TransactionWalletBanner.vue'

const props = defineProps<{
  detail: TransactionDetail
  isSeller?: boolean
}>()

const emit = defineEmits<{
  (e: 'track'): void
  (e: 'meet'): void
  (e: 'open-balance'): void
  (e: 'open-complain'): void
}>()

const copied = ref(false)

const COMPLAIN_CODES = [
  'complain',
  'oncomplain',
  'packed_complaining',
  'returned',
  'onship_return',
  'return_onship',
  'return_arrived',
]

const statusCode = computed(() => {
  return (typeof props.detail?.status === 'object' ? props.detail.status?.code : '') || ''
})

const isMeet = computed(() => props.detail.meet === true || props.detail.type === 2)
const isFinish = computed(() => isTransactionFinished(props.detail))
const isCanceled = computed(() => isTransactionCanceled(props.detail))

const isComplain = computed(() => {
  const code = statusCode.value
  if (COMPLAIN_CODES.includes(code)) return true
  const name = (typeof props.detail?.status === 'object' ? props.detail.status?.name : String(props.detail?.status || '')).toLowerCase()
  if (name.includes('komplain') || name.includes('pengembalian')) return true
  if (props.detail?.complain_date && !isFinish.value && !isCanceled.value) return true
  return false
})

const showSellerBanner = computed(() => props.isSeller && !props.detail.return_waybill && isFinish.value)
const showBuyerBanner = computed(() => !props.isSeller && !props.detail.return_waybill && isCanceled.value)

const sellerBannerMessage = computed(() => {
  const net = calcSellerIncome(props.detail).net
  return net > 0
    ? `Penghasilan sebesar ${formatRupiah(net)} telah masuk ke Saldo Bekasku. Ketuk untuk cek dompetmu.`
    : 'Penghasilan pesanan telah masuk ke Saldo Bekasku. Ketuk untuk cek dompetmu.'
})

const buyerBannerMessage = computed(() => {
  const refund = calcBuyerRefund(props.detail)
  return refund > 0
    ? `Dana sebesar ${formatRupiah(refund)} telah dikembalikan ke Saldo Bekasku. Ketuk untuk cek mutasi.`
    : 'Dana pesanan telah dikembalikan ke Saldo Bekasku. Ketuk untuk cek mutasi.'
})

const returnRefundTotal = computed(() => {
  if (props.detail.complain_price && props.detail.complain_price > 0) {
    return props.detail.complain_price
  }
  if (props.detail.complain_items && props.detail.complain_items.length > 0) {
    return props.detail.complain_items.reduce((acc: number, item: any) => {
      const qty = item.total_complain || item.total || 1
      const price = item.product_price || item.price || 0
      return acc + (qty * price)
    }, 0)
  }
  return props.detail.refund_amount || props.detail.price || 0
})

const buyerReturnRefundMessage = computed(() => {
  const amt = returnRefundTotal.value
  return amt > 0
    ? `Dana sebesar ${formatRupiah(amt)} telah dikembalikan ke Saldo Bekasku. Ketuk untuk cek saldo.`
    : 'Dana pesanan telah dikembalikan ke Saldo Bekasku. Ketuk untuk cek saldo.'
})

const statusName = computed(() => {
  if (typeof props.detail.status === 'object' && props.detail.status?.name) {
    return props.detail.status.name
  }
  if (isMeet.value && !isFinish.value) return 'Menunggu ketemuan'
  return String(props.detail.status || (isFinish.value ? 'Transaksi selesai' : 'Memproses Pesanan'))
})

const badgeStyle = computed(() => {
  const status = typeof props.detail.status === 'object' ? props.detail.status : null
  return resolveStatusBadgeStyle(statusName.value, status?.text_color, status?.back_color)
})

const invoiceNumber = computed(() => props.detail.invoice_no || props.detail.id || props.detail._id || '')

const formattedOrderDate = computed(() => (props.detail.buy_date ? formatDate(props.detail.buy_date) : '-'))

const cardScheduleTitle = computed(() => {
  if (isComplain.value) return 'Pesanan Dikembalikan'
  if (isMeet.value) return 'Batas Pertemuan'
  if (isFinish.value) return 'Selesai Pada'
  return 'Estimasi Pengiriman'
})

const cardScheduleSub = computed(() => {
  if (isComplain.value) {
    return props.detail.complain_detail || props.detail.complain_reason || 'Lihat Detail Pengembalian'
  }
  if (isMeet.value) {
    return props.detail.meeting_expired ? formatDate(props.detail.meeting_expired) : 'Sepakati waktu & lokasi temu via chat'
  }
  if (isFinish.value) {
    return props.detail.finish_date ? formatDate(props.detail.finish_date) : (props.detail.buy_date ? formatDate(props.detail.buy_date) : '-')
  }
  return props.detail.est_delivery || 'Sedang dalam pengiriman'
})

function copyInvoice() {
  if (!invoiceNumber.value || !navigator?.clipboard) return
  navigator.clipboard.writeText(invoiceNumber.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleScheduleClick() {
  if (isComplain.value) {
    emit('open-complain')
    return
  }
  if (isMeet.value) {
    emit('meet')
  } else {
    emit('track')
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5">
    <!-- Top Status Badge Row -->
    <div class="flex items-center gap-2 mb-3">
      <!-- Status Pill with exact color matching list card -->
      <span
        class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-sm whitespace-nowrap"
        :style="badgeStyle"
      >
        {{ statusName }}
      </span>

      <!-- Pay & Pick Outline Badge if Meetup -->
      <span
        v-if="isMeet"
        class="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-sm border border-primary text-primary"
      >
        Pay & Pick
      </span>
    </div>

    <!-- Invoice Number & Copy -->
    <div class="flex items-center justify-between gap-2 mb-2">
      <span class="font-outfit font-bold text-base text-text tracking-tight">
        {{ invoiceNumber }}
      </span>
      <button
        type="button"
        class="text-xs font-outfit font-semibold text-primary hover:underline transition-colors cursor-pointer shrink-0"
        @click="copyInvoice"
      >
        {{ copied ? 'Disalin!' : 'Copy' }}
      </button>
    </div>

    <!-- Order Date Row -->
    <div class="flex items-center justify-between text-xs font-outfit text-text mb-3.5">
      <span class="text-text-muted">Tanggal Pemesanan</span>
      <span class="font-medium text-text">{{ formattedOrderDate }}</span>
    </div>

    <!-- Rounded Gray Box: Selesai Pada / Batas Pertemuan / Estimasi Pengiriman / Pesanan Dikembalikan (Clickable) -->
    <div
      class="bg-surface-2 rounded-xl p-3.5 flex items-center justify-between border border-border/40 hover:bg-surface-2 active:bg-surface-3 transition-colors cursor-pointer select-none"
      @click="handleScheduleClick"
    >
      <div>
        <h4 class="font-outfit font-bold text-xs sm:text-sm text-text leading-snug">
          {{ cardScheduleTitle }}
        </h4>
        <p class="font-outfit text-xs text-text-muted mt-0.5">
          {{ cardScheduleSub }}
        </p>
      </div>
      <ChevronRight class="w-4 h-4 text-text-muted shrink-0" />
    </div>

    <!-- Complain Decline Banner (Seller rejected complain) -->
    <div
      v-if="detail.complain_decline_reason"
      class="mt-3 bg-amber-50 rounded-xl p-3.5 border border-amber-200/90 cursor-pointer hover:bg-amber-100/70 active:scale-[0.99] transition-all"
      @click="emit('open-complain')"
    >
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
          <ShieldAlert class="w-5 h-5 text-amber-800" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h5 class="font-outfit font-bold text-xs sm:text-sm text-amber-900 leading-snug">
              Pengajuan Komplain Ditolak
            </h5>
            <ChevronRight class="w-4 h-4 text-amber-800 shrink-0 ml-1" />
          </div>
          <p class="font-outfit text-xs text-amber-700 mt-0.5 line-clamp-2">
            Alasan: {{ detail.complain_decline_reason }}
          </p>
        </div>
      </div>
    </div>

    <!-- Buyer Return Refund Banner (Goods returned & refund processed) -->
    <div
      v-if="!isSeller && detail.return_waybill && detail.finish_date"
      class="mt-3 bg-emerald-50 rounded-xl border border-emerald-200/80 overflow-hidden"
    >
      <div
        class="p-3.5 flex items-start gap-3 cursor-pointer hover:bg-emerald-100/60 transition-colors"
        @click="emit('open-balance')"
      >
        <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
          <BadgeCheck class="w-5 h-5 text-emerald-700" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h5 class="font-outfit font-bold text-xs sm:text-sm text-emerald-950 leading-snug">
              Pengembalian Dana Berhasil
            </h5>
            <ChevronRight class="w-4 h-4 text-emerald-700 shrink-0 ml-1" />
          </div>
          <p class="font-outfit text-xs text-emerald-700 mt-0.5 leading-relaxed">
            {{ buyerReturnRefundMessage }}
          </p>
        </div>
      </div>
      <div class="h-px bg-emerald-200/60 mx-3.5"></div>
      <button
        type="button"
        class="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-outfit font-semibold text-emerald-700 hover:bg-emerald-100/60 transition-colors cursor-pointer"
        @click="emit('open-complain')"
      >
        <span>Lihat Detail Pengembalian</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Seller Return Completed Banner (Buyer returned goods, transaction finished without seller income) -->
    <div
      v-else-if="isSeller && detail.return_waybill && detail.finish_date"
      class="mt-3 bg-amber-50 rounded-xl p-3.5 border border-amber-200/90 cursor-pointer hover:bg-amber-100/70 active:scale-[0.99] transition-all"
      @click="emit('open-complain')"
    >
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
          <PackageCheck class="w-5 h-5 text-amber-800" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h5 class="font-outfit font-bold text-xs sm:text-sm text-amber-900 leading-snug">
              Barang Dikembalikan Pembeli
            </h5>
            <ChevronRight class="w-4 h-4 text-amber-800 shrink-0 ml-1" />
          </div>
          <p class="font-outfit text-xs text-amber-700 mt-0.5 leading-relaxed">
            Pesanan ini selesai melalui proses pengembalian barang. Ketuk untuk lihat riwayat pengembalian.
          </p>
        </div>
      </div>
    </div>

    <!-- Normal Wallet Banners (only if not a return-completed transaction) -->
    <TransactionWalletBanner
      v-else-if="showSellerBanner"
      title="Transaksi Sukses"
      :message="sellerBannerMessage"
      @click="emit('open-balance')"
    />
    <TransactionWalletBanner
      v-else-if="showBuyerBanner"
      title="Saldo Dikembalikan"
      :message="buyerBannerMessage"
      @click="emit('open-balance')"
    />
  </div>
</template>
