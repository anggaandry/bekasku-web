<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import type { ChatBoxItem } from '~/types/chat'
import ChatSidebarList from '~/components/chat/ChatSidebarList.vue'
import ChatRoomView from '~/components/chat/ChatRoomView.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const partnerId = computed(() => String(route.params.id || '').trim())

useHead(() => ({
  title: chatStore.activePartnerProfile.name
    ? `Chat dengan ${chatStore.activePartnerProfile.name} — BekasKu`
    : 'Ruang Obrolan — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Percakapan langsung dengan penjual atau pembeli di BekasKu.',
    },
  ],
}))

async function initRoomPage() {
  if (!authStore.isLoggedIn) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  chatStore.isFloatingOpen = false
  chatStore.fetchChatBox({ isRefresh: true, isSilent: true })
  chatStore.connectWebSocket()

  if (partnerId.value) {
    await chatStore.selectPartnerRoom({
      partnerId: partnerId.value,
      partnerName: route.query.name ? String(route.query.name) : undefined,
      partnerAvatar: route.query.avatar ? String(route.query.avatar) : undefined,
      preferFullPage: true,
    })
  }
}

onMounted(() => {
  initRoomPage()
})

watch(
  () => partnerId.value,
  (newId) => {
    if (newId && authStore.isLoggedIn) {
      chatStore.selectPartnerRoom({
        partnerId: newId,
        preferFullPage: true,
      })
    }
  },
)

function handleSelectRoom(item: ChatBoxItem) {
  router.push(`/chat/${item.id}`)
}
</script>

<template>
  <div class="bg-surface-2 min-h-[calc(100vh-140px)] py-0 md:py-6">
    <div class="max-w-7xl mx-auto md:px-4 lg:px-6">
      <div class="bg-white md:rounded-2xl md:border md:border-border-light md:shadow-xs overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-170px)] min-h-[540px] grid grid-cols-1 md:grid-cols-12">
        <!-- Left Column: Room List (Hidden on mobile when inside /chat/[id], shown on desktop) -->
        <div class="hidden md:block md:col-span-5 lg:col-span-4 md:border-r md:border-border-light h-full overflow-hidden">
          <ChatSidebarList
            @select-room="handleSelectRoom"
          />
        </div>

        <!-- Right Column: Active Conversation (Full screen on mobile, 8 cols on desktop) -->
        <div class="col-span-1 md:col-span-7 lg:col-span-8 h-full overflow-hidden flex flex-col">
          <ChatRoomView
            show-back-button
            @back="navigateTo('/chat')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
