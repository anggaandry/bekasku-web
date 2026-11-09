<template>
  <div class="min-h-screen flex flex-col bg-[#f4f4f4] text-[#1a1a1a]">
    <AppHeader v-if="showGlobalHeader" class="hidden md:block print:hidden" />
    <slot />
    <AppFooter v-if="showGlobalFooter" class="hidden md:block mt-auto print:hidden" />
    <AppAuthModal />
    <AppIdentityKycModal />
    <AppAccountDrawer
      :model-value="accountDrawer.isOpen.value"
      @update:model-value="val => accountDrawer.isOpen.value = val"
      @logout="handleLogout"
    />
    <AppNotificationDrawer
      :model-value="notificationDrawer.isOpen.value"
      @update:model-value="val => notificationDrawer.isOpen.value = val"
    />
    <FloatingChatDock class="print:hidden" />
    <AppToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useAppStore } from '~/stores/app'
import { useChatStore } from '~/stores/chat'
import { useHelpChatStore } from '~/stores/helpChat'
import { useAccountDrawer } from '~/composables/useAccountDrawer'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppAuthModal from '~/components/auth/AppAuthModal.vue'
import AppIdentityKycModal from '~/components/identity/AppIdentityKycModal.vue'
import AppAccountDrawer from '~/components/layout/AppAccountDrawer.vue'
import AppNotificationDrawer from '~/components/notification/AppNotificationDrawer.vue'
import FloatingChatDock from '~/components/shared/FloatingChatDock.vue'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const appStore = useAppStore()
const chatStore = useChatStore()
const helpChatStore = useHelpChatStore()
const accountDrawer = useAccountDrawer()
const notificationDrawer = useNotificationDrawer()

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
