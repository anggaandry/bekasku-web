<template>
  <div v-if="activeLiveSessions.length > 0" class="py-2 overflow-x-auto scrollbar-none">
    <div class="flex items-center gap-3">
      <button
        v-for="session in activeLiveSessions"
        :key="session.live_id"
        type="button"
        class="flex flex-col items-center gap-1 shrink-0 group cursor-pointer bg-transparent border-0 p-0"
        @click="handleOpenLive(session)"
      >
        <div class="relative p-0.5 rounded-full ring-2 ring-danger animate-pulse">
          <img
            :src="getAvatarSrc(session.user_avatar)"
            :alt="session.user_name"
            width="48"
            height="48"
            class="w-12 h-12 rounded-full object-cover bg-gray-100"
            @error="onAvatarError"
          />
          <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-danger text-white text-[9px] font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
        <span class="text-[11px] text-text max-w-[60px] truncate text-center">
          {{ session.user_name }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveSession } from '~/types/live'
import { useLivePlayer } from '~/composables/useLivePlayer'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  sessions: Array<LiveSession & { is_live?: boolean }>
}>()

const livePlayer = useLivePlayer()

const activeLiveSessions = computed(() =>
  (props.sessions || []).filter((s) => s.is_live === true && Boolean(s.live_id)),
)

function getAvatarSrc(url?: string): string {
  return sanitizeMediaUrl(url) || '/images/default_avatar.png'
}

function onAvatarError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img && !img.src.endsWith('/images/default_avatar.png')) {
    img.src = '/images/default_avatar.png'
  }
}

function handleOpenLive(session: LiveSession & { is_live?: boolean }) {
  if (!session.live_id) return
  livePlayer.openLive(session.live_id, {
    id: session.user_id || '',
    name: session.user_name || 'Penjual',
    avatar: getAvatarSrc(session.user_avatar),
    title: session.title || '',
  })
}
</script>

