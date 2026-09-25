<template>
  <div class="w-full relative group/duo">
    <!-- Shimmer Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="aspect-[21/9] sm:aspect-[24/9] rounded-2xl bg-gray-200 animate-shimmer" />
      <div class="aspect-[21/9] sm:aspect-[24/9] rounded-2xl bg-gray-200 animate-shimmer" />
    </div>

    <!-- Duo Pure Banner Ads Grid (Real API Ads, No shadows, Pure Images) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Banner 1: Pure Image Ad -->
      <div
        class="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-gray-200/80 bg-gray-100 group cursor-pointer aspect-[21/9] sm:aspect-[24/9] transition-all"
        @click="onBannerClick(banner1)"
      >
        <video
          v-if="banner1?.isVideo"
          :src="banner1?.image"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover pointer-events-none"
        />
        <img
          v-else
          :src="banner1?.image"
          :alt="banner1?.title || 'Iklan BekasKu'"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
          loading="eager"
          draggable="false"
        />
      </div>

      <!-- Banner 2: Pure Image Ad -->
      <div
        class="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-gray-200/80 bg-gray-100 group cursor-pointer aspect-[21/9] sm:aspect-[24/9] transition-all"
        @click="onBannerClick(banner2)"
      >
        <video
          v-if="banner2?.isVideo"
          :src="banner2?.image"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover pointer-events-none"
        />
        <img
          v-else
          :src="banner2?.image"
          :alt="banner2?.title || 'Iklan BekasKu'"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
          loading="eager"
          draggable="false"
        />
      </div>
    </div>

    <!-- Left Navigation Arrow (Panah Kiri) -->
    <button
      v-if="displayBanners.length > 2"
      type="button"
      class="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover/duo:opacity-100"
      aria-label="Iklan Sebelumnya"
      @click.stop="prevPair"
    >
      <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
    </button>

    <!-- Right Navigation Arrow (Panah Kanan) -->
    <button
      v-if="displayBanners.length > 2"
      type="button"
      class="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover/duo:opacity-100"
      aria-label="Iklan Selanjutnya"
      @click.stop="nextPair"
    >
      <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  type Banner,
  useBanners,
  MONGODB_ACTIVE_ADS,
} from '~/composables/useBanners'

interface Props {
  banners?: Banner[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  banners: () => [],
  loading: false,
})

const { logAdClick } = useBanners()

const currentIndex = ref(0)

const displayBanners = computed<Banner[]>(() => {
  if (props.banners && props.banners.length > 0) {
    return props.banners
  }
  return MONGODB_ACTIVE_ADS
})

const banner1 = computed(() => {
  const len = displayBanners.value.length
  return displayBanners.value[currentIndex.value % len] || displayBanners.value[0]
})

const banner2 = computed(() => {
  const len = displayBanners.value.length
  if (len <= 1) return banner1.value
  return displayBanners.value[(currentIndex.value + 1) % len]
})

function prevPair() {
  const len = displayBanners.value.length
  currentIndex.value = (currentIndex.value - 2 + len) % len
}

function nextPair() {
  const len = displayBanners.value.length
  currentIndex.value = (currentIndex.value + 2) % len
}

function onBannerClick(banner?: Banner) {
  if (banner && banner.link) {
    logAdClick(banner._id || banner.id)
    window.open(banner.link, '_blank', 'noopener,noreferrer')
  }
}
</script>
