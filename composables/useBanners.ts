import { API_ADS_LIST, API_ADS_LOG } from '~/utils/constants'

export interface Banner {
  _id?: string
  id?: string
  title?: string
  image: string
  link?: string
  active?: boolean
  view?: number
  isVideo?: boolean
  domain?: string
}

export function isVideoUrl(url?: string): boolean {
  if (!url) return false
  const cleanUrl = url.split('?')[0].toLowerCase()
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.m3u8') ||
    cleanUrl.endsWith('.3gp') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv')
  )
}

export function getDisplayDomain(link?: string): string {
  if (!link) return 'bekasku.id'
  try {
    const url = new URL(link)
    let host = url.hostname
    if (host.startsWith('www.')) {
      host = host.substring(4)
    }
    return host || 'bekasku.id'
  } catch {
    return 'bekasku.id'
  }
}

// Complete active ads from MongoDB production database
export const MONGODB_ACTIVE_ADS: Banner[] = [
  {
    _id: '67be9e8fefb18dbb11041d02',
    title: 'River Valley Resort Home',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67be9e8fefb18dbb11041d02_20250226115439_rivervalley-resorthome.png',
    link: 'https://rivervalley-resorthome.com/',
    domain: 'rivervalley-resorthome.com',
    isVideo: false,
  },
  {
    _id: '67be9f1a2de468d3b8002bd3',
    title: 'Givency One Luxury Residence',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67be9f1a2de468d3b8002bd3_20250226115658_givencyone.png',
    link: 'https://givencyone.com/',
    domain: 'givencyone.com',
    isVideo: false,
  },
  {
    _id: '67be9f4356db5a5fcf0d1b65',
    title: 'Halton Place Premium Living',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67be9f4356db5a5fcf0d1b65_20250226115739_halton-place.png',
    link: 'https://halton-place.com/',
    domain: 'halton-place.com',
    isVideo: false,
  },
  {
    _id: '67739697d4da7d3e9b039652',
    title: 'Milestone Coffee & Eatery',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67739697d4da7d3e9b039652_20241231140238_Milestone Ads 1140x630.png',
    link: 'https://www.instagram.com/milestone.mdn',
    domain: 'instagram.com',
    isVideo: false,
  },
  {
    _id: '677396fa83488833a8078522',
    title: 'Doffee ID Specialty Coffee',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_677396fa83488833a8078522_20241231140218_Doffee Ads 1140x630.png',
    link: 'https://www.instagram.com/doffee.id',
    domain: 'instagram.com',
    isVideo: false,
  },
  {
    _id: '6773978744fcf038cc0edb62',
    title: 'Earth Bake Artisan Bakery',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_6773978744fcf038cc0edb62_20241231140439_IMG-20241231-WA0005.jpg',
    link: 'https://www.instagram.com/earthbake',
    domain: 'instagram.com',
    isVideo: false,
  },
  {
    _id: '67abfb49ffbe01a9bc080ae2',
    title: 'Urban Stretch Clinic',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67abfb49ffbe01a9bc080ae2_20250212083713_iklan urban.jpg',
    link: 'https://wa.me/c/6285176737388',
    domain: 'wa.me',
    isVideo: false,
  },
  {
    _id: '67abfba0ebc7e0338d05f4e2',
    title: 'Eye Wellness Center',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67abfba0ebc7e0338d05f4e2_20250212083840_iklan eyewellness.jpg',
    link: 'https://wa.me/6285175478383',
    domain: 'wa.me',
    isVideo: false,
  },
  {
    _id: '67abfbd33d17b87b2507c355',
    title: 'Living Clinic Cambridge',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67abfbd33d17b87b2507c355_20250212083931_iklan living.jpg',
    link: 'https://wa.me/6285117108383',
    domain: 'wa.me',
    isVideo: false,
  },
  {
    _id: '67abfbfeffbe01a9bc080ae4',
    title: 'Selecta Hall & Convention',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67abfbfeffbe01a9bc080ae4_20250212084014_IMG-20250212-WA0000.jpg',
    link: 'https://g.co/kgs/hVSt7jK',
    domain: 'google.com',
    isVideo: false,
  },
  {
    _id: '67be9f6aefb18dbb11041d04',
    title: 'River Valley Resort Phase 2',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_67be9f6aefb18dbb11041d04_20250226115818_rivervalley-resorthome.png',
    link: 'https://rivervalley-resorthome.com/',
    domain: 'rivervalley-resorthome.com',
    isVideo: false,
  },
  {
    _id: '63d62c42f1c6c2592601f2e1',
    title: 'Tips & Panduan Belanja Preloved',
    image: 'https://bc.bekasku.id/myadmin/assets/images/advertisement/advertisement_63d62c42f1c6c2592601f2e1_20230226132031_111.jpg',
    link: 'https://www.instagram.com/p/Cn8rHTYyRdJ/',
    domain: 'instagram.com',
    isVideo: false,
  },
]

export function useBanners() {
  const api = useApi()
  const banners = ref<Banner[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBanners(): Promise<Banner[]> {
    loading.value = true
    error.value = null
    try {
      const res = await api.post<{ result?: any[]; message?: string }>(API_ADS_LIST, {
        province: 'Sumatera Utara',
      })
      const rawItems = res?.result || []

      const formattedBanners: Banner[] = rawItems
        .filter((item) => item && (item.image || item.imageUrl))
        .map((item) => {
          const mediaUrl = item.image || item.imageUrl || ''
          const isVideo = isVideoUrl(mediaUrl)
          const domain = getDisplayDomain(item.link || item.url)
          return {
            _id: item._id || item.id,
            id: item._id || item.id,
            title: item.title || 'Penawaran Spesial BekasKu',
            image: mediaUrl,
            link: item.link || item.url || '',
            active: item.active !== false,
            view: item.view || 0,
            isVideo,
            domain,
          }
        })

      // Merge with all known active Mongo ads so user sees all available promotions
      const existingIds = new Set(formattedBanners.map((b) => b._id || b.id))
      const combined = [...formattedBanners]
      for (const mAd of MONGODB_ACTIVE_ADS) {
        if (!existingIds.has(mAd._id)) {
          combined.push(mAd)
        }
      }

      banners.value = combined.length > 0 ? combined : MONGODB_ACTIVE_ADS
      return banners.value
    } catch (err: any) {
      console.warn('[useBanners] Failed to fetch production ads:', err)
      error.value = err?.message || 'Gagal memuat banner'
      banners.value = MONGODB_ACTIVE_ADS
      return MONGODB_ACTIVE_ADS
    } finally {
      loading.value = false
    }
  }

  async function logAdClick(id?: string) {
    if (!id) return
    try {
      await api.post(API_ADS_LOG, { id })
    } catch {
      // Non-blocking telemetry
    }
  }

  return {
    banners,
    loading,
    error,
    fetchBanners,
    isVideoUrl,
    getDisplayDomain,
    logAdClick,
  }
}
