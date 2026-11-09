<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import {
  NOTIF_TYPE_ORDER,
  NOTIF_TYPE_PROMO,
  NOTIF_TYPE_SYSTEM,
  NOTIF_TYPE_LIVE,
} from '~/utils/constants'
import { useNotificationStore } from '~/stores/notification'
import type { NotificationItem } from '~/types/notification'
import NotificationCard from '~/components/notification/NotificationCard.vue'
import NotificationEmptyState from '~/components/notification/NotificationEmptyState.vue'

const props = defineProps<{
  typeKey: 'sistem' | 'promo' | 'live' | 'pesanan'
}>()

const emit = defineEmits<{
  (e: 'click-item', item: NotificationItem): void
}>()

const notifStore = useNotificationStore()

const resolvedTypeNumber = computed(() => {
  switch (props.typeKey) {
    case 'pesanan':
      return NOTIF_TYPE_ORDER
    case 'promo':
      return NOTIF_TYPE_PROMO
    case 'live':
      return NOTIF_TYPE_LIVE
    case 'sistem':
    default:
      return NOTIF_TYPE_SYSTEM
  }
})

function loadInitial() {
  notifStore.fetchNotificationList(resolvedTypeNumber.value, true)
}

function loadMore() {
  notifStore.loadMoreCategoryNotif(resolvedTypeNumber.value)
}

watch(
  () => props.typeKey,
  () => {
    loadInitial()
  },
)

onMounted(() => {
  loadInitial()
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white">
    <!-- Loading skeleton -->
    <div v-if="notifStore.categoryLoading && notifStore.listCategoryNotif.length === 0" class="divide-y divide-border-light">
      <div
        v-for="i in 6"
        :key="i"
        class="p-4 flex items-start gap-3.5 animate-pulse"
      >
        <div class="w-11 h-11 rounded-xl bg-surface-2 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-surface-2 rounded-md w-3/5" />
          <div class="h-3 bg-surface-2 rounded-md w-4/5" />
          <div class="h-2.5 bg-surface-2 rounded-md w-1/4" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="notifStore.categoryError && notifStore.listCategoryNotif.length === 0" class="p-8 text-center space-y-3">
      <p class="font-outfit text-xs text-text-muted">
        {{ notifStore.categoryError }}
      </p>
      <button
        type="button"
        @click="loadInitial"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-border-light text-xs font-outfit font-semibold text-text transition-colors cursor-pointer"
      >
        <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Coba lagi</span>
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="notifStore.listCategoryNotif.length === 0" class="p-6">
      <NotificationEmptyState
        title="Belum ada notifikasi"
        subtitle="Notifikasi aktivitas Anda akan muncul di sini."
      />
    </div>

    <!-- Notification List -->
    <div v-else class="flex-1 overflow-y-auto divide-y divide-border-light">
      <NotificationCard
        v-for="item in notifStore.listCategoryNotif"
        :key="item.id"
        :item="item"
        @click="emit('click-item', item)"
      />

      <!-- Load More Trigger -->
      <div v-if="notifStore.hasMore" class="p-3 text-center">
        <button
          type="button"
          :disabled="notifStore.loadingMore"
          @click="loadMore"
          class="px-4 py-2 rounded-xl text-xs font-outfit font-semibold text-primary hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {{ notifStore.loadingMore ? 'Memuat...' : 'Muat lebih banyak' }}
        </button>
      </div>
    </div>
  </div>
</template>
