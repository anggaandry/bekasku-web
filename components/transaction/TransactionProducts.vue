<script setup lang="ts">
import { Image as ImageIcon } from 'lucide-vue-next'
import type { TransactionDetail, TransactionProductItem } from '~/types/transaction'
import { formatRupiah } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  detail: TransactionDetail
}>()

const products = computed<TransactionProductItem[]>(() => {
  if (Array.isArray(props.detail.order?.products) && props.detail.order.products.length > 0) {
    return props.detail.order.products
  }
  if (Array.isArray(props.detail.products) && props.detail.products.length > 0) {
    return props.detail.products
  }
  if (Array.isArray(props.detail.product_id) && props.detail.product_id.length > 0) {
    return props.detail.product_id
  }
  return []
})

const sellerName = computed(() => {
  return props.detail.seller_name || props.detail.order?.seller_city || 'rodin j'
})

const hasFreeDelivery = computed(() => {
  return Boolean(props.detail.free_delivery || (props.detail.discount_shipping_price && props.detail.discount_shipping_price > 0))
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-border/80 p-4 sm:p-5 space-y-3">
    <!-- Seller Header with Gratis Ongkir Badge -->
    <div class="flex items-center gap-2">
      <h3 class="font-outfit font-bold text-sm text-text">
        {{ sellerName }}
      </h3>
      <span
        v-if="hasFreeDelivery"
        class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white tracking-wide leading-none"
      >
        Gratis Ongkir
      </span>
    </div>

    <!-- Product List -->
    <div class="space-y-3.5 pt-1">
      <div
        v-for="(prod, idx) in products"
        :key="prod.id || prod.product_id || idx"
        class="flex items-start gap-3"
      >
        <!-- Product Thumbnail -->
        <div class="w-16 h-16 rounded-xl border border-border/60 overflow-hidden shrink-0 bg-surface-2 flex items-center justify-center">
          <img
            v-if="prod.product_image || prod.image"
            :src="sanitizeMediaUrl(prod.product_image || prod.image, '')"
            :alt="prod.product_title || prod.product_name || prod.title || 'Produk'"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <ImageIcon v-else class="w-6 h-6 text-text-muted" />
        </div>

        <!-- Info (Title + Red Price x Qty) -->
        <div class="flex-1 min-w-0">
          <h4 class="font-outfit font-normal text-xs sm:text-sm text-text line-clamp-2 leading-snug">
            {{ prod.product_title || prod.product_name || prod.title }}
          </h4>

          <!-- Price & Quantity on same row: Rp 10.000 x 1 -->
          <div class="flex items-baseline gap-1 mt-1.5 font-outfit">
            <span class="font-bold text-sm text-primary">
              {{ formatRupiah(prod.product_price || prod.price || 0) }}
            </span>
            <span class="text-xs text-text-muted font-normal">
              x {{ prod.total_product || prod.total || 1 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
