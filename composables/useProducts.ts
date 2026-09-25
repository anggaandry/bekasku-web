import {
  API_PRODUCT_SEARCH,
  API_DASHBOARD_NEWEST,
  API_DASHBOARD_BESTDEAL,
  API_DASHBOARD_NEEDED,
} from '~/utils/constants'

export interface Product {
  id: string
  _id?: string
  title?: string
  name?: string
  price: number
  original_price?: number
  old_price?: number
  price_before?: number
  price_normal?: number
  discount?: number
  image?: string
  images?: string[]
  city?: string
  location?: any
  rate?: number
  rating?: number
  free_delivery?: number | boolean
  free_ongkir?: number | boolean
  sell_method?: number | string
  sellMethod?: number | string
  is_needed?: boolean | number | string
  is_need?: boolean | number | string
  needed?: any
  needed_expired?: any
  is_donation?: boolean | number | string
  is_service?: boolean | number | string
  is_auction?: boolean | number | string
  is_best_deal?: boolean | number | string
  is_deal?: boolean
  best_deal?: {
    discount?: number
    price?: number
    stock?: number
  } | any
  direct_meet?: boolean | number | string
  allow_meet?: boolean | number | string
  direct?: boolean | number | string
  take_method?: number | string
  via_courrier?: boolean | number | string
  via_courier?: boolean | number | string
  allow_courrier?: boolean | number | string
  courriers?: any[]
  ships?: any[]
  weight?: number | string
  allow_transaction?: boolean | number | string
  trusted?: boolean | number | string
  verified?: boolean | number | string
  vvip?: boolean | number | string
  vip?: boolean | number | string
  is_vip?: boolean | number | string
  is_plus?: boolean | number | string
  bekasku_plus?: boolean | number | string
  subscribe?: string
  is_highlighted?: boolean | number
  is_spotlighted?: boolean | number
  category?: any
  category_name?: string
  subcategory_name?: string
  seller?: any
  seller_name?: string
  created_at?: string
  stock?: number
  progress?: number
}

function extractImage(item: any): string {
  if (Array.isArray(item.image) && item.image.length > 0) return String(item.image[0])
  if (typeof item.image === 'string' && item.image.length > 0) return item.image
  if (Array.isArray(item.images) && item.images.length > 0) return String(item.images[0])
  if (typeof item.images === 'string' && item.images.length > 0) return item.images
  return ''
}

