<script setup lang="ts">
import type { TransactionDetail } from '~/types/transaction'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

const props = defineProps<{
  detail: TransactionDetail
  isSeller: boolean
  isActionLoading?: boolean
  canConfirm?: boolean
  canCancel?: boolean
  canRequestPickup?: boolean
  canRequestDropoff?: boolean
  canPrintLabel?: boolean
  canFinish?: boolean
  canTrack?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'pickup'): void
  (e: 'dropoff'): void
  (e: 'print'): void
  (e: 'finish'): void
  (e: 'track'): void
  (e: 'meet'): void
  (e: 'review'): void
  (e: 'complain'): void
  (e: 'complainDetail'): void
  (e: 'complain-detail'): void
  (e: 'waybill'): void
  (e: 'finishReturn'): void
  (e: 'finish-return'): void
}>()

const statusCode = computed(() => {
  return (typeof props.detail?.status === 'object' ? props.detail.status?.code : '') || ''
})

const isMeet = computed(() => {
  return props.detail?.meet === true || props.detail?.type === 2
})

const isFinish = computed(() => {
  const code = statusCode.value
  const name = (typeof props.detail?.status === 'object' ? props.detail.status?.name : String(props.detail?.status || '')).toLowerCase()
  return props.detail?.step === 4 || props.detail?.step === 3 || name.includes('selesai') || code === 'finished'
})

const isArrived = computed(() => {
  return statusCode.value === 'arrived' || props.canFinish
})

const isComplainState = computed(() => {
  const c = statusCode.value
  const name = (typeof props.detail?.status === 'object' ? props.detail.status?.name : String(props.detail?.status || '')).toLowerCase()
  return (
    c === 'complain' ||
    c === 'oncomplain' ||
    c === 'packed_complaining' ||
    c === 'returned' ||
    c === 'onship_return' ||
    name.includes('komplain') ||
    name.includes('pengembalian') ||
    Boolean(props.detail?.complain_date)
  )
})

const hasReviewed = computed(() => {
  if (props.detail?.review && props.detail.review.trim().length > 0) return true
  if (props.detail?.review_data && (props.detail.review_data.score > 0 || props.detail.review_data.review)) return true
  return false
})

const primaryActionLabel = computed(() => {
  if (isComplainState.value) {
    if (statusCode.value === 'packed_complaining' && !props.isSeller) {
      return 'Input Resi Pengembalian'
    }
    if (statusCode.value === 'onship_return' && props.isSeller) {
      return 'Selesaikan Pengembalian'
    }
    return 'Detail Pengembalian'
  }

  if (isArrived.value && !props.isSeller) {
    return 'Diterima'
  }

  if (isMeet.value && !isFinish.value) {
    return 'Jumpa'
  }

  if (isFinish.value) {
    return hasReviewed.value ? 'Lihat Ulasan' : 'Beri Ulasan'
  }

  if (props.isSeller) {
    if (props.canConfirm) return 'Konfirmasi'
    if (props.canRequestPickup) return 'Ajukan Pickup'
    if (props.canPrintLabel) return 'Cetak Resi'
    return 'Detail Pesanan'
  } else {
    if (props.canTrack) return 'Lacak'
    if (props.detail?.step === 0) return 'Bayar Sekarang'
    return 'Lacak'
  }
})

function handleChat() {
  const targetId = props.isSeller ? props.detail?.buyer_id : props.detail?.seller_id
  const targetName = props.isSeller ? props.detail?.buyer_name : props.detail?.seller_name
  const targetAvatar = props.isSeller ? props.detail?.buyer_avatar : props.detail?.seller_avatar
  const firstProd = props.detail?.products?.[0]
  if (targetId) {
    chatStore.openChatWith({
      partnerId: String(targetId),
      partnerName: targetName || 'Pengguna BekasKu',
      partnerAvatar: targetAvatar || '',
      transaction: {
        id: String(props.detail?.id || props.detail?._id || ''),
        invoice: props.detail?.invoice || '',
        title: firstProd?.product_name || firstProd?.name || 'Pesanan BekasKu',
        image: firstProd?.product_image || firstProd?.image || '',
        status: (typeof props.detail?.status === 'object' ? props.detail.status?.name : String(props.detail?.status || '')) || 'Transaksi',
        status_code: (typeof props.detail?.status === 'object' ? props.detail.status?.code : String(props.detail?.status || '')) || 'waiting',
        price: Number(props.detail?.total_price || props.detail?.price || 0),
        total_order: Number(props.detail?.products?.length || 1),
      },
    })
  } else {
    navigateTo('/chat')
  }
}

function handlePrimaryClick() {
  if (isComplainState.value) {
    if (statusCode.value === 'packed_complaining' && !props.isSeller) {
      emit('waybill')
      return
    }
    if (statusCode.value === 'onship_return' && props.isSeller) {
      emit('finishReturn')
      emit('finish-return')
      return
    }
    emit('complainDetail')
    emit('complain-detail')
    return
  }

  if (isArrived.value && !props.isSeller) {
    emit('finish')
    return
  }

  if (isMeet.value && !isFinish.value) {
    emit('meet')
    return
  }

  if (isFinish.value) {
    emit('review')
    return
  }

  if (props.isSeller) {
    if (props.canConfirm) emit('confirm')
    else if (props.canRequestPickup) emit('pickup')
    else if (props.canPrintLabel) emit('print')
  } else {
    if (props.canTrack) emit('track')
    else if (props.detail?.step === 0) {
      navigateTo(`/checkout/payment?id=${props.detail?.id || props.detail?._id}`)
    }
  }
}
</script>

<template>
  <div class="flex items-center gap-2.5 sm:gap-3 w-full">
    <!-- Chat Button (Left) -->
    <button
      type="button"
      class="flex-1 h-11 sm:h-12 rounded-xl border border-primary text-primary font-outfit font-semibold text-xs sm:text-sm hover:bg-primary/5 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
      @click="handleChat"
    >
      Chat
    </button>

    <!-- Extra Action Button for Arrived state: Pengembalian -->
    <button
      v-if="isArrived && !isSeller"
      type="button"
      class="flex-1 h-11 sm:h-12 rounded-xl border border-red-500 text-red-600 font-outfit font-semibold text-xs sm:text-sm hover:bg-red-50 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
      @click="emit('complain')"
    >
      Pengembalian
    </button>

    <!-- Extra Action Button for packed_complaining state: Detail Pengembalian -->
    <button
      v-else-if="statusCode === 'packed_complaining' && !isSeller"
      type="button"
      class="flex-1 h-11 sm:h-12 rounded-xl border border-border text-text font-outfit font-semibold text-xs sm:text-sm hover:bg-surface-2 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
      @click="emit('complainDetail'); emit('complain-detail')"
    >
      Detail
    </button>

    <!-- Right Primary Button -->
    <button
      type="button"
      :disabled="isActionLoading"
      class="flex-1 h-11 sm:h-12 rounded-xl bg-primary text-white font-outfit font-semibold text-xs sm:text-sm hover:bg-primary-dark active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs text-center px-2"
      @click="handlePrimaryClick"
    >
      <span v-if="isActionLoading">Memproses...</span>
      <span v-else>{{ primaryActionLabel }}</span>
    </button>
  </div>
</template>
