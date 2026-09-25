<template>
  <div class="space-y-4">
    <!-- Carousel Hero Banner: Center Active + Left & Right Peeking Slides (Ultra Smooth Animated Track) -->
    <div
      class="relative w-full overflow-hidden select-none py-1 group/banner banner-container"
      @mouseenter="pauseAutoplay"
      @mouseleave="onMouseLeave"
      @mousedown="onPointerDown"
      @mousemove="onPointerMove"
      @mouseup="onPointerUp"
      @touchstart.passive="onPointerDown"
      @touchmove="onPointerMove"
      @touchend="onPointerUp"
      @touchcancel="onPointerUp"
    >
      <!-- Shimmer Loading -->
      <div v-if="loading" class="w-full flex justify-center px-4">
        <div class="w-[84%] sm:w-[76%] md:w-[72%] aspect-[21/9] sm:aspect-[24/8] md:aspect-[26/9] rounded-2xl md:rounded-3xl bg-gray-200 animate-shimmer" />
      </div>

      <!-- Single Banner (No track needed) -->
      <div
        v-else-if="displayBanners.length === 1"
        class="relative w-full flex items-center justify-center cursor-pointer"
        @click="handleSingleClick"
      >
        <div class="w-[84%] sm:w-[76%] md:w-[72%] aspect-[21/9] sm:aspect-[24/8] md:aspect-[26/9] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm relative">
          <video
            v-if="displayBanners[0]?.isVideo"
            :src="displayBanners[0]?.image"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover pointer-events-none"
          />
          <img
            v-else
            :src="displayBanners[0]?.image"
            :alt="displayBanners[0]?.title || 'Iklan BekasKu'"
            class="w-full h-full object-cover pointer-events-none"
            loading="eager"
            draggable="false"
          />
        </div>
      </div>

      <!-- Multi-Banner Sliding Peeking Stage with Seamless Infinite Clones -->
      <div v-else class="relative w-full">
        <!-- Horizontal Sliding Track -->
        <div
          ref="trackRef"
          class="flex items-center will-change-transform touch-pan-y"
          :style="{
            transform: `translate3d(calc(50% - (var(--slide-width) / 2) - (${trackIndex} * var(--slide-width)) + ${dragOffset}px), 0, 0)`,
            transition: isTransitioning ? 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }"
          @transitionend="onTransitionEnd"
        >
          <!-- Track Slides -->
          <div
            v-for="(banner, idx) in trackItems"
            :key="`${banner._id || banner.id || idx}-${idx}`"
            class="shrink-0 transition-all duration-600 ease-out cursor-pointer px-1 sm:px-2 md:px-2.5"
            :style="{ width: 'var(--slide-width)' }"
            :class="[
              idx === trackIndex
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-55 hover:opacity-80 scale-[0.96] z-0'
            ]"
            @click="handleSlideClick(idx, banner)"
          >
            <div
              class="w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[26/9] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
            >
              <video
                v-if="banner.isVideo"
                :src="banner.image"
                autoplay
                loop
                muted
                playsinline
                class="w-full h-full object-cover pointer-events-none"
              />
              <img
                v-else
                :src="banner.image"
                :alt="banner.title || 'Iklan BekasKu'"
                class="w-full h-full object-cover pointer-events-none select-none"
                :loading="idx === trackIndex ? 'eager' : 'lazy'"
                draggable="false"
              />
            </div>
          </div>
        </div>

        <!-- Left Navigation Arrow (Panah Kiri) -->
        <button
          type="button"
          class="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 border border-gray-200/90 shadow-md flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer backdrop-blur-xs"
          aria-label="Iklan Sebelumnya"
          @click.stop="prevSlide"
        >
          <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 stroke-[2.5]" />
        </button>

        <!-- Right Navigation Arrow (Panah Kanan) -->
        <button
          type="button"
          class="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 border border-gray-200/90 shadow-md flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer backdrop-blur-xs"
          aria-label="Iklan Selanjutnya"
          @click.stop="nextSlide"
        >
          <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 stroke-[2.5]" />
        </button>
      </div>
    </div>

    <!-- Dots Indicator (Sleek minimalist indicator matching reference image) -->
    <div v-if="displayBanners.length > 1" class="flex items-center justify-center gap-1.5 pt-0.5">
      <button
        v-for="(_, idx) in displayBanners"
        :key="`dot-${idx}`"
        type="button"
        class="h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer"
        :class="currentRealIndex === idx ? 'w-6 sm:w-8 bg-[#1a1a1a]' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'"
        :aria-label="`Menuju iklan ${idx + 1}`"
        @click="goToSlide(idx)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
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

