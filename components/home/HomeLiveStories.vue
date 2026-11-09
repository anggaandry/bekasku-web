<template>
  <div v-if="sessions && sessions.length > 0" class="py-2 overflow-x-auto scrollbar-none">
    <div class="flex items-center gap-3">
      <NuxtLink
        v-for="session in sessions"
        :key="session.live_id"
        :to="`/live/${session.live_id}`"
        class="flex flex-col items-center gap-1 shrink-0 group"
      >
        <div class="relative p-0.5 rounded-full ring-2 ring-danger animate-pulse">
          <NuxtImg
            :src="session.user_avatar || '/images/default_avatar.png'"
            :alt="session.user_name"
            width="48"
            height="48"
            class="w-12 h-12 rounded-full object-cover"
          />
          <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-danger text-white text-[9px] font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
        <span class="text-[11px] text-text max-w-[60px] truncate text-center">
          {{ session.user_name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveSession } from '~/types/live'

defineProps<{
  sessions: LiveSession[]
}>()
</script>

