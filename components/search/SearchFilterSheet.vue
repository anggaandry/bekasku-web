<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[85] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
    <div
      class="w-full md:max-w-lg bg-white rounded-t-[20px] md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Top Drag Handle Bar (Matches Screenshot 5) -->
      <div class="pt-3 pb-1 flex justify-center shrink-0">
        <div class="w-10 h-1 rounded-full bg-border-light" />
      </div>

      <!-- Modal Header: Filter + Reset -->
      <div class="px-5 py-2 flex items-center justify-between shrink-0">
        <h2 class="font-outfit font-bold text-lg text-text">
          Filter
        </h2>
        <button
          v-if="hasAnyDraftFilter"
          type="button"
          class="font-outfit font-bold text-sm text-primary hover:text-primary-dark cursor-pointer transition-colors"
          @click="resetDraft"
        >
          Reset
        </button>
      </div>

      <!-- Scrollable Filter Sections (Matches Screenshot 5 Order & Anatomy) -->
      <div class="flex-1 overflow-y-auto px-5 py-3 space-y-5">
        <!-- 1. Lokasi + Lihat Semua -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-outfit font-bold text-base text-text">
              Lokasi
            </h3>
            <button
              type="button"
              class="font-outfit font-semibold text-sm text-primary hover:text-primary-dark cursor-pointer"
              @click="emit('openLocationSelector')"
            >
              Lihat Semua
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="loc in locationChipList"
              :key="loc"
              type="button"
              class="px-4 py-2 rounded-full font-outfit text-sm transition-colors cursor-pointer"
              :class="
                isLocationSelected(loc)
                  ? 'bg-primary/10 text-primary border border-primary font-bold'
                  : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
              "
              @click="toggleLocationChip(loc)"
            >
              {{ loc }}
            </button>
          </div>
        </section>

        <!-- 2. Layanan & Promosi -->
        <section>
          <h3 class="font-outfit font-bold text-base text-text mb-3">
            Layanan &amp; Promosi
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="srv in layananOptions"
              :key="srv.key"
              type="button"
              class="px-4 py-2 rounded-full font-outfit text-sm transition-colors cursor-pointer"
              :class="
                isLayananSelected(srv.key)
                  ? 'bg-primary/10 text-primary border border-primary font-bold'
                  : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
              "
              @click="toggleLayanan(srv.key)"
            >
              {{ srv.label }}
            </button>
          </div>
        </section>

        <!-- 3. Jenis Toko (Strict Rule #11: Trusted, BekasKu+, Verified - NO VVIP) -->
        <section>
          <h3 class="font-outfit font-bold text-base text-text mb-3">
            Jenis Toko
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="st in jenisTokoOptions"
              :key="st.key"
              type="button"
              class="px-4 py-2 rounded-full font-outfit text-sm transition-colors cursor-pointer"
              :class="
                isJenisTokoSelected(st.key)
                  ? 'bg-primary/10 text-primary border border-primary font-bold'
                  : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
              "
              @click="toggleJenisToko(st.key)"
            >
              {{ st.label }}
            </button>
          </div>
        </section>

        <!-- 4. Harga (2-Column Rp | Terendah & Rp | Tertinggi) -->
        <section>
          <h3 class="font-outfit font-bold text-base text-text mb-3">
            Harga
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <!-- Min Price -->
            <div class="h-12 rounded-xl border border-border-light bg-white flex items-center overflow-hidden focus-within:border-primary">
              <div class="w-11 h-full bg-surface-2 border-r border-border-light flex items-center justify-center font-outfit font-medium text-sm text-text-muted shrink-0">
                Rp
              </div>
              <input
                v-model="minPriceInput"
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="Terendah"
                class="w-full h-full px-3 bg-transparent font-outfit text-sm text-text placeholder-text-subtle focus:outline-none"
              />
            </div>

            <!-- Max Price -->
            <div class="h-12 rounded-xl border border-border-light bg-white flex items-center overflow-hidden focus-within:border-primary">
              <div class="w-11 h-full bg-surface-2 border-r border-border-light flex items-center justify-center font-outfit font-medium text-sm text-text-muted shrink-0">
                Rp
              </div>
              <input
                v-model="maxPriceInput"
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="Tertinggi"
                class="w-full h-full px-3 bg-transparent font-outfit text-sm text-text placeholder-text-subtle focus:outline-none"
              />
            </div>
          </div>
        </section>

        <!-- 5. Penilaian (Star Rating Pills: 5, >=4, >=3, >=2, >=1) -->
        <section>
          <h3 class="font-outfit font-bold text-base text-text mb-3">
            Penilaian
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="lvl in [5, 4, 3, 2, 1]"
              :key="lvl"
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-outfit text-sm transition-colors cursor-pointer"
              :class="
                draftRating === lvl
                  ? 'bg-primary/10 text-primary border border-primary font-bold'
                  : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
              "
              @click="draftRating = draftRating === lvl ? 0 : lvl"
            >
              <Star
                class="w-3.5 h-3.5 shrink-0"
                :class="draftRating === lvl ? 'fill-primary text-primary' : 'fill-text text-text'"
              />
              <span>{{ lvl === 5 ? '5' : `≥${lvl}` }}</span>
            </button>
          </div>
        </section>

        <!-- 6. Kategori -->
        <section v-if="displayCategories.length > 0" class="pb-2">
          <h3 class="font-outfit font-bold text-base text-text mb-3">
            Kategori
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in displayCategories"
              :key="cat.id || cat._id || cat.name"
              type="button"
              class="px-4 py-2 rounded-full font-outfit text-sm transition-colors cursor-pointer"
              :class="
                isCategorySelected(cat)
                  ? 'bg-primary/10 text-primary border border-primary font-bold'
                  : 'bg-surface-2 text-text hover:bg-border/60 font-normal'
              "
              @click="toggleCategory(cat)"
            >
              {{ cat.name }}
            </button>
          </div>
        </section>
      </div>

      <!-- Bottom Sticky CTA: Terapkan -->
      <div class="px-5 pt-3 pb-6 bg-white border-t border-border/60 shrink-0">
        <button
          type="button"
          class="w-full py-3.5 rounded-xl font-outfit font-bold text-base text-white transition-all active:scale-[0.99] cursor-pointer"
          :class="hasAnyDraftFilter ? 'bg-primary hover:bg-primary-dark shadow-md' : 'bg-primary/60 hover:bg-primary'"
          @click="applyFilter"
        >
          Terapkan
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { SearchFilters, SearchCategoryItem } from '~/types/search'
import {
  DEFAULT_LOCATION_CHIPS,
  SEARCH_TYPE_BEST_DEAL,
  SEARCH_TYPE_BEKASKU_PLUS,
  SEARCH_TYPE_REGULAR,
} from '~/utils/constants'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    filters: SearchFilters
    categories?: SearchCategoryItem[]
  }>(),
  {
    categories: () => [],
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  apply: [updated: Partial<SearchFilters>]
  openLocationSelector: []
}>()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})

