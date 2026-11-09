<script setup lang="ts">
import { ChevronRight, Shield, Check, Lock, Truck } from 'lucide-vue-next'
import type { ShippingServiceItem } from '~/types/checkout'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'

const { formatPrice } = useFormat()

const props = defineProps<{
  shipping: ShippingServiceItem | null
  hasAddress: boolean
  useInsurance: boolean
  lockInsurance?: boolean
  insurancePrice: number
  hasFreeDelivery?: boolean
}>()

const emit = defineEmits<{
  select: []
  toggleInsurance: []
}>()
</script>

<template>
  <div class="p-4 border-t border-border/80">
    <!-- Header: Opsi Pengiriman + Lihat semua -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <span class="text-sm font-bold text-text">
        Opsi Pengiriman
      </span>
      <button
        type="button"
        class="text-xs font-semibold text-text-muted hover:text-primary flex items-center gap-0.5 transition-colors cursor-pointer"
        @click="emit('select')"
      >
        <span>Lihat semua</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Container Kartu Opsi Pengiriman (Sesuai Gambar Mobile V3) -->
    <div class="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
      <!-- Bagian Atas: Kurir & Layanan Terpilih -->
      <div
        class="p-4 transition-colors cursor-pointer hover:bg-surface-2/40 flex items-center gap-3.5"
        @click="emit('select')"
      >
        <!-- State 1: Sudah memilih kurir -->
        <template v-if="props.shipping && props.shipping.shipping_code">
          <!-- Logo Kurir Persegi / Rounded Sesuai Mobile V3 -->
          <div class="w-12 h-12 rounded-xl border border-border bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
            <img
              v-if="props.shipping.logo"
              :src="sanitizeMediaUrl(props.shipping.logo, '')"
              :alt="props.shipping.name || 'Kurir'"
              width="36"
              height="36"
              class="max-w-full max-h-full object-contain"
            />
            <Truck v-else class="w-6 h-6 text-text-muted" />
          </div>

          <!-- Info Kurir & Layanan -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h5 class="text-xs sm:text-sm font-bold text-text leading-snug">
                {{ props.shipping.name }} {{ props.shipping.service_name || props.shipping.description || '' }}
              </h5>
              <span class="text-xs sm:text-sm font-bold text-text tabular-nums shrink-0">
                {{ formatPrice(props.shipping.price || 0) }}
              </span>
            </div>
            <p v-if="props.shipping.est || props.shipping.duration" class="text-xs text-text-muted mt-0.5">
              Estimasi Tiba: {{ props.shipping.est || props.shipping.duration }}
            </p>
          </div>
        </template>

        <!-- State 2: Belum memilih kurir -->
        <template v-else>
          <div class="w-full flex items-center justify-between text-text-muted py-1">
            <span class="text-xs sm:text-sm">
              {{ props.hasAddress ? 'Pilih Pengiriman' : 'Pilih alamat terlebih dahulu' }}
            </span>
            <ChevronRight class="w-4 h-4 text-text-subtle" />
          </div>
        </template>
      </div>

      <!-- Bagian Bawah: Checkbox Asuransi Pengiriman Sesuai Gambar Mobile V3 -->
      <div
        v-if="props.shipping && props.shipping.shipping_code && props.insurancePrice > 0"
        class="px-4 py-3 border-t border-border/70 bg-white flex items-center justify-between gap-3 transition-colors select-none"
        :class="props.lockInsurance ? 'cursor-default' : 'cursor-pointer hover:bg-surface-2/40'"
        @click="!props.lockInsurance && emit('toggleInsurance')"
      >
        <div class="flex items-center gap-2 min-w-0">
          <Shield class="w-4 h-4 text-text-subtle shrink-0" />
          <span class="text-xs text-text">
            Pakai Asuransi Pengiriman: <strong class="font-semibold tabular-nums text-text">{{ formatPrice(props.insurancePrice) }}</strong>
          </span>
          <span v-if="props.lockInsurance" class="text-[10px] bg-surface-2 text-text-muted px-1.5 py-0.5 rounded flex items-center gap-1">
            <Lock class="w-3 h-3" /> Wajib
          </span>
        </div>

        <!-- Checkbox Kotak Rounded Sesuai Screenshot Mobile V3 -->
        <div
          class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors"
          :class="[
            props.useInsurance
              ? 'bg-primary border-primary text-white'
              : 'border-border bg-white',
            props.lockInsurance ? 'opacity-80' : 'hover:border-primary/50'
          ]"
        >
          <Check v-if="props.useInsurance" class="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>
    </div>
  </div>
</template>

