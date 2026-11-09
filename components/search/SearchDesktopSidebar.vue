<template>
  <aside class="bg-white rounded-2xl border border-border p-4 space-y-5 sticky top-24">
    <!-- 0. Tab Switcher: Produk | Toko (Desktop Left Sidebar) -->
    <div>
      <h2 class="font-outfit font-bold text-xs uppercase tracking-wider text-text-muted mb-2.5">
        Tampilkan Hasil
      </h2>
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface-2 border border-border">
        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-outfit text-xs transition-all cursor-pointer"
          :class="
            activeTab === 'product'
              ? 'bg-primary text-white font-bold shadow-2xs'
              : 'text-text-muted hover:text-text font-medium'
          "
          @click="emit('changeTab', 'product')"
        >
          <Package class="w-3.5 h-3.5 shrink-0" />
          <span>Produk</span>
        </button>

        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-outfit text-xs transition-all cursor-pointer"
          :class="
            activeTab === 'store'
              ? 'bg-primary text-white font-bold shadow-2xs'
              : 'text-text-muted hover:text-text font-medium'
          "
          @click="emit('changeTab', 'store')"
        >
          <Store class="w-3.5 h-3.5 shrink-0" />
          <span>Toko</span>
        </button>
      </div>
    </div>

    <!-- 1. Kategori Dropdown (Directly below Tampilkan Hasil) -->
    <div class="relative">
      <h3 class="font-outfit font-bold text-xs uppercase tracking-wider text-text-muted mb-2">
        Kategori
      </h3>
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border transition-colors font-outfit text-xs cursor-pointer text-left"
        :class="
          filters.categoryName || filters.categoryId
            ? 'bg-primary/8 border-primary text-primary font-bold'
            : 'bg-surface-2 hover:bg-border/60 border-border text-text font-medium'
        "
        @click.stop="isCategoryDropdownOpen = !isCategoryDropdownOpen"
      >
        <div class="flex items-center gap-2 min-w-0">
          <LayoutGrid
            class="w-3.5 h-3.5 shrink-0"
            :class="filters.categoryName || filters.categoryId ? 'text-primary' : 'text-text-muted'"
          />
          <span class="truncate">{{ activeCategoryLabel }}</span>
        </div>
        <ChevronDown
          class="w-4 h-4 shrink-0 transition-transform duration-200"
          :class="[
            filters.categoryName || filters.categoryId ? 'text-primary' : 'text-text-muted',
            isCategoryDropdownOpen ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Dropdown Menu Semua Kategori -->
      <div
        v-if="isCategoryDropdownOpen"
        class="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-border p-1.5 z-50 max-h-72 overflow-y-auto"
        @click.stop
      >
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-outfit text-xs transition-colors text-left cursor-pointer"
          :class="
            !filters.categoryName && !filters.categoryId
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-text hover:bg-surface-2 font-medium'
          "
          @click="selectCategoryItem(null)"
        >
          <span>Semua Kategori</span>
          <Check v-if="!filters.categoryName && !filters.categoryId" class="w-3.5 h-3.5 text-primary shrink-0" />
        </button>

        <div class="h-px bg-border my-1" />

        <button
          v-for="cat in sortedCategories"
          :key="cat.id || cat._id || cat.name"
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg font-outfit text-xs transition-colors text-left cursor-pointer"
          :class="
            isCategorySelected(cat)
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-text hover:bg-surface-2 font-normal'
          "
          @click="selectCategoryItem(cat)"
        >
          <span class="truncate pr-2">{{ cat.name }}</span>
          <Check v-if="isCategorySelected(cat)" class="w-3.5 h-3.5 text-primary shrink-0" />
        </button>
      </div>
    </div>

    <!-- Header Filter & Sort -->
    <div class="flex items-center justify-between border-y border-border py-3">
      <div class="flex items-center gap-1.5">
        <SlidersHorizontal class="w-4 h-4 text-primary shrink-0" />
        <h2 class="font-outfit font-bold text-base text-text">
          Filter &amp; Urutkan
        </h2>
      </div>
      <button
        type="button"
        class="font-outfit font-semibold text-xs text-primary hover:text-primary-dark cursor-pointer"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>

    <!-- 1. Urutkan (Sort Options matching _SortSheet in search_results_view.dart) -->
    <div v-if="activeTab === 'product'">
      <h3 class="font-outfit font-bold text-sm text-text mb-2.5">
        Urutkan
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="opt in sortOptions"
          :key="opt.key"
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            activeSortKey === opt.key
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="selectSort(opt.key)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 2. Lokasi -->
    <div>
      <div class="flex items-center justify-between mb-2.5">
        <h3 class="font-outfit font-bold text-sm text-text">
          Lokasi
        </h3>
        <button
          type="button"
          class="font-outfit font-semibold text-xs text-primary hover:text-primary-dark cursor-pointer"
          @click="emit('openLocationSelector')"
        >
          Lihat Semua
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="loc in locationChips"
          :key="loc"
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            isLocationActive(loc)
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="toggleLocation(loc)"
        >
          {{ loc }}
        </button>
      </div>
    </div>

    <!-- 2. Layanan & Promosi -->
    <div>
      <h3 class="font-outfit font-bold text-sm text-text mb-2.5">
        Layanan &amp; Promosi
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.type === SEARCH_TYPE_BEST_DEAL
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { type: filters.type === SEARCH_TYPE_BEST_DEAL ? SEARCH_TYPE_REGULAR : SEARCH_TYPE_BEST_DEAL })"
        >
          Best Deal
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.freeOngkir === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { freeOngkir: filters.freeOngkir === 1 ? 0 : 1 })"
        >
          Gratis Ongkir
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.trusted === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { trusted: filters.trusted === 1 ? 0 : 1 })"
        >
          Trusted
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.needed === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { needed: filters.needed === 1 ? 0 : 1 })"
        >
          Dibutuhkan
        </button>
      </div>
    </div>

    <!-- 3. Jenis Toko -->
    <div>
      <h3 class="font-outfit font-bold text-sm text-text mb-2.5">
        Jenis Toko
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.trusted === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { trusted: filters.trusted === 1 ? 0 : 1 })"
        >
          Trusted
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.type === SEARCH_TYPE_BEKASKU_PLUS
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { type: filters.type === SEARCH_TYPE_BEKASKU_PLUS ? SEARCH_TYPE_REGULAR : SEARCH_TYPE_BEKASKU_PLUS })"
        >
          BekasKu+
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.vip === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { vip: filters.vip === 1 ? 0 : 1 })"
        >
          VIP
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.verified === 1
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { verified: filters.verified === 1 ? 0 : 1 })"
        >
          Verified
        </button>
      </div>
    </div>

    <!-- 4. Harga -->
    <div>
      <h3 class="font-outfit font-bold text-sm text-text mb-2.5">
        Harga
      </h3>
      <div class="space-y-2">
        <div class="h-10 rounded-xl border border-border-light bg-white flex items-center overflow-hidden focus-within:border-primary">
          <div class="w-9 h-full bg-surface-2 border-r border-border-light flex items-center justify-center font-outfit text-xs text-text-muted shrink-0">
            Rp
          </div>
          <input
            v-model="minVal"
            type="number"
            min="0"
            placeholder="Terendah"
            class="w-full h-full px-2.5 bg-transparent font-outfit text-xs text-text placeholder-text-subtle focus:outline-none"
            @keyup.enter="applyPrice"
          />
        </div>
        <div class="h-10 rounded-xl border border-border-light bg-white flex items-center overflow-hidden focus-within:border-primary">
          <div class="w-9 h-full bg-surface-2 border-r border-border-light flex items-center justify-center font-outfit text-xs text-text-muted shrink-0">
            Rp
          </div>
          <input
            v-model="maxVal"
            type="number"
            min="0"
            placeholder="Tertinggi"
            class="w-full h-full px-2.5 bg-transparent font-outfit text-xs text-text placeholder-text-subtle focus:outline-none"
            @keyup.enter="applyPrice"
          />
        </div>
        <button
          type="button"
          class="w-full py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-bold text-xs cursor-pointer transition-colors"
          @click="applyPrice"
        >
          Terapkan Harga
        </button>
      </div>
    </div>

    <!-- 5. Penilaian -->
    <div>
      <h3 class="font-outfit font-bold text-sm text-text mb-2.5">
        Penilaian
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="lvl in [5, 4, 3, 2, 1]"
          :key="lvl"
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-outfit text-xs transition-colors cursor-pointer"
          :class="
            filters.rating === lvl
              ? 'bg-primary/10 text-primary border border-primary font-bold'
              : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
          "
          @click="emit('apply', { rating: filters.rating === lvl ? 0 : lvl })"
        >
          <Star
            class="w-3 h-3 shrink-0"
            :class="filters.rating === lvl ? 'fill-primary text-primary' : 'fill-text text-text'"
          />
          <span>{{ lvl === 5 ? '5' : `≥${lvl}` }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Star, Package, Store, SlidersHorizontal, LayoutGrid, ChevronDown, Check } from 'lucide-vue-next'
