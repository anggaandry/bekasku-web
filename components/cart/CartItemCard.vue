<script setup lang="ts">
import { Check, Heart } from 'lucide-vue-next'
import type { CartProduct } from '~/types/cart'
import { sanitizeMediaUrl } from '~/utils/media'
import { useFormat } from '~/composables/useFormat'
import { productPath } from '~/utils/slug'
import AppQuantityStepper from '~/components/shared/AppQuantityStepper.vue'

const { formatPrice } = useFormat()

const props = defineProps<{
  product: CartProduct
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  updateQty: [qty: number]
  delete: []
  toggleWishlist: []
}>()

const imageUrl = computed(() => sanitizeMediaUrl(props.product.product_image, '/images/product-placeholder.png'))
const itemSlug = computed(() => productPath({ id: props.product.product_id, title: props.product.product_title || 'produk' }))

const isUnavailable = computed(() => !props.product.is_available || props.product.product_stock <= 0)
const hasDiscount = computed(() => {
  return (
    props.product.is_best_deal ||
    props.product.is_nego ||
    props.product.original_price > props.product.product_price ||
    props.product.discount > 0
  )
})
</script>

<template>
  <div
    class="p-4 bg-white border-b border-border/60 transition-opacity"
    :class="{ 'opacity-65 bg-surface-2/40': props.disabled || isUnavailable }"
  >
    <div class="flex items-start gap-3">
      <!-- Checkbox Produk -->
      <button
        type="button"
        :disabled="props.disabled || isUnavailable"
        class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        :class="
          props.product.checked && !isUnavailable && !props.disabled
            ? 'bg-primary border-primary text-white'
            : 'border-border bg-white hover:border-primary/50'
        "
        aria-label="Pilih barang ini"
        @click="emit('toggle')"
      >
        <Check v-if="props.product.checked && !isUnavailable && !props.disabled" class="w-3.5 h-3.5 stroke-[3]" />
      </button>

      <!-- Thumbnail Produk dengan Badges & Overlay -->
      <div class="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-2 border border-border shrink-0">
        <NuxtLink :to="itemSlug" class="block w-full h-full">
          <img
            :src="imageUrl"
            :alt="props.product.product_title"
            width="80"
            height="80"
            class="w-full h-full object-cover"
          />
        </NuxtLink>

        <!-- Badge Diskon / Nego / Best Deal -->
        <span
          v-if="hasDiscount && !isUnavailable"
          class="absolute top-0 left-0 px-1.5 py-0.5 text-[9px] font-bold text-white rounded-br-lg"
          :class="props.product.is_nego ? 'bg-amber-600' : 'bg-primary'"
        >
          {{ props.product.is_nego ? 'Nego' : `-${props.product.discount_percent || 10}%` }}
        </span>

        <!-- Overlay Tidak Tersedia -->
        <div
          v-if="isUnavailable"
          class="absolute inset-0 bg-black/65 flex items-center justify-center p-1 text-center"
        >
          <span class="text-[9px] font-bold text-white leading-tight">
            {{ props.product.unavailable_reason || 'Stok Habis' }}
          </span>
        </div>
      </div>

      <!-- Info Produk & Stepper -->
      <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        <div>
          <!-- Judul Produk -->
          <NuxtLink
            :to="itemSlug"
            class="text-xs sm:text-sm font-medium text-text hover:text-primary transition-colors line-clamp-2 leading-snug"
          >
            {{ props.product.product_title }}
          </NuxtLink>

          <!-- Label Warning Unavailable / Metode Tidak Didukung -->
          <div v-if="isUnavailable || props.disabled" class="mt-1">
            <span class="inline-block px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold">
              {{ isUnavailable ? (props.product.unavailable_reason || 'Stok tidak mencukupi') : 'Tidak mendukung metode transaksi ini' }}
            </span>
          </div>

          <!-- Harga Produk -->
          <div class="mt-1 flex items-baseline gap-2 flex-wrap">
            <span class="text-sm sm:text-base font-bold text-text tabular-nums">
              {{ formatPrice(props.product.product_price) }}
            </span>
            <span
              v-if="hasDiscount && props.product.original_price > props.product.product_price"
              class="text-xs text-text-muted line-through tabular-nums"
            >
              {{ formatPrice(props.product.original_price) }}
            </span>
          </div>
        </div>

        <!-- Action Row: Wishlist + Qty Stepper -->
        <div class="mt-3 flex items-center justify-between gap-2 pt-1">
          <!-- Tombol Pindahkan ke Favorit -->
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
            :class="props.product.in_wishlist ? 'text-primary' : 'text-text-muted hover:text-text'"
            @click="emit('toggleWishlist')"
          >
            <Heart class="w-3.5 h-3.5" :class="{ 'fill-primary text-primary': props.product.in_wishlist }" />
            <span class="hidden sm:inline">{{ props.product.in_wishlist ? 'Tersimpan' : 'Ke Favorit' }}</span>
          </button>

          <!-- Quantity Stepper -->
          <AppQuantityStepper
            :model-value="props.product.total_product || 1"
            :min="1"
            :max="props.product.product_stock || 99"
            :disabled="isUnavailable || props.disabled"
            @update:model-value="(val) => emit('updateQty', val)"
            @delete="emit('delete')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
