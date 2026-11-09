<script setup lang="ts">
import { ArrowLeft, Heart, MessageSquare } from 'lucide-vue-next'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <!-- Mobile Only Header Bar (<md) -->
  <div class="md:hidden bg-white border-b border-border sticky top-0 z-30">
    <div class="px-4 h-14 flex items-center justify-between">
      <!-- Left: Back Button & Title -->
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-text font-outfit">
          Keranjang Saya
        </h1>
      </div>

      <!-- Right: Wishlist & Chat Shortcuts -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/wishlist"
          class="p-2 rounded-full hover:bg-surface-2 text-text transition-colors flex items-center justify-center cursor-pointer"
          title="Favorit Saya"
          aria-label="Favorit Saya"
        >
          <Heart class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink
          to="/chat"
          class="p-2 rounded-full hover:bg-surface-2 text-text transition-colors flex items-center justify-center cursor-pointer"
          title="Pesan Chat"
          aria-label="Pesan Chat"
        >
          <MessageSquare class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
