<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  X,
  ArrowLeft,
  Search,
  Crosshair,
  MapPin,
  Loader2,
  Check,
} from 'lucide-vue-next'
import type { MapLocationPoint, NominatimSearchResult } from '~/types/address'
import { useLocationStore } from '~/stores/location'
import { useGeocoding } from '~/composables/useGeocoding'

const props = defineProps<{
  modelValue: boolean
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', location: MapLocationPoint): void
}>()

const locationStore = useLocationStore()
const { reverseGeocodePoint, searchLocations } = useGeocoding()

const mapContainer = ref<HTMLDivElement | null>(null)
let leafletMap: {
  setView: (coords: [number, number], zoom: number) => void
  getCenter: () => { lat: number; lng: number }
  on: (event: string, handler: () => void) => void
  remove: () => void
} | null = null

const currentLat = ref<number>(props.initialLat || locationStore.lat || 3.597031)
const currentLng = ref<number>(props.initialLng || locationStore.lon || 98.678513)

const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<NominatimSearchResult[]>([])
const showSearchResults = ref(false)

const isReverseLoading = ref(false)
const isLocating = ref(false)

const locationTitle = ref('Mencari lokasi...')
const locationSubtitle = ref('Menghubungkan ke peta...')

const locationData = ref<MapLocationPoint>({
  lat: currentLat.value,
  lng: currentLng.value,
  title: 'Lokasi Terpilih',
  subtitle: 'Peta Lokasi',
})

async function handleReverseGeocode(lat: number, lon: number) {
  isReverseLoading.value = true
  try {
    const point = await reverseGeocodePoint(lat, lon)
    locationTitle.value = point.title
    locationSubtitle.value = point.subtitle
    locationData.value = point
  } finally {
    isReverseLoading.value = false
  }
}

let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined
function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  const q = searchQuery.value.trim()
  if (q.length < 3) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  isSearching.value = true
  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await searchLocations(q)
      searchResults.value = res
      showSearchResults.value = res.length > 0
    } finally {
      isSearching.value = false
    }
  }, 450)
}

function handleSelectSearchResult(item: NominatimSearchResult) {
  const lat = parseFloat(item.lat)
  const lon = parseFloat(item.lon)
  searchQuery.value = item.display_name
  showSearchResults.value = false

  if (leafletMap) {
    leafletMap.setView([lat, lon], 16)
  }
  currentLat.value = lat
  currentLng.value = lon
  handleReverseGeocode(lat, lon)
}

function handleDetectCurrentLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      currentLat.value = lat
      currentLng.value = lon
      if (leafletMap) {
        leafletMap.setView([lat, lon], 17)
      }
      handleReverseGeocode(lat, lon)
      isLocating.value = false
    },
    () => {
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function initLeafletMap() {
  if (typeof window === 'undefined' || !mapContainer.value) return
  const L = (window as unknown as { L?: Record<string, any> }).L
  if (!L) return

  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  const mapInstance = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([currentLat.value, currentLng.value], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(mapInstance)

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

  mapInstance.on('moveend', () => {
    const center = mapInstance.getCenter()
    currentLat.value = center.lat
    currentLng.value = center.lng
    handleReverseGeocode(center.lat, center.lng)
  })

  leafletMap = mapInstance
  handleReverseGeocode(currentLat.value, currentLng.value)
}

function loadLeafletAssets() {
  if (typeof document === 'undefined') return

  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  if ((window as unknown as { L?: unknown }).L) {
    nextTick(() => initLeafletMap())
  } else if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      nextTick(() => initLeafletMap())
    }
    document.body.appendChild(script)
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.initialLat && props.initialLng) {
        currentLat.value = props.initialLat
        currentLng.value = props.initialLng
      }
      nextTick(() => {
        loadLeafletAssets()
      })
    } else {
      if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
      }
      showSearchResults.value = false
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    loadLeafletAssets()
  }
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})

function close() {
  emit('update:modelValue', false)
}

