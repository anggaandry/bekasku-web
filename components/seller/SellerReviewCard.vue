<template>
  <div class="py-4 border-b border-border/60 last:border-b-0 space-y-3">
    <!-- 1. Transaction Product Context Pill -->
    <div v-if="hasProducts" class="space-y-2">
      <NuxtLink
        v-for="(prod, idx) in productList"
        :key="idx"
        :to="getProductLink(prod)"
        class="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-2 hover:bg-muted border border-border/80 transition-colors group cursor-pointer"
      >
        <!-- Product Thumbnail (40px x 40px) -->
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-white border border-border/40 shrink-0">
          <img
            v-if="prod.image"
            :src="sanitizeMediaUrl(prod.image)"
            :alt="prod.title || 'Produk'"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-text-subtle">
            <Package class="w-5 h-5" />
          </div>
        </div>

        <!-- Product Title & Price -->
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-text truncate group-hover:text-primary transition-colors font-outfit">
            {{ prod.title || 'Produk Transaksi' }}
          </p>
          <p v-if="prod.price !== undefined && prod.price !== null" class="text-xs font-semibold text-primary mt-0.5 font-outfit">
            {{ formatPrice(prod.price) }}
          </p>
        </div>

        <ChevronRight class="w-4 h-4 text-text-subtle group-hover:text-primary transition-colors shrink-0" />
      </NuxtLink>
    </div>

    <!-- Fallback Single Product Context if products array is empty -->
    <div
      v-else-if="review.product_title"
      class="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-2 border border-border/80"
    >
      <div class="w-10 h-10 rounded-lg overflow-hidden bg-white border border-border/40 shrink-0">
        <img
          v-if="review.product_image"
          :src="sanitizeMediaUrl(review.product_image)"
          :alt="review.product_title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-text-subtle">
          <Package class="w-4 h-4" />
        </div>
      </div>
      <p class="text-[13px] text-text font-semibold truncate flex-1 font-outfit">
        {{ review.product_title }}
      </p>
    </div>

    <!-- 2. Buyer Row (Avatar, Name, Outline Amber Stars, Date, Service/Shipping Chips) -->
    <div class="flex items-start gap-3">
      <!-- Buyer Avatar (36px x 36px rounded-full - matching Flutter L820) -->
      <div class="w-9 h-9 rounded-full overflow-hidden bg-surface-2 border border-border/60 shrink-0 flex items-center justify-center">
        <img
          v-if="review.avatar"
          :src="sanitizeMediaUrl(review.avatar)"
          :alt="review.name || 'Buyer'"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <User v-else class="w-5 h-5 text-text-subtle" />
      </div>

      <!-- Buyer Details -->
      <div class="flex-1 min-w-0 space-y-1">
        <p class="text-sm font-bold text-text truncate font-outfit">
          {{ review.name || 'Buyer' }}
        </p>

        <!-- Star Rating + Date -->
        <div class="flex items-center gap-2 font-outfit">
          <div class="flex items-center gap-0.5">
            <Star
              v-for="s in 5"
              :key="s"
              class="w-3.5 h-3.5 stroke-current fill-none"
              :class="s <= scoreNum ? 'text-amber-500' : 'text-border'"
            />
          </div>
          <span v-if="review.time" class="text-xs text-text-muted">
            {{ review.time }}
          </span>
        </div>

        <!-- Service & Shipping Chips -->
        <div
          v-if="review.service_score || review.shipping_score"
          class="flex items-center gap-1.5 pt-0.5 flex-wrap"
        >
          <span
            v-if="review.service_score"
            class="px-1.5 py-0.5 rounded-[4px] bg-muted text-text-muted text-[11px] font-outfit font-medium"
          >
            Pelayanan: {{ review.service_score }}★
          </span>
          <span
            v-if="review.shipping_score"
            class="px-1.5 py-0.5 rounded-[4px] bg-muted text-text-muted text-[11px] font-outfit font-medium"
          >
            Pengiriman: {{ review.shipping_score }}★
          </span>
        </div>
      </div>
    </div>

    <!-- 3. Review Comment Text (matching Flutter L935-945 & Image 1: "Mantap") -->
    <p
      v-if="review.review"
      class="text-sm text-text leading-relaxed font-outfit pt-1"
    >
      {{ review.review }}
    </p>

    <!-- 4. Review Attached Photos / Media (90px x 90px matching Flutter L950-1010 & Image 1) -->
    <div
      v-if="reviewImages.length > 0"
      class="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1"
    >
      <div
        v-for="(img, i) in reviewImages"
        :key="i"
        class="w-[90px] h-[90px] rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border cursor-pointer hover:opacity-90 transition-opacity"
        @click="$emit('photo-click', img)"
      >
        <img
          :src="sanitizeMediaUrl(img)"
          alt="Foto Ulasan"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Package,
  User,
  Star,
  ChevronRight,
} from 'lucide-vue-next'
import type { SellerReviewItem, ReviewProductContext } from '~/types/seller'
import { sanitizeMediaUrl } from '~/utils/media'
import { productPath } from '~/utils/slug'
import { useFormat } from '~/composables/useFormat'

const props = defineProps<{
  review: SellerReviewItem
}>()

defineEmits<{
  (e: 'photo-click', url: string): void
}>()

const { formatPrice } = useFormat()

const hasProducts = computed(() => {
  return Array.isArray(props.review.products) && props.review.products.length > 0
})

const productList = computed<ReviewProductContext[]>(() => {
  return props.review.products || []
})

const scoreNum = computed(() => {
  const score = props.review.score
  return Number(score) || 5
})

const reviewImages = computed<string[]>(() => {
  return Array.isArray(props.review.images) ? props.review.images : []
})

function getProductLink(prod: ReviewProductContext): string {
  return productPath(prod)
}
</script>
