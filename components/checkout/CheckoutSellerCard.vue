<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import type { CheckoutDraftSeller, ShippingServiceItem } from '~/types/checkout'
import { sanitizeMediaUrl } from '~/utils/media'
import { useFormat } from '~/composables/useFormat'
import CheckoutShipperTile from './CheckoutShipperTile.vue'

const { formatPrice } = useFormat()

const props = defineProps<{
  seller: CheckoutDraftSeller
  hasAddress: boolean
  isMeetTransaction?: boolean
}>()

const emit = defineEmits<{
  selectShipping: []
  toggleInsurance: []
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
    <!-- Header Toko: Nama & Lokasi Kota -->
    <div class="p-4 border-b border-border/80 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h4 class="text-sm font-bold text-text truncate">
          {{ props.seller.seller_name }}
        </h4>
        <div v-if="props.seller.seller_city" class="flex items-center gap-1 text-xs text-text-muted mt-0.5">
          <MapPin class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ props.seller.seller_city }}</span>
        </div>
      </div>

      <!-- Badge Gratis Ongkir jika ada -->
      <span
        v-if="props.seller.free_delivery"
        class="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold shrink-0"
      >
        Gratis Ongkir
      </span>
    </div>

    <!-- Daftar Produk di Toko Ini -->
    <div class="divide-y divide-border/60">
      <div
        v-for="product in props.seller.products"
        :key="product.product_id"
        class="p-4 flex items-center gap-3.5"
      >
        <!-- Foto Produk Persegi -->
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-2 border border-border shrink-0">
          <img
            :src="sanitizeMediaUrl(product.product_image, '/images/product-placeholder.png')"
            :alt="product.product_title"
            width="64"
            height="64"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Info Judul & Harga (Format: Rp 55.000 x 1) -->
        <div class="flex-1 min-w-0">
          <h5 class="text-xs sm:text-sm font-medium text-text line-clamp-2 leading-snug">
            {{ product.product_title }}
          </h5>
          <div class="mt-1 flex items-baseline gap-1 text-xs sm:text-sm">
            <span class="font-bold text-primary tabular-nums">
              {{ formatPrice(product.product_price) }}
            </span>
            <span class="text-text-muted">
              x {{ product.total_product || 1 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Opsi Pengiriman (Hanya untuk metode kurir) -->
    <CheckoutShipperTile
      v-if="!props.isMeetTransaction"
      :shipping="props.seller.shipping || null"
      :has-address="props.hasAddress"
      :use-insurance="props.seller.use_insurance || false"
      :lock-insurance="props.seller.lock_insurance || false"
      :insurance-price="props.seller.insurance_price || 0"
      :has-free-delivery="Boolean(props.seller.free_delivery)"
      @select="emit('selectShipping')"
      @toggle-insurance="emit('toggleInsurance')"
    />

    <!-- Notice Ketemuan Langsung jika mode COD -->
    <div v-else class="p-4 border-t border-border/80 bg-surface-2">
      <p class="text-xs text-text-muted leading-relaxed">
        <strong>Ketemuan Langsung (COD):</strong> Lakukan pertemuan langsung dengan penjual untuk memeriksa barang sebelum membayar.
      </p>
    </div>
  </div>
</template>

