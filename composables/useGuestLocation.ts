import {
  API_LOCATION,
  DEFAULT_LAT,
  DEFAULT_LOCATION,
  DEFAULT_LON,
  STORAGE_KEY_LOCATION,
} from '~/utils/constants'
import { useLocationStore } from '~/stores/location'
import { useAuthStore } from '~/stores/auth'
import { useGeocoding } from '~/composables/useGeocoding'

const STORAGE_KEY_LOCATION_PROMPTED = 'bkk_location_prompted'

/**
 * Triggers native browser geolocation permission directly for first-time guest visits
 * without showing an intrusive modal popup. Falls back to Medan, Sumatera Utara on denial/failure.
 */
export function useGuestLocation() {
  const api = useApi()
  const authStore = useAuthStore()
  const locationStore = useLocationStore()
  const { reverseGeocodePoint } = useGeocoding()

  function markPrompted() {
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION_PROMPTED, '1')
    } catch {
      // ignore storage failure
    }
  }

  function applyDefaultLocation() {
    locationStore.setLocation({
      city: 'Medan',
      province: 'Sumatera Utara',
      location: DEFAULT_LOCATION,
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
    })
  }

  function requestInitialGuestLocation() {
    if (!import.meta.client || authStore.isLoggedIn) return
    try {
      const prompted = localStorage.getItem(STORAGE_KEY_LOCATION_PROMPTED)
      const savedLoc = localStorage.getItem(STORAGE_KEY_LOCATION)
      if (prompted || savedLoc) return
    } catch {
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      markPrompted()
      applyDefaultLocation()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        markPrompted()
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const point = await reverseGeocodePoint(lat, lon)
          const city = (point.city || point.title || 'Medan').trim()
          const province = (point.province || 'Sumatera Utara').trim()
          const fullLoc = (point.subtitle || point.title || `${city}, ${province}`).trim()

          locationStore.setLocation({
            city,
            province,
            location: fullLoc,
            lat,
            lon,
          })

          api.post(API_LOCATION, {
            user_id: 'GUEST',
            lat,
            lon,
            location: fullLoc,
            city,
            province,
          }).catch(() => {})
        } catch {
          locationStore.setLocation({
            city: locationStore.city || 'Medan',
            province: locationStore.province || 'Sumatera Utara',
            location: locationStore.location || DEFAULT_LOCATION,
            lat,
            lon,
          })
        }
      },
      () => {
        markPrompted()
        applyDefaultLocation()
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return {
    requestInitialGuestLocation,
  }
}
