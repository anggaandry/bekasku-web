import { API_LIVE_LIST, API_VIDEO_LIST } from '~/utils/constants'
import type { LiveSession } from '~/types/live'
import type { VideoFeedItem } from '~/types/video'

export type { VideoFeedItem }

export function useLiveShopping() {
  const api = useApi()
  const liveSessions = ref<VideoFeedItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLiveSessions(): Promise<VideoFeedItem[]> {
    loading.value = true
    error.value = null
    try {
      // 1. Fetch active Live Streams
      let liveList: VideoFeedItem[] = []
      try {
        const liveRes = await api.post<{ result?: LiveSession[] }>(API_LIVE_LIST, {})
        const rawLives = liveRes?.result || []
        liveList = rawLives.map((l: any) => ({
          id: l.live_id || l._id || String(Math.random()),
          _id: l._id || l.live_id,
          live_id: l.live_id,
          user_id: l.user_id,
          user_name: l.user_name || 'Host',
          user_avatar: l.user_avatar || '',
          thumbnail: l.thumbnail || l.user_avatar || '',
          video_url: '',
          title: l.title || 'Sesi Jualan Live',
          content: l.title || 'Sesi Jualan Live',
          viewers: l.viewer_count || 0,
          likes: 0,
          comments: 0,
          city: l.city || 'Indonesia',
          is_live: true,
        }))
      } catch (err) {
        // silent fail on live list, continue to video list
      }

      // 2. Fetch Video Feed Items
      let videoList: VideoFeedItem[] = []
      try {
        const videoRes = await api.post<{ result?: { docs?: any[] } }>(API_VIDEO_LIST, {
          page: 1,
          limit: 10,
          lang: 'id',
        })
        const rawVideos = videoRes?.result?.docs || []
        videoList = rawVideos.map((v: any) => ({
          id: v._id || v.id || String(Math.random()),
          _id: v._id,
          user_id: v.user_id,
          user_name: v.user_name || 'Seller',
          user_avatar: v.user_avatar || '',
          thumbnail: v.thumbnail || '',
          video_url: v.video || v.video_url || '',
          title: v.content || 'Video BekasKu',
          content: v.content || '',
          likes: v.total_like || 0,
          total_like: v.total_like || 0,
          comments: v.total_comment || 0,
          total_comment: v.total_comment || 0,
          city: v.city || 'Indonesia',
          music: 'Original sound',
          is_live: false,
          product_id: v.product_id,
          product: v.product || (v.product_id
            ? {
                _id: v.product_id,
                title: v.product_title || 'Produk BekasKu',
                price: Number(v.product_price || 0),
                image: v.product_image || '',
              }
            : null),
        }))
      } catch (err) {
        // silent fail
      }

      // Combined: Live items first, then video items
      const combined = [...liveList, ...videoList]
      liveSessions.value = combined
      return combined
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat sesi live & video'
      liveSessions.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    liveSessions,
    loading,
    error,
    fetchLiveSessions,
  }
}
