<template>
  <div
    v-if="!loading && products && products.length > 0"
    class="relative overflow-hidden bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3 flex flex-col h-full justify-between"
  >
    <!-- Background Watermark Logo BekasKu Red Transparent -->
    <img
      src="/icon_only.png"
      alt=""
      class="pointer-events-none absolute -right-6 -bottom-6 w-36 sm:w-44 h-auto opacity-[0.06] select-none -rotate-12 z-0"
      aria-hidden="true"
    />

    <!-- Header Row -->
    <div class="relative z-10 flex items-center justify-between min-h-[32px] sm:min-h-[36px]">
      <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <h3 class="text-base sm:text-lg font-black text-gray-900 tracking-tight font-outfit">
          Best Deal
        </h3>

        <!-- Countdown Timer -->
        <ClientOnly>
          <div class="bg-[#E31B23] text-white text-xs font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs tracking-wider">
            <span>{{ formatDigit(hours) }}</span>
            <span class="text-white/80">:</span>
            <span>{{ formatDigit(minutes) }}</span>
            <span class="text-white/80">:</span>
            <span>{{ formatDigit(seconds) }}</span>
          </div>
          <template #fallback>
            <div class="bg-[#E31B23] text-white text-xs font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs tracking-wider">
              <span>00</span>
              <span class="text-white/80">:</span>
              <span>00</span>
              <span class="text-white/80">:</span>
              <span>00</span>
            </div>
          </template>
        </ClientOnly>
      </div>

      <NuxtLink
        to="/product/search?type=2"
        class="text-xs sm:text-sm font-semibold text-[#E31B23] hover:text-[#B91219] flex items-center gap-1 transition-colors"
      >
        <span>{{ t('Lihat semua') }}</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Product Slider / Horizontal Scroll -->
    <div class="relative z-10 group/bd select-none">
      <div
        ref="bdScrollRef"
        class="flex gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth scrollbar-none py-1 px-0.5 snap-x snap-mandatory"
      >
        <div
          v-for="item in products"
          :key="item.id || item._id"
          class="snap-start shrink-0 w-40 sm:w-44 md:w-48"
        >
          <AppProductCard :product="item" />
        </div>
      </div>

      <!-- Navigasi Panah Kiri/Kanan Desktop -->
      <button
        v-if="canScrollLeft"
        type="button"
        class="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-700 hover:text-[#E31B23] z-10 transition-colors"
        aria-label="Scroll kiri"
        @click="scroll('left')"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        v-if="canScrollRight"
        type="button"
        class="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-700 hover:text-[#E31B23] z-10 transition-colors"
        aria-label="Scroll kanan"
        @click="scroll('right')"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
  </div>

  <!-- Empty State Illustration Card -->
  <div
    v-else-if="!loading"
    class="relative overflow-hidden bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3 flex flex-col h-full justify-between"
  >
    <!-- Background Watermark Logo BekasKu Red Transparent -->
    <img
      src="/icon_only.png"
      alt=""
      class="pointer-events-none absolute -right-6 -bottom-6 w-36 sm:w-44 h-auto opacity-[0.06] select-none -rotate-12 z-0"
      aria-hidden="true"
    />

    <div class="relative z-10 flex items-center justify-between min-h-[32px] sm:min-h-[36px]">
      <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <h3 class="text-base sm:text-lg font-black text-gray-900 tracking-tight font-outfit">
          Best Deal
        </h3>
        <div class="bg-[#E31B23] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
          {{ t('Nantikan Segera') }}
        </div>
      </div>

      <NuxtLink
        to="/product/search?type=1"
        class="text-xs sm:text-sm font-semibold text-[#E31B23] hover:text-[#B91219] flex items-center gap-1 transition-colors"
      >
        <span>{{ t('Lihat semua produk') }}</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center shadow-2xs">
      <div class="w-20 h-20 mb-3 flex items-center justify-center">
        <img src="/images/discounttag.png" alt="Best Deal Segera Hadir" class="max-w-full max-h-full object-contain" />
      </div>
      <h4 class="font-outfit font-bold text-gray-900 text-sm sm:text-base">
        {{ t('Best Deal Sedang Disiapkan') }}
      </h4>
      <p class="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
        {{ t('Flash sale diskon spesial sedang dikurasi oleh tim BekasKu. Jangan lewatkan penawaran berikutnya!') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, ChevronLeft } from 'lucide-vue-next'
import type { ProductCard } from '~/types/product'
import { useLocale } from '~/composables/useLocale'
import AppProductCard from '~/components/shared/AppProductCard.vue'

const { t } = useLocale()

const props = withDefaults(
  defineProps<{
    products: ProductCard[]
    loading?: boolean
    bdTime?: string | number
  }>(),
  {
    loading: false,
    bdTime: 0,
  }
)

const bdScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function scroll(direction: 'left' | 'right') {
  if (!bdScrollRef.value) return
  const amount = direction === 'left' ? -300 : 300
  bdScrollRef.value.scrollBy({ left: amount, behavior: 'smooth' })
}

// Countdown timer dari bdTime (detik sisa dari API) atau default
const hours = ref(8)
const minutes = ref(38)
const seconds = ref(11)

function syncFromBdTime(rawVal?: string | number) {
  const totalSec = Number(rawVal)
  if (!isNaN(totalSec) && totalSec > 0) {
    hours.value = Math.floor(totalSec / 3600)
    minutes.value = Math.floor((totalSec % 3600) / 60)
    seconds.value = Math.floor(totalSec % 60)
  }
}

watch(
  () => props.bdTime,
  (val) => {
    syncFromBdTime(val)
  },
  { immediate: true }
)

let timerInterval: any = null

onMounted(() => {
  syncFromBdTime(props.bdTime)
  // Hitung mundur tiap detik
  timerInterval = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--
    } else if (minutes.value > 0) {
      minutes.value--
      seconds.value = 59
    } else if (hours.value > 0) {
      hours.value--
      minutes.value = 59
      seconds.value = 59
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function formatDigit(val: number): string {
  return val < 10 ? `0${val}` : `${val}`
}
</script>
