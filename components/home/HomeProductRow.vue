<template>
  <div
    v-if="!loading && products && products.length > 0"
    class="py-3"
  >
    <div class="flex items-center justify-between gap-2 mb-2.5">
      <h2 class="text-base md:text-base font-black md:font-bold text-text font-outfit tracking-tight">
        {{ title }}
      </h2>

      <!-- Controls: See All & Scroll Arrows (matching Jasa & Lowongan Kerja section) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <NuxtLink
          v-if="viewAllTo"
          :to="viewAllTo"
          class="inline-flex items-center gap-0.5 text-xs font-medium md:font-bold text-primary hover:text-primary-dark transition-colors md:mr-1"
        >
          <span>Lihat semua</span>
          <ChevronRight class="w-3.5 h-3.5 hidden md:inline" />
        </NuxtLink>

        <button
          type="button"
          class="hidden md:flex w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          :disabled="loading || products.length === 0"
          aria-label="Scroll kiri"
          @click="scrollTrack('left')"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          class="hidden md:flex w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          :disabled="loading || products.length === 0"
          aria-label="Scroll kanan"
          @click="scrollTrack('right')"
        >
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Scroll horizontal kartu produk -->
    <div
      ref="rowScrollRef"
      class="flex items-stretch gap-2.5 md:gap-3 overflow-x-auto scroll-smooth scrollbar-none pb-1"
    >
      <div
        v-for="item in products"
        :key="item.id || item._id"
        class="w-[122px] sm:w-[160px] md:w-[180px] shrink-0"
      >
        <AppProductCard :product="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import AppProductCard from '~/components/shared/AppProductCard.vue'

defineProps<{
  title: string
  products: ProductCard[]
  loading?: boolean
  viewAllTo?: string
}>()

const rowScrollRef = ref<HTMLElement | null>(null)

function scrollTrack(direction: 'left' | 'right') {
  if (!rowScrollRef.value) return
  const offset = direction === 'left' ? -360 : 360
  rowScrollRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>

