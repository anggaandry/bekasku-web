<template>
  <div class="md:hidden w-full bg-surface border-b border-border pb-2 px-3 pt-2">
    <!-- Live Stories (hanya tampil jika ada sesi live aktif) -->
    <HomeLiveStories
      v-if="liveSessions && liveSessions.length > 0"
      :sessions="liveSessions"
    />

    <!-- Action Chip Lokasi (Chip Voucher telah dihapus) -->
    <div class="pt-1">
      <HomeActionChips
        :current-city="currentCity"
        @open-location="isModalOpen = true"
      />
    </div>

    <!-- Address / Location Modal -->
    <AppAddressModal v-model="isModalOpen" />
  </div>
</template>

<script setup lang="ts">
import HomeLiveStories from './HomeLiveStories.vue'
import HomeActionChips from './HomeActionChips.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'
import { useLocationStore } from '~/stores/location'
import type { LiveSession } from '~/types/live'

defineProps<{
  liveSessions?: LiveSession[]
}>()

const locationStore = useLocationStore()
const currentCity = computed(() => locationStore.city || 'Medan')
const isModalOpen = ref(false)
</script>
