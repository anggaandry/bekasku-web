import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const authModal = useAuthModal()

  if (!authStore.isLoggedIn) {
    if (import.meta.client) {
      authModal.openLogin({
        redirectPath: to.fullPath,
      })
      if (from.fullPath && from.fullPath !== to.fullPath) {
        return abortNavigation()
      }
    }
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (!authStore.isPhoneVerified) {
    if (import.meta.client) {
      authModal.openPhoneVerify({
        redirectPath: to.fullPath,
      })
      if (from.fullPath && from.fullPath !== to.fullPath) {
        return abortNavigation()
      }
    }
    return navigateTo({
      path: '/phone/verify',
      query: { redirect: to.fullPath },
    })
  }
})

