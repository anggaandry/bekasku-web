<script setup lang="ts">
import { ChevronRight, X } from 'lucide-vue-next'
import type { ProductDetail } from '~/types/product'
import { SELL_METHOD_NEEDED, SELL_METHOD_SERVICE } from '~/utils/constants'

const props = defineProps<{
  product: ProductDetail
}>()

const isModalOpen = ref(false)

const isService = computed(() => {
  const cat = (props.product.category || '').toLowerCase()
  return (
    props.product.sell_method === SELL_METHOD_SERVICE ||
    cat.includes('jasa') ||
    cat.includes('lowongan')
  )
})

const isNeeded = computed(() => props.product.sell_method === SELL_METHOD_NEEDED)
const isServiceOrNeeded = computed(() => isService.value || isNeeded.value)

const categoryText = computed(() => props.product.category || '-')
const subCategoryText = computed(() => props.product.sub_category || '-')

const meetText = computed(() => {
  return props.product.direct || props.product.direct_meet ? 'Tersedia' : 'Tidak tersedia'
})

const courierText = computed(() => {
  return props.product.via_courrier || props.product.via_courier ? 'Tersedia' : 'Tidak tersedia'
})

const negoText = computed(() => {
  return props.product.negotiation ? 'Tersedia' : 'Tidak tersedia'
})

const weightText = computed(() => {
  if (!props.product.weight) return '0 gr'
  return `${props.product.weight} gr`
})

const dimensionText = computed(() => {
  const { length, width, height } = props.product
  if (!length && !width && !height) return '0 x 0 x 0 cm'
  return `${length || 0} x ${width || 0} x ${height || 0} cm`
})
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-sm font-bold text-text">Spesifikasi</h2>

    <div class="space-y-2.5 text-xs">
      <!-- Kategori -->
      <div class="flex items-start py-0.5">
        <span class="w-36 shrink-0 text-text-muted">Kategori</span>
        <NuxtLink
          v-if="product.category_id"
          :to="`/kategori/${product.category_id}`"
          class="font-medium text-primary hover:underline flex-1"
        >
          {{ categoryText }}
        </NuxtLink>
        <span v-else class="font-medium text-primary flex-1">{{ categoryText }}</span>
      </div>

      <!-- Ketemuan Langsung -->
      <div class="flex items-start py-0.5">
        <span class="w-36 shrink-0 text-text-muted">Ketemuan langsung</span>
        <span class="font-medium text-text flex-1">{{ meetText }}</span>
      </div>

      <!-- Stok Barang (Hidden for Jasa / Dibutuhkan) -->
      <div v-if="!isServiceOrNeeded" class="flex items-start py-0.5">
        <span class="w-36 shrink-0 text-text-muted">Stok barang</span>
        <span class="font-medium text-text flex-1">{{ product.stock ?? 0 }}</span>
      </div>

      <!-- Spesifikasi Lainnya Trigger -->
      <div class="flex items-center py-0.5">
        <span class="w-36 shrink-0 text-text-muted">Spesifikasi lainnya</span>
        <button
          type="button"
          class="flex items-center gap-1 text-text font-medium hover:text-primary transition-colors cursor-pointer"
          @click="isModalOpen = true"
        >
          <span>Lihat Lainnya</span>
          <ChevronRight class="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>
    </div>

    <!-- Full Specs Modal (product_specs_sheet.dart) -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click="isModalOpen = false"
      >
        <div
          class="bg-white text-text w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-base font-bold text-text">Spesifikasi</h3>
            <button
              type="button"
              class="text-text-muted hover:text-text p-1 rounded-lg transition-colors cursor-pointer"
              @click="isModalOpen = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="divide-y divide-border/60 text-xs">
            <div class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Dilihat</span>
              <span class="font-medium text-text flex-1">{{ product.views || 0 }}x</span>
            </div>
            <div v-if="!isServiceOrNeeded" class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Stok barang</span>
              <span class="font-medium text-text flex-1">{{ product.stock ?? 0 }}</span>
            </div>
            <div v-if="!isServiceOrNeeded" class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Berat barang</span>
              <span class="font-medium text-text flex-1">{{ weightText }}</span>
            </div>
            <div v-if="!isServiceOrNeeded" class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Dimensi</span>
              <span class="font-medium text-text flex-1">{{ dimensionText }}</span>
            </div>
            <div class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Jumpa langsung</span>
              <span class="font-medium text-text flex-1">{{ meetText }}</span>
            </div>
            <div v-if="!isServiceOrNeeded" class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Pengiriman kurir</span>
              <span class="font-medium text-text flex-1">{{ courierText }}</span>
            </div>
            <div class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Negosiasi harga</span>
              <span class="font-medium text-text flex-1">{{ negoText }}</span>
            </div>
            <div class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Kategori</span>
              <span class="font-medium text-text flex-1">{{ categoryText }}</span>
            </div>
            <div class="flex items-start py-3">
              <span class="w-36 shrink-0 text-text-muted">Sub Kategori</span>
              <span class="font-medium text-text flex-1">{{ subCategoryText }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
