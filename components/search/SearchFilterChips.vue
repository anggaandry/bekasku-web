<template>
  <div class="w-full bg-white border-b-2 border-border py-2 flex items-center justify-between gap-2">
    <!-- Left Scrollable Quick Filter Pills -->
    <div class="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none px-4">
      <!-- 1. Best Deal -->
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full text-xs font-outfit whitespace-nowrap border transition-colors cursor-pointer shrink-0"
        :class="
          isBestDeal
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2 text-text border-border hover:border-text-subtle font-normal'
        "
        @click="emit('toggleBestDeal')"
      >
        Best Deal
      </button>

      <!-- 2. Instan -->
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full text-xs font-outfit whitespace-nowrap border transition-colors cursor-pointer shrink-0"
        :class="
          isInstant
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2 text-text border-border hover:border-text-subtle font-normal'
        "
        @click="emit('toggleInstant')"
      >
        Instan
      </button>

      <!-- 3. Rating 4 ke atas -->
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full text-xs font-outfit whitespace-nowrap border transition-colors cursor-pointer shrink-0"
        :class="
          isRating4Up
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2 text-text border-border hover:border-text-subtle font-normal'
        "
        @click="emit('toggleRating4')"
      >
        Rating 4 ke atas
      </button>

      <!-- 4. Lokasi -->
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full text-xs font-outfit whitespace-nowrap border transition-colors cursor-pointer shrink-0"
        :class="
          hasLocationFilter
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2 text-text border-border hover:border-text-subtle font-normal'
        "
        @click="emit('openLocation')"
      >
        {{ locationLabel }}
      </button>
    </div>

    <!-- Right Fixed Action Buttons: Filter (SlidersHorizontal) & Sort (Filter/Funnel) -->
    <div class="flex items-center gap-2 pr-4 pl-1 bg-white shrink-0">
      <button
        type="button"
        class="w-[34px] h-[34px] rounded-lg bg-surface-2 hover:bg-border flex items-center justify-center text-text transition-colors cursor-pointer relative"
        title="Filter Pencarian"
        aria-label="Filter Pencarian"
        @click="emit('openFilter')"
      >
        <SlidersHorizontal class="w-[18px] h-[18px]" />
        <span
          v-if="activeFilterCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center"
        >
          {{ activeFilterCount }}
        </span>
      </button>

      <button
        type="button"
        class="w-[34px] h-[34px] rounded-lg bg-surface-2 hover:bg-border flex items-center justify-center text-text transition-colors cursor-pointer relative"
        title="Urutkan Hasil"
        aria-label="Urutkan Hasil"
        @click="emit('openSort')"
      >
        <Funnel class="w-[18px] h-[18px]" />
        <span
          v-if="hasCustomSort"
          class="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SlidersHorizontal, Funnel } from 'lucide-vue-next'
import type { SearchFilters } from '~/types/search'
import { SEARCH_TYPE_BEST_DEAL } from '~/utils/constants'

const props = defineProps<{
  filters: SearchFilters
}>()

const emit = defineEmits<{
  toggleBestDeal: []
  toggleInstant: []
  toggleRating4: []
  openLocation: []
  openFilter: []
  openSort: []
}>()

const isBestDeal = computed(() => props.filters.type === SEARCH_TYPE_BEST_DEAL)
const isInstant = computed(() => props.filters.freeOngkir === 1)
const isRating4Up = computed(() => (props.filters.rating || 0) >= 4)

const hasLocationFilter = computed(() => {
  return Boolean(
    props.filters.provinceName ||
    props.filters.locationId ||
    props.filters.city ||
    (props.filters.cities && props.filters.cities.length > 0)
  )
})

const locationLabel = computed(() => {
  if (props.filters.provinceName) return props.filters.provinceName
  if (props.filters.cities && props.filters.cities.length > 0) return props.filters.cities[0]
  if (props.filters.city) return props.filters.city
  return 'Lokasi'
})

const hasCustomSort = computed(() => {
  return Boolean(
    props.filters.newest === 1 ||
    props.filters.cheapest === 1 ||
    props.filters.mostExpensive === 1
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.filters.freeOngkir === 1) count++
  if (props.filters.trusted === 1) count++
  if (props.filters.verified === 1) count++
  if (props.filters.vip === 1) count++
  if (props.filters.needed === 1) count++
  if ((props.filters.rating || 0) > 0) count++
  if ((props.filters.minPrice || 0) > 0 || (props.filters.maxPrice || 0) > 0) count++
  if (props.filters.categoryId || props.filters.categoryName) count++
  if (hasLocationFilter.value) count++
  return count
})
</script>

