<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeft, X, RefreshCw } from 'lucide-vue-next'
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { useNotificationRouter } from '~/composables/useNotificationRouter'
import { useNotificationDrawer, type NotificationDrawerSubView } from '~/composables/useNotificationDrawer'
import NotificationCategoryList from '~/components/notification/NotificationCategoryList.vue'
import NotificationCard from '~/components/notification/NotificationCard.vue'
import NotificationEmptyState from '~/components/notification/NotificationEmptyState.vue'
import NotificationSubView from '~/components/notification/NotificationSubView.vue'
import NotificationUlasanView from '~/components/notification/NotificationUlasanView.vue'
import type { NotificationItem } from '~/types/notification'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const notifStore = useNotificationStore()
const authStore = useAuthStore()
const { navigateFromNotification } = useNotificationRouter()
const { activeView, setView } = useNotificationDrawer()

const titleMap: Record<NotificationDrawerSubView, string> = {
  hub: 'Notifikasi',
  sistem: 'Sistem',
  promo: 'Promo BekasKu',
  live: 'Live & Video',
  pesanan: 'Status Pesanan',
  ulasan: 'Penilaian',
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (authStore.isLoggedIn) {
        notifStore.fetchAllAndCategorize()
      }
    } else {
      setView('hub')
    }
  },
)

function closeDrawer() {
  emit('update:modelValue', false)
}

function handleSelectCategory(key: 'sistem' | 'promo' | 'live' | 'ulasan') {
  setView(key)
}

function handleCardClick(item: NotificationItem) {
  notifStore.markAsReadLocally(item.id)
  closeDrawer()
  navigateFromNotification(item)
}

function handleNavigate(url: string) {
  closeDrawer()
  navigateTo(url)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    if (activeView.value !== 'hub') {
      setView('hub')
    } else {
      closeDrawer()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="notif-drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[75] flex justify-end bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Notifikasi BekasKu"
        @click.self="closeDrawer"
      >
        <aside
          class="notif-drawer-panel w-full sm:w-[460px] max-w-full h-dvh bg-white shadow-2xl flex flex-col overflow-hidden text-text font-outfit"
        >
          <!-- Header Bar -->
          <div class="px-4 py-3 sm:py-3.5 border-b border-border-light flex items-center justify-between shrink-0 bg-white">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Back Button if inside a subview -->
              <button
                v-if="activeView !== 'hub'"
                type="button"
                @click="setView('hub')"
                class="p-1.5 -ml-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Kembali ke Notifikasi"
              >
                <ChevronLeft class="w-6 h-6 text-text" aria-hidden="true" />
              </button>

              <h2 class="font-outfit font-bold text-base sm:text-lg text-text truncate">
                {{ titleMap[activeView] }}
              </h2>
            </div>

            <!-- Close (X) Button -->
            <button
              type="button"
              @click="closeDrawer"
              class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Tutup"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Body Area: Switches View -->
          <!-- 1. Hub View (4 Categories + Status Pemesanan kamu) -->
          <div
            v-if="activeView === 'hub'"
            class="flex-1 overflow-y-auto divide-y divide-border-light bg-white"
          >
            <!-- 4 Category Items (Sistem, Promo, Live, Ulasan) -->
            <NotificationCategoryList @select="handleSelectCategory" />

            <!-- Section: Status Pemesanan kamu -->
            <div class="bg-surface-2 px-4 sm:px-5 py-2.5 border-y border-border-light flex items-center justify-between">
              <h3 class="font-outfit font-semibold text-xs sm:text-sm text-text">
                Status Pemesanan kamu
              </h3>
              <button
                type="button"
                @click="setView('pesanan')"
                class="font-outfit font-semibold text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              >
                Baca semua
              </button>
            </div>

            <!-- Loading Skeleton for Order Notifications -->
            <div v-if="notifStore.loading && notifStore.listOrderNotif.length === 0" class="divide-y divide-border-light">
              <div
                v-for="i in 4"
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

            <!-- Error State -->
            <div v-else-if="notifStore.error && notifStore.listOrderNotif.length === 0" class="p-8 text-center space-y-3">
              <p class="font-outfit text-xs text-text-muted">
                {{ notifStore.error }}
              </p>
              <button
                type="button"
                @click="notifStore.fetchAllAndCategorize()"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-border-light text-xs font-outfit font-semibold text-text transition-colors cursor-pointer"
              >
                <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coba lagi</span>
              </button>
            </div>

            <!-- Order Status Notification Cards -->
            <div v-else-if="notifStore.listOrderNotif.length > 0" class="divide-y divide-border-light">
              <NotificationCard
                v-for="item in notifStore.listOrderNotif"
                :key="item.id"
                :item="item"
                @click="handleCardClick"
              />
            </div>

            <!-- Empty Orders -->
            <div v-else class="p-6">
              <NotificationEmptyState
                title="Belum ada status pemesanan"
                subtitle="Pembaruan status pesanan dan transaksi Anda akan muncul di sini."
              />
            </div>
          </div>

          <!-- 2. Subcategory View (Sistem, Promo, Live, Pesanan) -->
          <NotificationSubView
            v-else-if="activeView === 'sistem' || activeView === 'promo' || activeView === 'live' || activeView === 'pesanan'"
            :type-key="activeView"
            @click-item="handleCardClick"
          />

          <!-- 3. Ulasan View (Rating & Ulasan Saya tabs) -->
          <NotificationUlasanView
            v-else-if="activeView === 'ulasan'"
            @navigate="handleNavigate"
          />
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notif-drawer-enter-active,
.notif-drawer-leave-active {
  transition: opacity 0.22s ease;
}
.notif-drawer-enter-active .notif-drawer-panel,
.notif-drawer-leave-active .notif-drawer-panel {
  transition: transform 0.26s cubic-bezier(0.32, 0.72, 0, 1);
}
.notif-drawer-enter-from,
.notif-drawer-leave-to {
  opacity: 0;
}
.notif-drawer-enter-from .notif-drawer-panel,
.notif-drawer-leave-to .notif-drawer-panel {
  transform: translateX(100%);
}
</style>
