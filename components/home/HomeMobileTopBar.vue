<template>
  <div class="md:hidden w-full bg-white px-4 pt-3 pb-1">
    <!-- Live Stories (hanya tampil jika ada sesi live aktif) -->
    <HomeLiveStories
      v-if="activeLiveSessions.length > 0"
      :sessions="activeLiveSessions"
      class="mb-2.5"
    />

    <!-- Action Chip Lokasi -->
    <HomeActionChips
      :current-city="currentAddressText"
      @open-location="isModalOpen = true"
    />

    <!-- Address / Location Modal -->
    <AppAddressModal v-model="isModalOpen" />
  </div>
</template>

<script setup lang="ts">
import HomeLiveStories from './HomeLiveStories.vue'
import HomeActionChips from './HomeActionChips.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'
import { useAddress } from '~/composables/useAddress'
import { useLiveShopping } from '~/composables/useLiveShopping'
import type { LiveSession } from '~/types/live'

const props = defineProps<{
  liveSessions?: Array<LiveSession & { is_live?: boolean }>
}>()

const { liveSessions: storeLiveSessions, refreshActiveLivesOnly } = useLiveShopping()
const hasPolled = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const activeLiveSessions = computed(() => {
  const source = hasPolled.value ? storeLiveSessions.value : (props.liveSessions || [])
  return source.filter((s) => s.is_live === true && Boolean(s.live_id))
})

function handleVisibilityRefresh() {
  if (typeof document !== 'undefined' && !document.hidden) {
    refreshActiveLivesOnly().then(() => {
      hasPolled.value = true
    })
  }
}

onMounted(async () => {
  if (props.liveSessions && props.liveSessions.length > 0 && storeLiveSessions.value.length === 0) {
    storeLiveSessions.value = [...props.liveSessions] as any
  }
  await refreshActiveLivesOnly()
  hasPolled.value = true
  if (import.meta.client) {
    pollTimer = setInterval(() => {
      if (!document.hidden) {
        refreshActiveLivesOnly()
      }
    }, 4000)
    document.addEventListener('visibilitychange', handleVisibilityRefresh)
  }
})

onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (import.meta.client) {
    document.removeEventListener('visibilitychange', handleVisibilityRefresh)
  }
})

const { currentAddressText } = useAddress()
const isModalOpen = ref(false)
</script>
