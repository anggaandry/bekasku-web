<script setup lang="ts">
import {
  Truck,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Package,
  User,
  Handshake,
  ShieldCheck,
  Bike,
  Phone,
  MapPin,
  Box,
} from 'lucide-vue-next'
import type { TrackingDetailInfo } from '~/types/transaction'
import { resolveCourierLogo, getCourierCode } from '~/utils/courier'

const props = withDefaults(
  defineProps<{
    tracking?: TrackingDetailInfo | null
    loading?: boolean
    isReturn?: boolean
  }>(),
  {
    tracking: null,
    loading: false,
    isReturn: false,
  }
)

const copied = ref(false)

const courierLogoUrl = computed(() => {
  return resolveCourierLogo(props.tracking?.courier_name, props.tracking?.courier_logo)
})

const stepperStages = computed(() => {
  if (props.isReturn) {
    return [
      { label: 'Diajukan', icon: MessageSquare },
      { label: 'Disiapkan', icon: Package },
      { label: 'Dikirim', icon: Truck },
      { label: 'Sampai', icon: User },
    ]
  }
  const isMeet = props.tracking?.is_meet
  return [
    { label: 'Konfirmasi', icon: MessageSquare },
    { label: isMeet ? 'Siap' : 'Dikemas', icon: Package },
    { label: isMeet ? 'Bertemu' : 'Dikirim', icon: Truck },
    { label: 'Terkirim', icon: User },
  ]
})

const activeStepperIndex = computed(() => {
  if (!props.tracking) return 0
  const s = props.tracking.step ?? 0

  if (props.isReturn) {
    if (props.tracking.return_arrive_date || s >= 8) return 3
    if (props.tracking.waybill || s === 7) return 2
    if (s === 6) return 1
    return 0
  }

  // Same step mapping as Flutter TrackingOrderController
  switch (s) {
    case 0:
    case 1:
      return 0 // Konfirmasi
    case 2:
      return 1 // Dikemas
    case 3:
      return 2 // Dikirim
    case 4:
    case 10:
      return 3 // Terkirim / Selesai
    default:
      if (s >= 5 && s <= 8) return 2
      return 0
  }
})

const isInstantCourier = computed(() => {
  if (!props.tracking) return false
  const cName = (props.tracking.courier_name || '').toLowerCase()
  const sName = (props.tracking.service_name || '').toLowerCase()
  return (
    cName.includes('grab') ||
    cName.includes('gojek') ||
    cName.includes('gosend') ||
    cName.includes('lalamove') ||
    cName.includes('borzo') ||
    sName.includes('instant') ||
    sName.includes('same day') ||
    sName.includes('sameday')
  )
})

