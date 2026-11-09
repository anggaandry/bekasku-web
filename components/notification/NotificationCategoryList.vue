<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  BadgePercent,
  SquarePlay,
  Star,
  ChevronRight,
} from 'lucide-vue-next'
import { useNotificationStore } from '~/stores/notification'

const emit = defineEmits<{
  (e: 'select', key: 'sistem' | 'promo' | 'live' | 'ulasan'): void
}>()

const notifStore = useNotificationStore()

const categories = computed(() => [
  {
    key: 'sistem' as const,
    title: 'Sistem',
    subtitle: notifStore.latestSistem || 'Pemberitahuan sistem & akun',
    badge: notifStore.unreadSistem,
    icon: Bell,
    iconColor: 'text-primary',
  },
  {
    key: 'promo' as const,
    title: 'Promo BekasKu',
    subtitle: notifStore.latestPromo || 'Promo menarik & penawaran spesial BekasKu',
    badge: notifStore.unreadPromo,
    icon: BadgePercent,
    iconColor: 'text-primary',
  },
  {
    key: 'live' as const,
    title: 'Live & Video',
    subtitle: notifStore.latestLive || 'Siaran langsung & video terbaru',
    badge: notifStore.unreadLive,
    icon: SquarePlay,
    iconColor: 'text-emerald-500',
  },
  {
    key: 'ulasan' as const,
    title: 'Ulasan',
    subtitle: 'Berikan ulasan untuk produk yang anda beli',
    badge: notifStore.unreadReview,
    icon: Star,
    iconColor: 'text-secondary-star',
  },
])
</script>

<template>
  <div class="bg-white divide-y divide-border-light">
    <button
      v-for="cat in categories"
      :key="cat.key"
      type="button"
      @click="emit('select', cat.key)"
      class="w-full flex items-center gap-3.5 px-4 sm:px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer group text-left focus-visible:outline-2 focus-visible:outline-primary"
    >
      <!-- Icon Container (matches mobile _buildMenuItem with rounded border box) -->
      <div class="w-11 h-11 rounded-xl bg-white border border-border-light flex items-center justify-center shrink-0 shadow-2xs group-hover:border-primary/40 transition-colors">
        <component :is="cat.icon" class="w-5 h-5" :class="cat.iconColor" aria-hidden="true" />
      </div>

      <!-- Title & Subtitle -->
      <div class="flex-1 min-w-0">
        <h3 class="font-outfit font-semibold text-sm sm:text-base text-text truncate">
          {{ cat.title }}
        </h3>
        <p class="font-outfit text-xs text-text-muted truncate mt-0.5">
          {{ cat.subtitle }}
        </p>
      </div>

      <!-- Badge & Chevron -->
      <div class="flex items-center gap-2 shrink-0">
        <span
          v-if="cat.badge > 0"
          class="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white font-outfit font-bold text-[10px] flex items-center justify-center"
        >
          {{ cat.badge > 99 ? '99+' : cat.badge }}
        </span>
        <ChevronRight class="w-4 h-4 text-text-subtle group-hover:text-text transition-colors" aria-hidden="true" />
      </div>
    </button>
  </div>
</template>
