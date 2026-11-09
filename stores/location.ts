import { defineStore } from 'pinia'
import { DEFAULT_LOCATION, STORAGE_KEY_LOCATION, STORAGE_KEY_CITY } from '~/utils/constants'

export interface UserLocation {
  city: string
  province: string
  location: string
  lat: number
  lon: number
}

export const useLocationStore = defineStore('location', () => {
  const city = ref<string>('Medan')
  const province = ref<string>('Sumatera Utara')
  const location = ref<string>(DEFAULT_LOCATION)
  const lat = ref<number>(3.597031)
  const lon = ref<number>(98.678513)

  function setLocation(loc: Partial<UserLocation>) {
    if (loc.city) city.value = loc.city
    if (loc.province) province.value = loc.province
    if (loc.location) location.value = loc.location
    if (loc.lat !== undefined) lat.value = loc.lat
    if (loc.lon !== undefined) lon.value = loc.lon

    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_CITY, city.value)
        localStorage.setItem(
          STORAGE_KEY_LOCATION,
          JSON.stringify({
            city: city.value,
            province: province.value,
            location: location.value,
            lat: lat.value,
            lon: lon.value,
          })
        )
      } catch {
        // ignore
      }
    }
  }

  function initFromStorage() {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_LOCATION)
        if (stored) {
          const parsed = JSON.parse(stored)
          setLocation(parsed)
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    city,
    province,
    location,
    lat,
    lon,
    setLocation,
    initFromStorage,
  }
})

