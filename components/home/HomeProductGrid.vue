<template>
  <div class="space-y-4">
    <!-- Section Heading -->
    <h3 class="text-base sm:text-lg font-black text-gray-900 tracking-tight uppercase">
      {{ title }}
    </h3>

    <!-- Product Grid (5 columns on desktop) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
      <!-- 1. Initial Shimmer Loading Skeleton (20 Cards matching Mobile V3 ShimmerProductCard) -->
      <template v-if="loading && products.length === 0">
        <div
          v-for="n in 20"
          :key="`skel-init-${n}`"
          class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-2xs animate-shimmer flex flex-col justify-between"
        >
          <!-- 1:1 Aspect Ratio Image placeholder -->
          <div class="w-full aspect-square bg-gray-200" />
          <div class="p-2 sm:p-2.5 space-y-2">
            <!-- Price placeholder -->
            <div class="h-3.5 sm:h-4 bg-gray-200 rounded w-2/3" />
            <!-- Title line 1 -->
            <div class="h-3 bg-gray-200 rounded w-full" />
            <!-- Title line 2 -->
            <div class="h-3 bg-gray-200 rounded w-3/4" />
            <!-- City / Location placeholder -->
            <div class="pt-1 flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-full bg-gray-200" />
              <div class="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      </template>

      <!-- 2. Real Products (With AOS fade-up animation) -->
      <template v-else>
        <AppProductCard
          v-for="(product, idx) in displayProducts"
          :key="product.id || product._id || idx"
          :product="product"
          data-aos="fade-up"
          :data-aos-delay="(idx % 10) * 30"
          @click="$emit('select', product)"
        />

        <!-- Incremental Loading Shimmer (5 Cards when fetching next page) -->
        <template v-if="loading && products.length > 0">
          <div
            v-for="n in 5"
            :key="`skel-more-${n}`"
            class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-2xs animate-shimmer flex flex-col justify-between"
          >
            <div class="w-full aspect-square bg-gray-200" />
            <div class="p-2 sm:p-2.5 space-y-2">
              <div class="h-3.5 sm:h-4 bg-gray-200 rounded w-2/3" />
              <div class="h-3 bg-gray-200 rounded w-full" />
              <div class="h-3 bg-gray-200 rounded w-3/4" />
              <div class="pt-1 flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-gray-200" />
                <div class="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Centered Pill Button: Muat Lebih Banyak (Tightened vertical spacing) -->
    <div
      v-if="hasMore"
      class="flex justify-center pt-3 pb-1"
    >
      <button
        type="button"
        :disabled="loading"
        class="bg-white hover:bg-gray-50 border-2 border-gray-900 text-gray-900 font-bold text-xs sm:text-sm px-8 py-2.5 rounded-full shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        @click="$emit('loadMore')"
      >
        <RefreshCw v-if="loading" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? 'Memuat Produk...' : 'Muat Lebih Banyak' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'

interface Props {
  products?: Product[]
  loading?: boolean
  hasMore?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  products: () => [],
  loading: false,
  hasMore: true,
  title: 'REKOMENDASI BEKASKU',
})

defineEmits<{
  loadMore: []
  select: [product: Product]
}>()

const displayProducts = computed(() => {
  return props.products
})
</script>
