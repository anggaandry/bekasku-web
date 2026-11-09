<template>
  <section class="w-full">
    <!-- Section Header: Subcategory Name (Left) + Lihat semua (Right Red, Matches Screenshots 1 & 2) -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-outfit font-semibold text-[15px] sm:text-base text-text">
        {{ subcategory.name }}
      </h2>
      <button
        type="button"
        class="font-outfit font-normal text-xs sm:text-[13px] text-primary hover:text-primary-dark transition-colors cursor-pointer"
        @click="emit('viewAll', subcategory)"
      >
        Lihat semua
      </button>
    </div>

    <!-- Product Cards Grid (Mobile: 2 columns side-by-side per Screenshots 1 & 2; Tablet: 3 cols; Desktop: 4 cols) -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      <NuxtLink
        v-for="(prod, idx) in visibleProducts"
        :key="prod.id || prod._id || idx"
        :to="productPath(prod)"
        class="group flex flex-col justify-between bg-white rounded-xl transition-all hover:shadow-xs cursor-pointer"
        :class="idx >= 2 ? 'hidden md:flex' : 'flex'"
        @click="emit('selectProduct', prod)"
      >
        <div>
          <!-- 1. Square Product Image + Bottom-Left Red 'Free Shipping' Overlay (Matches Screenshots 1 & 2) -->
          <div class="relative w-full aspect-square rounded-lg bg-surface-2 overflow-hidden flex items-center justify-center">
            <img
              v-if="getThumb(prod)"
              :src="getThumb(prod)"
              :alt="prod.title || prod.name || subcategory.name"
              width="220"
              height="220"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <ImageIcon v-else class="w-7 h-7 text-text-subtle" />

            <!-- Bottom-Left Red Free Shipping Badge (Matches Screenshots 1 & 2) -->
            <span
              v-if="hasFreeShipping(prod)"
              class="absolute bottom-0 left-0 bg-primary text-white font-outfit font-medium text-[10px] sm:text-[11px] px-2 py-0.5 rounded-tr-md leading-tight shadow-2xs"
            >
              Free Shipping
            </span>
          </div>

          <!-- 2. Red Price -->
          <p class="font-outfit font-bold text-sm sm:text-[15px] text-primary mt-2 leading-tight">
            {{ formatPrice(prod.price) }}
          </p>

          <!-- 3. 1-Line Product Title -->
          <h3 class="font-outfit font-normal text-xs sm:text-[13px] text-text truncate mt-0.5 group-hover:text-primary transition-colors">
            {{ prod.title || prod.name || 'Produk BekasKu' }}
          </h3>

          <!-- 4. Capability Badge (Pay & Pick) -->
          <div v-if="isPayAndPick(prod)" class="mt-2 min-h-[22px] flex items-center flex-wrap gap-1">
            <span
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/8 border border-primary/25 text-primary font-outfit font-semibold text-[10px] leading-tight"
            >
              <Handshake class="w-2.5 h-2.5 text-primary shrink-0" />
              <span>Pay &amp; Pick</span>
            </span>
          </div>
        </div>

        <!-- 5. Location Row (MapPin + City, Matches Screenshots 1 & 2) -->
        <div class="mt-1.5 flex items-center gap-1 text-[11px] text-text-muted font-outfit">
          <MapPin class="w-3.5 h-3.5 text-text shrink-0" />
          <span class="truncate">{{ prod.city || 'Indonesia' }}</span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Handshake, Image as ImageIcon } from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'
import type { Subcategory } from '~/types/category'
import type { ProductCard } from '~/types/product'

interface CategorySubcategorySectionProps {
  subcategory: Subcategory
}

const props = defineProps<CategorySubcategorySectionProps>()

const emit = defineEmits<{
  viewAll: [subcategory: Subcategory]
  selectProduct: [product: ProductCard]
}>()

// Show 2 products on mobile (<md), up to 4 on desktop (lg+)
const visibleProducts = computed(() => {
  return (props.subcategory.products || []).slice(0, 4)
})

function getThumb(prod: ProductCard): string {
  const raw = Array.isArray(prod.images) && prod.images.length > 0
    ? prod.images[0]
    : prod.image || ''
  return sanitizeMediaUrl(String(raw), '')
}

function formatPrice(val?: number): string {
  const num = Number(val) || 0
  return `Rp${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function hasFreeShipping(prod: any): boolean {
  const freeDel = Number(prod?.free_delivery) || 0
  return freeDel > 0 || prod?.free_ongkir === 1 || prod?.free_ongkir === true
}

function hasPromoBadge(prod: any): boolean {
  const disc = Number(prod?.discount) || 0
  const oldP = Number(prod?.old_price || prod?.price_before || prod?.original_price) || 0
  const curP = Number(prod?.price) || 0
  return disc > 0 || (oldP > curP && curP > 0) || Boolean(prod?.is_best_deal) || hasFreeShipping(prod)
}

function isPayAndPick(prod: any): boolean {
  const tm = Number(prod?.take_method)
  return tm === 2 || tm === 3 || Boolean(prod?.direct_meet || prod?.allow_meet)
}
</script>

