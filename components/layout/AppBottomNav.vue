<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-2 py-1.5 shadow-lg safe-bottom">
    <div class="grid grid-cols-5 items-center text-center">
      <!-- Tab 1: Beranda -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center py-1 text-xs transition-colors"
        :class="$route.path === '/' || $route.path.startsWith('/var') ? 'text-primary font-bold' : 'text-text-muted hover:text-text'"
      >
        <Home class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">{{ t('Beranda') }}</span>
      </NuxtLink>

      <!-- Tab 2: Promo (dengan badge 9+ persis mobile V3) -->
      <NuxtLink
        to="/product/search?type=2"
        class="flex flex-col items-center py-1 text-xs transition-colors relative"
        :class="$route.path.includes('type=2') ? 'text-primary font-bold' : 'text-text-muted hover:text-primary'"
      >
        <div class="relative">
          <BadgePercent class="w-5 h-5 mb-0.5" />
          <span class="absolute -top-1 -right-2.5 bg-primary text-white text-[8px] font-black px-1 py-0.2 rounded-full ring-1.5 ring-white">
            9+
          </span>
        </div>
        <span class="text-[10px] leading-tight">{{ t('Promo') }}</span>
      </NuxtLink>

      <!-- Tab 3: Live & Video -->
      <NuxtLink
        to="/showcase/video"
        class="flex flex-col items-center py-1 text-xs transition-colors"
        :class="$route.path.startsWith('/showcase/video') || $route.path.startsWith('/live') ? 'text-primary font-bold' : 'text-text-muted hover:text-primary'"
      >
        <PlaySquare class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">{{ t('Live & Video') }}</span>
      </NuxtLink>

      <!-- Tab 4: Post (Iklan Saya - matches Mobile V3 tab 4) -->
      <button
        type="button"
        class="flex flex-col items-center py-1 text-xs transition-colors cursor-pointer"
        :class="$route.path === '/catalog' || $route.path === '/jual' || $route.path.startsWith('/seller/catalog') ? 'text-primary font-bold' : 'text-text-muted hover:text-text'"
        @click="handleProtectedTab('/catalog', t('Iklan Saya'))"
      >
        <Newspaper class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">{{ t('Post') }}</span>
      </button>

      <!-- Tab 5: Akun (Membuka Nav Drawer di Mobile Sesuai Mobile V3) -->
      <button
        type="button"
        class="flex flex-col items-center py-1 text-xs transition-colors cursor-pointer"
        :class="accountDrawer.isOpen.value || $route.path.startsWith('/account') || $route.path === '/profile' ? 'text-primary font-bold' : 'text-text-muted hover:text-text'"
        @click="handleAccountTab"
      >
        <User class="w-5 h-5 mb-0.5" />
        <span class="text-[10px] leading-tight">{{ t('Akun') }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, BadgePercent, PlaySquare, Newspaper, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useAccountDrawer } from '~/composables/useAccountDrawer'

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()
const accountDrawer = useAccountDrawer()
const { t } = useLocale()

function handleAccountTab() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Profil & Akun Saya',
      redirectPath: route.fullPath,
    })
  } else {
    accountDrawer.open()
  }
}

function handleProtectedTab(path: string, featureTitle: string) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle,
      redirectPath: path,
    })
  } else {
    navigateTo(path)
  }
}
</script>

<style scoped>
.safe-bottom {
  padding-bottom: calc(0.375rem + env(safe-area-inset-bottom, 0px));
}
</style>
