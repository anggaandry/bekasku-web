import { API_ADS_LIST, API_ADS_LOG } from '~/utils/constants'
import type { Banner } from '~/types/banner'

export function useBanners() {
  const api = useApi()
  const banners = ref<Banner[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBanners(): Promise<Banner[]> {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ result?: Banner[] }>(API_ADS_LIST, {})
      // Filter hanya banner yang aktif (active: true) dan memiliki URL gambar/video
      const list = (response?.result || []).filter(b => b.active !== false && !!b.image)
      banners.value = list
      return list
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat banner iklan'
      banners.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function logBannerClick(id: string) {
    if (!id) return
    try {
      await api.post(API_ADS_LOG, { id })
    } catch {
      // ignore log failure
    }
  }

  return {
    banners,
    loading,
    error,
    fetchBanners,
    logBannerClick,
  }
}
