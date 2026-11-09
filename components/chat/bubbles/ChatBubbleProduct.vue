<script setup lang="ts">
import { MapPin, Star, Plus, Image as ImageIcon } from 'lucide-vue-next'
import type { ProductChatModel } from '~/types/chat'
import { formatRupiah } from '~/utils/format'

defineProps<{
  product: ProductChatModel
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-cart', product: ProductChatModel): void
  (e: 'buy-now', product: ProductChatModel): void
  (e: 'open-product', product: ProductChatModel): void
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-border-light shadow-2xs p-3.5 transition-all"
    :class="compact ? 'w-full max-w-[290px]' : 'w-full max-w-[340px]'"
  >
    <!-- Clickable Product Info Row -->
    <div
      class="flex items-start gap-3 cursor-pointer group"
      @click="emit('open-product', product)"
    >
      <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <ImageIcon v-else class="w-6 h-6 text-text-subtle" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-outfit font-normal text-sm text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {{ product.title }}
        </p>

        <p class="font-outfit font-semibold text-base text-text mt-1">
          {{ formatRupiah(product.price) }}
        </p>

        <div class="flex items-center justify-between gap-2 mt-1.5 text-xs text-text-muted">
          <div class="flex items-center gap-1 min-w-0">
            <MapPin class="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span class="truncate">{{ product.location || 'Indonesia' }}</span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span class="font-medium text-text">{{ (product.rating || 0).toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="!product.is_seller" class="grid grid-cols-2 gap-2.5 mt-3.5">
      <button
        type="button"
        @click.stop="emit('add-cart', product)"
        class="h-10 rounded-xl border border-primary bg-white hover:bg-primary/8 text-primary font-outfit font-semibold text-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
      >
        <Plus class="w-4 h-4 text-primary shrink-0" />
        <span>Keranjang</span>
      </button>

      <button
        type="button"
        @click.stop="emit('buy-now', product)"
        class="h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
      >
        <span class="text-white">Beli</span>
      </button>
    </div>

    <div v-else class="mt-3.5">
      <button
        type="button"
        @click.stop="emit('open-product', product)"
        class="w-full h-9 rounded-xl border border-border bg-surface-2 hover:bg-muted text-text font-outfit font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
      >
        Lihat Produk
      </button>
    </div>
  </div>
</template>