import type { SearchFilters, SearchCategoryItem } from '~/types/search'
import {
  DEFAULT_LOCATION_CHIPS,
  SEARCH_TYPE_BEST_DEAL,
  SEARCH_TYPE_BEKASKU_PLUS,
  SEARCH_TYPE_REGULAR,
} from '~/utils/constants'

const props = withDefaults(
  defineProps<{
    filters: SearchFilters
    categories?: SearchCategoryItem[]
    activeTab?: 'product' | 'store'
  }>(),
  {
    categories: () => [],
    activeTab: 'product',
  }
)

const emit = defineEmits<{
  apply: [patch: Partial<SearchFilters>]
  reset: []
  openLocationSelector: []
  changeTab: [tab: 'product' | 'store']
}>()

const isCategoryDropdownOpen = ref(false)

const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

const activeCategoryLabel = computed(() => {
  if (props.filters.categoryName) return props.filters.categoryName
  if (props.filters.categoryId) {
    const found = props.categories.find(
      (c) => (c.id || c._id) === props.filters.categoryId
    )
    if (found) return found.name
  }
  return 'Semua Kategori'
})

function isCategorySelected(cat: SearchCategoryItem): boolean {
  const catId = cat.id || cat._id || ''
  if (props.filters.categoryId && catId && props.filters.categoryId === catId) {
    return true
  }
  if (
    props.filters.categoryName &&
    cat.name &&
    props.filters.categoryName.toLowerCase() === cat.name.toLowerCase()
  ) {
    return true
  }
  return false
}

