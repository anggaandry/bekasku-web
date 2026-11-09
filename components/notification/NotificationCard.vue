<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Bell,
  Tag,
  Radio,
  BarChart2,
  SquarePlay,
  MessageSquare,
  Heart,
  ChevronRight,
  Users,
} from 'lucide-vue-next'
import type { NotificationItem } from '~/types/notification'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  item: NotificationItem
}>()

const emit = defineEmits<{
  (e: 'click', item: NotificationItem): void
}>()

const imageError = ref(false)
const isUnread = computed(() => !props.item.read)

// Resolve thumbnail image
const primaryImage = computed(() => {
  if (imageError.value) return ''
  if (props.item.image) return sanitizeMediaUrl(props.item.image, '')
  if (props.item.feed) {
    const feed = props.item.feed
    const cover = feed.cover || feed.thumbnail || feed.user_avatar || feed.userAvatar || feed.avatar
    if (cover) return sanitizeMediaUrl(cover, '')
  }
  if (props.item.transaction) {
    const pImg = props.item.transaction.product_image || props.item.transaction.productImage
    if (pImg) return sanitizeMediaUrl(pImg, '')
  }
  return ''
})

// Feed subtype checks
const feedSubType = computed(() => {
  return props.item.feed?.sub_type || props.item.feed?.type || ''
})

const isLiveEnded = computed(() => feedSubType.value === 'live_ended')
const liveTotalViewers = computed(() => props.item.feed?.total_viewers ?? '0')

// Fallback icon config
const iconConfig = computed(() => {
  if (props.item.type === 4 || props.item.feed) {
    switch (feedSubType.value) {
      case 'live_started':
        return { icon: Radio, iconColor: 'text-primary', bgColor: 'bg-chip-soft-bg' }
      case 'live_ended':
        return { icon: BarChart2, iconColor: 'text-primary', bgColor: 'bg-primary/10' }
      case 'video_new':
        return { icon: SquarePlay, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' }
      case 'video_comment':
        return { icon: MessageSquare, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50' }
      case 'video_like':
        return { icon: Heart, iconColor: 'text-rose-600', bgColor: 'bg-rose-50' }
      default:
        return { icon: SquarePlay, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' }
    }
  }

  if (props.item.type === 2) {
    return { icon: Tag, iconColor: 'text-white', bgColor: 'bg-primary' }
  }

  return { icon: Bell, iconColor: 'text-text-subtle', bgColor: 'bg-surface-2' }
})
</script>

<template>
  <button
    type="button"
    @click="emit('click', item)"
    class="w-full text-left flex items-start gap-3.5 px-4 sm:px-5 py-3.5 transition-colors cursor-pointer border-b border-border-light hover:bg-surface-2/70 focus-visible:outline-2 focus-visible:outline-primary"
    :class="isUnread ? 'bg-primary/5' : 'bg-white'"
  >
    <!-- Leading Avatar / Image / Icon -->
    <div class="shrink-0 mt-0.5">
      <div
        v-if="primaryImage"
        class="w-11 h-11 rounded-xl overflow-hidden bg-surface-2 border border-border-light flex items-center justify-center"
      >
        <img
          :src="primaryImage"
          :alt="item.title"
          width="44"
          height="44"
          loading="lazy"
          class="w-full h-full object-cover"
          @error="imageError = true"
        />
      </div>

      <div
        v-else
        class="w-11 h-11 rounded-xl flex items-center justify-center border border-border-light"
        :class="iconConfig.bgColor"
      >
        <component
          :is="iconConfig.icon"
          class="w-5 h-5"
          :class="iconConfig.iconColor"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h4
        class="font-outfit text-sm text-text line-clamp-2 leading-snug"
        :class="isUnread ? 'font-bold' : 'font-semibold'"
      >
        {{ item.title }}
      </h4>

      <p
        v-if="item.description"
        class="font-outfit text-xs text-text-muted line-clamp-2 leading-relaxed mt-1"
      >
        {{ item.description }}
      </p>

      <!-- Stats Pill for Live Ended -->
      <div v-if="isLiveEnded" class="mt-2 flex items-center gap-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-chip-soft-bg border border-chip-soft-border text-primary font-outfit font-semibold text-[11px]">
          <Users class="w-3 h-3 text-primary" aria-hidden="true" />
          <span>{{ liveTotalViewers }} Penonton</span>
        </span>
      </div>

      <p class="font-outfit text-[11px] text-text-subtle mt-1.5">
        {{ item.time }}
      </p>
    </div>

    <!-- Chevron -->
    <ChevronRight class="w-4 h-4 text-text-subtle shrink-0 mt-1" aria-hidden="true" />
  </button>
</template>
