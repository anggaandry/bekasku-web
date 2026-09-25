import { API_PRODUCT_SEARCH } from '~/utils/constants'

export interface ServiceItem {
  id: string
  title: string
  price: number
  image: string
  city?: string
  rate?: number
  category?: string
  sub_category?: string
}

export function useServices() {
  const api = useApi()
  const services = ref<ServiceItem[]>([])
  const loading = ref(false)

  async function fetchServices(limit = 8): Promise<ServiceItem[]> {
    loading.value = true
    try {
      const res = await api.post<{
        result?: { docs?: any[] }
      }>(API_PRODUCT_SEARCH, {
        page: 1,
        limit,
        type: 'service',
        query: '',
      })

      const docs = res?.result?.docs || []
      if (docs.length > 0) {
        services.value = docs.map((s) => ({
          id: s.id || s._id || '',
          title: s.title || s.name || 'Jasa Profesional',
          price: s.price || 50000,
          image: s.image || '',
          city: s.city || 'Medan',
          rate: s.rate || 4.9,
          category: s.sub_category || 'Layanan & Servis',
        }))
        return services.value
      }

      // Default curated service fallback if backend has zero service records
      services.value = [
        {
          id: 's1',
          title: 'Ganti Layar LCD & Baterai HP Semua Tipe',
          price: 50000,
          image: '',
          city: 'Medan',
          rate: 5.0,
          category: 'Servis Gadget',
        },
        {
          id: 's2',
          title: 'Servis Laptop & Install Ulang Windows/Mac',
          price: 75000,
          image: '',
          city: 'Jakarta',
          rate: 4.9,
          category: 'Komputer & IT',
        },
        {
          id: 's3',
          title: 'Cuci Sepatu Deep Clean & Repaint Shoes',
          price: 45000,
          image: '',
          city: 'Bandung',
          rate: 4.8,
          category: 'Laundry & Perawatan',
        },
        {
          id: 's4',
          title: 'Service AC Rumah Cuci Bongkar Pasang',
          price: 65000,
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
          city: 'Tangerang',
          rate: 4.9,
          category: 'Rumah Tangga',
        },
      ]
      return services.value
    } catch (err) {
      console.warn('[useServices] Error fetching services:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    services,
    loading,
    fetchServices,
  }
}
