import { API_MYADDRESS_LIST, API_MYADDRESS_SUBMIT } from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'

export interface UserAddress {
  id?: string
  _id?: string
  address_id?: string
  address_name: string
  contact_name: string
  contact_phone: string
  address: string
  city?: string
  province?: string
  subdistrict?: string
  postal?: string
  address_note?: string
  main?: boolean | number
}

const STORAGE_KEY_SHIPPING_ADDR = 'bks_shipping_address'

export function useAddress() {
  const api = useApi()
  const authStore = useAuthStore()

  const currentAddressText = useState<string>('current_shipping_address_text', () => 'Jl. Mawar No. 27 Blok B, Medan')
  const currentAddress = useState<UserAddress | null>('current_shipping_address', () => null)
  const addressList = useState<UserAddress[]>('user_addresses_list', () => [])
  const loading = ref(false)

  // Fallback initial sample addresses if user hasn't created any yet
  const defaultSampleAddresses: UserAddress[] = [
    {
      id: 'addr-1',
      address_name: 'Rumah',
      contact_name: 'Erlangga',
      contact_phone: '081234567890',
      address: 'Jl. Mawar No. 27 Blok B, Medan, Sumatera Utara 20142',
      city: 'Medan',
      province: 'Sumatera Utara',
      address_note: 'Pagar hitam depan pos satpam',
      main: true,
    },
    {
      id: 'addr-2',
      address_name: 'Kantor',
      contact_name: 'Erlangga',
      contact_phone: '081234567890',
      address: 'Gedung BekasKu Hub Lt. 4, Jl. Asia No. 88, Medan Kota',
      city: 'Medan',
      province: 'Sumatera Utara',
      address_note: 'Lobi utama resepsionis',
      main: false,
    },
  ]

  /**
   * Fetch addresses from API /myaddress/list (or initialize defaults)
   */
  async function fetchAddresses() {
    // Load from localStorage if present
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SHIPPING_ADDR)
        if (saved) {
          const parsed = JSON.parse(saved)
          currentAddress.value = parsed
          currentAddressText.value = parsed.address || currentAddressText.value
        }
      } catch {
        // ignore
      }
    }

    if (authStore.isLoggedIn) {
      loading.value = true
      try {
        const res = await api.post<{ result?: UserAddress[]; message?: string }>(
          API_MYADDRESS_LIST,
          {}
        )
        if (res && res.result && Array.isArray(res.result) && res.result.length > 0) {
          addressList.value = res.result
          const mainAddr = res.result.find((a) => a.main === true || a.main === 1) || res.result[0]
          if (!currentAddress.value && mainAddr) {
            selectAddress(mainAddr)
          }
          return res.result
        }
      } catch (err) {
        console.warn('[useAddress] Failed to fetch /myaddress/list from API:', err)
      } finally {
        loading.value = false
      }
    }

    // Fallback if empty
    if (addressList.value.length === 0) {
      addressList.value = defaultSampleAddresses
      if (!currentAddress.value) {
        selectAddress(defaultSampleAddresses[0])
      }
    }

    return addressList.value
  }

  /**
   * Select active address
   */
  function selectAddress(addr: UserAddress) {
    currentAddress.value = addr
    currentAddressText.value = addr.address
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_SHIPPING_ADDR, JSON.stringify(addr))
      } catch {
        // ignore
      }
    }
  }

  /**
   * Add new address to API & local list
   */
  async function addAddress(newAddr: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    loading.value = true
    const createdAddr: UserAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    }

    try {
      if (authStore.isLoggedIn) {
        await api.post(API_MYADDRESS_SUBMIT, {
          address_name: newAddr.address_name,
          contact_name: newAddr.contact_name,
          contact_phone: newAddr.contact_phone,
          address: newAddr.address,
          city: newAddr.city || '',
          province: newAddr.province || '',
          address_note: newAddr.address_note || '',
          main: newAddr.main ? true : false,
        })
      }
    } catch (err) {
      console.warn('[useAddress] Failed to submit address to API:', err)
    } finally {
      loading.value = false
    }

    if (createdAddr.main) {
      addressList.value = addressList.value.map((a) => ({ ...a, main: false }))
    }

    addressList.value = [createdAddr, ...addressList.value]
    selectAddress(createdAddr)
    return createdAddr
  }

  return {
    currentAddressText,
    currentAddress,
    addressList,
    loading,
    fetchAddresses,
    selectAddress,
    addAddress,
  }
}
