<script setup lang="ts">
import { Box } from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import { formatRupiah } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  detail: TransactionDetail
  isSeller: boolean
}>()

const products = computed(() => {
  if (props.detail?.products && props.detail.products.length > 0) {
    return props.detail.products
  }
  if (props.detail?.order?.products && props.detail.order.products.length > 0) {
    return props.detail.order.products
  }
  return []
})
const sellerName = computed(() => props.detail?.seller_name || 'Penjual')
const productsCount = computed(() => products.value.length)

function getFinalPrice(prod: { product_price?: number; price?: number }) {
  return Number(prod.product_price || prod.price || 0)
}

function getDiscount(prod: { discount?: number }) {
  return Math.abs(Number(prod.discount || 0))
}

function getOriginalPrice(prod: { product_price?: number; price?: number; discount?: number }) {
  return getFinalPrice(prod) + getDiscount(prod)
}

const subtotal = computed(() => {
  if (props.detail?.total_order && props.detail.total_order > 0) {
    return props.detail.total_order
  }
  if (props.detail?.price && props.detail.price > 0) {
    return props.detail.price
  }
  return products.value.reduce((acc, p) => acc + getFinalPrice(p) * (p.total_product || p.total || 1), 0)
})
const shippingFee = computed(() => props.detail?.shipping_price || 0)
const discountProduct = computed(() => {
  if (props.detail?.total_discount && props.detail.total_discount > 0) {
    return props.detail.total_discount
  }
  return products.value.reduce((acc, p) => acc + getDiscount(p) * (p.total_product || p.total || 1), 0)
})
const discountShipping = computed(() => props.detail?.discount_shipping_price || 0)
const finalTotal = computed(() => {
  if (props.detail?.price && props.detail.price > 0) {
    return props.detail.price
  }
  return subtotal.value + shippingFee.value - discountProduct.value - discountShipping.value
})
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white rounded-2xl p-5 border border-border space-y-4 shadow-2xs">
      <div class="border-b border-border/60 pb-3">
        <h4 class="font-outfit font-bold text-base text-text">
          {{ sellerName }}
        </h4>
      </div>

      <div class="space-y-3">
        <div
          v-for="(prod, idx) in products"
          :key="idx"
          class="flex items-start gap-3.5"
        >
          <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-xl border border-border/80 overflow-hidden bg-surface-2 shrink-0 flex items-center justify-center">
            <NuxtImg
              v-if="prod.product_image || prod.image"
              :src="sanitizeMediaUrl(prod.product_image || prod.image)"
              :alt="prod.product_title || prod.product_name || 'Produk'"
              width="72"
              height="72"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <Box v-else class="w-6 h-6 text-text-subtle" />
          </div>

          <div class="flex-1 min-w-0">
            <h5 class="font-outfit text-sm text-text line-clamp-2 leading-snug">
              {{ prod.product_title || prod.product_name || prod.title }}
            </h5>
            <div v-if="getDiscount(prod) > 0" class="mt-1 text-xs text-text-subtle line-through font-outfit">
              {{ formatRupiah(getOriginalPrice(prod)) }}
            </div>
            <div class="mt-0.5 flex items-baseline gap-1.5">
              <span class="font-outfit font-bold text-sm sm:text-base text-primary">
                {{ formatRupiah(getFinalPrice(prod)) }}
              </span>
              <span class="text-xs text-text-muted">
                x {{ prod.total_product || prod.total || 1 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <slot />

    <div class="bg-white rounded-2xl p-5 border border-border space-y-3 shadow-2xs">
      <h4 class="font-outfit font-bold text-base text-text">
        Ringkasan Pemesanan
      </h4>

      <div class="space-y-2 text-sm font-outfit pt-1">
        <div class="flex justify-between text-text-muted">
          <span>Total harga ({{ productsCount }})</span>
          <span class="text-text font-medium">{{ formatRupiah(subtotal) }}</span>
        </div>

        <div class="flex justify-between text-text-muted">
          <span>Biaya Ongkir</span>
          <span class="text-text font-medium">{{ formatRupiah(shippingFee) }}</span>
        </div>

        <div v-if="discountProduct > 0" class="flex justify-between text-danger font-medium">
          <span>Diskon Barang</span>
          <span>-{{ formatRupiah(discountProduct) }}</span>
        </div>

        <div v-if="discountShipping > 0" class="flex justify-between text-danger font-medium">
          <span>Diskon Ongkir</span>
          <span>-{{ formatRupiah(discountShipping) }}</span>
        </div>

        <div class="pt-3 border-t border-border flex justify-between items-center text-base">
          <span class="font-outfit font-semibold text-text">Total Pemesanan</span>
          <span class="font-outfit font-bold text-base sm:text-lg text-text">
            {{ formatRupiah(finalTotal) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
