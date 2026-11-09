<script setup lang="ts">
import { MapPin, CheckCircle2, ChevronRight, Copy } from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import { sanitizeMediaUrl } from '~/utils/media'
import { resolveCourierLogo } from '~/utils/courier'

const props = defineProps<{
  detail: TransactionDetail
  canTrack?: boolean
}>()

const emit = defineEmits<{
  (e: 'track'): void
}>()

const copied = ref(false)

const courierName = computed(() => {
  return (
    props.detail.courier_name ||
    props.detail.order?.shipping?.name ||
    props.detail.waybill_service ||
    'J&T Express'
  )
})

const courierLogo = computed(() => {
  const logo = props.detail.courier_logo || props.detail.order?.shipping?.logo
  return resolveCourierLogo(courierName.value, logo)
})

const recipientName = computed(() => {
  return props.detail.destination_contact_name || props.detail.buyer_name || 'Angga Andry'
})

const recipientPhone = computed(() => {
  return props.detail.destination_contact_phone || props.detail.buyer_phone || '082294588970'
})

const fullAddress = computed(() => {
  return (
    props.detail.destination_address ||
    'jl perjuangan, perumahan d\'regalle cluster terrana blok b16, sunggal, tj selamat'
  )
})

const waybillNumber = computed(() => {
  return props.detail.waybill || ''
})

const shippingStatusText = computed(() => {
  const s = props.detail.step
  if (s >= 4 || props.detail.finish_date) {
    return 'Paket telah berhasil dikirimkan dan pesanan selesai.'
  }
  if (s === 3) {
    return 'Paket sedang dalam perjalanan menuju alamat pengiriman.'
  }
  if (s === 2) {
    return 'Penjual sedang menyiapkan dan mengemas pesanan Anda.'
  }
  return 'Pesanan sedang diproses.'
})

function copyWaybill() {
  if (!waybillNumber.value) return
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(waybillNumber.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Alamat Pengiriman Section -->
    <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-2.5">
      <h3 class="font-outfit font-bold text-sm text-text">
        Alamat Pengiriman
      </h3>

      <div class="flex items-start gap-2.5 pt-0.5">
        <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div class="min-w-0">
          <h4 class="font-outfit font-bold text-xs text-text">
            {{ recipientName }} &bull; {{ recipientPhone }}
          </h4>
          <p class="font-outfit text-xs text-text-muted mt-1 leading-relaxed">
            {{ fullAddress }}
          </p>
        </div>
      </div>
    </div>

    <!-- Informasi Pengiriman Barang Section -->
    <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-outfit font-bold text-sm text-text">
          Informasi Pengiriman Barang
        </h3>
        <button
          v-if="canTrack && waybillNumber"
          type="button"
          class="inline-flex items-center gap-1 text-xs font-outfit font-semibold text-primary hover:underline cursor-pointer"
          @click="emit('track')"
        >
          <span>Lacak</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Courier Row -->
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-7 rounded-md border border-border/60 bg-surface-2 p-1 flex items-center justify-center shrink-0">
          <img
            v-if="courierLogo"
            :src="courierLogo"
            :alt="courierName"
            class="max-w-full max-h-full object-contain"
          />
          <span v-else class="text-[10px] font-bold text-primary font-outfit">
            {{ courierName.slice(0, 3).toUpperCase() }}
          </span>
        </div>
        <span class="font-outfit font-semibold text-sm text-text">
          {{ courierName }}
        </span>
      </div>

      <!-- Resi Row -->
      <div v-if="waybillNumber" class="flex items-center justify-between gap-2 pt-1">
        <span class="font-outfit font-bold text-sm text-text tracking-wide">
          # {{ waybillNumber }}
        </span>
        <button
          type="button"
          class="text-xs font-outfit font-semibold text-primary hover:underline transition-colors cursor-pointer"
          @click="copyWaybill"
        >
          {{ copied ? 'Disalin!' : 'Copy' }}
        </button>
      </div>

      <!-- Green Status Card (Clickable to Track) -->
      <div
        class="bg-success-soft border border-success-border/60 rounded-xl p-3 flex items-center justify-between gap-2.5 transition-colors cursor-pointer hover:bg-emerald-100/70 active:bg-emerald-100 select-none"
        @click="emit('track')"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 class="w-4 h-4 text-success shrink-0" />
          <p class="font-outfit text-xs text-success-title font-medium leading-relaxed">
            {{ shippingStatusText }}
          </p>
        </div>
        <ChevronRight class="w-4 h-4 text-success shrink-0" />
      </div>
    </div>
  </div>
</template>