function copyWaybill() {
  if (!props.tracking?.waybill) return
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(props.tracking.waybill)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="space-y-3.5">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-3.5">
      <!-- Stepper Skeleton -->
      <div class="bg-white rounded-xl border border-border/80 p-4 sm:p-5">
        <div class="w-40 h-4 bg-surface-2 rounded mb-4 animate-pulse" />
        <div class="flex items-center justify-between gap-3">
          <div v-for="i in 4" :key="`track_shimmer_${i}`" class="flex flex-col items-center flex-1 gap-2">
            <div class="w-8 h-8 rounded-full bg-surface-2 animate-pulse" />
            <div class="w-12 h-3 bg-surface-2 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Courier Summary Skeleton -->
      <div class="bg-white rounded-xl border border-border/80 p-4 sm:p-5">
        <div class="flex items-center gap-3">
          <div class="w-14 h-9 rounded-lg bg-surface-2 animate-pulse shrink-0" />
          <div class="space-y-1.5 flex-1">
            <div class="w-32 h-4 bg-surface-2 rounded animate-pulse" />
            <div class="w-24 h-3 bg-surface-2 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Timeline Skeleton -->
      <div class="bg-white rounded-xl border border-border/80 p-4 sm:p-5 space-y-4">
        <div v-for="i in 3" :key="`track_event_${i}`" class="flex gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-surface-2 animate-pulse shrink-0 mt-1" />
          <div class="flex-1 space-y-1.5">
            <div class="w-4/5 h-4 bg-surface-2 rounded animate-pulse" />
            <div class="w-24 h-3 bg-surface-2 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!tracking"
      class="bg-white rounded-xl border border-border/80 p-8 text-center"
    >
      <div class="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mx-auto mb-3">
        <Truck class="w-6 h-6 text-primary" />
      </div>
      <h4 class="font-outfit font-bold text-sm text-text">
        Informasi Pelacakan Belum Tersedia
      </h4>
      <p class="font-poppins text-xs text-text-muted mt-1 max-w-xs mx-auto leading-relaxed">
        Nomor resi atau informasi kurir sedang diperbarui oleh pihak ekspedisi.
      </p>
    </div>

    <!-- Active Tracking Content (Mobile V3 Layout) -->
    <template v-else>
      <!-- 1. Stepper Section -->
      <div class="bg-white rounded-xl border border-border/80 p-4 sm:p-5">
        <!-- Estimasi diterima -->
        <div
          v-if="tracking.est_delivery && !tracking.is_meet"
          class="font-poppins font-semibold text-sm text-primary mb-4"
        >
          Estimasi diterima {{ tracking.est_delivery }}
        </div>

        <div class="flex items-center justify-between">
          <template v-for="(stage, idx) in stepperStages" :key="stage.label">
            <!-- Step Node -->
            <div class="flex flex-col items-center shrink-0">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                :class="[
                  idx <= activeStepperIndex
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-surface-2 text-text-muted border border-border/60',
                ]"
              >
                <component :is="stage.icon" class="w-4 h-4" />
              </div>
              <span
                class="mt-2 text-[11px] font-poppins text-center transition-colors"
                :class="[
                  idx <= activeStepperIndex
                    ? 'font-semibold text-text'
                    : 'font-medium text-text-muted',
                ]"
              >
                {{ stage.label }}
              </span>
            </div>

            <!-- Connector Line between nodes -->
            <div
              v-if="idx < stepperStages.length - 1"
              class="flex-1 mx-2 -mt-5 h-[3px] rounded-full transition-colors"
              :class="[
                idx < activeStepperIndex
                  ? 'bg-primary'
                  : 'bg-surface-2',
              ]"
            />
          </template>
        </div>
      </div>

      <!-- 2. Courier / Meetup Info Section -->
      <!-- COD / Meetup Variant -->
      <div
        v-if="tracking.is_meet"
        class="bg-white rounded-xl p-4 sm:p-5 border border-border/80 space-y-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Handshake class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-outfit font-bold text-sm text-text">
              Jumpa Langsung (Pay & Pick)
            </h4>
            <p class="font-poppins text-xs text-text-muted font-medium">
              Metode Serah Terima Fisik Tanpa Kurir
            </p>
          </div>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2.5">
          <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p class="font-poppins text-xs text-emerald-800 leading-relaxed">
            Dana Anda tersimpan aman di Rekber Bekasku sampai Anda memeriksa barang dan melakukan konfirmasi penerimaan secara tatap muka.
          </p>
        </div>
      </div>

      <!-- Regular Courier Variant -->
      <div
        v-else
        class="bg-white rounded-xl p-4 sm:p-5 border border-border/80 space-y-3"
      >
        <div class="flex items-center gap-3">
          <!-- Courier Logo Box -->
          <div class="w-16 h-10 px-2 py-1 rounded-lg border border-border/80 bg-white flex items-center justify-center shrink-0">
            <img
              v-if="courierLogoUrl"
              :src="courierLogoUrl"
              :alt="tracking.courier_name"
              class="w-full h-full object-contain"
              @error="(e: any) => {
                const code = getCourierCode(tracking?.courier_name)
                if (code) e.target.src = `/images/couriers/${code}.png`
              }"
            />
            <Truck v-else class="w-5 h-5 text-text-muted" />
          </div>
          <!-- Courier & Service & Resi -->
          <div class="flex-1 min-w-0">
            <h4 class="font-outfit font-semibold text-sm sm:text-[15px] text-text truncate">
              {{ tracking.courier_name }} {{ tracking.service_name }}
            </h4>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="font-poppins text-xs text-text-muted font-medium">
                {{ tracking.waybill || '-' }}
              </span>
              <button
                v-if="tracking.waybill"
                type="button"
                class="p-0.5 rounded text-text-muted hover:text-text cursor-pointer transition-colors"
                title="Salin No. Resi"
                @click="copyWaybill"
              >
                <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
                <Copy v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Instant Courier Extra (Driver / Live Link) -->
        <div
          v-if="isInstantCourier && (tracking.driver_name || tracking.track_link)"
          class="p-3 bg-surface-2 rounded-xl border border-border/60 space-y-2.5 text-xs font-poppins"
        >
          <div v-if="tracking.driver_name" class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bike class="w-3.5 h-3.5" />
              </div>
              <div>
                <p class="text-[11px] text-text-muted">Kurir Pengantar</p>
                <p class="font-outfit font-semibold text-text text-xs">{{ tracking.driver_name }}</p>
              </div>
            </div>
            <span
              v-if="tracking.driver_plate"
              class="px-2 py-0.5 bg-white border border-border rounded text-[11px] font-semibold text-text"
            >
              {{ tracking.driver_plate }}
            </span>
          </div>

          <a
            v-if="tracking.track_link"
            :href="tracking.track_link"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-dark transition-colors"
          >
            <MapPin class="w-3.5 h-3.5" />
            <span>Buka Peta Live Kurir</span>
          </a>
        </div>
      </div>

      <!-- 3. Timeline History Section (Riwayat Perjalanan Paket) -->
      <div class="bg-white rounded-xl p-4 sm:p-5 border border-border/80">
        <!-- Empty Manifest -->
        <div
          v-if="!tracking.manifest || tracking.manifest.length === 0"
          class="text-center py-8"
        >
          <Box class="w-10 h-10 text-border mx-auto mb-2" />
          <p class="font-poppins text-xs text-text-muted">
            Belum ada informasi pengiriman
          </p>
        </div>

        <!-- Manifest Timeline Matching Mobile V3 -->
        <div v-else class="space-y-0 pt-1">
          <div
            v-for="(item, idx) in tracking.manifest"
            :key="idx"
            class="flex items-stretch gap-3"
          >
            <!-- Left Indicator Column -->
            <div class="flex flex-col items-center shrink-0 w-3">
              <!-- Dot: Topmost is Red, rest are Gray -->
              <div
                class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 transition-colors"
                :class="[
                  idx === 0
                    ? 'bg-primary ring-2 ring-primary/20'
                    : 'bg-gray-400',
                ]"
              />
              <!-- Vertical Connecting Line -->
              <div
                v-if="idx < tracking.manifest.length - 1"
                class="w-[1.5px] flex-1 bg-border/80 my-1"
              />
            </div>

            <!-- Right Content Column -->
            <div
              class="flex-1 min-w-0"
              :class="idx < tracking.manifest.length - 1 ? 'pb-5' : 'pb-1'"
            >
              <!-- Description Text: Primary red for latest, gray-700 for previous -->
              <p
                class="text-[13px] sm:text-[13.5px] leading-relaxed transition-colors font-poppins"
                :class="[
                  idx === 0
                    ? 'font-medium text-primary'
                    : 'font-normal text-text',
                ]"
              >
                {{ item.description || item.status || item.note || '-' }}
              </p>

              <!-- Date & Time -->
              <p
                v-if="item.time || item.date"
                class="font-poppins text-xs text-text-muted font-normal mt-1"
              >
                {{ item.time || item.date }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
