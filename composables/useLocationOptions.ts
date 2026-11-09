import {
  API_LOCATION_PROVINCE_LIST,
  API_LOCATION_CITY_BY_PROVINCE,
  API_LOCATION_LIST,
} from '~/utils/constants'
import type { LocationOption } from '~/types/search'

export function useLocationOptions() {
  const api = useApi()
  const provinces = ref<LocationOption[]>([])
  const cities = ref<LocationOption[]>([])
  const locations = ref<LocationOption[]>([])
  const loadingProvinces = ref(false)
  const loadingCities = ref(false)
  const loadingLocations = ref(false)
  const error = ref<string | null>(null)

  async function fetchProvinces(filter = '') {
    loadingProvinces.value = true
    error.value = null
    try {
      const res = await api.post<{
        status?: boolean
        message?: string
        result?: { docs?: LocationOption[] }
      }>(API_LOCATION_PROVINCE_LIST, { filter })
      provinces.value = Array.isArray(res?.result?.docs) ? res.result!.docs : []
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat provinsi'
      provinces.value = []
    } finally {
      loadingProvinces.value = false
    }
  }

  async function fetchCitiesByProvince(provinceId: string, provinceName = '', filter = '') {
    loadingCities.value = true
    error.value = null
    try {
      const res = await api.post<{
        status?: boolean
        message?: string
        result?: { docs?: LocationOption[]; province_name?: string }
      }>(API_LOCATION_CITY_BY_PROVINCE, {
        province_id: provinceId,
        province_name: provinceName,
        filter,
      })
      cities.value = Array.isArray(res?.result?.docs) ? res.result!.docs : []
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat kota'
      cities.value = []
    } finally {
      loadingCities.value = false
    }
  }

  async function searchLocationList(filter = '') {
    loadingLocations.value = true
    error.value = null
    try {
      const res = await api.post<{
        status?: boolean
        message?: string
        result?: { docs?: LocationOption[] }
      }>(API_LOCATION_LIST, { filter, page: 1 })
      locations.value = Array.isArray(res?.result?.docs) ? res.result!.docs : []
    } catch (e: any) {
      error.value = e?.message || 'Gagal mencari lokasi'
      locations.value = []
    } finally {
      loadingLocations.value = false
    }
  }

  return {
    provinces,
    cities,
    locations,
    loadingProvinces,
    loadingCities,
    loadingLocations,
    error,
    fetchProvinces,
    fetchCitiesByProvince,
    searchLocationList,
  }
}

