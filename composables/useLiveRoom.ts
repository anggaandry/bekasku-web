import { ref, onBeforeUnmount } from 'vue'
import { Room, RoomEvent, RemoteTrack, Track } from 'livekit-client'
import {
  API_LIVE_VALIDATE,
  API_LIVE_TOKEN,
  API_SELLER_PRODUCT,
  LIVEKIT_WS_URL,
} from '~/utils/constants'
import type { LiveProductItem, LiveChatMessage } from '~/types/live'
import { useAuthStore } from '~/stores/auth'

export function useLiveRoom(liveId: string) {
  const api = useApi()
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const host = ref<{
    id: string
    name: string
    avatar: string
    rating: number
    title?: string
    is_followed?: boolean
  }>({
    id: '',
    name: 'Host BekasKu',
    avatar: '',
    rating: 4.8,
    title: 'Sesi Jualan Live',
    is_followed: false,
  })

  const viewers = ref(0)
  const previewAvatars = ref<string[]>([])
  const messages = ref<LiveChatMessage[]>([])
  const pinnedProduct = ref<LiveProductItem | null>(null)
  const hostProducts = ref<LiveProductItem[]>([])
  const floatingHearts = ref<Array<{ id: number; color: string; left: number }>>([])
  const isLiveEnded = ref(false)
  const isConnecting = ref(false)
  const isConnected = ref(false)
  const isMuted = ref(false)
  const error = ref<string | null>(null)

  let livekitRoom: Room | null = null
  let socket: WebSocket | null = null
  let heartCounter = 0
  const attachedAudioEls: HTMLMediaElement[] = []
  const heartTimers = new Set<ReturnType<typeof setTimeout>>()

  // 1. LiveKit Video Attachment Ref
  const videoElementRef = ref<HTMLVideoElement | null>(null)

  async function joinRoom(initialHost?: {
    id: string
    name: string
    avatar: string
    rating?: number
    title?: string
  }) {
    if (initialHost) {
      host.value = {
        id: initialHost.id,
        name: initialHost.name,
        avatar: initialHost.avatar,
        rating: initialHost.rating || 4.8,
        title: initialHost.title || 'Sesi Jualan Live',
      }
    }

    if (!import.meta.client) return
    isConnecting.value = true
    error.value = null

    const currentUserId = authStore.userId || `guest_${Math.random().toString(36).substring(2, 8)}`

    try {
      // Step 0: Validate Live session & hydrate authoritative host metadata
      try {
        const validateRes = await api.post<{
          status?: boolean
          result?: {
            live_id?: string
            title?: string
            status?: 'living' | 'ended'
            host?: {
              id?: string
              name?: string
              avatar?: string
              rating?: number
              is_followed?: boolean
            }
          }
        }>(API_LIVE_VALIDATE, { live_id: liveId })

        if (validateRes?.result) {
          if (validateRes.result.status === 'ended') {
            isLiveEnded.value = true
            isConnecting.value = false
            return
          }
          const h = validateRes.result.host
          if (h) {
            host.value = {
              id: h.id || host.value.id,
              name: h.name || host.value.name,
              avatar: h.avatar || host.value.avatar,
              rating: h.rating ?? host.value.rating,
              title: validateRes.result.title || host.value.title,
              is_followed: h.is_followed ?? false,
            }
          }
        }
      } catch (valErr: any) {
        const status = valErr?.statusCode || valErr?.status || valErr?.response?.status
        if (status === 404 || valErr?.data?.status === false) {
          isLiveEnded.value = true
          isConnecting.value = false
          return
        }
      }

      // Step A: Fetch LiveKit Subscriber Token
      let livekitToken = ''
      try {
        const tokenRes = await api.get<{ result?: { token?: string }; token?: string }>(
          `${API_LIVE_TOKEN}?channelName=${encodeURIComponent(liveId)}&uid=${encodeURIComponent(
            currentUserId
          )}&role=subscriber`
        )
        livekitToken = tokenRes?.result?.token || tokenRes?.token || ''
      } catch (err: any) {
        // Continue to WS even if token endpoint fails (mock/sandbox fallback)
      }

      // Step B: Connect to LiveKit Room if token available
      if (livekitToken) {
        try {
          livekitRoom = new Room({
            adaptiveStream: true,
            dynacast: true,
          })

          livekitRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            if (track.kind === Track.Kind.Video && videoElementRef.value) {
              track.attach(videoElementRef.value)
            } else if (track.kind === Track.Kind.Audio) {
              const el = track.attach()
              el.muted = isMuted.value
              attachedAudioEls.push(el)
              document.body.appendChild(el)
            }
          })

          livekitRoom.on(RoomEvent.Disconnected, () => {
            isConnected.value = false
          })

          await livekitRoom.connect(LIVEKIT_WS_URL, livekitToken)
          isConnected.value = true
        } catch {
          // fallback gracefully without crashing
        }
      }

      // Step C: Connect to Native BekasKu Live WebSocket for Chat & Reactions
      connectWebSocket(liveId, currentUserId)

      // Step D: Fetch Host Products for Live Store
      if (host.value.id) {
        fetchHostProducts(host.value.id)
      }
    } catch (err: any) {
      error.value = err?.message || 'Gagal terhubung ke ruang live'
    } finally {
      isConnecting.value = false
    }
  }

  function connectWebSocket(roomId: string, userId: string) {
    if (!import.meta.client) return
    try {
      const apiBase = (config.public.apiBase as string) || 'https://sandbox.bekasku.id/v3/api'
      const wsBase = apiBase.replace(/^http/, 'ws').replace(/\/$/, '')
      const wsUrl = `${wsBase}/socket/live/${roomId}/${userId}`

      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        // Connection open, backend automatically triggers viewer_joined & audience_update
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleSocketMessage(data)
        } catch {}
      }

      socket.onerror = () => {}
      socket.onclose = () => {}
    } catch {}
  }

  function handleSocketMessage(payload: any) {
    const eventType = payload.event || payload.type

    switch (eventType) {
      case 'audience_update':
      case 'viewer_update':
        viewers.value = payload.total ?? payload.count ?? viewers.value
        if (payload.preview_avatars && Array.isArray(payload.preview_avatars)) {
          previewAvatars.value = payload.preview_avatars
        }
        break

      case 'viewer_joined':
      case 'user_joined':
        messages.value.push({
          id: `join_${Date.now()}_${Math.random()}`,
          user_id: payload.user_id || '',
          user_name: payload.sender || payload.user_name || 'Penonton',
          user_avatar: payload.avatar || payload.user_avatar || '',
          message: 'bergabung',
          is_join: true,
          timestamp: Date.now(),
        })
        break

      case 'chat':
        messages.value.push({
          id: `chat_${Date.now()}_${Math.random()}`,
          user_id: payload.user_id || '',
          user_name: payload.sender || payload.user_name || 'Penonton',
          user_avatar: payload.avatar || payload.user_avatar || '',
          message: payload.message || '',
          is_join: false,
          timestamp: payload.timestamp || Date.now(),
        })
        break

      case 'pin_product':
      case 'pinned_product':
        if (payload.product) {
          const p = payload.product
          pinnedProduct.value = {
            _id: p._id || p.id || '',
            title: p.title || p.name || '',
            price: p.price || 0,
            image: p.image || (Array.isArray(p.images) ? p.images[0] : '') || '',
          }
        } else {
          pinnedProduct.value = null
        }
        break

      case 'floating_reaction':
        spawnFloatingHeart()
        break

      case 'live_ended':
        isLiveEnded.value = true
        break
    }
  }

  function sendChatMessage(text: string) {
    const clean = text.trim()
    if (!clean) return

    // Optimistic UI insert
    messages.value.push({
      id: `chat_${Date.now()}_${Math.random()}`,
      user_id: authStore.userId || '',
      user_name: authStore.userName || 'Saya',
      user_avatar: authStore.userAvatar,
      message: clean,
      is_join: false,
      timestamp: Date.now(),
    })

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          command: 'chat',
          message: clean,
          senderID: authStore.userId || '',
          senderName: authStore.userName || 'Penonton',
          senderAvatar: authStore.userAvatar || '',
          isHost: false,
        })
      )
    }
  }

  function sendLikeReaction() {
    spawnFloatingHeart()
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          command: 'like_reaction',
          reactionType: 'heart',
        })
      )
    }
  }

  function spawnFloatingHeart() {
    const colors = ['#EF4444', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const left = Math.floor(Math.random() * 60) + 20 // 20% to 80%
    const id = ++heartCounter

    floatingHearts.value.push({ id, color, left })

    const timer = setTimeout(() => {
      heartTimers.delete(timer)
      floatingHearts.value = floatingHearts.value.filter((h) => h.id !== id)
    }, 2000)
    heartTimers.add(timer)
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (videoElementRef.value) {
      videoElementRef.value.muted = isMuted.value
    }
    attachedAudioEls.forEach((el) => {
      el.muted = isMuted.value
    })
  }

  async function fetchHostProducts(sellerId: string) {
    try {
      const res = await api.post<{
        result?: { docs?: any[] }
      }>(API_SELLER_PRODUCT, {
        seller_id: sellerId,
        scope: 'livestream',
        page: 1,
        limit: 50,
        filter: '',
        lang: 'id',
      })
      const docs = res?.result?.docs || []
      hostProducts.value = docs.map((d: any) => ({
        _id: d._id,
        title: d.title || '',
        price: d.price || 0,
        image: d.image || (d.images && d.images[0]) || '',
        step: d.step,
        rating: d.rating,
        review_count: d.review_count,
        seller_id: d.user_id,
      }))
    } catch {
      hostProducts.value = []
    }
  }

  async function leaveRoom() {
    heartTimers.forEach((t) => clearTimeout(t))
    heartTimers.clear()

    attachedAudioEls.forEach((el) => el.remove())
    attachedAudioEls.length = 0

    try {
      if (livekitRoom) {
        await livekitRoom.disconnect()
        livekitRoom = null
      }
    } catch {}

    try {
      if (socket) {
        socket.close()
        socket = null
      }
    } catch {}
  }

  onBeforeUnmount(() => {
    leaveRoom()
  })

  return {
    host,
    viewers,
    previewAvatars,
    messages,
    pinnedProduct,
    hostProducts,
    floatingHearts,
    isLiveEnded,
    isConnecting,
    isConnected,
    isMuted,
    error,
    videoElementRef,
    joinRoom,
    sendChatMessage,
    sendLikeReaction,
    toggleMute,
    fetchHostProducts,
    leaveRoom,
  }
}

