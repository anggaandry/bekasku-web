<template>
  <div class="min-h-screen flex flex-col bg-[#f4f4f4] text-[#1a1a1a]">
    <AppHeader v-if="showGlobalHeader" class="hidden md:block print:hidden" />
    <slot />
    <AppFooter v-if="showGlobalFooter" class="hidden md:block mt-auto print:hidden" />
    <AppAuthModal />
    <AppIdentityKycModal />
    <AppAccountDrawer
      :model-value="accountDrawer.isOpen.value"
      @update:model-value="val => val ? accountDrawer.open() : accountDrawer.close()"
      @logout="handleLogout"
    />
    <AppNotificationDrawer
      :model-value="notificationDrawer.isOpen.value"
      @update:model-value="val => notificationDrawer.isOpen.value = val"
    />
    <FloatingChatDock class="print:hidden" />
    <AppCookieConsent class="print:hidden" />
    <AppToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useAppStore } from '~/stores/app'
import { useChatStore } from '~/stores/chat'
import { useHelpChatStore } from '~/stores/helpChat'
import { useNotificationStore } from '~/stores/notification'
import { useAccountDrawer } from '~/composables/useAccountDrawer'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'
import { useAuthModal } from '~/composables/useAuthModal'
import { STORAGE_KEY_LOCATION } from '~/utils/constants'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppAuthModal from '~/components/auth/AppAuthModal.vue'
import AppIdentityKycModal from '~/components/identity/AppIdentityKycModal.vue'
import AppAccountDrawer from '~/components/layout/AppAccountDrawer.vue'
import AppNotificationDrawer from '~/components/notification/AppNotificationDrawer.vue'
import FloatingChatDock from '~/components/shared/FloatingChatDock.vue'
import AppCookieConsent from '~/components/shared/AppCookieConsent.vue'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const appStore = useAppStore()
const chatStore = useChatStore()
const helpChatStore = useHelpChatStore()
const notificationStore = useNotificationStore()
const accountDrawer = useAccountDrawer()
const notificationDrawer = useNotificationDrawer()
const authModal = useAuthModal()

watch(
  () => route.query.drawer,
  (drawer) => {
    if (!import.meta.client || window.innerWidth >= 768) return
    accountDrawer.isOpen.value = drawer === 'account'
  },
  { immediate: true }
)

function handleLogout() {
  chatStore.disconnectAll()
  helpChatStore.disconnectAll()
  authStore.clearSession()
  navigateTo('/')
}

const showGlobalHeader = computed(() => {
  if (route.path === '/' && appStore.isComingSoon) return false
  return true
})

const showGlobalFooter = computed(() => {
  if (route.path === '/' && appStore.isComingSoon) return false
  if (
    route.path.startsWith('/chat') ||
    route.path.startsWith('/help/chat') ||
    route.path.startsWith('/showcase/video') ||
    route.path.startsWith('/live/')
  ) return false
  return true
})

onMounted(() => {
  cartStore.initFromStorage()
  authStore.initFromStorage()
  if (authStore.isLoggedIn) {
    chatStore.fetchChatBox({ isRefresh: true, isSilent: true })
    chatStore.connectWebSocket()
    helpChatStore.consumePendingHelpPopup()
    notificationStore.fetchAllAndCategorize()
    notificationStore.registerWebPushAndListen()
  } else {
    const authPages = ['/beta-access', '/login', '/register', '/forgot-password', '/phone/verify']
    const isGuestHomeEntry = !authPages.some((p) => route.path.startsWith(p))
    if (isGuestHomeEntry && !authModal.isOpen.value) {
      try {
        const prompted = localStorage.getItem('bkk_location_prompted')
        const savedLoc = localStorage.getItem(STORAGE_KEY_LOCATION)
        if (!prompted && !savedLoc) {
          setTimeout(() => {
            if (!authStore.isLoggedIn && !authModal.isOpen.value && route.path !== '/beta-access') {
              authModal.openLocationAsk()
            }
          }, 550)
        }
      } catch {
        // ignore
      }
    }
  }
})

watch(
  () => chatStore.isFloatingOpen,
  (open) => {
    if (open && helpChatStore.isFloatingOpen) {
      helpChatStore.isFloatingOpen = false
      helpChatStore.isFloatingMinimized = true
    }
  },
)

watch(
  () => helpChatStore.isFloatingOpen,
  (open) => {
    if (open && chatStore.isFloatingOpen) {
      chatStore.isFloatingOpen = false
      chatStore.isFloatingMinimized = true
    }
  },
)

watch(
  () => authStore.isLoggedIn,
  (logged) => {
    if (logged) {
      chatStore.fetchChatBox({ isRefresh: true, isSilent: true })
      chatStore.connectWebSocket()
      helpChatStore.consumePendingHelpPopup()
      notificationStore.fetchAllAndCategorize()
      notificationStore.registerWebPushAndListen()
    } else {
      chatStore.disconnectAll()
      helpChatStore.disconnectAll()
    }
  },
)
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
}
</style>
