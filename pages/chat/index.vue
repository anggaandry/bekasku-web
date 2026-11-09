<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import type { ChatBoxItem } from '~/types/chat'
import ChatSidebarList from '~/components/chat/ChatSidebarList.vue'
import ChatRoomView from '~/components/chat/ChatRoomView.vue'

useHead({
  title: 'Kotak Masuk — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Kelola pesan, negosiasi harga, dan permintaan live photo atau video produk di BekasKu.',
    },
  ],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

async function initChatPage() {
  if (!authStore.isLoggedIn) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  chatStore.isFloatingOpen = false
  await chatStore.fetchChatBox({ isRefresh: true })
  chatStore.connectWebSocket()

  // Support query params: ?user_id=...&name=...&avatar=...
  const queryUserId = String(route.query.user_id || route.query.seller_id || '').trim()
  if (queryUserId) {
    await chatStore.selectPartnerRoom({
      partnerId: queryUserId,
      partnerName: route.query.name ? String(route.query.name) : undefined,
      partnerAvatar: route.query.avatar ? String(route.query.avatar) : undefined,
      preferFullPage: true,
    })
  } else if (
    import.meta.client &&
    window.innerWidth >= 768 &&
    !chatStore.activePartnerId &&
    chatStore.rooms.length > 0 &&
    chatStore.rooms[0]
  ) {
    // Auto-select first room on desktop split view
    const first = chatStore.rooms[0]
    await chatStore.selectPartnerRoom({
      partnerId: first.id,
      partnerName: first.name || 'Pengguna BekasKu',
      partnerAvatar: first.avatar || '',
      subscribeType: first.subscribe_type,
      isBekaskuPlus: first.is_bekasku_plus,
      preferFullPage: true,
    })
  }
}

onMounted(() => {
  initChatPage()
})

watch(
  () => authStore.isLoggedIn,
  (logged) => {
    if (logged) {
      initChatPage()
    }
  },
)

function handleSelectRoom(item: ChatBoxItem) {
  if (import.meta.client && window.innerWidth < 768) {
    chatStore.selectPartnerRoom({
      partnerId: item.id,
      partnerName: item.name || 'Pengguna BekasKu',
      partnerAvatar: item.avatar || '',
      subscribeType: item.subscribe_type,
      isBekaskuPlus: item.is_bekasku_plus,
      preferFullPage: true,
    })
    router.push(`/chat/${item.id}`)
  } else {
    chatStore.selectPartnerRoom({
      partnerId: item.id,
      partnerName: item.name || 'Pengguna BekasKu',
      partnerAvatar: item.avatar || '',
      subscribeType: item.subscribe_type,
      isBekaskuPlus: item.is_bekasku_plus,
      preferFullPage: true,
    })
  }
}
</script>

<template>
  <div class="bg-surface-2 min-h-[calc(100vh-140px)] py-0 md:py-6">
    <div class="max-w-7xl mx-auto md:px-4 lg:px-6">
      <div class="bg-white md:rounded-2xl md:border md:border-border-light md:shadow-xs overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-170px)] min-h-[540px] grid grid-cols-1 md:grid-cols-12">
        <!-- Left Column: Room List (Full width on mobile, 4 cols on desktop) -->
        <div class="col-span-1 md:col-span-5 lg:col-span-4 md:border-r md:border-border-light h-full overflow-hidden">
          <ChatSidebarList
            show-back-button
            @select-room="handleSelectRoom"
            @back="router.back()"
          />
        </div>

        <!-- Right Column: Active Conversation (Desktop Only on /chat index) -->
        <div class="hidden md:flex md:col-span-7 lg:col-span-8 h-full overflow-hidden flex-col">
          <ChatRoomView />
        </div>
      </div>
    </div>
  </div>
</template>