// Draft state synced when modal opens
const draftCities = ref<string[]>([])
const draftProvinceName = ref('')
const draftType = ref(0)
const draftFreeOngkir = ref(0)
const draftTrusted = ref(0)
const draftVerified = ref(0)
const draftVip = ref(0)
const draftNeeded = ref(0)
const draftRating = ref(0)
const draftCategoryId = ref('')
const draftCategoryName = ref('')
const minPriceInput = ref('')
const maxPriceInput = ref('')

const layananOptions = [
  { key: 'best_deal', label: 'Best Deal' },
  { key: 'free_ongkir', label: 'Gratis Ongkir' },
  { key: 'trusted', label: 'Trusted' },
  { key: 'needed', label: 'Dibutuhkan' },
]

const jenisTokoOptions = [
  { key: 'trusted', label: 'Trusted' },
  { key: 'bekasku_plus', label: 'BekasKu+' },
  { key: 'vip', label: 'VIP' },
  { key: 'verified', label: 'Verified' },
]

const locationChipList = computed(() => {
  const base = [...DEFAULT_LOCATION_CHIPS.slice(0, 6)]
  for (const c of draftCities.value) {
    if (c && !base.includes(c)) base.unshift(c)
  }
  if (draftProvinceName.value && !base.includes(draftProvinceName.value)) {
    base.unshift(draftProvinceName.value)
  }
  return base
})

const displayCategories = computed<SearchCategoryItem[]>(() => {
  if (props.categories && props.categories.length > 0) {
    return props.categories.slice(0, 12)
  }
  return []
})

const hasAnyDraftFilter = computed(() => {
  return Boolean(
    draftCities.value.length > 0 ||
    draftProvinceName.value ||
    draftType.value === SEARCH_TYPE_BEST_DEAL ||
    draftType.value === SEARCH_TYPE_BEKASKU_PLUS ||
    draftFreeOngkir.value === 1 ||
    draftTrusted.value === 1 ||
    draftVerified.value === 1 ||
    draftVip.value === 1 ||
    draftNeeded.value === 1 ||
    draftRating.value > 0 ||
    draftCategoryId.value ||
    draftCategoryName.value ||
    minPriceInput.value.trim() ||
    maxPriceInput.value.trim()
  )
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      syncFromProps()
    }
  },
  { immediate: true }
)

function syncFromProps() {
  const f = props.filters
  draftCities.value = f.cities ? [...f.cities] : (f.city ? [f.city] : [])
  draftProvinceName.value = f.provinceName || ''
  draftType.value = f.type || 0
  draftFreeOngkir.value = f.freeOngkir || 0
  draftTrusted.value = f.trusted || 0
  draftVerified.value = f.verified || 0
  draftVip.value = f.vip || 0
  draftNeeded.value = f.needed || 0
  draftRating.value = f.rating || 0
  draftCategoryId.value = f.categoryId || ''
  draftCategoryName.value = f.categoryName || ''
  minPriceInput.value = f.minPrice && f.minPrice > 0 ? String(f.minPrice) : ''
  maxPriceInput.value = f.maxPrice && f.maxPrice > 0 ? String(f.maxPrice) : ''
}

