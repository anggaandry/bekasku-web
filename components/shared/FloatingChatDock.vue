<script setup lang="ts">
import { computed } from 'vue'
import { Headset, MessageSquare } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useHelpChatStore } from '~/stores/helpChat'
import { useAuthModal } from '~/composables/useAuthModal'
import FloatingChatPill from '~/components/shared/FloatingChatPill.vue'
import ChatFloatingWidget from '~/components/chat/ChatFloatingWidget.vue'
import HelpFloatingWidget from '~/components/help/HelpFloatingWidget.vue'

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()
const chatStore = useChatStore()
const helpChatStore = useHelpChatStore()

const isGlobalHidden = computed(() => {
  const path = route.path || ''
  return (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/checkout')
  )
})

const isChatRouteHidden = computed(() => isGlobalHidden.value || (route.path || '').startsWith('/chat'))
const isHelpRouteHidden = computed(() => isGlobalHidden.value || (route.path || '').startsWith('/help/chat'))

const showHelpPill = computed(
  () => !isHelpRouteHidden.value && helpChatStore.isFloatingMinimized && !helpChatStore.isFloatingOpen,
)
const showChatPill = computed(
  () => !isChatRouteHidden.value && chatStore.isFloatingMinimized && !chatStore.isFloatingOpen,
)
const showHelpPopup = computed(() => !isHelpRouteHidden.value && helpChatStore.isFloatingOpen)
const showChatPopup = computed(() => !isChatRouteHidden.value && chatStore.isFloatingOpen)

const hasAnyDockChild = computed(
  () => showHelpPill.value || showChatPill.value || showHelpPopup.value || showChatPopup.value,
)

function handleOpenHelpPanel() {
  helpChatStore.openHelpChat({ topic: 'general' })
}

function handleDismissHelpPill() {
  helpChatStore.dismissFloatingWidget()
}

function handleOpenChatPanel() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Chat & Pesan',
      redirectPath: route.fullPath,
    })
    return
  }
  if (helpChatStore.isFloatingOpen) {
    helpChatStore.minimizeToFloatingIcon()
  }
  chatStore.isFloatingOpen = true
  chatStore.isFloatingMinimized = false
}

function handleDismissChatPill() {
  chatStore.dismissFloatingWidget()
}
</script>

<template>
  <!-- Keep embedded widgets mounted so their open watchers remain active, positioned side-by-side in one flex dock -->
  <div
    v-if="!isGlobalHidden"
    v-show="hasAnyDockChild"
    class="hidden md:flex fixed bottom-5 right-5 z-[65] items-end justify-end gap-2.5 pointer-events-none max-w-[calc(100vw-2rem)] font-outfit"
  >
    <FloatingChatPill
      v-if="showHelpPill"
      :class="showChatPopup ? 'hidden lg:flex' : 'flex'"
      label="BekasKu Center"
      :online="helpChatStore.wsConnected"
      open-title="Buka BekasKu Center"
      dismiss-title="Sembunyikan BekasKu Center"
      @open="handleOpenHelpPanel"
      @dismiss="handleDismissHelpPill"
    >
      <template #icon>
        <Headset class="w-5 h-5 text-primary" aria-hidden="true" />
      </template>
    </FloatingChatPill>

    <FloatingChatPill
      v-if="showChatPill"
      label="Chat"
      :badge-count="chatStore.totalUnread"
      open-title="Buka Chat"
      dismiss-title="Sembunyikan Chat sepenuhnya"
      @open="handleOpenChatPanel"
      @dismiss="handleDismissChatPill"
    >
      <template #icon>
        <MessageSquare class="w-5 h-5 text-primary fill-primary/10" aria-hidden="true" />
      </template>
    </FloatingChatPill>

    <HelpFloatingWidget embedded />
    <ChatFloatingWidget embedded />
  </div>
</template>
