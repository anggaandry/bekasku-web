<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1.5 shadow-lg safe-bottom">
    <div class="grid grid-cols-5 items-center text-center">
      <!-- Tab 1: Beranda -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center py-1 text-xs transition-colors"
        :class="$route.path === '/' || $route.path.startsWith('/var') ? 'text-[#E31B23] font-bold' : 'text-gray-500 hover:text-gray-900'"
      >
        <Home class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">Beranda</span>
      </NuxtLink>

      <!-- Tab 2: Live & Video -->
      <NuxtLink
        to="/#kategori-live"
        class="flex flex-col items-center py-1 text-xs transition-colors text-gray-500 hover:text-[#E31B23]"
      >
        <Video class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">Live &amp; Video</span>
      </NuxtLink>

      <!-- Tab 3: Best Deal -->
      <NuxtLink
        to="/#bestdeal-creator"
        class="flex flex-col items-center py-1 text-xs transition-colors text-gray-500 hover:text-[#E31B23]"
      >
        <BadgePercent class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">Best Deal</span>
      </NuxtLink>

      <!-- Tab 4: Transaksi -->
      <NuxtLink
        to="/transactions"
        class="flex flex-col items-center py-1 text-xs transition-colors"
        :class="$route.path === '/transactions' ? 'text-[#E31B23] font-bold' : 'text-gray-500 hover:text-gray-900'"
      >
        <Receipt class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">Transaksi</span>
      </NuxtLink>

      <!-- Tab 5: Akun -->
      <NuxtLink
        to="/profile"
        class="flex flex-col items-center py-1 text-xs transition-colors"
        :class="$route.path === '/profile' ? 'text-[#E31B23] font-bold' : 'text-gray-500 hover:text-gray-900'"
      >
        <User class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">Akun</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Video, BadgePercent, Receipt, User } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'

const appStore = useAppStore()
const activeTab = computed({
  get: () => appStore.activeMobileTab,
  set: (val) => {
    appStore.activeMobileTab = val
  },
})
</script>

<style scoped>
.safe-bottom {
  padding-bottom: calc(0.375rem + env(safe-area-inset-bottom, 0px));
}
</style>
