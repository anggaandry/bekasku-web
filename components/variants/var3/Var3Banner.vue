<template>
  <div class="w-full relative group/mag">
    <!-- Shimmer Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-8 aspect-[16/9] rounded-2xl bg-gray-200 animate-shimmer" />
      <div class="lg:col-span-4 space-y-4">
        <div class="aspect-[16/8] rounded-2xl bg-gray-200 animate-shimmer" />
        <div class="aspect-[16/8] rounded-2xl bg-gray-200 animate-shimmer" />
      </div>
    </div>

    <!-- Editorial Magazine Split Banner Layout (Pure Images, Real API Ads) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Left: Large Featured Hero Ad (8 cols) -->
      <div
        class="lg:col-span-8 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-gray-200/80 bg-gray-100 group cursor-pointer aspect-[16/9] transition-all"
        @click="onBannerClick(mainBanner)"
      >
        <video
          v-if="mainBanner?.isVideo"
          :src="mainBanner?.image"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover pointer-events-none"
        />
        <img
          v-else
          :src="mainBanner?.image"
          :alt="mainBanner?.title || 'Iklan BekasKu'"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
          loading="eager"
          draggable="false"
        />
      </div>

      <!-- Right: 2 Stacked Mini Promo Cards (4 cols) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <!-- Card 1 -->
        <div
          class="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-gray-200/80 bg-gray-100 group cursor-pointer aspect-[16/7.5] transition-all"
          @click="onBannerClick(sideBanner1)"
        >
          <video
            v-if="sideBanner1?.isVideo"
            :src="sideBanner1?.image"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover pointer-events-none"
          />
          <img
            v-else
            :src="sideBanner1?.image"
            :alt="sideBanner1?.title || 'Iklan BekasKu'"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
            loading="lazy"
            draggable="false"
          />
        </div>

        <!-- Card 2 -->
        <div
          class="relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-gray-200/80 bg-gray-100 group cursor-pointer aspect-[16/7.5] transition-all"
          @click="onBannerClick(sideBanner2)"
        >
          <video
            v-if="sideBanner2?.isVideo"
            :src="sideBanner2?.image"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover pointer-events-none"
          />
          <img
            v-else
            :src="sideBanner2?.image"
            :alt="sideBanner2?.title || 'Iklan BekasKu'"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>
    </div>

    <!-- Left Navigation Arrow (Panah Kiri) -->
    <button
      v-if="displayBanners.length > 3"
      type="button"
      class="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover/mag:opacity-100"
      aria-label="Iklan Sebelumnya"
      @click.stop="prevTrio"
    >
      <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
    </button>

    <!-- Right Navigation Arrow (Panah Kanan) -->
    <button
      v-if="displayBanners.length > 3"
      type="button"
      class="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover/mag:opacity-100"
      aria-label="Iklan Selanjutnya"
      @click.stop="nextTrio"
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

const mainBanner = computed(() => {
  const len = displayBanners.value.length
  return displayBanners.value[currentIndex.value % len] || displayBanners.value[0]
})

const sideBanner1 = computed(() => {
  const len = displayBanners.value.length
  if (len <= 1) return mainBanner.value
  return displayBanners.value[(currentIndex.value + 1) % len]
})

const sideBanner2 = computed(() => {
  const len = displayBanners.value.length
  if (len <= 2) return sideBanner1.value
  return displayBanners.value[(currentIndex.value + 2) % len]
})

function prevTrio() {
  const len = displayBanners.value.length
  currentIndex.value = (currentIndex.value - 3 + len) % len
}

function nextTrio() {
  const len = displayBanners.value.length
  currentIndex.value = (currentIndex.value + 3) % len
}

function onBannerClick(banner?: Banner) {
  if (banner && banner.link) {
    logAdClick(banner._id || banner.id)
    window.open(banner.link, '_blank', 'noopener,noreferrer')
  }
}
</script>
