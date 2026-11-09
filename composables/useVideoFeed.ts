import {
  API_LIVE_LIST,
  API_VIDEO_LIST,
  API_VIDEO_LIKE,
  API_VIDEO_DELETE,
  API_VIDEO_COMMENT_LIST,
  API_VIDEO_COMMENT_POST,
  API_VIDEO_POST,
  API_PRODUCT_MYPOST,
} from '~/utils/constants'
import type { VideoFeedItem, VideoCommentItem } from '~/types/video'
import type { LiveSession } from '~/types/live'
import { useAuthStore } from '~/stores/auth'

export function useVideoFeed() {
  const api = useApi()
  const authStore = useAuthStore()

  const videos = ref<VideoFeedItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const hasNextPage = ref(true)
  const selectedTab = ref<number>(0) // 0: Semua, 1: Saya

  let isFetching = false

  async function fetchVideos({ refresh = false } = {}) {
    if (isFetching && !refresh) return
    isFetching = true

    if (refresh) {
      page.value = 1
      videos.value = []
      hasNextPage.value = true
    }

    loading.value = true
    error.value = null

    try {
      // Phase 1: If Page 1 & Tab 0 (Semua), fetch active Live Streams first
      let activeLives: VideoFeedItem[] = []
      if (page.value === 1 && selectedTab.value === 0) {
        try {
          const liveRes = await api.post<{ result?: LiveSession[] }>(API_LIVE_LIST, {})
          const rawLives = liveRes?.result || []
          activeLives = rawLives.map((l: any) => ({
            id: l.live_id || l._id || String(Math.random()),
            _id: l._id || l.live_id,
            live_id: l.live_id,
            user_id: l.user_id,
            user_name: l.user_name || 'Host BekasKu',
            user_avatar: l.user_avatar || '',
            thumbnail: l.thumbnail || l.user_avatar || '',
            video_url: '',
            title: l.title || 'Sesi Jualan Live',
            content: l.title || 'Sesi Jualan Live',
            city: l.city || 'Indonesia',
            viewers: l.viewer_count || 0,
            likes: 0,
            total_like: 0,
            comments: 0,
            total_comment: 0,
            is_live: true,
          }))
        } catch {
          // ignore error fetching lives
        }
      }

      // Phase 2: Fetch standard short videos
      const body: Record<string, any> = {
        page: page.value,
        limit: 10,
        lang: 'id',
      }

      if (selectedTab.value === 1) {
        body.user_id = authStore.userId || ''
      }

      const res = await api.post<{
        result?: {
          docs?: any[]
          hasNextPage?: boolean
        }
      }>(API_VIDEO_LIST, body)

      const docs = res?.result?.docs || []
      const mappedVideos: VideoFeedItem[] = docs.map((v: any) => ({
        id: v._id || v.id || String(Math.random()),
        _id: v._id,
        user_id: v.user_id,
        user_name: v.user_name || 'Seller',
        user_avatar: v.user_avatar || '',
        thumbnail: v.thumbnail || '',
        video_url: v.video || v.video_url || '',
        title: v.content || 'Video BekasKu',
        content: v.content || '',
        city: v.city || 'Indonesia',
        likes: v.total_like || 0,
        total_like: v.total_like || 0,
        is_liked: v.is_liked === true,
        comments: v.total_comment || 0,
        total_comment: v.total_comment || 0,
        music: 'Original video sound',
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
        created_at: v.created_at,
      }))

      if (page.value === 1) {
        videos.value = [...activeLives, ...mappedVideos]
      } else {
        videos.value.push(...mappedVideos)
      }

      hasNextPage.value = res?.result?.hasNextPage === true
      if (hasNextPage.value) {
        page.value += 1
      }
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat video'
    } finally {
      loading.value = false
      isFetching = false
    }
  }

  async function toggleLike(item: VideoFeedItem): Promise<boolean> {
    const videoId = item._id || item.id
    if (!videoId) return false

    const wasLiked = item.is_liked === true
    const currentLikes = item.total_like || 0

    // Optimistic update
    item.is_liked = !wasLiked
    item.total_like = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1
    item.likes = item.total_like

    try {
      const res = await api.post<{
        status?: boolean
        message?: string
        result?: { is_liked?: boolean; total_like?: number }
      }>(API_VIDEO_LIKE, { video_post_id: videoId })

      if (res?.result) {
        item.is_liked = res.result.is_liked === true
        item.total_like = res.result.total_like ?? item.total_like
        item.likes = item.total_like
      }
      return true
    } catch {
      // Rollback
      item.is_liked = wasLiked
      item.total_like = currentLikes
      item.likes = currentLikes
      return false
    }
  }

  async function deleteVideo(item: VideoFeedItem): Promise<boolean> {
    const videoId = item._id || item.id
    if (!videoId) return false

    try {
      await api.post(API_VIDEO_DELETE, { video_post_id: videoId })
      videos.value = videos.value.filter((v) => (v._id || v.id) !== videoId)
      return true
    } catch (err: any) {
      throw new Error(err?.message || 'Gagal menghapus video')
    }
  }

  async function fetchComments(videoId: string, commentPage = 1) {
    const res = await api.post<{
      result?: {
        docs?: any[]
        hasNextPage?: boolean
        totalDocs?: number
        total_comment?: number
      }
    }>(API_VIDEO_COMMENT_LIST, {
      video_post_id: videoId,
      page: commentPage,
      limit: 15,
    })

    const docs = res?.result?.docs || []
    const mapped: VideoCommentItem[] = docs.map((c: any) => ({
      _id: c._id || String(Math.random()),
      comment: c.comment || '',
      user_name: c.user_name || 'Pengguna BekasKu',
      user_avatar: c.user_avatar || '',
      time: c.time || 'Baru saja',
      created_at: c.created_at,
    }))

    return {
      comments: mapped,
      hasNextPage: res?.result?.hasNextPage === true,
      total: res?.result?.totalDocs || res?.result?.total_comment || mapped.length,
    }
  }

  async function postComment(videoId: string, commentText: string): Promise<VideoCommentItem> {
    const res = await api.post<{
      result?: any
      status?: boolean
    }>(API_VIDEO_COMMENT_POST, {
      video_post_id: videoId,
      comment: commentText.trim(),
    })

    const created = res?.result || {}
    return {
      _id: created._id || String(Date.now()),
      comment: commentText.trim(),
      user_name: authStore.userName || 'Saya',
      user_avatar: authStore.userAvatar,
      time: 'Baru saja',
    }
  }

  async function postVideo(payload: {
    content: string
    videoUrl: string
    thumbUrl: string
    productId?: string | null
  }) {
    return await api.post<{ status?: boolean; message?: string; result?: any }>(API_VIDEO_POST, {
      content: payload.content,
      video: payload.videoUrl,
      thumbnail: payload.thumbUrl,
      product_id: payload.productId || null,
    })
  }

  async function fetchMyProducts(search = '', productPage = 1) {
    const res = await api.post<{
      result?: {
        docs?: any[]
        hasNextPage?: boolean
      }
    }>(API_PRODUCT_MYPOST, {
      page: productPage,
      filter: search,
      lang: 'id',
      limit: 20,
    })
    return {
      docs: res?.result?.docs || [],
      hasNextPage: res?.result?.hasNextPage === true,
    }
  }

  return {
    videos,
    loading,
    error,
    page,
    hasNextPage,
    selectedTab,
    fetchVideos,
    toggleLike,
    deleteVideo,
    fetchComments,
    postComment,
    postVideo,
    fetchMyProducts,
  }
}