function isProvinceChip(name: string): boolean {
  const lower = name.toLowerCase().trim()
  return (
    lower === 'dki jakarta' ||
    lower === 'jakarta' ||
    lower === 'sumatera utara' ||
    lower === 'bali'
  )
}

function isLocationSelected(loc: string): boolean {
  if (isProvinceChip(loc)) {
    return draftProvinceName.value.toLowerCase() === loc.toLowerCase()
  }
  return draftCities.value.includes(loc)
}

function toggleLocationChip(loc: string) {
  if (isProvinceChip(loc)) {
    if (draftProvinceName.value.toLowerCase() === loc.toLowerCase()) {
      draftProvinceName.value = ''
    } else {
      draftCities.value = []
      draftProvinceName.value = loc
    }
  } else {
    draftProvinceName.value = ''
    if (draftCities.value.includes(loc)) {
      draftCities.value = draftCities.value.filter((c) => c !== loc)
    } else {
      draftCities.value.push(loc)
    }
  }
}

function isLayananSelected(key: string): boolean {
  if (key === 'best_deal') return draftType.value === SEARCH_TYPE_BEST_DEAL
  if (key === 'free_ongkir') return draftFreeOngkir.value === 1
  if (key === 'trusted') return draftTrusted.value === 1
  if (key === 'needed') return draftNeeded.value === 1
  return false
}

function toggleLayanan(key: string) {
  if (key === 'best_deal') {
    draftType.value = draftType.value === SEARCH_TYPE_BEST_DEAL ? SEARCH_TYPE_REGULAR : SEARCH_TYPE_BEST_DEAL
  } else if (key === 'free_ongkir') {
    draftFreeOngkir.value = draftFreeOngkir.value === 1 ? 0 : 1
  } else if (key === 'trusted') {
    draftTrusted.value = draftTrusted.value === 1 ? 0 : 1
  } else if (key === 'needed') {
    draftNeeded.value = draftNeeded.value === 1 ? 0 : 1
  }
}

function isJenisTokoSelected(key: string): boolean {
  if (key === 'trusted') return draftTrusted.value === 1
  if (key === 'bekasku_plus') return draftType.value === SEARCH_TYPE_BEKASKU_PLUS
  if (key === 'vip') return draftVip.value === 1
  if (key === 'verified') return draftVerified.value === 1
  return false
}

function toggleJenisToko(key: string) {
  if (key === 'trusted') {
    draftTrusted.value = draftTrusted.value === 1 ? 0 : 1
  } else if (key === 'bekasku_plus') {
    draftType.value = draftType.value === SEARCH_TYPE_BEKASKU_PLUS ? SEARCH_TYPE_REGULAR : SEARCH_TYPE_BEKASKU_PLUS
  } else if (key === 'vip') {
    draftVip.value = draftVip.value === 1 ? 0 : 1
  } else if (key === 'verified') {
    draftVerified.value = draftVerified.value === 1 ? 0 : 1
  }
}

function isCategorySelected(cat: SearchCategoryItem): boolean {
  const cId = cat.id || cat._id || ''
  if (cId && draftCategoryId.value) return draftCategoryId.value === cId
  return Boolean(draftCategoryName.value && draftCategoryName.value.toLowerCase() === cat.name.toLowerCase())
}

function toggleCategory(cat: SearchCategoryItem) {
  if (isCategorySelected(cat)) {
    draftCategoryId.value = ''
    draftCategoryName.value = ''
  } else {
    draftCategoryId.value = cat.id || cat._id || ''
    draftCategoryName.value = cat.name
  }
}

function resetDraft() {
  draftCities.value = []
  draftProvinceName.value = ''
  draftType.value = props.filters.q ? SEARCH_TYPE_REGULAR : 0
  draftFreeOngkir.value = 0
  draftTrusted.value = 0
  draftVerified.value = 0
  draftVip.value = 0
  draftNeeded.value = 0
  draftRating.value = 0
  draftCategoryId.value = ''
  draftCategoryName.value = ''
  minPriceInput.value = ''
  maxPriceInput.value = ''
}

function applyFilter() {
  let min = parseInt(minPriceInput.value, 10) || 0
  let max = parseInt(maxPriceInput.value, 10) || 0
  // Auto-correct if min > max per SearchResultsView L1157
  if (min > 0 && max > 0 && min > max) {
    const tmp = min
    min = max
    max = tmp
  }

  emit('apply', {
    cities: draftCities.value,
    city: draftCities.value[0] || '',
    provinceName: draftProvinceName.value,
    type: draftType.value,
    freeOngkir: draftFreeOngkir.value,
    trusted: draftTrusted.value,
    verified: draftVerified.value,
    vip: draftVip.value,
    needed: draftNeeded.value,
    rating: draftRating.value,
    categoryId: draftCategoryId.value,
    categoryName: draftCategoryName.value,
    minPrice: min,
    maxPrice: max,
  })
  closeModal()
}

function closeModal() {
  emit('update:modelValue', false)
}
</script>
