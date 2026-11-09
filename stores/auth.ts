import { defineStore } from 'pinia'
import {
  STORAGE_KEY_TOKEN,
  STORAGE_KEY_USER_ID,
  STORAGE_KEY_USER_PROFILE,
  STORAGE_KEY_LOCATION,
} from '~/utils/constants'
import { sanitizeMediaUrl } from '~/utils/media'
import { isJwtExpired } from '~/utils/jwt'
import type { AuthUserPayload } from '~/types/auth'

export interface UserProfile {
  _id: string
  id?: string
  name: string
  username?: string
  phone?: string
  avatar?: string
  email?: string
  city?: string
  default_loc?: string
  default_lat?: number
  default_lon?: number
  phone_verify?: boolean
  is_verified?: boolean
  subscribe?: string
  subscribe_type?: string
  follower_count?: number
  following_count?: number
  cart_count?: number
  unread_notifications?: number
  unread_messages?: number
  badge_wishlist?: number
  badge_promotion?: number
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
  const user = ref<UserProfile | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value && !!user.value._id && user.value._id !== 'GUEST')
  const isPhoneVerified = computed(() => Boolean(user.value?.phone_verify || user.value?.is_verified))
  const displayName = computed(() => user.value?.name || user.value?.username || 'Akun Saya')
  const userAvatar = computed(() => sanitizeMediaUrl(user.value?.avatar, ''))
  const userId = computed(() => user.value?._id || user.value?.id || '')

  function normalizeUser(raw: (AuthUserPayload & Record<string, any>) | UserProfile): UserProfile {
    const resolvedId = String(raw._id || raw.id || (raw as AuthUserPayload).user_id || '').trim()
    const rawAny = raw as Record<string, any>
    return {
      _id: resolvedId,
      id: resolvedId,
      name: raw.name || raw.username || 'Member BekasKu',
      username: raw.username,
      phone: raw.phone || '',
      avatar: sanitizeMediaUrl(raw.avatar, ''),
      email: raw.email || '',
      city: raw.city || raw.default_loc || '',
      default_loc: raw.default_loc || raw.city || '',
      default_lat: raw.default_lat,
      default_lon: raw.default_lon,
      phone_verify: Boolean(raw.phone_verify ?? raw.is_verified ?? false),
      is_verified: Boolean(raw.is_verified ?? raw.phone_verify ?? false),
      subscribe: rawAny.subscribe || 'no',
      subscribe_type: rawAny.subscribe_type || '',
      follower_count: Number(rawAny.total_followers ?? rawAny.follower ?? rawAny.follower_count ?? 0),
      following_count: Number(rawAny.total_following ?? rawAny.following ?? rawAny.following_count ?? 0),
      cart_count: raw.cart_count || 0,
      unread_notifications: raw.unread_notifications || 0,
      unread_messages: raw.unread_messages || 0,
      badge_wishlist: Number(rawAny.badge_wishlist ?? rawAny.total_favorite ?? 0),
      badge_promotion: Number(rawAny.badge_promotion ?? rawAny.badge_active_promotion ?? 0),
    }
  }

  function persistSnapshot(normalized: UserProfile, jwtToken: string) {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken)
      localStorage.setItem(STORAGE_KEY_USER_ID, normalized._id)
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(normalized))
    } catch {
      // ignore storage quota errors
    }
  }

  function setSession(userData: AuthUserPayload | UserProfile, jwtToken: string) {
    const normalized = normalizeUser(userData)
    user.value = normalized
    token.value = jwtToken
    api.setToken(jwtToken)
    persistSnapshot(normalized, jwtToken)
  }

  function markPhoneVerified(phone?: string) {
    if (!user.value) return
    user.value = {
      ...user.value,
      ...(phone ? { phone } : {}),
      phone_verify: true,
      is_verified: true,
    }
    if (token.value) {
      persistSnapshot(user.value, token.value)
    }
  }

  function updateAvatar(avatarUrl: string) {
    if (!user.value) return
    user.value = {
      ...user.value,
      avatar: sanitizeMediaUrl(avatarUrl, ''),
    }
    if (token.value) {
      persistSnapshot(user.value, token.value)
    }
  }

  function updateLocation(loc: string, lat?: number, lon?: number) {
    if (import.meta.client) {
      try {
        localStorage.setItem(
          STORAGE_KEY_LOCATION,
          JSON.stringify({ default_loc: loc, default_lat: lat, default_lon: lon }),
        )
      } catch {
        // ignore
      }
    }
    if (!user.value) return
    user.value = {
      ...user.value,
      city: loc,
      default_loc: loc,
      default_lat: lat,
      default_lon: lon,
    }
    if (token.value) {
      persistSnapshot(user.value, token.value)
    }
  }

  function clearSession() {
    user.value = null
    token.value = null
    api.setToken(null)
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER_ID)
        localStorage.removeItem(STORAGE_KEY_USER_PROFILE)
      } catch {
        // ignore
      }
      try {
        const userIdCookie = useCookie(STORAGE_KEY_USER_ID)
        userIdCookie.value = null
      } catch {
        // ignore
      }
      try {
        const chatStore = useChatStore()
        chatStore.disconnectAll?.()
      } catch {
        // ignore
      }
    }
    api.fetchGuestToken()
  }

  async function fetchProfile(): Promise<UserProfile | null> {
    if (!token.value) return null
    loading.value = true
    try {
      const res = await api.post<{ result?: AuthUserPayload; message?: string }>('/profile/info', {})
      if (res?.result) {
        const currentId = user.value?._id || userId.value || res.result._id || res.result.id || ''
        const merged = {
          ...user.value,
          ...res.result,
          _id: currentId,
          id: currentId,
        }
        const normalized = normalizeUser(merged)
        user.value = normalized
        if (token.value) {
          persistSnapshot(normalized, token.value)
        }
        return normalized
      }
    } catch (err: any) {
      const errMsg = err?.data?.message?.toString()?.toLowerCase() || ''
      if (errMsg.includes('jwt-expired') || errMsg.includes('token needed') || errMsg.includes('key needed')) {
        clearSession()
        return null
      }
    } finally {
      loading.value = false
    }
    return user.value
  }

  function initFromStorage() {
    if (!import.meta.client) return
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
      const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID)
      const storedProfile = localStorage.getItem(STORAGE_KEY_USER_PROFILE)

      if (storedToken && storedUserId && storedUserId !== 'GUEST') {
        // Cek masa aktif token JWT di client
        if (isJwtExpired(storedToken)) {
          clearSession()
          return
        }

        token.value = storedToken
        api.setToken(storedToken)
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile)
            if (parsed && (parsed._id || parsed.id)) {
              user.value = normalizeUser(parsed)
            }
          } catch {
            // ignore invalid JSON
          }
        }
        fetchProfile()
      }
    } catch {
      // ignore
    }
  }

  return {
    user,
    userId,
    token,
    loading,
    isLoggedIn,
    isPhoneVerified,
    displayName,
    userAvatar,
    setSession,
    markPhoneVerified,
    updateAvatar,
    updateLocation,
    clearSession,
    fetchProfile,
    initFromStorage,
  }
})