// Display banners from API with robust production MongoDB fallback
const displayBanners = computed<Banner[]>(() => {
  if (props.banners && props.banners.length > 0) {
    return props.banners
  }
  return MONGODB_ACTIVE_ADS
})

// Number of clone buffers at start and end
const CLONE_COUNT = 2

// Infinite looping track items
const trackItems = computed(() => {
  const list = displayBanners.value
  const len = list.length
  if (len <= 1) return list
  const before = [list[(len - 2 + len) % len], list[(len - 1 + len) % len]]
  const after = [list[0], list[1 % len]]
  return [...before, ...list, ...after]
})

const trackRef = ref<HTMLElement | null>(null)
const currentRealIndex = ref(0)
const trackIndex = ref(CLONE_COUNT)
const isTransitioning = ref(true)

// Autoplay & Pause state
const isPaused = ref(false)
let autoplayTimer: any = null

// Drag & Swipe state
const isDragging = ref(false)
const dragOffset = ref(0)
let startX = 0
let startY = 0
let isHorizontalDrag: boolean | null = null
let hasDragged = false

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

function prevSlide() {
  const len = displayBanners.value.length
  if (len <= 1) return
  isTransitioning.value = true
  trackIndex.value--
  currentRealIndex.value = (currentRealIndex.value - 1 + len) % len
}

function nextSlide() {
  const len = displayBanners.value.length
  if (len <= 1) return
  isTransitioning.value = true
  trackIndex.value++
  currentRealIndex.value = (currentRealIndex.value + 1) % len
}

function goToSlide(idx: number) {
  const len = displayBanners.value.length
  if (len <= 1 || idx === currentRealIndex.value) return
  isTransitioning.value = true
  currentRealIndex.value = idx
  trackIndex.value = idx + CLONE_COUNT
}

function onTransitionEnd(e?: TransitionEvent) {
  if (e && e.target !== trackRef.value) return
  const len = displayBanners.value.length
  if (len <= 1) return

  // End boundary reached -> seamless jump to real head
  if (trackIndex.value >= len + CLONE_COUNT) {
    isTransitioning.value = false
    trackIndex.value = trackIndex.value - len
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitioning.value = true
      })
    })
  } else if (trackIndex.value < CLONE_COUNT) {
    // Start boundary reached -> seamless jump to real tail
    isTransitioning.value = false
    trackIndex.value = trackIndex.value + len
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitioning.value = true
      })
    })
  }
}

function handleSlideClick(itemIdx: number, banner: Banner) {
  if (hasDragged) return

  if (itemIdx === trackIndex.value) {
    if (banner && banner.link) {
      logAdClick(banner._id || banner.id)
      window.open(banner.link, '_blank', 'noopener,noreferrer')
    }
  } else if (itemIdx < trackIndex.value) {
    prevSlide()
  } else {
    nextSlide()
  }
}

function handleSingleClick() {
  const ad = displayBanners.value[0]
  if (ad && ad.link) {
    logAdClick(ad._id || ad.id)
    window.open(ad.link, '_blank', 'noopener,noreferrer')
  }
}

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (!isPaused.value && !isDragging.value && displayBanners.value.length > 1) {
      nextSlide()
    }
  }, 4500)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function pauseAutoplay() {
  isPaused.value = true
}

function resumeAutoplay() {
  isPaused.value = false
}

function onMouseLeave() {
  onPointerUp()
  resumeAutoplay()
}

// Unified Pointer & Touch Drag Handlers
function onPointerDown(e: MouseEvent | TouchEvent) {
  if (displayBanners.value.length <= 1) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  startX = clientX
  startY = clientY
  isDragging.value = true
  hasDragged = false
  isHorizontalDrag = null
  dragOffset.value = 0
  pauseAutoplay()
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const diffX = clientX - startX
  const diffY = clientY - startY

  if (isHorizontalDrag === null) {
    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      isHorizontalDrag = Math.abs(diffX) >= Math.abs(diffY)
    }
  }

  if (isHorizontalDrag) {
    if ('touches' in e && e.cancelable) {
      e.preventDefault()
    }
    hasDragged = true
    isTransitioning.value = false
    dragOffset.value = diffX
  }
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  isTransitioning.value = true

  const threshold = 50
  if (dragOffset.value < -threshold) {
    nextSlide()
  } else if (dragOffset.value > threshold) {
    prevSlide()
  }
  dragOffset.value = 0
  resumeAutoplay()
}
</script>

<style scoped>
.banner-container {
  --slide-width: 84%;
}

@media (min-width: 640px) {
  .banner-container {
    --slide-width: 76%;
  }
}

@media (min-width: 768px) {
  .banner-container {
    --slide-width: 72%;
  }
}
</style>
