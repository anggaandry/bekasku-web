<template>
  <div
    v-if="!loading && sellers && sellers.length > 0"
    class="relative overflow-hidden bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col h-full"
  >
    <!-- Background Watermark Logo BekasKu+ Transparent -->
    <img
      src="/images/bekasku_plus_variant_6.png"
      alt=""
      class="pointer-events-none absolute -right-6 -bottom-6 w-44 sm:w-56 h-auto opacity-[0.06] select-none -rotate-12 z-0"
      aria-hidden="true"
    />

    <!-- Section Heading Header with Official BekasKu+ Horizontal Brand Asset -->
    <div class="relative z-10 flex items-center justify-between min-h-[32px] sm:min-h-[36px] mb-3">
      <div class="flex items-center gap-2">
        <img
          src="/images/bekasku_plus_variant_6_horizontal.png"
          alt="BekasKu+"
          class="h-5 sm:h-5.5 w-auto object-contain"
        />
        <h3 class="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-outfit">
          {{ t('Creator & Influencer') }}
        </h3>
      </div>

      <div class="flex items-center gap-2">
        <!-- Navigation Arrows if items scrollable -->
        <div v-if="sellers.length > 2" class="flex items-center gap-1">
          <button
            type="button"
            class="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer"
            title="Sebelumnya"
            @click="scrollTrack('left')"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            class="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer"
            title="Selanjutnya"
            @click="scrollTrack('right')"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <NuxtLink
          to="/bekasku-plus"
          class="text-xs sm:text-sm font-semibold text-[#E31B23] hover:text-[#B91219] flex items-center gap-1 transition-colors"
        >
          <span>{{ t('Lihat semua') }}</span>
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Seller Cards List: Top Aligned, Horizontal Scroll 1 Row (ke samping 1 dan 2) -->
    <div
      ref="sellerScrollRef"
      class="relative z-10 flex items-center gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth scrollbar-none py-1 px-0.5 select-none"
    >
      <div
        v-for="seller in sellers"
        :key="seller.id || seller._id"
        class="bg-white rounded-xl border border-gray-200/80 p-3 flex flex-col items-center text-center justify-between shadow-2xs hover:shadow-md hover:border-red-200 transition-all duration-200 group w-[148px] sm:w-[155px] min-h-[168px] shrink-0"
      >
        <!-- Avatar with Gold Verified Badge -->
        <div class="relative w-[54px] h-[54px] flex items-center justify-center shrink-0 mb-1.5">
          <img
            :src="sanitizeAvatar(seller.avatar)"
            :alt="seller.name"
            class="w-full h-full object-cover rounded-full border border-gray-100 group-hover:scale-105 transition-transform"
            loading="lazy"
            @error="onAvatarError"
          />
          <span
            class="absolute -bottom-0.5 -right-0.5 bg-[#EBAD25] text-white p-0.5 rounded-full ring-2 ring-white shadow-xs"
            title="Verified Official Seller"
          >
            <Check class="w-2.5 h-2.5 stroke-[3]" />
          </span>
        </div>

        <!-- Seller Store Name -->
        <div class="flex items-center justify-center gap-1 w-full px-1">
          <span class="text-xs font-bold text-gray-900 truncate font-outfit">
            {{ seller.name }}
          </span>
        </div>

        <!-- Rating & Location -->
        <div class="flex items-center justify-center gap-1.5 text-[10.5px] text-gray-500 w-full truncate">
          <span class="flex items-center gap-0.5 text-gray-700 font-semibold font-outfit">
            <Star class="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
            {{ seller.rating ? Number(seller.rating).toFixed(1) : '5.0' }}
          </span>
          <span class="text-gray-300">·</span>
          <span class="truncate max-w-[65px]">
            {{ seller.city || seller.location || 'Medan' }}
          </span>
        </div>

        <!-- CTA Button "Kunjungi" (Primary Red Theme #E31B23) -->
        <NuxtLink
          :to="`/seller/${seller.id || seller._id}`"
          class="w-full mt-2 py-1 px-3 rounded-full border border-[#E31B23] text-[#E31B23] hover:bg-[#E31B23] hover:text-white text-xs font-bold font-outfit transition-colors text-center shadow-2xs"
        >
          {{ t('Kunjungi') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, ChevronLeft, Check, Star } from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'
import { useLocale } from '~/composables/useLocale'
import type { BekaskuPlusSeller } from '~/types/seller'

const { t } = useLocale()

defineProps<{
  sellers: BekaskuPlusSeller[]
  loading?: boolean
}>()

const sellerScrollRef = ref<HTMLElement | null>(null)

function scrollTrack(direction: 'left' | 'right') {
  if (!sellerScrollRef.value) return
  const amount = direction === 'left' ? -200 : 200
  sellerScrollRef.value.scrollBy({ left: amount, behavior: 'smooth' })
}

function sanitizeAvatar(url?: string): string {
  return sanitizeMediaUrl(url, '/images/mascot.png')
}

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = '/images/mascot.png'
  }
}
</script>
