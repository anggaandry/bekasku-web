<template>
  <div class="space-y-3 flex flex-col">
    <!-- Section Heading Header (Bekasku+ Creator & Influencer | Arrows | Lihat semua) -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <img
          src="/images/bekasku_plus_variant_6_horizontal.png"
          alt="BekasKu+"
          class="h-5 object-contain"
        />
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 tracking-tight font-outfit">
          Creator &amp; Influencer
        </h3>
      </div>

      <div class="flex items-center gap-2">
        <!-- Navigation Arrows if more than 4 items -->
        <div v-if="displaySellers.length > 4" class="flex items-center gap-1">
          <button
            type="button"
            class="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!canScrollLeft"
            title="Sebelumnya"
            @click="scrollPrev"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            class="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!canScrollRight"
            title="Selanjutnya"
            @click="scrollNext"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <NuxtLink
          to="/seller"
          class="text-xs sm:text-sm font-medium text-[#2563EB] hover:underline transition-colors"
        >
          Lihat semua
        </NuxtLink>
      </div>
    </div>

    <!-- Seller Cards List (matches Flutter bekasku_v3: no giant white wrapper, height 162px, card width 148px) -->
    <div
      ref="sellerScrollRef"
      class="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth no-scrollbar py-0.5 select-none"
      @scroll="handleScroll"
    >
      <!-- Shimmer Loading Skeletons matching Mobile V3 -->
      <template v-if="loading">
        <div
          v-for="n in 2"
          :key="`seller-skel-${n}`"
          class="bg-white rounded-xl border border-gray-100 p-2.5 flex flex-col items-center text-center justify-between shadow-2xs w-[148px] h-[162px] shrink-0 animate-shimmer"
        >
          <div class="w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-full bg-gray-200" />
          <div class="w-20 h-3.5 bg-gray-200 rounded" />
          <div class="w-16 h-2.5 bg-gray-100 rounded" />
          <div class="w-full h-6 bg-gray-200 rounded-lg" />
        </div>
      </template>

      <template v-else>
        <div
          v-for="seller in displaySellers"
          :key="seller.id"
          class="bg-white rounded-xl border border-[#EEEEEE] p-2.5 flex flex-col items-center text-center justify-between shadow-2xs hover:shadow-md transition-all duration-200 group w-[148px] h-[162px] shrink-0"
        >
        <!-- Avatar with Gold Verified Badge (matches Flutter 60px circle + gold badge #EBAD25) -->
        <div class="relative w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] flex items-center justify-center shrink-0">
          <div class="w-full h-full rounded-full overflow-hidden bg-[#F3F4F6] border border-gray-100 shadow-2xs">
            <img
              :src="seller.avatar"
              :alt="seller.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              @error="onAvatarError($event)"
            />
          </div>

          <!-- Gold Verified Badge (matches Flutter #EBAD25) -->
          <div
            class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#EBAD25] flex items-center justify-center ring-1.5 ring-white text-white shadow-2xs"
            title="Verified Creator"
          >
            <Check class="w-2 h-2 text-white stroke-[3.5]" />
          </div>
        </div>

        <!-- Store Name (font-outfit bold 14px) -->
        <h4 class="font-outfit font-bold text-xs sm:text-[13px] text-gray-900 truncate w-full text-center mt-1">
          {{ seller.name }}
        </h4>

        <!-- Rating & Location (Star #F59E0B + rating + dot + pin + city) -->
        <div class="flex items-center justify-center gap-1 text-[10px] text-gray-500 w-full">
          <Star class="w-2.5 h-2.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
          <span class="font-outfit font-semibold text-gray-700">
            {{ seller.rating.toFixed(1) }}
          </span>
          <span class="text-[#9CA3AF] text-[8px] mx-0.5">•</span>
          <MapPin class="w-2.5 h-2.5 text-gray-500 shrink-0" />
          <span class="truncate max-w-[65px] font-outfit text-gray-500">
            {{ seller.city }}
          </span>
        </div>

        <!-- "Kunjungi" Button (matches Flutter Outlined Button with Royal Blue #2563EB) -->
        <NuxtLink
          :to="`/seller/${seller.id}`"
          class="w-full py-1 px-2 border border-[#2563EB] bg-white hover:bg-blue-50/80 text-[#2563EB] font-outfit font-bold text-[11px] sm:text-[11.5px] rounded-md transition-colors text-center block cursor-pointer"
        >
          Kunjungi
        </NuxtLink>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Creator } from '~/composables/useCreators'

interface Props {
  creators?: Creator[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  creators: () => [],
  loading: false,
})

const { creators: defaultCreators, fetchCreators } = useCreators()

onMounted(async () => {
  if (!props.creators || props.creators.length === 0) {
    await fetchCreators()
  }
  nextTick(() => {
    handleScroll()
  })
})

const displaySellers = computed(() => {
  const source = (props.creators && props.creators.length > 0)
    ? props.creators
    : defaultCreators.value

  return source.map((c) => ({
    id: c.id || c._id || '',
    name: c.name || c.store_name || 'anne14',
    avatar: c.avatar || 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-175967555011556755.png',
    city: c.city || 'Medan',
    rating: typeof c.rating === 'number' ? c.rating : 5.0,
  }))
})

// Scroll Navigation
const sellerScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function handleScroll() {
  const el = sellerScrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 6
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 6
}

function scrollNext() {
  const el = sellerScrollRef.value
  if (!el) return
  el.scrollBy({ left: el.clientWidth * 0.9, behavior: 'smooth' })
}

function scrollPrev() {
  const el = sellerScrollRef.value
  if (!el) return
  el.scrollBy({ left: -el.clientWidth * 0.9, behavior: 'smooth' })
}

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-175967555011556755.png'
  }
}
</script>



