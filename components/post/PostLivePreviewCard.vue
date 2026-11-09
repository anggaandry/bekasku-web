<template>
  <div class="space-y-3">
    <!-- Phone Simulator Shell -->
    <div class="w-full max-w-[340px] mx-auto bg-dark p-2.5 rounded-[2.5rem] shadow-2xl border border-gray-700/60 ring-1 ring-black/40">
      <!-- Dynamic Island / Top Speaker -->
      <div class="flex justify-center items-center pt-1.5 pb-2">
        <div class="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>
      </div>

      <!-- Phone Screen -->
      <div class="bg-white rounded-[1.8rem] overflow-hidden flex flex-col h-[580px] select-none text-text-primary shadow-inner">
        <!-- Status Bar -->
        <div class="px-5 pt-2 pb-1 flex items-center justify-between text-[10px] font-semibold text-text-primary shrink-0 bg-white">
          <span>9:41</span>
          <div class="flex items-center gap-1.5 text-text-muted">
            <Signal class="w-3 h-3 text-text-primary" />
            <Wifi class="w-3 h-3 text-text-primary" />
            <BatteryMedium class="w-3.5 h-3.5 text-text-primary" />
          </div>
        </div>

        <!-- Mobile Detail Top App Bar -->
        <div class="px-3 py-2 flex items-center justify-between border-b border-border-light/60 shrink-0 bg-white">
          <div class="p-1 -ml-1 text-text-primary">
            <ArrowLeft class="w-5 h-5" />
          </div>
          <div class="flex items-center gap-3 text-text-primary">
            <Search class="w-4 h-4" />
            <Share2 class="w-4 h-4" />
            <ShoppingCart class="w-4 h-4" />
          </div>
        </div>

        <!-- Scrollable Mobile Product Detail Body -->
        <div class="flex-1 overflow-y-auto overscroll-contain divide-y-4 divide-surface-2 bg-white">
          <!-- 1. Media Aspect Square with Swipeable Carousel & 1/N counter -->
          <div class="relative aspect-square w-full bg-surface-2 flex items-center justify-center overflow-hidden group/media">
            <!-- Swipeable / Draggable Image Container -->
            <div
              v-if="images && images.length > 0"
              ref="carouselRef"
              class="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar select-none touch-pan-x"
              :class="images.length > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''"
              @scroll="onCarouselScroll"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
            >
              <div
                v-for="(img, idx) in images"
                :key="img.id || idx"
                class="w-full h-full shrink-0 snap-center relative aspect-square bg-surface-2 flex items-center justify-center"
              >
                <img
                  :src="img.url"
                  :alt="`${title || 'Preview Produk'} ${idx + 1}`"
                  class="w-full h-full object-cover select-none pointer-events-none"
                  draggable="false"
                />
              </div>
            </div>

            <!-- Empty State when no photos uploaded -->
            <div v-else class="flex flex-col items-center justify-center text-text-muted p-4 text-center">
              <Camera class="w-10 h-10 stroke-1 mb-2 text-text-subtle" />
              <span class="text-xs font-medium">Belum ada foto</span>
            </div>

            <!-- Carousel Navigation Arrow: Left -->
            <button
              v-if="images && images.length > 1 && currentSlideIndex > 0"
              type="button"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer z-10"
              aria-label="Foto Sebelumnya"
              @click.stop="prevSlide"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <!-- Carousel Navigation Arrow: Right -->
            <button
              v-if="images && images.length > 1 && currentSlideIndex < images.length - 1"
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer z-10"
              aria-label="Foto Selanjutnya"
              @click.stop="nextSlide"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <!-- Page counter pill (e.g. 1/4) updating dynamically -->
            <div
              v-if="images && images.length > 0"
              class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide pointer-events-none z-10 shadow-xs"
            >
              {{ currentSlideIndex + 1 }}/{{ images.length }}
            </div>
          </div>

          <!-- 2. Price, Wishlist, Title & Rating -->
          <div class="p-4 space-y-1.5">
            <div class="flex items-start justify-between gap-3">
              <span class="text-xl font-extrabold text-text-primary tracking-tight">
                {{ priceDisplay }}
              </span>
              <button type="button" class="text-text-muted p-0.5" aria-label="Favorit">
                <Heart class="w-5 h-5" />
              </button>
            </div>

            <h1 class="text-xs sm:text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {{ title || 'Judul barang akan tampil di sini...' }}
            </h1>

            <div class="flex items-center gap-1.5 text-[11px] text-text-muted pt-0.5">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span class="font-bold text-text-primary">4.0</span>
              <span>(10)</span>
            </div>
          </div>

          <!-- 3. Spesifikasi Section -->
          <div class="p-4 space-y-2.5 text-xs">
            <h2 class="font-bold text-xs text-text-primary">Spesifikasi</h2>

            <div class="space-y-2 text-[11px]">
              <div class="flex items-center justify-between">
                <span class="text-text-muted">Kategori</span>
                <span class="font-semibold text-primary">
                  {{ subcategoryName || 'Kategori' }}
                </span>
              </div>

              <!-- Selling & Delivery Specs only for Direct Selling (Hidden for Needed & Service like Flutter V3) -->
              <template v-if="sellMethod === SELL_METHOD_DIRECT">
                <div class="flex items-center justify-between">
                  <span class="text-text-muted">Ketemuan langsung</span>
                  <span class="font-medium text-text-primary">
                    {{ directMeet ? 'Tersedia' : 'Tidak tersedia' }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-text-muted">Kirim via Kurir</span>
                  <span class="font-medium text-text-primary">
                    {{ deliveryCourrier ? 'Tersedia' : 'Tidak tersedia' }}
                  </span>
                </div>

                <div v-if="freeDelivery" class="flex items-center justify-between">
                  <span class="text-text-muted">Bebas Ongkir</span>
                  <span class="font-semibold text-emerald-600">Tersedia</span>
                </div>
              </template>

              <!-- Dynamic Specs Summary (Direct Selling only) -->
              <div v-if="sellMethod === SELL_METHOD_DIRECT && dynamicAnswers && dynamicAnswers.length > 0" class="flex items-center justify-between">
                <span class="text-text-muted">Spesifikasi lainnya</span>
                <span class="font-medium text-text-primary flex items-center gap-0.5 truncate max-w-[55%]">
                  <span class="truncate">{{ dynamicSummary }}</span>
                  <ChevronRight class="w-3 h-3 text-text-muted shrink-0" />
                </span>
              </div>
            </div>
          </div>

          <!-- 4. Deskripsi Section -->
          <div class="p-4 space-y-2 text-xs">
            <h2 class="font-bold text-xs text-text-primary">Deskripsi</h2>
            <p class="text-[11px] text-text-secondary leading-relaxed line-clamp-4">
              {{ description || 'Berikan deskripsi barang lengkap mengenai spesifikasi, kondisi, dan kelengkapan...' }}
            </p>
            <p class="text-[11px] font-bold text-primary cursor-pointer">
              Baca Selengkapnya
            </p>
          </div>

          <!-- 5. Toko / Penjual Card -->
          <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center shrink-0 text-text-muted text-xs font-bold overflow-hidden border border-border-light">
                <img
                  v-if="sellerAvatar && !avatarLoadError"
                  :src="sellerAvatar"
                  :alt="sellerName"
                  class="w-full h-full object-cover"
                  @error="avatarLoadError = true"
                />
                <span v-else-if="sellerName" class="text-xs font-bold text-text-primary">{{ sellerName.charAt(0).toUpperCase() }}</span>
                <Store v-else class="w-4 h-4 text-text-muted" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-text-primary truncate">
                  {{ sellerName }}
                </p>
                <p class="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>

            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border border-primary text-primary text-[11px] font-bold shrink-0 hover:bg-red-50 transition-colors"
            >
              Kunjungi
            </button>
          </div>

          <!-- 6. Lokasi Pengiriman / Layanan -->
          <div class="px-4 py-3 flex items-center gap-1.5 text-[11px] text-text-muted">
            <MapPin class="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span class="truncate">
              {{ isService ? 'Lokasi layanan: ' : isNeeded ? 'Lokasi kebutuhan: ' : 'Dikirim dari ' }}{{ cityName || 'Indonesia' }}
            </span>
          </div>
        </div>

        <!-- Phone Simulator Fixed Bottom Action Bar (Parity with Flutter Mobile V3) -->
        <div class="p-2.5 border-t border-border-light bg-white shrink-0 space-y-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex-1 py-2 text-center text-xs font-bold rounded-xl border border-border-light text-text-primary bg-white hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone v-if="isService" class="w-3.5 h-3.5 text-text-secondary" />
              <Share2 v-else-if="isNeeded" class="w-3.5 h-3.5 text-text-secondary" />
              <span>{{ isNeeded ? 'Bagikan' : isService ? 'Hubungi' : 'Batalkan' }}</span>
            </button>
            <button
              type="button"
              class="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <MessageSquare v-if="isService" class="w-3.5 h-3.5" />
              <span>{{ isNeeded ? 'Tawarkan Barang' : isService ? 'Chat Pengiklan' : 'Edit Iklan' }}</span>
            </button>
          </div>

          <!-- Home Indicator Pill -->
          <div class="w-24 h-1 bg-black/80 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Signal,
  Wifi,
  BatteryMedium,
  ArrowLeft,
  Search,
  Share2,
  ShoppingCart,
  Heart,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-vue-next'
import {
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'
import type { UploadedImage, DynamicFormAnswer } from '~/types/post'
import { formatNumber } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    title: string
    price: number
    stock: number
    sellMethod?: number
    description?: string
    images: UploadedImage[]
    subcategoryName: string
    dynamicAnswers: DynamicFormAnswer[]
    cityName: string
    deliveryCourrier: boolean
    directMeet: boolean
    freeDelivery: boolean
  }>(),
  {
    sellMethod: SELL_METHOD_DIRECT,
    description: '',
  }
)

