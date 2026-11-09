<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[85] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
    <div class="w-full md:max-w-md bg-white rounded-t-[20px] md:rounded-2xl shadow-2xl h-[80vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border/60 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <button
            v-if="activeProvince"
            type="button"
            class="p-1 text-text hover:text-primary rounded-lg cursor-pointer"
            aria-label="Kembali ke Provinsi"
            @click="activeProvince = null"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <button
            v-else
            type="button"
            class="p-1 text-text hover:text-primary rounded-lg cursor-pointer"
            aria-label="Tutup"
            @click="closeModal"
          >
            <X class="w-5 h-5" />
          </button>

          <h2 class="font-outfit font-bold text-lg text-text truncate">
            {{ activeProvince ? activeProvince.name : 'Pilih Provinsi' }}
          </h2>
        </div>

        <button
          v-if="activeProvince"
          type="button"
          class="p-1 text-text-subtle hover:text-text rounded-lg cursor-pointer"
          aria-label="Tutup"
          @click="closeModal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Search Input -->
      <div class="px-4 py-3 shrink-0">
        <div class="h-11 rounded-xl border border-border-light bg-white flex items-center px-3 focus-within:border-primary">
          <Search class="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="activeProvince ? 'Cari Kota / Kabupaten' : 'Cari Provinsi'"
            class="w-full bg-transparent font-outfit text-sm text-text placeholder-text-subtle focus:outline-none"
          />
        </div>
      </div>

      <!-- "Semua di [Provinsi]" Button when inside Province City view -->
      <div v-if="activeProvince" class="px-4 pb-2 shrink-0">
        <button
          type="button"
          class="w-full py-2.5 px-4 rounded-xl border border-border bg-surface-2 hover:border-primary hover:text-primary flex items-center justify-center gap-2 font-outfit font-semibold text-sm text-text transition-colors cursor-pointer"
          @click="selectWholeProvince(activeProvince)"
        >
          <MapPin class="w-4 h-4 text-primary" />
          <span>Semua di {{ activeProvince.name }}</span>
        </button>
      </div>

      <!-- List Content -->
      <div class="flex-1 overflow-y-auto divide-y divide-border">
        <div v-if="loadingProvinces || loadingCities" class="py-12 flex justify-center">
          <Loader2 class="w-6 h-6 text-primary animate-spin" />
        </div>

        <!-- City List View -->
        <template v-else-if="activeProvince">
          <button
            v-for="cityItem in filteredCities"
            :key="cityItem.id || cityItem.name"
            type="button"
            class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-surface-2 transition-colors cursor-pointer"
            @click="selectCity(cityItem)"
          >
            <span class="font-outfit text-sm sm:text-base text-text">
              {{ cityItem.type ? `${cityItem.type} ${cityItem.name}` : cityItem.name }}
            </span>
            <ChevronRight class="w-4 h-4 text-text-subtle" />
          </button>
        </template>

        <!-- Province List View -->
        <template v-else>
          <!-- Semua lokasi option -->
          <button
            v-if="!searchQuery.trim() || 'semua lokasi'.includes(searchQuery.toLowerCase())"
            type="button"
            class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-surface-2 transition-colors cursor-pointer"
            @click="selectAllLocations"
          >
            <span class="font-outfit text-sm sm:text-base font-medium text-primary">
              Semua lokasi
            </span>
            <ChevronRight class="w-4 h-4 text-text-subtle" />
          </button>

          <button
            v-for="prov in filteredProvinces"
            :key="prov.id || prov.name"
            type="button"
            class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-surface-2 transition-colors cursor-pointer"
            @click="openProvinceCities(prov)"
          >
            <span class="font-outfit text-sm sm:text-base text-text">
              {{ prov.name }}
            </span>
            <ChevronRight class="w-4 h-4 text-text-subtle" />
          </button>
        </template>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup lang="ts">
import { X, ArrowLeft, Search, MapPin, ChevronRight, Loader2 } from 'lucide-vue-next'
import type { LocationOption, SearchFilters } from '~/types/search'
import { useLocationOptions } from '~/composables/useLocationOptions'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  select: [locationPatch: Partial<SearchFilters>]
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

const {
  provinces,
  cities,
  loadingProvinces,
  loadingCities,
  fetchProvinces,
  fetchCitiesByProvince,
} = useLocationOptions()

const searchQuery = ref('')
const activeProvince = ref<LocationOption | null>(null)

const filteredProvinces = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return provinces.value
  return provinces.value.filter((p) => p.name.toLowerCase().includes(q))
})

const filteredCities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return cities.value
  return cities.value.filter((c) => c.name.toLowerCase().includes(q))
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      activeProvince.value = null
      searchQuery.value = ''
      if (provinces.value.length === 0) {
        fetchProvinces()
      }
    }
  }
)

async function openProvinceCities(prov: LocationOption) {
  activeProvince.value = prov
  searchQuery.value = ''
  await fetchCitiesByProvince(prov.id, prov.name)
}

function selectAllLocations() {
  emit('select', {
    provinceId: '',
    provinceName: '',
    locationId: '',
    locationName: '',
    city: '',
    cities: [],
  })
  closeModal()
}

function selectWholeProvince(prov: LocationOption) {
  emit('select', {
    provinceId: prov.id,
    provinceName: prov.name,
    locationId: '',
    locationName: '',
    city: '',
    cities: [],
  })
  closeModal()
}

function selectCity(cityItem: LocationOption) {
  const cleanCity = cityItem.name.split(',')[0]?.trim() || cityItem.name
  emit('select', {
    provinceId: '',
    provinceName: '',
    locationId: cityItem.id,
    locationName: cleanCity,
    city: cleanCity,
    cities: [cleanCity],
  })
  closeModal()
}

function closeModal() {
  emit('update:modelValue', false)
}
</script>
