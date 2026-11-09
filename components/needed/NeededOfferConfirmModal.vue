<template>
  <Teleport to="body">
    <div
      v-if="modelValue && product"
      class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl space-y-4"
        @click.stop
      >
        <div class="flex items-center justify-between pb-2 border-b border-border/50">
          <h3 class="font-outfit font-bold text-base md:text-lg text-text">
            Konfirmasi Penawaran
          </h3>
          <button
            type="button"
            class="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="emit('update:modelValue', false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-3 bg-surface-2 rounded-xl border border-border flex items-center gap-3">
          <div class="w-14 h-14 rounded-lg overflow-hidden bg-white border border-border/60 shrink-0 flex items-center justify-center">
            <img
              v-if="product.image"
              :src="sanitizeMediaUrl(product.image)"
              :alt="product.title"
              width="56"
              height="56"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <Package v-else class="w-6 h-6 text-text-subtle" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-xs text-text-muted font-outfit">Barang yang Ditawarkan:</p>
            <h4 class="text-sm font-bold text-text truncate font-outfit mt-0.5">
              {{ product.title }}
            </h4>
            <p class="text-xs font-bold text-primary font-outfit mt-0.5">
              {{ formatPrice(product.price) }}
            </p>
          </div>
        </div>

        <div class="text-xs text-text-muted font-outfit leading-relaxed space-y-1">
          <p>
            Produk ini akan dikirimkan sebagai pesan penawaran otomatis ke ruang chat:
          </p>
          <div class="p-2.5 bg-muted rounded-lg text-text font-medium text-[12px] flex items-center gap-2">
            <span class="truncate">
              <strong>{{ target.seller_name || 'Pembuat Iklan' }}</strong>
              &bull;
              <em>"{{ target.needed_title || 'Iklan Dibutuhkan' }}"</em>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            :disabled="submitting"
            class="h-11 rounded-xl border border-border bg-white text-text font-outfit text-sm font-semibold hover:bg-surface-2 transition-colors cursor-pointer select-none"
            @click="emit('update:modelValue', false)"
          >
            Batal
          </button>

          <button
            type="button"
            :disabled="submitting"
            class="h-11 rounded-xl bg-primary text-white font-outfit text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-none select-none"
            @click="emit('confirm')"
          >
            <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <template v-else>
              <Send class="w-4 h-4" />
              <span>Kirim Penawaran</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Package, Send } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import type { NeededOfferTargetInfo } from '~/types/needed'
import { sanitizeMediaUrl } from '~/utils/media'
import { useFormat } from '~/composables/useFormat'

defineProps<{
  modelValue: boolean
  product: ProductCard | null
  target: NeededOfferTargetInfo
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

const { formatPrice } = useFormat()
</script>
