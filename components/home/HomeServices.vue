<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
    <!-- ── SISI KIRI: JASA & LOWONGAN KERJA ───────────────────────────── -->
    <div class="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <!-- Section Header (Clean: Title + See All + Arrows) -->
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <h3 class="font-outfit font-black text-gray-900 text-sm sm:text-base tracking-tight uppercase">
            JASA &amp; LOWONGAN KERJA
          </h3>

          <!-- Controls: See All & Scroll Arrows -->
          <div class="flex items-center gap-1.5 shrink-0">
            <NuxtLink
              to="/search?type=6&newest=1"
              class="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-0.5 mr-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </NuxtLink>

            <button
              type="button"
              class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              :disabled="loading || serviceList.length === 0"
              @click="scrollTrack(serviceScrollRef, 'left')"
              aria-label="Scroll Kiri Jasa"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              :disabled="loading || serviceList.length === 0"
              @click="scrollTrack(serviceScrollRef, 'right')"
              aria-label="Scroll Kanan Jasa"
            >
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Horizontal Scroll Track -->
        <div
          ref="serviceScrollRef"
          class="flex gap-3 overflow-x-auto scrollbar-none scroll-smooth pt-3.5 pb-1 select-none"
        >
          <!-- Shimmer Loading (Matching mobile_v3 ShimmerProductCard) -->
          <template v-if="loading">
            <div
              v-for="n in 4"
              :key="`srv-shim-${n}`"
              class="w-[145px] sm:w-[155px] shrink-0 rounded-xl border border-gray-100 p-2 space-y-2 animate-shimmer"
            >
              <div class="w-full aspect-square rounded-lg bg-gray-200" />
              <div class="h-3.5 bg-gray-200 rounded w-2/3" />
              <div class="h-3 bg-gray-200 rounded w-full" />
              <div class="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          </template>

          <!-- Empty State -->
          <div
            v-else-if="serviceList.length === 0"
            class="w-full py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center"
          >
            <p>Belum ada jasa &amp; lowongan kerja aktif</p>
          </div>

          <!-- Real Service Items (Clean without badge clutter) -->
          <div
            v-for="service in serviceList"
            v-else
            :key="service.id || service._id"
            class="group w-[145px] sm:w-[155px] shrink-0 bg-white rounded-xl border border-gray-200/90 overflow-hidden hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            @click="handleNavigate(service)"
          >
            <!-- Clean Image (No Badge Overlays) -->
            <div class="relative w-full aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
              <img
                v-if="service.image"
                :src="service.image"
                :alt="service.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <ImageIcon class="w-6 h-6 text-gray-300" />
              </div>
            </div>

            <!-- Details -->
            <div class="p-2 flex-1 flex flex-col justify-between">
              <div>
                <!-- Price / Rate -->
                <div class="font-outfit text-[13px] sm:text-[14px] font-black text-[#2563EB] leading-tight">
                  {{ formatPrice(service.price) }}
                </div>

                <!-- Title -->
                <h4 class="font-outfit text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mt-1 group-hover:text-[#2563EB] transition-colors">
                  {{ service.title }}
                </h4>
              </div>

              <!-- Location / City -->
              <div class="flex items-center gap-1 text-[10.5px] text-gray-500 font-medium mt-2 pt-1 border-t border-gray-100">
                <MapPin class="w-3 h-3 text-gray-400 shrink-0" />
                <span class="truncate">{{ service.city || 'Indonesia' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── SISI KANAN: BARANG DIBUTUHKAN ───────────────────────────── -->
    <div class="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <!-- Section Header (Clean: Title + See All + Arrows) -->
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <h3 class="font-outfit font-black text-gray-900 text-sm sm:text-base tracking-tight uppercase">
            BARANG DIBUTUHKAN
          </h3>

          <!-- Controls: See All & Scroll Arrows -->
          <div class="flex items-center gap-1.5 shrink-0">
            <NuxtLink
              to="/search?type=4"
              class="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-0.5 mr-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </NuxtLink>

            <button
              type="button"
              class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              :disabled="loading || neededList.length === 0"
              @click="scrollTrack(neededScrollRef, 'left')"
              aria-label="Scroll Kiri Barang Dibutuhkan"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              :disabled="loading || neededList.length === 0"
              @click="scrollTrack(neededScrollRef, 'right')"
              aria-label="Scroll Kanan Barang Dibutuhkan"
            >
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Horizontal Scroll Track -->
        <div
          ref="neededScrollRef"
          class="flex gap-3 overflow-x-auto scrollbar-none scroll-smooth pt-3.5 pb-1 select-none"
        >
          <!-- Shimmer Loading (Matching mobile_v3 ShimmerProductCard) -->
          <template v-if="loading">
            <div
              v-for="n in 4"
              :key="`need-shim-${n}`"
              class="w-[145px] sm:w-[155px] shrink-0 rounded-xl border border-gray-100 p-2 space-y-2 animate-shimmer"
            >
              <div class="w-full aspect-square rounded-lg bg-gray-200" />
              <div class="h-3.5 bg-gray-200 rounded w-2/3" />
              <div class="h-3 bg-gray-200 rounded w-full" />
              <div class="h-2.5 bg-gray-100 rounded w-1/2" />
            </div>
          </template>

          <!-- Empty State -->
          <div
            v-else-if="neededList.length === 0"
            class="w-full py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center"
          >
            <p>Belum ada permintaan barang dibutuhkan aktif</p>
          </div>

          <!-- Real Needed Items (Clean without badge clutter) -->
          <div
            v-for="item in neededList"
            v-else
            :key="item.id || item._id"
            class="group w-[145px] sm:w-[155px] shrink-0 bg-white rounded-xl border border-gray-200/90 overflow-hidden hover:border-[#EBAD25]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            @click="handleNavigate(item)"
          >
            <!-- Clean Image (No Badge Overlays) -->
            <div class="relative w-full aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <ImageIcon class="w-6 h-6 text-gray-300" />
              </div>
            </div>

            <!-- Details -->
            <div class="p-2 flex-1 flex flex-col justify-between">
              <div>
                <!-- Budget / Price -->
                <div class="font-outfit text-[13px] sm:text-[14px] font-black text-[#2563EB] leading-tight">
                  {{ item.price > 0 ? formatPrice(item.price) : 'Budget Negosiasi' }}
                </div>

                <!-- Title -->
                <h4 class="font-outfit text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mt-1 group-hover:text-[#2563EB] transition-colors">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Location / City -->
              <div class="flex items-center gap-1 text-[10.5px] text-gray-500 font-medium mt-2 pt-1 border-t border-gray-100">
                <MapPin class="w-3 h-3 text-gray-400 shrink-0" />
                <span class="truncate">{{ item.city || 'Indonesia' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'
import { useFormat } from '~/composables/useFormat'

interface Props {
  services?: Product[]
  needed?: Product[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  services: () => [],
  needed: () => [],
  loading: false,
})

const { formatPrice } = useFormat()

const serviceList = computed(() => props.services || [])
const neededList = computed(() => props.needed || [])

const serviceScrollRef = ref<HTMLElement | null>(null)
const neededScrollRef = ref<HTMLElement | null>(null)

function scrollTrack(el: HTMLElement | null, direction: 'left' | 'right') {
  if (!el) return
  const distance = 320
  el.scrollBy({
    left: direction === 'left' ? -distance : distance,
    behavior: 'smooth',
  })
}

function handleNavigate(item: Product) {
  const id = item.id || item._id
  if (id) {
    navigateTo(`/product/${id}`)
  }
}
</script>
