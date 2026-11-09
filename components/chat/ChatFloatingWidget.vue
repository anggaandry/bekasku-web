<script setup lang="ts">
import { computed, watch } from 'vue'
import { MessageSquare, Settings } from 'lucide-vue-next'
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import type { ChatBoxItem } from '~/types/chat'
import ChatSidebarList from '~/components/chat/ChatSidebarList.vue'
import ChatRoomView from '~/components/chat/ChatRoomView.vue'
import FloatingChatPill from '~/components/shared/FloatingChatPill.vue'

const props = withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()
const chatStore = useChatStore()

const isHiddenRoute = computed(() => {
  const path = route.path || ''
  return (
    path.startsWith('/chat') ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/checkout')
  )
})

watch(
  () => chatStore.isFloatingOpen,
  async (open) => {
    if (open && authStore.isLoggedIn) {
      await chatStore.fetchChatBox({ isRefresh: true, isSilent: true })
      chatStore.connectWebSocket()
      if (!chatStore.activePartnerId && chatStore.rooms.length > 0 && chatStore.rooms[0]) {
        const first = chatStore.rooms[0]
        await chatStore.selectPartnerRoom({
          partnerId: first.id,
          partnerName: first.name || 'Pengguna BekasKu',
          partnerAvatar: first.avatar || '',
          subscribeType: first.subscribe_type,
          isBekaskuPlus: first.is_bekasku_plus,
        })
      }
    }
  },
)

function handleOpenPanel() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Chat & Pesan',
      redirectPath: route.fullPath,
    })
    return
  }
  chatStore.isFloatingOpen = true
  chatStore.isFloatingMinimized = false
}

function handleHideToFloatingIcon() {
  chatStore.minimizeToFloatingIcon()
}

function handleDismissCompletely() {
  chatStore.dismissFloatingWidget()
}

function handleSelectRoom(item: ChatBoxItem) {
  chatStore.selectPartnerRoom({
    partnerId: item.id,
    partnerName: item.name || 'Pengguna BekasKu',
    partnerAvatar: item.avatar || '',
    subscribeType: item.subscribe_type,
    isBekaskuPlus: item.is_bekasku_plus,
  })
}

function handleExpandFullPage() {
  const targetPartnerId = chatStore.activePartnerId
  chatStore.dismissFloatingWidget()
  if (targetPartnerId) {
    navigateTo(`/chat/${targetPartnerId}`)
  } else {
    navigateTo('/chat')
  }
}
</script>

<template>
  <template v-if="!isHiddenRoute">
    <!-- Embedded popup only (used inside coordinated FloatingChatDock) -->
    <div
      v-if="props.embedded && chatStore.isFloatingOpen"
      class="pointer-events-auto w-[640px] lg:w-[680px] xl:w-[740px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white border border-border-light shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden font-outfit shrink-0"
      role="dialog"
      aria-label="Popup Chat BekasKu"
    >
      <div class="grid grid-cols-12 h-full overflow-hidden">
        <div class="col-span-4 border-r border-border-light flex flex-col h-full overflow-hidden bg-white">
          <div class="px-4 py-3.5 bg-white border-b border-border-light flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
              <span class="font-outfit font-bold text-base text-text">Chat</span>
              <span
                v-if="chatStore.totalUnread > 0"
                class="px-1.5 py-0.5 rounded-full bg-primary text-white font-bold text-[10px] leading-none"
              >
                {{ chatStore.totalUnread }}
              </span>
            </div>

            <button
              type="button"
              @click="handleExpandFullPage"
              class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
              title="Buka Halaman Chat Utama"
              aria-label="Buka Halaman Chat Utama"
            >
              <Settings class="w-4 h-4" />
            </button>
          </div>

          <div class="flex-1 overflow-hidden">
            <ChatSidebarList
              compact
              @select-room="handleSelectRoom"
            />
          </div>
        </div>

        <div class="col-span-8 flex flex-col h-full overflow-hidden bg-white">
          <ChatRoomView
            compact
            is-floating
            @expand-fullpage="handleExpandFullPage"
            @minimize-floating="handleHideToFloatingIcon"
            @close-floating="handleHideToFloatingIcon"
          />
        </div>
      </div>
    </div>

    <!-- Standalone fallback if used directly outside FloatingChatDock -->
    <div v-else-if="!props.embedded" class="hidden md:block">
      <div
        v-if="chatStore.isFloatingMinimized && !chatStore.isFloatingOpen"
        class="fixed bottom-5 right-5 z-[60]"
      >
        <FloatingChatPill
          label="Chat"
          :badge-count="chatStore.totalUnread"
          open-title="Buka Chat"
          dismiss-title="Sembunyikan Chat sepenuhnya"
          @open="handleOpenPanel"
          @dismiss="handleDismissCompletely"
        >
          <template #icon>
            <MessageSquare class="w-5 h-5 text-primary fill-primary/10" aria-hidden="true" />
          </template>
        </FloatingChatPill>
      </div>

      <div
        v-else-if="chatStore.isFloatingOpen"
        class="fixed bottom-5 right-5 z-[65] w-[640px] lg:w-[680px] xl:w-[740px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white border border-border-light shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden font-outfit"
        role="dialog"
        aria-label="Popup Chat BekasKu"
      >
        <div class="grid grid-cols-12 h-full overflow-hidden">
          <div class="col-span-4 border-r border-border-light flex flex-col h-full overflow-hidden bg-white">
            <div class="px-4 py-3.5 bg-white border-b border-border-light flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="font-outfit font-bold text-base text-text">Chat</span>
                <span
                  v-if="chatStore.totalUnread > 0"
                  class="px-1.5 py-0.5 rounded-full bg-primary text-white font-bold text-[10px] leading-none"
                >
                  {{ chatStore.totalUnread }}
                </span>
              </div>

              <button
                type="button"
                @click="handleExpandFullPage"
                class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                title="Buka Halaman Chat Utama"
                aria-label="Buka Halaman Chat Utama"
              >
                <Settings class="w-4 h-4" />
              </button>
            </div>

            <div class="flex-1 overflow-hidden">
              <ChatSidebarList
                compact
                @select-room="handleSelectRoom"
              />
            </div>
          </div>

          <div class="col-span-8 flex flex-col h-full overflow-hidden bg-white">
            <ChatRoomView
              compact
              is-floating
              @expand-fullpage="handleExpandFullPage"
              @minimize-floating="handleHideToFloatingIcon"
              @close-floating="handleHideToFloatingIcon"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
