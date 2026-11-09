<template>
  <header class="w-full bg-primary text-white sticky top-0 z-50 px-3 py-2.5 shadow-xs">
    <!-- Single Top Bar: Shared SearchBar (left) + Action Icons (right) -->
    <div class="flex items-center gap-2">
      <div class="flex-1 min-w-0">
        <SearchBar
          v-model="searchQuery"
          variant="header-mobile"
          input-id="mobile-search-input"
          placeholder="Cari di BekasKu..."
          readonly
          @click-input="navigateTo('/search')"
          @submit="handleSearch"
        />
      </div>

      <!-- Right Mobile Actions: Chat, Bell, Cart -->
      <div class="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          title="Chat"
          @click="handleAuthAction('/chat', 'Chat & Pesan')"
        >
          <MessageSquare class="w-5 h-5" />
          <span
            v-if="chatStore.totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
          </span>
        </button>

        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          title="Notifikasi"
          @click="handleNotificationClick"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="notifStore.totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ notifStore.totalUnread > 99 ? '99+' : notifStore.totalUnread }}
          </span>
        </button>

        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          :title="t('Keranjang')"
          @click="handleAuthAction('/cart', t('Keranjang Belanja'))"
        >
          <ShoppingCart class="w-5 h-5" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 bg-badge-bg text-badge-text text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1.5 ring-primary"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>

        <button
          type="button"
          class="px-1.5 py-1 text-white hover:bg-white/15 rounded-lg text-[10px] font-bold uppercase shrink-0 cursor-pointer flex items-center gap-0.5"
          :title="t('Bahasa / Language')"
          :aria-label="t('Bahasa / Language')"
          @click="isLangModalOpen = true"
        >
          <Languages class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ currentLocaleMeta.shortLabel }}</span>
        </button>
      </div>
    </div>

    <AccountLanguageModal v-model="isLangModalOpen" />
  </header>
</template>

<script setup lang="ts">
import { MessageSquare, Bell, ShoppingCart, Languages } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'
import { useAuthModal } from '~/composables/useAuthModal'
import { useLocale } from '~/composables/useLocale'
import SearchBar from '~/components/search/SearchBar.vue'
import AccountLanguageModal from '~/components/account/AccountLanguageModal.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const notifStore = useNotificationStore()
const notificationDrawer = useNotificationDrawer()
const authModal = useAuthModal()
const { t, currentLocaleMeta } = useLocale()
const isLangModalOpen = ref(false)

const searchQuery = ref('')

function handleSearch(val?: string) {
  const q = (val !== undefined ? val : searchQuery.value).trim()
  if (!q) {
    navigateTo('/search')
    return
  }
  navigateTo({
    path: '/search/result',
    query: { q },
  })
}

function handleNotificationClick() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Notifikasi',
    })
  } else {
    notificationDrawer.open()
  }
}

function handleAuthAction(targetPath: string, label?: string) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: label,
      redirectPath: targetPath,
    })
  } else {
    navigateTo(targetPath)
  }
}
</script>