function confirmPick() {
  emit('select', locationData.value)
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[90] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-2xs select-none font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-label="Titik Lokasi"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-2xl h-dvh sm:h-[86vh] sm:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col border border-border"
        >
          <!-- Header Bar -->
          <div class="px-4 py-3.5 border-b border-border flex items-center justify-between bg-white shrink-0 z-20">
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
                aria-label="Kembali"
                @click="close"
              >
                <ArrowLeft class="w-5 h-5 text-text" aria-hidden="true" />
              </button>
              <h3 class="font-bold text-base text-text">Titik Lokasi</h3>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text cursor-pointer transition-colors"
              aria-label="Tutup"
              @click="close"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Map View Area -->
          <div class="relative flex-1 w-full overflow-hidden bg-surface-2">
            <!-- Map Container -->
            <div ref="mapContainer" class="w-full h-full z-0" />

            <!-- Fixed Center Marker Pin -->
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center z-10 -translate-y-5">
              <div class="relative flex flex-col items-center animate-bounce duration-300">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin class="w-5 h-5 fill-white text-primary" aria-hidden="true" />
                </div>
                <div class="w-2.5 h-1 bg-black/30 rounded-full mt-1 blur-2xs" />
              </div>
            </div>

            <!-- Floating Button: Gunakan lokasi saat ini -->
            <button
              type="button"
              :disabled="isLocating"
              class="absolute bottom-4 right-4 z-10 px-4 py-2.5 rounded-full bg-white border border-border/80 shadow-md hover:shadow-lg text-xs font-bold text-text flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              @click="handleDetectCurrentLocation"
            >
              <Loader2 v-if="isLocating" class="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
              <Crosshair v-else class="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Gunakan lokasi saat ini</span>
            </button>
          </div>

          <!-- Bottom Card: Search & Address Details -->
          <div class="bg-white border-t border-border p-4 sm:p-5 space-y-4 shrink-0 z-20 shadow-lg">
            <!-- Search Bar: Cari lokasi -->
            <div class="relative">
              <div class="relative flex items-center">
                <Search class="absolute left-3.5 w-4 h-4 text-text-muted pointer-events-none" aria-hidden="true" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari lokasi"
                  class="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-hidden transition-colors"
                  @input="onSearchInput"
                  @focus="searchResults.length > 0 ? (showSearchResults = true) : null"
                >
                <button
                  v-if="searchQuery"
                  type="button"
                  class="absolute right-3 p-1 text-text-muted hover:text-text cursor-pointer"
                  aria-label="Hapus pencarian lokasi"
                  @click="searchQuery = ''; showSearchResults = false"
                >
                  <X class="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <!-- Search Suggestions Dropdown -->
              <div
                v-if="showSearchResults && searchResults.length > 0"
                class="absolute bottom-full mb-2 left-0 right-0 bg-white border border-border rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-border/60 z-30"
              >
                <button
                  v-for="(item, idx) in searchResults"
                  :key="idx"
                  type="button"
                  class="w-full px-4 py-2.5 text-left text-xs hover:bg-surface-2 transition-colors cursor-pointer flex items-start gap-2.5 group"
                  @click="handleSelectSearchResult(item)"
                >
                  <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span class="text-text group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                    {{ item.display_name }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Location Address Detail Preview -->
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <p class="font-bold text-sm sm:text-base text-text truncate">
                  {{ locationTitle }}
                </p>
                <Loader2 v-if="isReverseLoading" class="w-3.5 h-3.5 text-primary animate-spin shrink-0" aria-hidden="true" />
              </div>
              <p class="text-xs text-text-muted leading-relaxed line-clamp-2">
                {{ locationSubtitle }}
              </p>
            </div>

            <!-- Primary CTA Button: Pilih lokasi ini -->
            <button
              type="button"
              :disabled="isReverseLoading"
              class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
              @click="confirmPick"
            >
              <Check class="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Pilih lokasi ini</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
