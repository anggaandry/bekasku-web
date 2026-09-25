<template>
  <div v-if="sessions && sessions.length > 0" class="py-1">
    <!-- Horizontal Live Channels Row matching mobile v3 / home_red.png -->
    <div class="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
      <div
        v-for="live in sessions"
        :key="live.id"
        class="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
        @click="handleOpenLive(live)"
      >
        <!-- Story Circle with Gradient Ring & LIVE Badge -->
        <div class="relative p-0.5 rounded-full bg-gradient-to-tr from-[#E31B23] via-[#ff7332] to-[#ff2d20] shadow-xs group-hover:scale-105 transition-transform duration-200">
          <div class="p-0.5 rounded-full bg-white">
            <img
              :src="live.seller_avatar"
              :alt="live.seller_name"
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover bg-gray-100"
            />
          </div>

          <!-- Red LIVE Badge Pill -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#E31B23] text-white text-[9px] font-black px-2 py-0.2 rounded-full flex items-center gap-1 shadow-xs border border-white">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        <!-- Channel / Seller Name -->
        <span class="text-xs font-semibold text-gray-800 text-center max-w-[76px] truncate group-hover:text-[#E31B23] transition-colors mt-1">
          {{ live.seller_name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveSession } from '~/composables/useLiveShopping'

interface Props {
  sessions: LiveSession[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  sessions: () => [],
  loading: false,
})

function handleOpenLive(live: LiveSession) {
  // Navigate to live session or open live player modal
  navigateTo(`/live?session=${live.id}`)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
