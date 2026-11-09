<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <!-- Modal Handle for mobile bottom sheet -->
        <div class="sm:hidden flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-outfit font-bold text-gray-900 text-base sm:text-lg">
            Sematkan Produk Jualan
          </h3>

          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            @click="$emit('update:modelValue', false)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Search Bar -->
        <div class="p-4 border-b border-gray-100 bg-gray-50/50">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama barang jualanmu..."
              class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:border-primary focus:outline-hidden transition-all text-gray-900 placeholder:text-gray-400 shadow-2xs"
              @input="onSearchInput"
            />
          </div>
        </div>

        <!-- Product List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-[300px]">
          <!-- Loading -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <span class="text-xs">Memuat produk jualanmu...</span>
          </div>

          <!-- Empty -->
          <div
            v-else-if="products.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center text-gray-400"
          >
            <PackageSearch class="w-12 h-12 text-gray-300 stroke-[1.5] mb-2" />
            <p class="text-xs sm:text-sm text-gray-700 font-semibold">
              Tidak ada produk ditemukan
            </p>
            <p class="text-xs text-gray-400 mt-0.5 max-w-xs">
              Pastikan Anda sudah memposting iklan produk aktif sebelum menyematkannya ke video.
            </p>
          </div>

          <!-- Product Cards matching mobile screenshot -->
          <div
            v-else
            v-for="item in products"
            :key="item._id || item.id"
            class="flex items-center gap-3.5 p-3 rounded-2xl border border-gray-100 hover:border-red-200 bg-white hover:bg-red-50/30 transition-all shadow-2xs"
            :class="{ 'opacity-50 pointer-events-none': item.step !== undefined && item.step !== 1 }"
          >
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
              <img
                :src="sanitizeMediaUrl(item.image || (item.images && item.images[0]), '')"
                :alt="item.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                {{ item.title }}
              </h4>

              <div class="text-xs sm:text-sm font-extrabold text-primary font-outfit mt-1">
                Rp {{ formatRupiah(item.price || 0) }}
              </div>

              <div v-if="item.step !== undefined && item.step !== 1" class="text-[11px] font-semibold text-primary mt-1">
                Sudah Terjual / Tidak Tersedia
              </div>

              <div v-else-if="item.rating" class="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
                <span class="font-bold text-gray-700">{{ Number(item.rating).toFixed(1) }}</span>
                <span v-if="item.review_count">({{ item.review_count }})</span>
              </div>
            </div>

            <button
              v-if="item.step === undefined || item.step === 1"
              type="button"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-red-700 text-white font-bold text-xs transition-transform active:scale-95 shrink-0 cursor-pointer shadow-xs"
              @click="handleSelect(item)"
            >
              Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { X, Search, PackageSearch, Star } from 'lucide-vue-next'
import { useVideoFeed } from '~/composables/useVideoFeed'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'

export interface SellerProductOption {
  _id: string
  id?: string
  title: string
  price: number
  image?: string
  images?: string[]
  step?: number
  rating?: number
  review_count?: number
}

export interface SelectedVideoProduct {
  _id: string
  title: string
  price: number
  image?: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'select': [product: SelectedVideoProduct]
}>()

const { fetchMyProducts } = useVideoFeed()

const products = ref<SellerProductOption[]>([])
const loading = ref(false)
const searchQuery = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      loadProducts()
    }
  }
)

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})

async function loadProducts(search = '') {
  loading.value = true
  try {
    const res = await fetchMyProducts(search, 1)
    products.value = res.docs
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadProducts(searchQuery.value.trim())
  }, 400)
}

function handleSelect(product: SellerProductOption) {
  emit('select', {
    _id: product._id || product.id || '',
    title: product.title,
    price: product.price,
    image: product.image || (product.images && product.images[0]) || '',
  })
  emit('update:modelValue', false)
}

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>

