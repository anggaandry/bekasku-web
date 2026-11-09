<script setup lang="ts">
import { computed } from 'vue'
import {
  CircleAlert,
  Clock,
  Percent,
  ChevronRight,
  Headset,
} from 'lucide-vue-next'
import type { ProductDetail } from '~/types/product'

const props = defineProps<{
  product: ProductDetail
  countdownStr?: string
}>()

const emit = defineEmits<{
  (e: 'register-bestdeal'): void
  (e: 'bekasku-center'): void
}>()

const onDecline = computed(() => props.product.on_decline === true)
const onExpired = computed(() => props.product.on_expired === true)
const onVerify = computed(() => props.product.on_verify === true)
const onAir = computed(() => props.product.on_air !== false)
const isDirect = computed(() => Number(props.product.sell_method ?? 1) === 1)

const discount = computed(() => Number(props.product.discount || 0))
const bdComing = computed(() => String(props.product.bd_coming || '').trim())
const bdcdSecond = computed(() => Number(props.product.bdcd_second || 0))

const showOngoing = computed(() => discount.value > 0 && bdcdSecond.value >= 0)
const showRegistered = computed(() => bdComing.value.length > 0)
const showRegister = computed(() => onAir.value && isDirect.value && !showOngoing.value && !showRegistered.value)
</script>

<template>
  <div class="space-y-3">
    <!-- 1. Status Banners (Ditolak / Kadaluarsa / Sedang Diverifikasi) -->
    <div
      v-if="onDecline"
      class="p-3.5 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3"
    >
      <CircleAlert class="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div class="space-y-0.5">
        <h4 class="font-outfit font-bold text-sm text-danger">Postingan Ditolak</h4>
        <p class="font-outfit text-xs text-text-muted leading-relaxed">
          {{ product.decline_reason || 'Postingan Anda tidak sesuai dengan ketentuan kami.' }}
        </p>
      </div>
    </div>

    <div
      v-else-if="onExpired"
      class="p-3.5 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3"
    >
      <Clock class="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div class="space-y-0.5">
        <h4 class="font-outfit font-bold text-sm text-warning">Postingan Kadaluarsa</h4>
        <p class="font-outfit text-xs text-text-muted leading-relaxed">
          Masa aktif postingan Anda sudah berakhir.
        </p>
      </div>
    </div>

    <div
      v-else-if="onVerify"
      class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3"
    >
      <Clock class="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div class="space-y-0.5">
        <h4 class="font-outfit font-bold text-sm text-primary">Sedang Diverifikasi</h4>
        <p class="font-outfit text-xs text-text-muted leading-relaxed">
          Postingan Anda sedang ditinjau oleh tim kami.
        </p>
      </div>
    </div>

    <!-- 2. Best Deal Registration / Status (DetailRegisterSeller) -->
    <button
      v-if="showRegister"
      type="button"
      @click="emit('register-bestdeal')"
      class="w-full p-3.5 rounded-xl bg-white border border-border hover:border-primary/40 flex items-center gap-3 transition-colors cursor-pointer text-left"
    >
      <div class="p-2 rounded-lg bg-amber-100 text-orange-500 shrink-0">
        <Percent class="w-5 h-5" />
      </div>
      <span class="flex-1 text-xs sm:text-sm font-bold text-text">
        DAFTARKAN KE BEST DEAL
      </span>
      <ChevronRight class="w-5 h-5 text-text-muted shrink-0" />
    </button>

    <div
      v-else-if="showRegistered"
      class="p-4 rounded-xl bg-white border border-border space-y-2.5"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-amber-100 text-orange-500 shrink-0">
          <Percent class="w-5 h-5" />
        </div>
        <span class="text-sm font-semibold text-text">TERDAFTAR DI BESTDEAL</span>
      </div>
      <p class="text-xs text-text leading-relaxed">
        <span class="font-bold text-orange-500">BEST DEAL </span>
        <span>iklan kamu akan dimulai pada: </span>
        <span class="font-semibold">{{ bdComing }}</span>
      </p>
    </div>

    <div
      v-else-if="showOngoing"
      class="p-4 rounded-xl bg-white border border-border space-y-2.5"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-amber-100 text-orange-500 shrink-0">
          <Percent class="w-5 h-5" />
        </div>
        <span class="text-sm font-semibold text-text">BESTDEAL SEDANG BERLANGSUNG</span>
      </div>
      <p class="text-xs text-text">
        <span class="font-bold text-orange-500">BEST DEAL </span>
        <span>iklan kamu akan berakhir dalam: </span>
        <span v-if="countdownStr" class="font-mono font-bold text-text ml-1">{{ countdownStr }}</span>
      </p>
    </div>

    <!-- 3. Bekasku Center Help Tile (DetailSellerHelpTile) -->
    <button
      type="button"
      @click="emit('bekasku-center')"
      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-border hover:bg-slate-100 flex items-center gap-3 transition-colors cursor-pointer text-left"
    >
      <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
        <Headset class="w-4 h-4" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-outfit font-semibold text-xs sm:text-sm text-text">
          {{ onDecline ? 'Banding Iklan ke Bekasku Center' : 'Butuh Bantuan Terkait Iklan Ini?' }}
        </div>
        <div class="text-[11px] text-text-muted leading-snug">
          {{
            onDecline
              ? 'Iklan ditolak moderasi. Hubungi CS untuk bantuan & resolusi.'
              : 'Konsultasi masalah foto, kategori, atau kendala tayang dengan CS.'
          }}
        </div>
      </div>
      <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" />
    </button>
  </div>
</template>

