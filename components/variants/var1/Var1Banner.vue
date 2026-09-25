<template>
  <div class="w-full">
    <!-- Shimmer Loading -->
    <div v-if="loading" class="w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[26/8] rounded-2xl bg-gray-200 animate-shimmer" />

    <!-- Cinematic Hero Ads Banner Carousel: Pure Banner Image without shadow or text overlay -->
    <div
      v-else
      class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group border border-gray-200/80 bg-gray-100"
      @mouseenter="isPaused = true"
      @mouseleave="isPaused = false"
    >
      <!-- Main Slide Container -->
      <div
        class="relative w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[26/8] overflow-hidden cursor-pointer"
        @click="onBannerClick(currentBanner)"
      >
        <video
          v-if="currentBanner?.isVideo"
          :src="currentBanner?.image"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
        />
        <img
          v-else
          :src="currentBanner?.image"
          :alt="currentBanner?.title || 'Iklan BekasKu'"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
          loading="eager"
          draggable="false"
        />
      </div>

      <!-- Left Navigation Arrow (Panah Kiri) -->
      <button
        type="button"
        class="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 border border-gray-200/90 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover:opacity-100"
        aria-label="Iklan Sebelumnya"
        @click.stop="prevSlide"
      >
        <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
      </button>

      <!-- Right Navigation Arrow (Panah Kanan) -->
      <button
        type="button"
        class="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 border border-gray-200/90 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover:opacity-100"
        aria-label="Iklan Selanjutnya"
        @click.stop="nextSlide"
      >
        <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
      </button>

      <!-- Minimalist Bottom Dots -->
      <div v-if="displayBanners.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
        <button
          v-for="(_, idx) in displayBanners"
          :key="idx"
          type="button"
          class="h-1.5 rounded-full transition-all cursor-pointer"
          :class="currentIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'"
          :aria-label="`Slide ${idx + 1}`"
          @click.stop="currentIndex = idx"
        />
      </div>
    </div>
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
const isPaused = ref(false)

const displayBanners = computed<Banner[]>(() => {
  if (props.banners && props.banners.length > 0) {
    return props.banners
  }
  return MONGODB_ACTIVE_ADS
})

const currentBanner = computed(() => displayBanners.value[currentIndex.value] || displayBanners.value[0])

function prevSlide() {
  if (displayBanners.value.length <= 1) return
  if (currentIndex.value === 0) {
    currentIndex.value = displayBanners.value.length - 1
  } else {
    currentIndex.value--
  }
}

function nextSlide() {
  if (displayBanners.value.length <= 1) return
  if (currentIndex.value >= displayBanners.value.length - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }
}

function onBannerClick(banner: Banner) {
  if (banner && banner.link) {
    logAdClick(banner._id || banner.id)
    window.open(banner.link, '_blank', 'noopener,noreferrer')
  }
}

let timer: any = null
onMounted(() => {
  timer = setInterval(() => {
    if (!isPaused.value && displayBanners.value.length > 1) {
      nextSlide()
    }
  }, 4500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
