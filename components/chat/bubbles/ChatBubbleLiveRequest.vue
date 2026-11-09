<script setup lang="ts">
import { computed } from 'vue'
import { HelpCircle, Camera, Video, Play, Image as ImageIcon, AlertCircle } from 'lucide-vue-next'
import type { RequestChatModel } from '~/types/chat'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  request: RequestChatModel
  type: 'req-live-photo' | 'req-live-video' | 'live-photo' | 'live-video'
  mediaUrl?: string
  caption?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'show-info'): void
  (e: 'take-photo', request: RequestChatModel): void
  (e: 'take-video', request: RequestChatModel): void
  (e: 'preview-media', payload: { url: string; isVideo: boolean }): void
  (e: 'open-product', request: RequestChatModel): void
}>()

const isVideoType = computed(() => props.type === 'req-live-video' || props.type === 'live-video' || props.request.type === 'video')
const isFulfilled = computed(() => props.type === 'live-photo' || props.type === 'live-video' || Boolean(props.mediaUrl))
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-border-light shadow-2xs overflow-hidden transition-all"
    :class="compact ? 'w-full max-w-[290px]' : 'w-full max-w-[340px]'"
  >
    <!-- Header Bar -->
    <div class="bg-surface-2 px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-border-light">
      <div class="flex items-center gap-1.5 min-w-0">
        <Video v-if="isVideoType" class="w-3.5 h-3.5 text-primary shrink-0" />
        <Camera v-else class="w-3.5 h-3.5 text-primary shrink-0" />
        <span class="font-outfit font-semibold text-xs text-text truncate">
          {{ isVideoType ? 'Permintaan Live Video' : 'Permintaan Live Photo' }}
        </span>
      </div>

      <button
        type="button"
        @click.stop="emit('show-info')"
        class="w-5 h-5 rounded-full bg-text-muted/15 hover:bg-text-muted/25 text-text-muted flex items-center justify-center transition-colors cursor-pointer shrink-0"
        aria-label="Info Live Media"
      >
        <HelpCircle class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Product Info Row -->
    <div
      class="p-3.5 flex items-start gap-3 cursor-pointer group"
      @click="emit('open-product', request)"
    >
      <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
        <img
          v-if="request.image"
          :src="request.image"
          :alt="request.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <ImageIcon v-else class="w-6 h-6 text-text-subtle" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-outfit font-normal text-sm text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {{ request.title }}
        </p>

        <p
          v-if="request.price"
          class="font-outfit font-semibold text-sm sm:text-base text-text mt-1"
        >
          {{ formatRupiah(request.price) }}
        </p>
      </div>
    </div>

    <!-- Seller Action Button when unfulfilled request -->
    <div
      v-if="!isFulfilled && request.is_seller"
      class="border-t border-border-light"
    >
      <button
        type="button"
        @click.stop="isVideoType ? emit('take-video', request) : emit('take-photo', request)"
        class="w-full py-2.5 px-3.5 flex items-center justify-center gap-1.5 font-outfit font-semibold text-sm text-primary hover:bg-primary/8 transition-colors cursor-pointer"
      >
        <Video v-if="isVideoType" class="w-4 h-4 text-primary shrink-0" />
        <Camera v-else class="w-4 h-4 text-primary shrink-0" />
        <span>{{ isVideoType ? 'Ambil Video' : 'Ambil Foto' }}</span>
      </button>
    </div>

    <!-- Buyer Waiting Info when unfulfilled request -->
    <div
      v-else-if="!isFulfilled && !request.is_seller"
      class="px-3.5 py-2 bg-surface-2/60 border-t border-border-light text-center"
    >
      <span class="font-outfit text-xs text-text-muted">
        Menunggu penjual mengirimkan {{ isVideoType ? 'live video' : 'live photo' }}
      </span>
    </div>

    <!-- Fulfilled Live Photo / Live Video Media Preview -->
    <div v-if="isFulfilled" class="px-3.5 pb-3.5 space-y-2">
      <!-- Expired Video State -->
      <div
        v-if="isVideoType && !mediaUrl"
        class="rounded-xl bg-surface-2 border border-border p-3 flex items-center gap-2.5 text-text-muted"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-text-muted" />
        <span class="font-outfit italic text-xs">Video telah kadaluarsa</span>
      </div>

      <!-- Active Video / Photo Preview -->
      <div
        v-else-if="mediaUrl"
        class="relative rounded-xl overflow-hidden bg-black/5 border border-border-light cursor-pointer group aspect-4/3 max-h-[220px]"
        @click.stop="emit('preview-media', { url: mediaUrl, isVideo: isVideoType })"
      >
        <video
          v-if="isVideoType"
          :src="mediaUrl"
          preload="metadata"
          muted
          playsinline
          class="w-full h-full object-cover"
        />
        <img
          v-else
          :src="mediaUrl"
          :alt="request.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        <!-- Play Button Overlay for Video -->
        <div
          v-if="isVideoType"
          class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors"
        >
          <div class="w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center shadow-md">
            <Play class="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      <p v-if="caption" class="font-outfit text-sm text-text leading-relaxed break-words">
        {{ caption }}
      </p>
    </div>
  </div>
</template>