const authStore = useAuthStore()

const isNeeded = computed(() => props.sellMethod === SELL_METHOD_NEEDED)
const isService = computed(() => props.sellMethod === SELL_METHOD_SERVICE)

const priceDisplay = computed(() => {
  if (!props.price || props.price === 0) return 'Rp0'
  const formatted = formatNumber(props.price)
  if (isNeeded.value) return `Budget Rp${formatted}`
  if (isService.value) return `Tarif Rp${formatted}`
  return `Rp${formatted}`
})

// Carousel State
const carouselRef = ref<HTMLElement | null>(null)
const currentSlideIndex = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const scrollStartLeft = ref(0)
const dragMoved = ref(false)

function onCarouselScroll() {
  if (!carouselRef.value || props.images.length === 0) return
  const el = carouselRef.value
  const width = el.clientWidth || 1
  const idx = Math.round(el.scrollLeft / width)
  currentSlideIndex.value = Math.max(0, Math.min(idx, props.images.length - 1))
}

function scrollToSlide(index: number) {
  if (!carouselRef.value || props.images.length === 0) return
  const clamped = Math.max(0, Math.min(index, props.images.length - 1))
  const width = carouselRef.value.clientWidth || 1
  carouselRef.value.scrollTo({
    left: clamped * width,
    behavior: 'smooth',
  })
  currentSlideIndex.value = clamped
}

