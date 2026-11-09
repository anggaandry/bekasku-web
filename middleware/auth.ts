import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'

export default defineNuxtRouteMiddleware((to, from) => {
  // Di SSR, profil user disimpan di client-side (localStorage/session).
  // Lewatkan check server agar client hydration dapat menginisialisasi sesi dari storage terlebih dahulu.
  if (import.meta.server) return

  const authStore = useAuthStore()
  if (!authStore.token) {
    authStore.initFromStorage()
  }

  if (!authStore.isLoggedIn) {
    const authModal = useAuthModal()
    authModal.openLogin({
      redirectPath: to.fullPath,
    })
    if (from.fullPath && from.fullPath !== to.fullPath) {
      return abortNavigation()
    }
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})

