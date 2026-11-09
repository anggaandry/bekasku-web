<template>
  <div class="space-y-4">
    <!-- Section Heading with Red "Lihat semua" Link matching Mobile V3 -->
    <div class="flex items-center justify-between">
      <h3 class="text-base sm:text-lg font-black text-text tracking-tight font-outfit uppercase">
        {{ t(title) }}
      </h3>
      <NuxtLink
        to="/search/result?type=0"
        class="text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors"
      >
        <span>{{ t('Lihat semua') }}</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Shared Product Grid -->
    <ProductGrid
      :products="products"
      :loading="loading"
      :has-more="hasMore"
      :columns="5"
      :skeleton-count="30"
      @load-more="emit('loadMore')"
      @select="(p) => emit('select', p)"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import { useLocale } from '~/composables/useLocale'
import ProductGrid from '~/components/shared/ProductGrid.vue'

const { t } = useLocale()

withDefaults(
  defineProps<{
    products?: ProductCard[]
    loading?: boolean
    hasMore?: boolean
    title?: string
  }>(),
  {
    products: () => [],
    loading: false,
    hasMore: true,
    title: 'REKOMENDASI BEKASKU',
  }
)

const emit = defineEmits<{
  loadMore: []
  select: [product: ProductCard]
}>()
</script>