function prevSlide() {
  scrollToSlide(currentSlideIndex.value - 1)
}

function nextSlide() {
  scrollToSlide(currentSlideIndex.value + 1)
}

function onMouseDown(e: MouseEvent) {
  if (!carouselRef.value || props.images.length <= 1) return
  isDragging.value = true
  dragMoved.value = false
  dragStartX.value = e.pageX
  scrollStartLeft.value = carouselRef.value.scrollLeft
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || !carouselRef.value) return
  e.preventDefault()
  const delta = e.pageX - dragStartX.value
  if (Math.abs(delta) > 4) {
    dragMoved.value = true
  }
  carouselRef.value.scrollLeft = scrollStartLeft.value - delta
}

function onMouseUp(e: MouseEvent) {
  if (!isDragging.value || !carouselRef.value) return
  isDragging.value = false
  if (dragMoved.value) {
    const delta = e.pageX - dragStartX.value
    if (delta < -35 && currentSlideIndex.value < props.images.length - 1) {
      scrollToSlide(currentSlideIndex.value + 1)
    } else if (delta > 35 && currentSlideIndex.value > 0) {
      scrollToSlide(currentSlideIndex.value - 1)
    } else {
      scrollToSlide(currentSlideIndex.value)
    }
  }
}

watch(
  () => props.images.length,
  (newLen) => {
    if (currentSlideIndex.value >= newLen) {
      currentSlideIndex.value = Math.max(0, newLen - 1)
      scrollToSlide(currentSlideIndex.value)
    }
  },
)

const avatarLoadError = ref(false)

const sellerName = computed(() => {
  return authStore.displayName || authStore.user?.name || authStore.user?.username || 'Toko Penjual'
})

const sellerAvatar = computed(() => {
  return authStore.userAvatar || authStore.user?.avatar || null
})

watch(
  () => sellerAvatar.value,
  () => {
    avatarLoadError.value = false
  },
)

const dynamicSummary = computed(() => {
  if (!props.dynamicAnswers || props.dynamicAnswers.length === 0) return ''
  const valid = props.dynamicAnswers.filter((a) => a.answer && a.answer.trim())
  return valid.map((a) => a.answer).slice(0, 2).join(', ')
})
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
