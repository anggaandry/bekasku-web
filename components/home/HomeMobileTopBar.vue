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
import type { LiveSession } from '~/types/live'

const props = defineProps<{
  liveSessions?: Array<LiveSession & { is_live?: boolean }>
}>()

const activeLiveSessions = computed(() =>
  (props.liveSessions || []).filter((s) => s.is_live === true && Boolean(s.live_id)),
)

const { currentAddressText } = useAddress()
const isModalOpen = ref(false)
</script>
