<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, Navigation, Search, Loader2 } from 'lucide-vue-next'
import { DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON } from '~/utils/constants'
import { useAuthModal } from '~/composables/useAuthModal'
import { useGeocoding } from '~/composables/useGeocoding'
import type { NominatimSearchResult } from '~/types/address'

const authModal = useAuthModal()
const { reverseGeocodePoint, searchLocations } = useGeocoding()

const isLocating = ref(false)
const showManualSearch = ref(false)
const manualQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<NominatimSearchResult[]>([])
const locError = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

function handleAllowLocation() {
  locError.value = ''
  if (!import.meta.client || !navigator.geolocation) {
    locError.value = 'Browser tidak mendukung GPS. Silakan cari lokasi secara manual.'
    showManualSearch.value = true
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const point = await reverseGeocodePoint(lat, lon)
        await authModal.applyLocationChoice(
          point.city || point.title || 'Lokasi Saat Ini',
          lat,
          lon,
          point.province,
          point.subtitle || point.title,
        )
      } finally {
        isLocating.value = false
      }
    },
    (err) => {
      isLocating.value = false
      if (err?.code === 1) {
        locError.value = 'Izin lokasi browser ditolak. Aktifkan izin lokasi browser atau cari manual di bawah.'
      } else {
        locError.value = 'Gagal mendeteksi GPS secara otomatis. Silakan cari lokasi secara manual.'
      }
      showManualSearch.value = true
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

function handleManualSearchInput() {
  locError.value = ''
  if (searchTimer) clearTimeout(searchTimer)
  const q = manualQuery.value.trim()
  if (q.length < 3) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    isSearching.value = true
    try {
      searchResults.value = await searchLocations(q)
    } finally {
      isSearching.value = false
    }
  }, 350)
}

async function handleSelectManualResult(item: NominatimSearchResult) {
  const lat = Number(item.lat)
  const lon = Number(item.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

  isLocating.value = true
  locError.value = ''
  try {
    const point = await reverseGeocodePoint(lat, lon)
    await authModal.applyLocationChoice(
      point.city || item.display_name.split(',')[0] || 'Lokasi Terpilih',
      lat,
      lon,
      point.province,
      item.display_name || point.subtitle,
    )
  } finally {
    isLocating.value = false
  }
}

async function handleSkipDefault() {
  await authModal.applyLocationChoice('Medan', DEFAULT_LAT, DEFAULT_LON, 'Sumatera Utara', DEFAULT_LOCATION)
}
</script>

<template>
  <div class="py-2 flex flex-col items-center text-center">
    <div class="w-32 h-32 flex items-center justify-center">
      <img
        src="/images/auth/location_ask3.png"
        alt="Izin Lokasi BekasKu"
        width="128"
        height="128"
        class="w-full h-full object-contain"
      />
    </div>

    <h3 class="mt-2 text-lg font-bold text-text font-outfit">
      Temukan Barang Terdekat dari Lokasi Anda
    </h3>
    <p class="mt-1.5 text-xs text-text-muted leading-relaxed max-w-sm">
      Izinkan akses GPS browser atau cari kota Anda secara manual agar BekasKu menampilkan produk sekitar Anda.
    </p>

    <p v-if="locError" class="mt-2.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
      {{ locError }}
    </p>

    <div class="mt-4 w-full space-y-2.5 text-left">
      <button
        type="button"
        :disabled="isLocating || authModal.isSubmitting.value"
        class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        @click="handleAllowLocation"
      >
        <Loader2 v-if="isLocating" class="w-4 h-4 animate-spin" />
        <Navigation v-else class="w-4 h-4" />
        <span>{{ isLocating ? 'Mendeteksi Lokasi GPS...' : 'Deteksi Lokasi GPS Otomatis' }}</span>
      </button>

      <!-- Manual Search Toggle & Input -->
      <div class="space-y-2">
        <button
          v-if="!showManualSearch"
          type="button"
          class="w-full h-10 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-semibold text-text flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          @click="showManualSearch = true"
        >
          <Search class="w-3.5 h-3.5 text-primary" />
          <span>Cari Lokasi Manual</span>
        </button>

        <div v-else class="space-y-2">
          <div class="relative">
            <Search class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="manualQuery"
              type="text"
              placeholder="Ketik nama kota atau kecamatan (min. 3 huruf)..."
              class="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-white text-xs text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              @input="handleManualSearchInput"
            />
            <Loader2 v-if="isSearching" class="w-3.5 h-3.5 text-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div
            v-if="searchResults.length > 0"
            class="max-h-40 overflow-y-auto rounded-xl border border-border bg-white divide-y divide-border-light shadow-sm"
          >
            <button
              v-for="item in searchResults"
              :key="item.place_id"
              type="button"
              class="w-full px-3 py-2 text-left text-xs text-text hover:bg-surface-2 flex items-start gap-2 transition-colors cursor-pointer"
              @click="handleSelectManualResult(item)"
            >
              <MapPin class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span class="line-clamp-2">{{ item.display_name }}</span>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        :disabled="isLocating || authModal.isSubmitting.value"
        class="w-full h-9 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        @click="handleSkipDefault"
      >
        <MapPin class="w-3.5 h-3.5 text-text-muted" />
        <span>Lewati (Gunakan {{ DEFAULT_LOCATION }})</span>
      </button>
    </div>
  </div>
</template>
