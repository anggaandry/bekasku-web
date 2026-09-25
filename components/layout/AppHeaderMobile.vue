<template>
  <header class="w-full bg-[#E31B23] text-white sticky top-0 z-50 px-3 py-2.5 shadow-xs">
    <!-- Single Top Bar: Search Input (left) + Action Icons (right) matching home_red.png -->
    <div class="flex items-center gap-2">
      <!-- Search Input Bar (Clean White Squircle with Search Icon) -->
      <div class="flex-1 flex items-center bg-white rounded-xl px-3 py-1.5 shadow-2xs">
        <Search class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari di Bekasku..."
          class="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-xs font-medium"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Right Mobile Actions: Chat, Bell, Cart -->
      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Chat Icon (Requires Auth) -->
        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          title="Chat"
          @click="handleAuthAction('/chat')"
        >
          <MessageSquare class="w-5 h-5" />
        </button>

        <!-- Notification Bell with Yellow Badge (Requires Auth) -->
        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          title="Notifikasi"
          @click="handleAuthAction('/notifications')"
        >
          <Bell class="w-5 h-5" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-[#FFD600] rounded-full ring-1.5 ring-[#E31B23]" />
        </button>

        <!-- Cart Icon with Yellow Badge (Requires Auth) -->
        <button
          type="button"
          class="p-1.5 text-white hover:text-white/80 rounded-lg relative shrink-0 cursor-pointer"
          title="Keranjang"
          @click="handleAuthAction('/cart')"
        >
          <ShoppingCart class="w-5 h-5" />
          <span
            class="absolute -top-0.5 -right-0.5 bg-[#FFD600] text-[#111827] text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1.5 ring-[#E31B23]"
          >
            {{ cartStore.totalItems || 0 }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Search, MessageSquare, Bell, ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()

const searchQuery = ref('')

function handleSearch() {
  if (!searchQuery.value.trim()) return
  navigateTo({
    path: '/',
    query: { q: searchQuery.value.trim() },
  })
}

function handleAuthAction(targetPath: string) {
  if (!authStore.isLoggedIn) {
    navigateTo('/login')
  } else {
    navigateTo(targetPath)
  }
}
</script>

<style scoped>
/* Scoped isolation */
</style>