function selectCategoryItem(cat: SearchCategoryItem | null) {
  isCategoryDropdownOpen.value = false
  if (!cat) {
    emit('apply', { categoryId: '', categoryName: '', subcategoryId: '' })
    return
  }
  emit('apply', {
    categoryId: cat.id || cat._id || '',
    categoryName: cat.name,
    subcategoryId: '',
  })
}

function closeDropdownOnOutsideClick() {
  isCategoryDropdownOpen.value = false
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('click', closeDropdownOnOutsideClick)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('click', closeDropdownOnOutsideClick)
  }
})

type SortKey = 'relevant' | 'newest' | 'most_expensive' | 'cheapest'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'relevant', label: 'Paling Sesuai' },
  { key: 'newest', label: 'Terbaru' },
  { key: 'most_expensive', label: 'Harga Tertinggi' },
  { key: 'cheapest', label: 'Harga Rendah' },
]

const activeSortKey = computed<SortKey>(() => {
  if (props.filters.newest === 1) return 'newest'
  if (props.filters.mostExpensive === 1) return 'most_expensive'
  if (props.filters.cheapest === 1) return 'cheapest'
  return 'relevant'
})

function selectSort(key: SortKey) {
  emit('apply', {
    newest: key === 'newest' ? 1 : 0,
    mostExpensive: key === 'most_expensive' ? 1 : 0,
    cheapest: key === 'cheapest' ? 1 : 0,
  })
}

const minVal = ref(props.filters.minPrice && props.filters.minPrice > 0 ? String(props.filters.minPrice) : '')
const maxVal = ref(props.filters.maxPrice && props.filters.maxPrice > 0 ? String(props.filters.maxPrice) : '')

watch(
  () => [props.filters.minPrice, props.filters.maxPrice],
  ([min, max]) => {
    minVal.value = min && min > 0 ? String(min) : ''
    maxVal.value = max && max > 0 ? String(max) : ''
  }
)

const locationChips = computed(() => {
  const base = [...DEFAULT_LOCATION_CHIPS.slice(0, 5)]
  if (props.filters.city && !base.includes(props.filters.city)) {
    base.unshift(props.filters.city)
  }
  return base
})

function isLocationActive(loc: string): boolean {
  if (props.filters.provinceName?.toLowerCase() === loc.toLowerCase()) return true
  if (props.filters.city?.toLowerCase() === loc.toLowerCase()) return true
  if (props.filters.cities?.some((c) => c.toLowerCase() === loc.toLowerCase())) return true
  return false
}

function toggleLocation(loc: string) {
  if (isLocationActive(loc)) {
    emit('apply', { provinceName: '', city: '', cities: [] })
  } else if (loc.toLowerCase() === 'dki jakarta') {
    emit('apply', { provinceName: 'DKI Jakarta', city: '', cities: [] })
  } else {
    emit('apply', { provinceName: '', city: loc, cities: [loc] })
  }
}

function applyPrice() {
  let min = parseInt(minVal.value, 10) || 0
  let max = parseInt(maxVal.value, 10) || 0
  if (min > 0 && max > 0 && min > max) {
    const tmp = min
    min = max
    max = tmp
  }
  emit('apply', { minPrice: min, maxPrice: max })
}
</script>

