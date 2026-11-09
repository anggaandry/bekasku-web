<script setup lang="ts">
import { MapPin, Navigation } from 'lucide-vue-next'
import { DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON } from '~/utils/constants'
import { useAuthModal } from '~/composables/useAuthModal'

const authModal = useAuthModal()
const isLocating = ref(false)
const locError = ref('')

function handleAllowLocation() {
  locError.value = ''
  if (!import.meta.client || !navigator.geolocation) {
    handleSkipDefault()
    return
  }
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      isLocating.value = false
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      await authModal.applyLocationChoice('Lokasi Saat Ini', lat, lon)
    },
    async () => {
      isLocating.value = false
      await authModal.applyLocationChoice(DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON)
    },
    { enableHighAccuracy: false, timeout: 8000 },
  )
}

async function handleSkipDefault() {
  await authModal.applyLocationChoice(DEFAULT_LOCATION, DEFAULT_LAT, DEFAULT_LON)
}
</script>

<template>
  <div class="py-2 flex flex-col items-center text-center">
    <div class="w-36 h-36 flex items-center justify-center">
      <img
        src="/images/auth/location_ask3.png"
        alt="Izin Lokasi BekasKu"
        width="136"
        height="136"
        class="w-full h-full object-contain"
      />
    </div>

    <h3 class="mt-3 text-lg font-bold text-text font-outfit">
      Temukan Barang Terdekat dari Lokasi Anda
    </h3>
    <p class="mt-1.5 text-xs text-text-muted leading-relaxed max-w-sm">
      Izinkan akses lokasi agar BekasKu dapat menampilkan rekomendasi barang bekas terbaik di sekitar kota Anda.
    </p>

    <p v-if="locError" class="mt-2 text-xs font-medium text-red-600">
      {{ locError }}
    </p>

    <div class="mt-5 w-full space-y-2">
      <button
        type="button"
        :disabled="isLocating || authModal.isSubmitting.value"
        class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        @click="handleAllowLocation"
      >
        <Navigation class="w-4 h-4" />
        <span>{{ isLocating ? 'Mendeteksi Lokasi...' : 'Izinkan Akses Lokasi' }}</span>
      </button>

      <button
        type="button"
        :disabled="isLocating || authModal.isSubmitting.value"
        class="w-full h-10 rounded-xl border border-border bg-white hover:bg-surface-2 text-xs font-semibold text-text-muted hover:text-text flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        @click="handleSkipDefault"
      >
        <MapPin class="w-3.5 h-3.5 text-primary" />
        <span>Lewati (Gunakan {{ DEFAULT_LOCATION }})</span>
      </button>
    </div>
  </div>
</template>

