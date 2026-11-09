import {
  API_MYADDRESS_LIST,
  API_MYADDRESS_INIT,
  API_MYADDRESS_SUBMIT,
  API_MYADDRESS_DELETE,
  API_PROFILE_UPDATE,
  API_LOCATION,
  DEFAULT_LOCATION,
} from '~/utils/constants'
import { useLocationStore } from '~/stores/location'
import { useAuthStore } from '~/stores/auth'
import type { UserAddress, AddressFormPayload } from '~/types/address'

export type { UserAddress, AddressFormPayload }

export function useAddress() {
  const api = useApi()
  const locationStore = useLocationStore()
  const authStore = useAuthStore()

  const addresses = useState<UserAddress[]>('user_addresses', () => [])
  const selectedAddress = useState<UserAddress | null>('user_selected_address', () => null)
  const loading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const defaultAddress = computed(() => {
    return (
      addresses.value.find(a => a.main === true || a.main === 1 || a.main === 'true' || a.is_default === true) ||
      addresses.value[0] ||
      null
    )
  })

  const currentAddress = computed(() => {
    return selectedAddress.value || defaultAddress.value
  })

  const currentAddressText = computed(() => {
    if (currentAddress.value) {
      const label = currentAddress.value.address_name || currentAddress.value.name || 'Alamat'
      const city = currentAddress.value.city || locationStore.city || 'Medan'
      return `${label} (${city})`
    }
    return locationStore.city || DEFAULT_LOCATION
  })

  async function fetchAddresses(): Promise<UserAddress[]> {
    if (!authStore.isLoggedIn) {
      addresses.value = []
      return []
    }
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ result?: UserAddress[] }>(API_MYADDRESS_LIST, {})
      const list = response?.result || []
      addresses.value = list
      if (!selectedAddress.value && list.length > 0) {
        const def = list.find(a => a.main === true || a.main === 1 || a.main === 'true' || a.is_default === true) || list[0]
        if (def) {
          selectedAddress.value = def
          if (def.city) {
            locationStore.setLocation({
              city: def.city,
              province: def.province || locationStore.province,
              location: def.address || `${def.city}`,
              lat: typeof def.lat === 'number' ? def.lat : parseFloat(def.lat || '') || locationStore.lat,
              lon: typeof def.lon === 'number' ? def.lon : parseFloat(def.lon || '') || locationStore.lon,
            })
          }
        }
      }
      return addresses.value
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      error.value = errObj?.message || 'Gagal memuat alamat'
      addresses.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  function selectAddress(addr: UserAddress) {
    selectedAddress.value = addr
    const latNum = typeof addr.lat === 'number' ? addr.lat : parseFloat(addr.lat || '') || locationStore.lat
    const lonNum = typeof addr.lon === 'number' ? addr.lon : parseFloat(addr.lon || '') || locationStore.lon

    if (addr.city) {
      locationStore.setLocation({
        city: addr.city,
        province: addr.province || locationStore.province,
        location: addr.address || addr.city,
        lat: latNum,
        lon: lonNum,
      })
    }

    if (!authStore.isLoggedIn) {
      api.post(API_LOCATION, {
        user_id: 'GUEST',
        lat: latNum,
        lon: lonNum,
        location: addr.address || addr.city,
        city: addr.city,
        province: addr.province || locationStore.province,
      }).catch(() => {})
    }
  }

  async function getAddressDetail(addressId: string | number): Promise<UserAddress | null> {
    if (!addressId) return null
    try {
      const res = await api.post<{ result?: UserAddress }>(API_MYADDRESS_INIT, {
        address_id: String(addressId),
      })
      return res?.result || null
    } catch {
      return null
    }
  }

  async function saveAddress(payload: AddressFormPayload): Promise<{ success: boolean; message?: string; result?: UserAddress }> {
    isSubmitting.value = true
    try {
      const body = {
        address_id: payload.address_id || '',
        address_name: payload.address_name,
        address: payload.address.replaceAll(/[<>]/g, '').trim(),
        address_note: (payload.address_note || '').replaceAll(/[<>]/g, '').trim(),
        city: payload.city,
        province: payload.province,
        postal: payload.postal,
        subdistrict: payload.subdistrict,
        type_city: payload.type_city,
        main: payload.main,
        lon: String(payload.lon || ''),
        lat: String(payload.lat || ''),
        contact_name: payload.contact_name.replaceAll(/[<>]/g, '').trim(),
        contact_phone: payload.contact_phone.replaceAll(/\D/g, ''),
      }

      const res = await api.post<{ status?: boolean; message?: string; result?: UserAddress }>(API_MYADDRESS_SUBMIT, body)
      const ok = res?.status === true || String(res?.message || '').toUpperCase() === 'SUCCESS'

      if (ok) {
        await fetchAddresses()
        if (payload.main) {
          const latNum = parseFloat(String(payload.lat)) || locationStore.lat
          const lonNum = parseFloat(String(payload.lon)) || locationStore.lon
          locationStore.setLocation({
            city: payload.city,
            province: payload.province,
            location: payload.address || payload.city,
            lat: latNum,
            lon: lonNum,
          })
        }
        return { success: true, message: res?.message, result: res?.result }
      }

      return { success: false, message: res?.message || 'Gagal menyimpan alamat' }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return { success: false, message: errObj?.data?.message || errObj?.message || 'Terjadi kesalahan sistem' }
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteAddress(addressId: string | number): Promise<{ success: boolean; message?: string }> {
    if (!addressId) return { success: false, message: 'ID alamat tidak valid' }
    isSubmitting.value = true
    try {
      const res = await api.post<{ status?: boolean; message?: string }>(API_MYADDRESS_DELETE, {
        address_id: String(addressId),
      })
      const ok = res?.status === true || String(res?.message || '').toUpperCase() === 'SUCCESS'
      if (ok) {
        await fetchAddresses()
        return { success: true }
      }
      return { success: false, message: res?.message || 'Gagal menghapus alamat' }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return { success: false, message: errObj?.data?.message || errObj?.message || 'Gagal menghapus alamat' }
    } finally {
      isSubmitting.value = false
    }
  }

  async function setDefaultAddress(addressId: string | number): Promise<{ success: boolean; message?: string }> {
    if (!addressId) return { success: false }
    isSubmitting.value = true
    try {
      const res = await api.post<{ status?: boolean; message?: string }>(API_PROFILE_UPDATE, {
        address_default_id: String(addressId),
      })
      const ok = res?.status === true || String(res?.message || '').toUpperCase() === 'SUCCESS'
      if (ok) {
        await fetchAddresses()
        const target = addresses.value.find(a => String(a.id || a._id) === String(addressId))
        if (target) {
          selectAddress(target)
        }
        return { success: true }
      }
      return { success: false, message: res?.message || 'Gagal memperbarui alamat utama' }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return { success: false, message: errObj?.data?.message || errObj?.message || 'Gagal mengatur alamat utama' }
    } finally {
      isSubmitting.value = false
    }
  }

  // Backward compatibility alias for existing code
  async function addAddress(payload: Partial<UserAddress>): Promise<UserAddress> {
    const latStr = payload.lat !== undefined ? String(payload.lat) : String(locationStore.lat)
    const lonStr = payload.lon !== undefined ? String(payload.lon) : String(locationStore.lon)

    const formPayload: AddressFormPayload = {
      address_id: payload.id || payload._id || '',
      address_name: payload.address_name || 'Rumah',
      contact_name: payload.contact_name || '',
      contact_phone: payload.contact_phone || '',
      city: payload.city || locationStore.city || 'Medan',
      province: payload.province || locationStore.province || 'Sumatera Utara',
      postal: payload.postal || payload.postal_code || '20112',
      subdistrict: payload.subdistrict || 'Medan Petisah',
      type_city: payload.type_city || 'Kota',
      address: payload.address || '',
      address_note: payload.address_note || '',
      main: Boolean(payload.main ?? (addresses.value.length === 0)),
      lat: latStr,
      lon: lonStr,
    }

    const res = await saveAddress(formPayload)
    if (res.success && res.result) {
      selectAddress(res.result)
      return res.result
    }
    if (res.success && addresses.value.length > 0) {
      const latest = addresses.value[0]
      if (latest) {
        selectAddress(latest)
        return latest
      }
    }

    throw new Error(res.message || 'Gagal menyimpan alamat')
  }

  return {
    addresses,
    addressList: addresses,
    defaultAddress,
    currentAddress,
    currentAddressText,
    loading,
    isSubmitting,
    error,
    fetchAddresses,
    selectAddress,
    getAddressDetail,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    addAddress,
  }
}