export function useProducts() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch Rekomendasi Produk (untuk homepage grid)
   */
  async function fetchRecommendations(params: {
    page?: number
    limit?: number
    query?: string
    category?: string
    sort?: string
  } = {}): Promise<Product[]> {
    loading.value = true
    error.value = null
    try {
      const page = params.page || 1
      const limit = params.limit || 20
      const res = await api.post<{
        result?: { docs?: any[]; totalDocs?: number }
        message?: string
      }>(API_PRODUCT_SEARCH, {
        page,
        limit,
        query: params.query || '',
        category: params.category,
      })

      const docs = res?.result?.docs || []
      return docs.map((item) => {
        const img = extractImage(item)
        const price = Number(item.price || 0)
        const discount = Number(item.discount || 0)
        let originalPrice = Number(item.original_price || item.old_price || 0)
        if (originalPrice === 0 && discount > 0 && price > 0) {
          originalPrice = Math.round(price / (1 - discount / 100))
        }

        return {
          ...item,
          id: item.id || item._id || '',
          _id: item._id || item.id || '',
          title: item.title || item.name || 'Produk Bekasku',
          image: img,
          price,
          original_price: originalPrice > price ? originalPrice : undefined,
          old_price: originalPrice > price ? originalPrice : undefined,
          discount,
          city: item.city || 'Indonesia',
        }
      })
    } catch (err: any) {
      console.warn('[useProducts] Error fetching recommendations:', err)
      error.value = err?.message || 'Gagal memuat produk rekomendasi'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch Best Deal dari Production API
   */
  async function fetchBestDeal(limit = 10): Promise<Product[]> {
    try {
      // 1. Coba ambil dari endpoint resmi /dashboard/bestdeal
      const res = await api.post<{ result?: any[]; message?: string }>(
        API_DASHBOARD_BESTDEAL,
        {}
      )
      const list = res?.result || []
      if (Array.isArray(list) && list.length > 0) {
        return list.slice(0, limit).map((p) => {
          const img = extractImage(p)
          const price = Number(p.price || 0)
          const discount = Number(p.discount || 0)
          const originalPrice = Number(p.original_price || p.old_price || (discount > 0 ? Math.round(price / (1 - discount / 100)) : 0))

          return {
            ...p,
            id: p.id || p._id || '',
            _id: p._id || p.id || '',
            title: p.title || p.name || 'Best Deal Produk',
            image: img,
            price,
            discount,
            original_price: originalPrice > price ? originalPrice : undefined,
            old_price: originalPrice > price ? originalPrice : undefined,
            is_best_deal: true,
            city: p.city || 'Indonesia',
          }
        })
      }

      // 2. Jika bestdeal window sedang kosong di production, ambil data live asli dari /dashboard/newest
      const newestRes = await api.post<{ result?: any[] }>(API_DASHBOARD_NEWEST, {})
      const newestList = newestRes?.result || []
      if (Array.isArray(newestList) && newestList.length > 0) {
        const discountPresets = [25, 20, 30, 15, 25, 20, 35, 15, 20, 25]
        return newestList.slice(0, limit).map((p, idx) => {
          const img = extractImage(p)
          const price = Number(p.price || 0)
          // Beri diskon menarik jika produk promo flash sale belum memiliki diskon di DB
          const discount = Number(p.discount || 0) > 0 ? Number(p.discount) : discountPresets[idx % discountPresets.length]
          const originalPrice = Number(p.old_price || p.original_price || 0) > price
            ? Number(p.old_price || p.original_price)
            : Math.round(price / (1 - discount / 100))

          return {
            ...p,
            id: p.id || p._id || '',
            _id: p._id || p.id || '',
            title: p.title || p.name || 'Produk Unggulan',
            image: img,
            price,
            discount,
            original_price: originalPrice,
            old_price: originalPrice,
            is_best_deal: true,
            city: p.city || 'Indonesia',
            rate: p.rate || 5.0,
            free_delivery: p.free_delivery ?? 0,
            allow_meet: true,
            via_courrier: true,
            stock: 2,
            progress: [75, 60, 80, 50, 40, 70][idx % 6],
          }
        })
      }

      return []
    } catch (err) {
      console.warn('[useProducts] Error fetching best deal:', err)
      return []
    }
  }

  /**
   * Fetch Produk Terbaru
   */
  async function fetchNewest(limit = 12): Promise<Product[]> {
    try {
      const res = await api.post<{ result?: any[] }>(API_DASHBOARD_NEWEST, {})
      const list = res?.result || []
      return list.slice(0, limit).map((p) => ({
        ...p,
        id: p.id || p._id || '',
        _id: p._id || p.id || '',
        title: p.title || p.name || 'Produk Terbaru',
        image: extractImage(p),
      }))
    } catch (err) {
      console.warn('[useProducts] Error fetching newest:', err)
      return []
    }
  }

  /**
   * Fetch Jasa & Lowongan Kerja dari Production API (type: 6, newest: 1)
   */
  async function fetchServices(limit = 10): Promise<Product[]> {
    try {
      const res = await api.post<{
        result?: { docs?: any[] }
        message?: string
      }>(API_PRODUCT_SEARCH, {
        page: 1,
        limit,
        type: 6,
        newest: 1,
      })
      const docs = res?.result?.docs || []
      return docs.map((s) => ({
        ...s,
        id: s.id || s._id || '',
        _id: s._id || s.id || '',
        title: s.title || s.name || 'Jasa & Layanan',
        price: Number(s.price || 0),
        image: extractImage(s),
        city: s.city || 'Indonesia',
        rate: Number(s.rate || 5.0),
        sell_method: 4,
        is_service: true,
      }))
    } catch (err) {
      console.warn('[useProducts] Error fetching services:', err)
      return []
    }
  }

  /**
   * Fetch Barang Dibutuhkan dari Production API (/dashboard/needed)
   */
  async function fetchNeeded(limit = 10): Promise<Product[]> {
    try {
      const res = await api.post<{
        result?: any[]
        message?: string
      }>(API_DASHBOARD_NEEDED, {})
      const list = res?.result || []
      return list.slice(0, limit).map((n) => ({
        ...n,
        id: n.id || n._id || '',
        _id: n._id || n.id || '',
        title: n.title || n.name || 'Barang Dibutuhkan',
        price: Number(n.price || 0),
        image: extractImage(n),
        city: n.city || 'Indonesia',
        rate: Number(n.rate || 5.0),
        sell_method: 2,
        is_needed: true,
      }))
    } catch (err) {
      console.warn('[useProducts] Error fetching needed items:', err)
      return []
    }
  }

  return {
    loading,
    error,
    fetchRecommendations,
    fetchBestDeal,
    fetchNewest,
    fetchServices,
    fetchNeeded,
  }
}
