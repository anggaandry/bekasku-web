import { defineStore } from 'pinia'
import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER_ID } from '~/utils/constants'

export interface UserProfile {
  _id: string
  name: string
  username?: string
  phone?: string
  avatar?: string
  email?: string
  city?: string
  is_verified?: boolean
  cart_count?: number
  unread_notifications?: number
  unread_messages?: number
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
  const user = ref<UserProfile | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value && user.value._id !== 'GUEST')
  const displayName = computed(() => user.value?.name || user.value?.username || 'Akun Saya')
  const userAvatar = computed(() => user.value?.avatar || '')

  function setSession(userData: UserProfile, jwtToken: string) {
    user.value = userData
    token.value = jwtToken
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken)
        localStorage.setItem(STORAGE_KEY_USER_ID, userData._id)
      } catch {
        // ignore
      }
    }
  }

  function clearSession() {
    user.value = null
    token.value = null
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER_ID)
      } catch {
        // ignore
      }
    }
  }

  async function fetchProfile(): Promise<UserProfile | null> {
    if (!token.value) return null
    loading.value = true
    try {
      const res = await api.post<{ result?: UserProfile; message?: string }>('/profile/info', {})
      if (res?.result && res.result._id) {
        user.value = res.result
        return res.result
      }
    } catch {
      // Guest or expired token
    } finally {
      loading.value = false
    }
    return null
  }

  function initFromStorage() {
    if (import.meta.client) {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
        const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID)
        if (storedToken && storedUserId && storedUserId !== 'GUEST') {
          token.value = storedToken
          fetchProfile()
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    displayName,
    userAvatar,
    setSession,
    clearSession,
    fetchProfile,
    initFromStorage,
  }
})
