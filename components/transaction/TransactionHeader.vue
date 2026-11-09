<script setup lang="ts">
import { ChevronLeft, Heart, MessageSquare, Headphones } from 'lucide-vue-next'
import { BEKASKU_CENTER_MSG_ORDER_HELP } from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'

const props = withDefaults(
  defineProps<{
    title?: string
    showActions?: boolean
    mode?: 'list' | 'detail'
  }>(),
  {
    showActions: true,
    mode: 'list',
  }
)

const router = useRouter()
const helpChatStore = useHelpChatStore()

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/transaction')
  }
}

function handleOpenSupport() {
  helpChatStore.openHelpChat({
    topic: 'transaction',
    referenceTitle: props.title || 'Detail Pesanan',
    initialMessage: BEKASKU_CENTER_MSG_ORDER_HELP,
  })
}
</script>

<template>
  <div class="sticky top-0 z-30 bg-white">
    <!-- Mobile App Bar (< md) -->
    <header class="md:hidden border-b border-border px-3 h-14 flex items-center justify-between">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center -ml-1 text-text hover:text-primary transition-colors cursor-pointer"
        aria-label="Kembali"
        @click="handleBack"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>

      <h1 class="font-outfit font-semibold text-base text-text truncate max-w-[200px] text-center">
        {{ title || (mode === 'detail' ? 'Detail Pesanan' : 'Transaksi saya') }}
      </h1>

      <div class="flex items-center gap-1">
        <!-- Detail mode: Headphone Support Icon -->
        <button
          v-if="mode === 'detail'"
          type="button"
          class="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-text hover:text-primary transition-colors cursor-pointer"
          aria-label="Bantuan BekasKu Center"
          @click="handleOpenSupport"
        >
          <Headphones class="w-4 h-4 text-text" />
        </button>

        <!-- List mode: Heart & Chat Icons -->
        <template v-else-if="showActions !== false">
          <NuxtLink
            to="/favorite"
            class="w-9 h-9 flex items-center justify-center text-text hover:text-primary transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink
            to="/chat"
            class="w-9 h-9 flex items-center justify-center text-text hover:text-primary transition-colors cursor-pointer"
            aria-label="Pesan"
          >
            <MessageSquare class="w-5 h-5" />
          </NuxtLink>
        </template>
        <div v-else class="w-9 h-9"></div>
      </div>
    </header>

    <!-- Desktop Breadcrumb (md+) -->
    <div class="hidden md:block py-2.5 bg-bg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <!-- Breadcrumb: Beranda / Transaksi Saya -->
        <nav class="flex items-center gap-1.5 text-xs font-outfit text-text-muted">
          <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
          <span class="text-text-muted/50">/</span>
          <NuxtLink
            to="/transaction"
            class="transition-colors"
            :class="mode === 'detail' ? 'hover:text-primary' : 'text-text font-semibold'"
          >
            Transaksi Saya
          </NuxtLink>
          <template v-if="mode === 'detail'">
            <span class="text-text-muted/50">/</span>
            <span class="text-text font-semibold">{{ title || 'Detail Pesanan' }}</span>
          </template>
        </nav>

        <!-- Detail mode action -->
        <div v-if="mode === 'detail'" class="flex items-center gap-2">
          <NuxtLink
            to="/favorite"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 text-xs font-outfit font-medium text-text hover:text-primary transition-colors cursor-pointer bg-white shadow-2xs"
          >
            <Heart class="w-3.5 h-3.5 text-primary" />
            <span>Wishlist</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
