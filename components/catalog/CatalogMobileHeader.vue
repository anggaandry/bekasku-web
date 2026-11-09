<script setup lang="ts">
import {
  TrendingUp,
  Heart,
  MessageSquare,
} from 'lucide-vue-next'
</script>

<template>
  <!-- Mobile Sticky Top Navigation Bar (Matches Flutter BekasKu V3 MyCatalogView) -->
  <header class="md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-border-light sticky top-0 z-30 shadow-2xs font-outfit">
    <h1 class="text-lg font-bold text-text tracking-tight">
      Iklan Saya
    </h1>

    <div class="flex items-center gap-1">
      <NuxtLink
        to="/sundul"
        class="p-2 rounded-lg text-text hover:bg-surface-2 transition-colors cursor-pointer"
        title="Riwayat Sundul & Promosi"
        aria-label="Riwayat Sundul & Promosi"
      >
        <TrendingUp class="w-5 h-5 text-text" aria-hidden="true" />
      </NuxtLink>

      <NuxtLink
        to="/wishlist"
        class="p-2 rounded-lg text-text hover:bg-surface-2 transition-colors cursor-pointer"
        title="Wishlist Favorit"
        aria-label="Wishlist Favorit"
      >
        <Heart class="w-5 h-5 text-text" aria-hidden="true" />
      </NuxtLink>

      <NuxtLink
        to="/chat"
        class="p-2 rounded-lg text-text hover:bg-surface-2 transition-colors cursor-pointer"
        title="Pesan & Diskusi"
        aria-label="Pesan & Diskusi"
      >
        <MessageSquare class="w-5 h-5 text-text" aria-hidden="true" />
      </NuxtLink>
    </div>
  </header>
</template>

