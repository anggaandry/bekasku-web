<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-vue-next'

const props = defineProps<{
  images: string[]
  title?: string
  allowAnalytics?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-analytics'): void
}>()

const activeIndex = ref(0)
const isLightboxOpen = ref(false)

// Zoom & Pan state for Photo Viewer
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

function prevImage() {
  if (props.images.length <= 1) return
  activeIndex.value = activeIndex.value === 0 ? props.images.length - 1 : activeIndex.value - 1
  resetZoom()
}

function nextImage() {
  if (props.images.length <= 1) return
  activeIndex.value = activeIndex.value === props.images.length - 1 ? 0 : activeIndex.value + 1
  resetZoom()
}

function selectImage(index: number) {
  activeIndex.value = index
}

function openLightbox() {
  resetZoom()
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
  resetZoom()
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.5, 4)
}

function zoomOut() {
  if (scale.value > 1) {
    scale.value = Math.max(scale.value - 0.5, 1)
    if (scale.value === 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }
}

function resetZoom() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function handleWheel(e: WheelEvent) {
  if (!isLightboxOpen.value) return
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

function startDrag(e: MouseEvent) {
  if (scale.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - translateX.value, y: e.clientY - translateY.value }
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || scale.value <= 1) return
  translateX.value = e.clientX - dragStart.value.x
  translateY.value = e.clientY - dragStart.value.y
}

function endDrag() {
  isDragging.value = false
}

function onKeyDown(e: KeyboardEvent) {
  if (!isLightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === '+' || e.key === '=') zoomIn()
  if (e.key === '-') zoomOut()
  if (e.key === '0') resetZoom()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="relative w-full select-none">
    <!-- Main Image Frame -->
    <div class="relative w-full aspect-square sm:aspect-4/3 md:aspect-square bg-surface-2 md:rounded-2xl overflow-hidden md:border md:border-border/60 group">
      <img
        v-if="images.length > 0"
        :src="images[activeIndex]"
        :alt="title || 'Foto Produk'"
        class="w-full h-full object-cover sm:object-contain transition-all duration-300 cursor-zoom-in"
        loading="eager"
        fetchpriority="high"
        @click="openLightbox"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-text-muted text-sm">
        Tidak ada foto
      </div>

      <!-- Arrow Buttons -->
      <button
        v-if="images.length > 1"
        type="button"
        @click.stop="prevImage"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 cursor-pointer"
        aria-label="Foto Sebelumnya"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        v-if="images.length > 1"
        type="button"
        @click.stop="nextImage"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 cursor-pointer"
        aria-label="Foto Selanjutnya"
      >
        <ChevronRight class="w-5 h-5" />
      </button>

      <!-- Expand / Lightbox Trigger Button -->
      <button
        v-if="images.length > 0"
        type="button"
        @click.stop="openLightbox"
        class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 cursor-pointer"
        aria-label="Perbesar Foto"
      >
        <Maximize2 class="w-4 h-4" />
      </button>

      <!-- AI Analytics Floating Button -->
      <button
        v-if="allowAnalytics"
        type="button"
        @click.stop="emit('open-analytics')"
        class="absolute left-4 bottom-4 px-2.5 py-1 rounded-xl bg-gradient-to-br from-amber-400/90 to-purple-500/90 hover:opacity-95 text-white font-outfit font-semibold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-opacity"
      >
        <Sparkles class="w-4 h-4 text-white" />
        <span class="text-white">Analisa</span>
      </button>

      <!-- Counter Pill -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-3.5 right-4 px-2.5 py-0.5 rounded-full bg-white/90 border border-border-light text-text text-xs font-medium tracking-wide shadow-2xs"
      >
        {{ activeIndex + 1 }}/{{ images.length }}
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div
      v-if="images.length > 1"
      class="flex items-center gap-2.5 mt-3 px-4 md:px-0 overflow-x-auto pb-1 scrollbar-thin"
    >
      <button
        v-for="(img, idx) in images"
        :key="idx"
        type="button"
        @click="selectImage(idx)"
        class="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer"
        :class="activeIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-border/60 opacity-70 hover:opacity-100'"
        :aria-label="`Pilih Foto ${idx + 1}`"
      >
        <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" />
      </button>
    </div>

    <!-- Interactive Lightbox & Photo Zoom Viewer -->
    <Teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 select-none overflow-hidden"
        @click="closeLightbox"
        @wheel="handleWheel"
      >
        <!-- Top Toolbar -->
        <div class="relative z-10 flex items-center justify-between gap-3 text-white py-2 px-2 sm:px-4" @click.stop>
          <div class="flex items-center gap-1.5 sm:gap-2 font-outfit text-xs sm:text-sm min-w-0 flex-1 overflow-hidden">
            <span class="font-semibold truncate whitespace-nowrap" :title="title || 'Foto Produk'">{{ title || 'Foto Produk' }}</span>
            <span v-if="images.length > 1" class="text-white/60 shrink-0 text-[11px] sm:text-xs whitespace-nowrap">({{ activeIndex + 1 }}/{{ images.length }})</span>
          </div>

          <!-- Controls: Zoom In, Zoom Out, Reset, Close -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              @click="zoomOut"
              :disabled="scale <= 1"
              class="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-white"
              title="Perkecil (-)"
            >
              <ZoomOut class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span class="text-[11px] sm:text-xs font-mono w-10 sm:w-12 text-center text-white/80">
              {{ Math.round(scale * 100) }}%
            </span>
            <button
              type="button"
              @click="zoomIn"
              :disabled="scale >= 4"
              class="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-white"
              title="Perbesar (+)"
            >
              <ZoomIn class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              @click="resetZoom"
              class="hidden sm:flex p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
              title="Reset Zoom (0)"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="closeLightbox"
              class="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-primary text-white transition-colors cursor-pointer ml-1 sm:ml-2"
              title="Tutup (Esc)"
            >
              <X class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <!-- Center Image Viewport with Drag & Zoom -->
        <div
          class="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
          :class="scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @click.stop
        >
          <img
            :src="images[activeIndex]"
            :alt="title || 'Fullscreen Preview'"
            class="max-w-full max-h-[82vh] object-contain transition-transform duration-75 origin-center pointer-events-none select-none rounded-lg"
            :style="{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            }"
            draggable="false"
          />

          <!-- Left / Right Carousel in Viewer -->
          <button
            v-if="images.length > 1 && scale === 1"
            type="button"
            @click.stop="prevImage"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Sebelumnya"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button
            v-if="images.length > 1 && scale === 1"
            type="button"
            @click.stop="nextImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Selanjutnya"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>

        <!-- Bottom Thumbnails in Viewer -->
        <div
          v-if="images.length > 1"
          class="relative z-10 flex items-center justify-center gap-2 py-2 overflow-x-auto"
          @click.stop
        >
          <button
            v-for="(img, idx) in images"
            :key="idx"
            type="button"
            @click="selectImage(idx); resetZoom()"
            class="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0"
            :class="activeIndex === idx ? 'border-primary ring-2 ring-primary/40 scale-105' : 'border-white/30 opacity-60 hover:opacity-100'"
          >
            <img :src="img" :alt="`Thumb ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
