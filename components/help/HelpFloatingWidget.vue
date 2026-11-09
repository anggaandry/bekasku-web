<script setup lang="ts">
import { computed, watch } from 'vue'
import { Headset } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useHelpChatStore } from '~/stores/helpChat'
import HelpChatRoomView from '~/components/help/HelpChatRoomView.vue'
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
const helpChatStore = useHelpChatStore()

const isHiddenRoute = computed(() => {
  const path = route.path || ''
  return (
    path.startsWith('/help/chat') ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/checkout')
  )
})

watch(
  () => helpChatStore.isFloatingOpen,
  async (open) => {
    if (open && authStore.isLoggedIn) {
      helpChatStore.connectWebSocket()
      await helpChatStore.fetchMessages({ resetPage: true, silent: helpChatStore.messages.length > 0 })
    }
  },
)

function handleOpenPanel() {
  helpChatStore.openHelpChat({ topic: 'general' })
}

function handleHideToFloatingIcon() {
  helpChatStore.minimizeToFloatingIcon()
}

function handleDismissCompletely() {
  helpChatStore.dismissFloatingWidget()
}

function handleExpandFullPage() {
  helpChatStore.expandToFullPage()
}
</script>

<template>
  <template v-if="!isHiddenRoute">
    <!-- Embedded popup only (used inside coordinated FloatingChatDock) -->
    <div
      v-if="props.embedded && helpChatStore.isFloatingOpen"
      class="pointer-events-auto w-[390px] lg:w-[420px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white border border-border-light shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden font-outfit shrink-0"
      role="dialog"
      aria-label="Popup Chat BekasKu Center"
      tabindex="-1"
      @keydown.esc="handleHideToFloatingIcon"
    >
      <HelpChatRoomView
        compact
        is-floating
        @expand-fullpage="handleExpandFullPage"
        @minimize-floating="handleHideToFloatingIcon"
        @close-floating="handleHideToFloatingIcon"
      />
    </div>

    <!-- Standalone fallback if used directly outside FloatingChatDock -->
    <div v-else-if="!props.embedded" class="hidden md:block">
      <div
        v-if="helpChatStore.isFloatingMinimized && !helpChatStore.isFloatingOpen"
        class="fixed bottom-5 right-5 z-[60]"
      >
        <FloatingChatPill
          label="BekasKu Center"
          :online="helpChatStore.wsConnected"
          open-title="Buka BekasKu Center"
          dismiss-title="Sembunyikan BekasKu Center"
          @open="handleOpenPanel"
          @dismiss="handleDismissCompletely"
        >
          <template #icon>
            <Headset class="w-5 h-5 text-primary" aria-hidden="true" />
          </template>
        </FloatingChatPill>
      </div>

      <div
        v-else-if="helpChatStore.isFloatingOpen"
        class="fixed bottom-5 right-5 z-[65] w-[390px] lg:w-[420px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white border border-border-light shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden font-outfit"
        role="dialog"
        aria-label="Popup Chat BekasKu Center"
        tabindex="-1"
        @keydown.esc="handleHideToFloatingIcon"
      >
        <HelpChatRoomView
          compact
          is-floating
          @expand-fullpage="handleExpandFullPage"
          @minimize-floating="handleHideToFloatingIcon"
          @close-floating="handleHideToFloatingIcon"
        />
      </div>
    </div>
  </template>
</template>
