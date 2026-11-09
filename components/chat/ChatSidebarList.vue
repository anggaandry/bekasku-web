<script setup lang="ts">
import { Search, X, MessageSquare, ArrowLeft } from 'lucide-vue-next'
import {
  CHAT_FILTER_ALL,
  CHAT_FILTER_SELLER,
  CHAT_FILTER_BUYER,
} from '~/utils/constants'
import { useChatStore } from '~/stores/chat'
import type { ChatBoxItem } from '~/types/chat'
import ChatRoomTile from '~/components/chat/ChatRoomTile.vue'

const props = defineProps<{
  compact?: boolean
  showBackButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'select-room', item: ChatBoxItem): void
  (e: 'back'): void
}>()

const chatStore = useChatStore()

const filterTabs = [
  { id: CHAT_FILTER_ALL, label: 'Semua', badgeIndex: 0 },
  { id: CHAT_FILTER_SELLER, label: 'Jual', badgeIndex: 1 },
  { id: CHAT_FILTER_BUYER, label: 'Beli', badgeIndex: 2 },
]

function onSearchInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  chatStore.setSearchQuery(target.value)
}

function clearSearch() {
  chatStore.setSearchQuery('')
}

function onScrollList(ev: Event) {
  const el = ev.target as HTMLElement
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
    chatStore.loadMoreRooms()
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Top Header -->
    <div
      v-if="!compact"
      class="px-4 py-3.5 border-b border-border-light flex items-center gap-3 shrink-0"
    >
      <button
        v-if="showBackButton"
        type="button"
        @click="emit('back')"
        class="p-1.5 -ml-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer md:hidden"
        aria-label="Kembali"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="font-outfit font-bold text-lg text-text">
        Kotak Masuk
      </h1>
    </div>

    <!-- Search Bar + Filter Pills -->
    <div
      class="border-b border-border-light space-y-2.5 shrink-0"
      :class="compact ? 'p-2.5' : 'p-3.5'"
    >
      <!-- Search Input (matches 'Cari nama seller' in chatbox_view.dart) -->
      <div class="relative flex items-center rounded-xl border border-border-light bg-surface-2/60 focus-within:bg-white focus-within:border-primary transition-colors">
        <Search class="w-4 h-4 text-text-muted ml-3.5 shrink-0" />
        <input
          :value="chatStore.searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Cari nama seller"
          class="w-full px-2.5 py-2 font-outfit text-xs sm:text-sm text-text bg-transparent outline-hidden"
        />
        <button
          v-if="chatStore.searchQuery"
          type="button"
          @click="clearSearch"
          class="mr-2.5 w-5 h-5 rounded-full bg-text-muted/20 hover:bg-text-muted/30 flex items-center justify-center text-text-muted cursor-pointer"
          aria-label="Hapus Pencarian"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- Filter Tabs: Semua / Jual / Beli -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="tab in filterTabs"
          :key="tab.id"
          type="button"
          @click="chatStore.setFilterType(tab.id)"
          class="px-3 py-1.5 rounded-full font-outfit text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          :class="
            chatStore.filterType === tab.id
              ? 'bg-primary text-white font-semibold'
              : 'bg-surface-2 hover:bg-muted text-text-muted'
          "
        >
          <span :class="chatStore.filterType === tab.id ? 'text-white' : ''">
            {{ tab.label }}
          </span>
          <span
            v-if="(chatStore.badges[tab.badgeIndex] || 0) > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight"
            :class="
              chatStore.filterType === tab.id
                ? 'bg-white text-primary'
                : 'bg-primary text-white'
            "
          >
            {{ chatStore.badges[tab.badgeIndex] }}
          </span>
        </button>
      </div>
    </div>

    <!-- Room List Body -->
    <div
      class="flex-1 overflow-y-auto overscroll-contain"
      @scroll="onScrollList"
    >
      <!-- Skeleton Loader -->
      <div v-if="chatStore.loadingRooms" class="divide-y divide-border-light">
        <div
          v-for="n in 6"
          :key="n"
          class="px-4 py-3.5 flex items-center gap-3 animate-pulse"
        >
          <div class="w-11 h-11 rounded-full bg-muted shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3.5 bg-muted rounded-md w-2/5"></div>
            <div class="h-3 bg-surface-2 rounded-md w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="chatStore.rooms.length === 0"
        class="h-full min-h-[240px] flex flex-col items-center justify-center p-6 text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-surface-2 border border-border-light flex items-center justify-center text-text-subtle mb-3">
          <MessageSquare class="w-7 h-7" />
        </div>
        <p class="font-outfit font-semibold text-sm text-text">
          Belum ada pesan
        </p>
        <p class="font-outfit text-xs text-text-muted mt-1 max-w-[220px]">
          Percakapan Anda dengan penjual atau pembeli akan muncul di sini.
        </p>
      </div>

      <!-- Populated Room List -->
      <div v-else>
        <ChatRoomTile
          v-for="room in chatStore.rooms"
          :key="room.id"
          :item="room"
          :active="chatStore.activePartnerId === room.id"
          :compact="compact"
          @select="emit('select-room', $event)"
        />

        <div
          v-if="chatStore.loadingMoreRooms"
          class="py-3 flex items-center justify-center"
        >
          <span class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    </div>
  </div>
</template>
