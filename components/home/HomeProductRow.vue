<template>
  <div
    v-if="!loading && products && products.length > 0"
    class="py-3"
  >
    <div class="flex items-center justify-between mb-2.5">
      <h2 class="text-sm md:text-base font-bold text-text">
        {{ title }}
      </h2>
      <NuxtLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
      >
        <span>Lihat Semua</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>

    <!-- Scroll horizontal kartu produk -->
    <div class="flex items-stretch gap-3 overflow-x-auto scrollbar-none pb-1">
      <div
        v-for="item in products"
        :key="item.id || item._id"
        class="w-[140px] sm:w-[160px] md:w-[180px] shrink-0"
      >
        <AppProductCard :product="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import AppProductCard from '~/components/shared/AppProductCard.vue'

defineProps<{
  title: string
  products: ProductCard[]
  loading?: boolean
  viewAllTo?: string
}>()
</script>

