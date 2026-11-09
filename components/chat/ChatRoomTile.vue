<script setup lang="ts">
import { computed } from 'vue'
import {
  Check,
  CheckCheck,
  Camera,
  Video,
  Crown,
  User as UserIcon,
} from 'lucide-vue-next'
import type { ChatBoxItem } from '~/types/chat'

const props = defineProps<{
  item: ChatBoxItem
  active?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: ChatBoxItem): void
}>()

// Rule #11: BekasKu+ vs VIP classification
const isBekaskuPlus = computed(() =>
  Boolean(
    props.item.is_bekasku_plus ||
      String(props.item.name || '').toLowerCase() === 'anne14',
  ),
)

const isVip = computed(() =>
  !isBekaskuPlus.value && String(props.item.subscribe_type || '').toLowerCase() === 'vip',
)

const previewState = computed(() => {
  const room = props.item
  // status === 0 means outgoing (me), status === 1 means incoming
  const isOutgoing = room.status === 0

  if (room.intyping) {
    return {
      text: 'Sedang mengetik...',
      italic: false,
      highlight: true,
      mediaIcon: null as 'photo' | 'video' | null,
      showReadTick: false,
    }
  }
  if (room.anomaly) {
    return {
      text: 'Pesan tidak dapat ditampilkan',
      italic: true,
      highlight: false,
      mediaIcon: null as 'photo' | 'video' | null,
      showReadTick: isOutgoing,
    }
  }
  if (room.request_type === 'photo') {
    const hasPhoto = Boolean(room.image)
    return {
      text: hasPhoto ? (room.message || 'Live Photo') : 'Sedang meminta live photo product.',
      italic: !hasPhoto,
      highlight: false,
      mediaIcon: hasPhoto ? ('photo' as const) : null,
      showReadTick: isOutgoing,
    }
  }
  if (room.request_type === 'video') {
    const hasVideo = Boolean(room.video)
    return {
      text: hasVideo ? (room.message || 'Live Video') : 'Sedang meminta live video product.',
      italic: !hasVideo,
      highlight: false,
      mediaIcon: hasVideo ? ('video' as const) : null,
      showReadTick: isOutgoing,
    }
  }
  if (room.negotiation) {
    return {
      text: room.message || 'Sedang negosiasi harga.',
      italic: !room.message,
      highlight: false,
      mediaIcon: null as 'photo' | 'video' | null,
      showReadTick: isOutgoing,
    }
  }
  if (room.video) {
    return {
      text: room.message || 'Video',
      italic: false,
      highlight: false,
      mediaIcon: 'video' as const,
      showReadTick: isOutgoing,
    }
  }
  if (room.image) {
    return {
      text: room.message || 'Foto',
      italic: false,
      highlight: false,
      mediaIcon: 'photo' as const,
      showReadTick: isOutgoing,
    }
  }
  return {
    text: room.message || 'Mulai percakapan',
    italic: false,
    highlight: false,
    mediaIcon: null as 'photo' | 'video' | null,
    showReadTick: isOutgoing,
  }
})
</script>

<template>
  <button
    type="button"
    @click="emit('select', item)"
    class="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-border-light transition-colors cursor-pointer"
    :class="[
      active
        ? 'bg-primary/8 hover:bg-primary/12 border-l-[3px] border-l-primary'
        : 'bg-white hover:bg-surface-2/70',
      compact ? 'px-3 py-3' : 'px-4 py-3.5',
    ]"
  >
    <!-- Avatar + Online Dot -->
    <div class="relative shrink-0">
      <div
        class="rounded-full overflow-hidden bg-surface-2 border border-border-light flex items-center justify-center"
        :class="compact ? 'w-10 h-10' : 'w-11 h-11'"
      >
        <img
          v-if="item.avatar"
          :src="item.avatar"
          :alt="item.name || 'User'"
          class="w-full h-full object-cover"
        />
        <UserIcon v-else class="w-5 h-5 text-text-subtle" />
      </div>

      <span
        v-if="item.online"
        class="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"
      ></span>
    </div>

    <!-- Name + Badge + Last Message -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <span
            class="font-outfit font-semibold text-text truncate"
            :class="compact ? 'text-xs' : 'text-sm'"
          >
            {{ item.name || 'Pengguna BekasKu' }}
          </span>

          <!-- Rule #11: BekasKu+ Official Curated Seller Badge -->
          <img
            v-if="isBekaskuPlus"
            src="/images/bekasku_plus_variant_6_horizontal.png"
            alt="BekasKu+"
            class="h-4 w-auto object-contain shrink-0"
          />

          <!-- Rule #11: VIP Subscriber Badge -->
          <span
            v-else-if="isVip"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-outfit font-semibold text-[10px] shrink-0"
          >
            <Crown class="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span>VIP</span>
          </span>
        </div>

        <span class="font-outfit text-[11px] text-text-muted shrink-0">
          {{ item.time || '' }}
        </span>
      </div>

      <!-- Last Message Preview Row -->
      <div class="flex items-center justify-between gap-2 mt-1">
        <div class="flex items-center gap-1 min-w-0 flex-1">
          <!-- Outgoing Read / Sent Check Icon -->
          <template v-if="previewState.showReadTick && !item.intyping">
            <CheckCheck
              v-if="item.read"
              class="w-3.5 h-3.5 text-primary shrink-0"
            />
            <Check
              v-else
              class="w-3.5 h-3.5 text-text-muted shrink-0"
            />
          </template>

          <!-- Media Indicator Icon -->
          <Camera
            v-if="previewState.mediaIcon === 'photo'"
            class="w-3.5 h-3.5 text-text-muted shrink-0"
          />
          <Video
            v-else-if="previewState.mediaIcon === 'video'"
            class="w-3.5 h-3.5 text-text-muted shrink-0"
          />

          <p
            class="font-outfit text-xs truncate"
            :class="[
              previewState.highlight
                ? 'text-primary font-medium'
                : 'text-text-muted',
              previewState.italic ? 'italic' : '',
            ]"
          >
            {{ previewState.text }}
          </p>
        </div>

        <!-- Unread Count Pill -->
        <span
          v-if="(item.total_unread || 0) > 0"
          class="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white font-outfit font-semibold text-[11px] flex items-center justify-center shrink-0"
        >
          {{ item.total_unread > 99 ? '99+' : item.total_unread }}
        </span>
      </div>
    </div>
  </button>
</template>
