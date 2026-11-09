import { useLocationStore } from '~/stores/location'
import type {
  MapLocationPoint,
  NominatimReverseResponse,
  NominatimSearchResult,
} from '~/types/address'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

export function useGeocoding() {
  const locationStore = useLocationStore()

  async function reverseGeocodePoint(lat: number, lon: number): Promise<MapLocationPoint> {
    const fallbackTitle = 'Titik Terpilih'
    const fallbackSubtitle = `Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    const fallbackPoint: MapLocationPoint = {
      lat,
      lng: lon,
      title: fallbackTitle,
      subtitle: fallbackSubtitle,
      city: locationStore.city || 'Medan',
      province: locationStore.province || 'Sumatera Utara',
      subdistrict: 'Medan',
      postal: '20112',
      type_city: 'Kota',
    }

    try {
      const res = await $fetch<NominatimReverseResponse>(
        `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${Number(lat)}&lon=${Number(lon)}&accept-language=id`,
        {
          headers: {
            'User-Agent': 'BekasKuWeb/1.0',
          },
        }
      )

      if (res && res.address) {
        const addr = res.address
        const road = addr.road || addr.pedestrian || addr.street || ''
        const houseNumber = addr.house_number ? `No. ${addr.house_number}` : ''
        const suburb = addr.suburb || addr.village || addr.neighbourhood || ''
        const subdistrict = addr.city_district || addr.subdistrict || addr.district || ''
        const rawCity = addr.city || addr.town || addr.county || ''
        const city = rawCity.replace(/^(Kota|Kabupaten)\s+/i, '')
        const typeCity = rawCity.toLowerCase().includes('kabupaten') ? 'Kabupaten' : 'Kota'
        const province = addr.state || addr.province || ''
        const postal = addr.postcode || ''

        const cleanStreet =
          [road, houseNumber].filter(Boolean).join(' ') ||
          suburb ||
          res.name ||
          'Lokasi Terpilih'

        const areaParts = [
          subdistrict ? `Kec. ${subdistrict}` : '',
          city ? `${typeCity} ${city}` : '',
          province,
          postal,
          'Indonesia',
        ]
          .filter(Boolean)
          .join(', ')

        return {
          lat,
          lng: lon,
          title: cleanStreet,
          subtitle: areaParts || res.display_name || fallbackSubtitle,
          road: cleanStreet,
          subdistrict,
          city: city || locationStore.city || 'Medan',
          province: province || locationStore.province || 'Sumatera Utara',
          postal: postal || '20112',
          type_city: typeCity,
        }
      }

      return fallbackPoint
    } catch {
      return fallbackPoint
    }
  }

  async function searchLocations(query: string): Promise<NominatimSearchResult[]> {
    const cleanQuery = query.trim()
    if (cleanQuery.length < 3) return []

    try {
      const res = await $fetch<NominatimSearchResult[]>(
        `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(cleanQuery)}&countrycodes=id&limit=5&accept-language=id`,
        {
          headers: {
            'User-Agent': 'BekasKuWeb/1.0',
          },
        }
      )
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  }

  return {
    reverseGeocodePoint,
    searchLocations,
  }
}

