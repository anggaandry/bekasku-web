<template>
  <header class="sticky top-0 z-40 bg-white border-b border-border/60">
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Back Button -->
      <button
        type="button"
        class="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-text hover:bg-surface-2 transition-colors cursor-pointer"
        aria-label="Kembali"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <!-- Center Title -->
      <h1 class="text-base font-semibold text-text font-outfit truncate text-center flex-1 px-2">
        Tawarkan Barang
      </h1>

      <!-- Action Button: Posting Barang Baru -->
      <NuxtLink
        to="/post"
        class="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        title="Posting Barang Baru"
        aria-label="Posting Barang Baru"
      >
        <CirclePlus class="w-6 h-6" />
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft, CirclePlus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (process.client && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

