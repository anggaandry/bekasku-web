<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, X, PackageOpen, ArrowRight } from 'lucide-vue-next'
import type { PromotionTargetProduct } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  products: PromotionTargetProduct[]
  loading?: boolean
  selectedId?: string
}>()

const emit = defineEmits<{
  (e: 'select', product: PromotionTargetProduct): void
  (e: 'search', keyword: string): void
  (e: 'proceed'): void
}>()

const searchInput = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  searchInput.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', val)
  }, 400)
}

function clearSearch() {
  searchInput.value = ''
  emit('search', '')
}

function getProductImage(img?: string[] | string): string {
  if (Array.isArray(img) && img.length > 0) return img[0]
  if (typeof img === 'string' && img.length > 0) return img
  return '/images/empty-product.png'
}

const selectedProduct = computed(() => {
  return props.products.find((p) => p._id === props.selectedId) || null
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-4">
    <!-- Header & Search Input -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-sm sm:text-base font-bold font-outfit text-text">
          Pilih Barang yang Ingin Dipromosikan
        </h3>
        <p class="text-xs text-text-muted mt-0.5">
          Pilih salah satu produk aktif Anda untuk ditingkatkan visibilitasnya
        </p>
      </div>

      <!-- Search Bar -->
      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          :value="searchInput"
          type="text"
          placeholder="Cari nama barang..."
          class="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
          @input="onSearchInput"
        >
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
          @click="clearSearch"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="props.loading" class="space-y-2.5">
      <div v-for="i in 4" :key="i" class="h-20 bg-surface-2 rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="props.products.length === 0"
      class="text-center py-12 px-4 space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-surface-2 text-text-muted flex items-center justify-center mx-auto">
        <PackageOpen class="w-6 h-6" />
      </div>
      <div>
        <p class="text-xs sm:text-sm font-semibold text-text">
          Tidak ada barang aktif ditemukan
        </p>
        <p class="text-xs text-text-muted mt-0.5">
          Pastikan Anda memiliki produk yang sedang tayang atau ubah kata kunci pencarian.
        </p>
      </div>
    </div>

    <!-- Product Radio List -->
    <div v-else class="space-y-2 max-h-[460px] overflow-y-auto pr-1">
      <div
        v-for="p in props.products"
        :key="p._id"
        class="flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer"
        :class="[
          p._id === props.selectedId
            ? 'border-primary bg-primary/5 shadow-2xs'
            : 'border-border-light hover:border-border hover:bg-surface-2/60'
        ]"
        @click="emit('select', p)"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <NuxtImg
            :src="getProductImage(p.image)"
            :alt="p.title"
            class="w-14 h-14 rounded-lg object-cover bg-surface-2 border border-border-light shrink-0"
            width="56"
            height="56"
          />
          <div class="min-w-0 flex-1">
            <h4 class="text-xs sm:text-sm font-semibold text-text truncate font-outfit">
              {{ p.title }}
            </h4>
            <div class="text-xs font-bold text-primary mt-0.5">
              {{ formatRupiah(p.price) }}
            </div>
            <div v-if="p.city" class="text-[11px] text-text-muted truncate mt-0.5">
              {{ p.city }}
            </div>
          </div>
        </div>

        <!-- Radio Indicator -->
        <div class="shrink-0 pl-2">
          <div
            class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
            :class="[
              p._id === props.selectedId
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white'
            ]"
          >
            <div
              v-if="p._id === props.selectedId"
              class="w-2 h-2 rounded-full bg-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar / Footer -->
    <div class="pt-3 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="text-xs text-text-muted text-center sm:text-left">
        <span v-if="selectedProduct" class="font-medium text-text">
          Terpilih: {{ selectedProduct.title }}
        </span>
        <span v-else>
          Pilih salah satu produk di atas untuk melanjutkan
        </span>
      </div>

      <button
        type="button"
        :disabled="!props.selectedId"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
        @click="emit('proceed')"
      >
        <span>Lanjutkan</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

