<template>
  <div>
    <!-- Product Grid -->
    <div
      class="grid gap-3 sm:gap-3.5"
      :class="
        columns === 4
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      "
    >
      <!-- 1. Initial Shimmer Skeleton -->
      <template v-if="loading && products.length === 0">
        <div
          v-for="n in skeletonCount"
          :key="`pg-skel-init-${n}`"
          class="bg-white rounded-xl border border-border overflow-hidden shadow-2xs animate-shimmer flex flex-col justify-between"
        >
          <div class="w-full aspect-square bg-border" />
          <div class="p-2.5 space-y-2">
            <div class="h-4 bg-border rounded w-2/3" />
            <div class="h-3 bg-border rounded w-full" />
            <div class="h-3 bg-border rounded w-3/4" />
            <div class="pt-1 flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-full bg-border" />
              <div class="h-2.5 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
        </div>
      </template>

      <!-- 2. Real Product Cards -->
      <template v-else>
        <AppProductCard
          v-for="(product, idx) in products"
          :key="product.id || product._id || idx"
          :product="product"
          :prevent-navigation="preventNavigation"
          @click="emit('select', product)"
        />

        <!-- Incremental Load More Shimmer -->
        <template v-if="loading && products.length > 0">
          <div
            v-for="n in 8"
            :key="`pg-skel-more-${n}`"
            class="bg-white rounded-xl border border-border overflow-hidden shadow-2xs animate-shimmer flex flex-col justify-between"
          >
            <div class="w-full aspect-square bg-border" />
            <div class="p-2.5 space-y-2">
              <div class="h-4 bg-border rounded w-2/3" />
              <div class="h-3 bg-border rounded w-full" />
              <div class="h-3 bg-border rounded w-3/4" />
              <div class="pt-1 flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-border" />
                <div class="h-2.5 bg-surface-2 rounded w-1/2" />
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Load More CTA -->
    <div
      v-if="hasMore && products.length > 0"
      class="flex justify-center pt-5 pb-2"
    >
      <button
        type="button"
        :disabled="loading"
        class="bg-white hover:bg-surface-2 border-2 border-text text-text font-outfit font-bold text-xs sm:text-sm px-8 py-2.5 rounded-full shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        @click="emit('loadMore')"
      >
        <RefreshCw v-if="loading" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? 'Memuat Produk...' : 'Muat Lebih Banyak' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import AppProductCard from '~/components/shared/AppProductCard.vue'

withDefaults(
  defineProps<{
    products: ProductCard[]
    loading?: boolean
    hasMore?: boolean
    columns?: 4 | 5
    skeletonCount?: number
    preventNavigation?: boolean
  }>(),
  {
    products: () => [],
    loading: false,
    hasMore: false,
    columns: 5,
    skeletonCount: 12,
    preventNavigation: false,
  }
)

const emit = defineEmits<{
  loadMore: []
  select: [product: ProductCard]
}>()
</script>

