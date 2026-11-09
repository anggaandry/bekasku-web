<template>
  <div class="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
    <!-- 1. LIVE CARD LAYOUT -->
    <template v-if="item.is_live">
      <!-- Background Ambient Poster -->
      <img
        v-if="livePosterUrl"
        :src="livePosterUrl"
        :alt="item.user_name"
        class="absolute inset-0 w-full h-full object-cover filter blur-md opacity-40 scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />

      <!-- Center Live Host Beacon & Avatar -->
      <div class="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        <div class="flex items-center gap-1.5 bg-primary text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg animate-pulse mb-6">
          <span class="w-2 h-2 rounded-full bg-white" />
          <span>SEDANG LIVE</span>
        </div>

        <!-- Ringed Host Avatar -->
        <div class="relative p-1 rounded-full bg-gradient-to-tr from-[#FF2D20] via-[#FF7332] to-[#FF2D20] shadow-2xl mb-4">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white bg-gray-900 flex items-center justify-center">
            <img
              v-if="livePosterUrl && !avatarErr"
              :src="livePosterUrl"
              :alt="item.user_name"
              class="w-full h-full object-cover"
              @error="avatarErr = true"
            />
            <span v-else class="text-white font-bold text-3xl select-none">
              {{ (item.user_name || 'H').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <h3 class="font-outfit font-black text-xl sm:text-2xl text-white drop-shadow-md mb-1">
          {{ item.user_name }}
        </h3>
        <p class="text-xs sm:text-sm text-amber-300 font-semibold mb-8">
          {{ item.title || 'Sesi Jualan Live Eksklusif' }}
        </p>

        <!-- CTA Tonton Siaran -->
        <NuxtLink
          :to="`/live/${item.live_id || item.id}`"
          class="w-full py-3.5 px-8 rounded-full bg-gradient-to-r from-primary to-red-600 text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 text-center flex items-center justify-center gap-2"
        >
          <Radio class="w-4 h-4 text-white animate-pulse" />
          <span>Tonton Siaran</span>
        </NuxtLink>
      </div>

      <!-- Bottom Info -->
      <div class="absolute bottom-6 left-6 z-10 text-white">
        <p class="font-bold text-base">@{{ item.user_name }}</p>
        <p class="text-xs text-white/70 mt-1">Mari bergabung ke keseruan Live ini!</p>
      </div>
    </template>

    <!-- 2. STANDARD SHORT VIDEO FEED ITEM -->
    <template v-else>
      <!-- HTML5 Video Player -->
      <video
        ref="videoPlayerRef"
        :src="sanitizeMediaUrl(item.video_url, '')"
        :poster="sanitizeMediaUrl(item.thumbnail, '')"
        loop
        playsinline
        webkit-playsinline
        class="w-full h-full object-cover cursor-pointer"
        @click="togglePlay"
      />

      <!-- Dark Gradient Overlays for Readability -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />

      <!-- Center Play/Pause Flash Overlay Indicator -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="!isPlaying"
          class="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div class="w-16 h-16 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-2xl">
            <Play class="w-8 h-8 fill-white ml-1 text-white" />
          </div>
        </div>
      </Transition>

      <!-- Right Action Sidebar (Matches mobile screenshot, hidden on desktop since desktop has Instagram-style right panel) -->
      <div class="absolute right-3 sm:right-4 bottom-16 sm:bottom-20 z-20 flex md:hidden flex-col items-center gap-4">
        <!-- Creator Avatar with Link -->
        <NuxtLink
          :to="`/seller/${item.user_id}`"
          class="relative group cursor-pointer"
          title="Kunjungi Toko"
        >
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-white bg-gray-800 shadow-lg flex items-center justify-center">
            <img
              v-if="sanitizedAvatar && !avatarErr"
              :src="sanitizedAvatar"
              :alt="item.user_name"
              class="w-full h-full object-cover"
              @error="avatarErr = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gray-700 select-none">
              {{ (item.user_name || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
        </NuxtLink>

        <!-- Like Button -->
        <button
          type="button"
          class="flex flex-col items-center text-white group cursor-pointer"
          @click="$emit('like', item)"
        >
          <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center transition-transform active:scale-125 border border-white/10 shadow-md">
            <Heart
              class="w-6 h-6 transition-colors"
              :class="item.is_liked ? 'fill-red-500 text-red-500' : 'text-white'"
            />
          </div>
          <span class="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {{ formatCompact(item.total_like || item.likes || 0) }}
          </span>
        </button>

        <!-- Comment Button -->
        <button
          type="button"
          class="flex flex-col items-center text-white group cursor-pointer"
          @click="$emit('comment', item)"
        >
          <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center transition-transform active:scale-110 border border-white/10 shadow-md">
            <MessageCircle class="w-6 h-6 text-white" />
          </div>
          <span class="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {{ formatCompact(item.total_comment || item.comments || 0) }}
          </span>
        </button>

        <!-- Share Button -->
        <button
          type="button"
          class="flex flex-col items-center text-white group cursor-pointer"
          title="Bagikan Video"
          @click="$emit('share', item)"
        >
          <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center transition-transform active:scale-110 border border-white/10 shadow-md">
            <Share2 class="w-5 h-5 text-white" />
          </div>
        </button>

        <!-- Owner Delete Video Button -->
        <button
          v-if="isOwner"
          type="button"
          class="flex flex-col items-center text-white/80 hover:text-red-400 group cursor-pointer"
          title="Hapus Video Saya"
          @click="$emit('delete', item)"
        >
          <div class="w-10 h-10 rounded-full bg-red-950/60 backdrop-blur-xs flex items-center justify-center transition-transform active:scale-110 border border-red-500/30 shadow-md text-red-400">
            <Trash2 class="w-5 h-5" />
          </div>
        </button>

        <!-- Spinning Music Disc -->
        <div class="w-10 h-10 rounded-full bg-gray-950 border-2 border-gray-700 overflow-hidden flex items-center justify-center shadow-lg animate-spin [animation-duration:4s]">
          <div class="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Music class="w-2.5 h-2.5 text-white/90" />
          </div>
        </div>
      </div>

      <!-- Bottom Info Overlay (Matches mobile screenshot, hidden on desktop since desktop has Instagram-style right panel) -->
      <div class="absolute left-4 sm:left-5 right-18 bottom-6 sm:bottom-8 z-20 text-white md:hidden">
        <!-- Pinned Product Card (if linked) -->
        <NuxtLink
          v-if="item.product || item.product_id"
          :to="`/product/${item.product?._id || item.product_id}`"
          class="inline-flex items-center gap-2.5 p-1.5 pr-3 mb-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 transition-all max-w-xs shadow-lg group/prod"
        >
          <div class="w-9 h-9 rounded-lg overflow-hidden bg-gray-800 shrink-0 flex items-center justify-center">
            <img
              v-if="sanitizeMediaUrl(item.product?.image || item.thumbnail, '')"
              :src="sanitizeMediaUrl(item.product?.image || item.thumbnail, '')"
              :alt="item.product?.title || 'Produk Terkait'"
              class="w-full h-full object-cover group-hover/prod:scale-105 transition-transform"
            />
            <ShoppingBag v-else class="w-4 h-4 text-white/60" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate line-clamp-1">
              {{ item.product?.title || 'Lihat Produk Jualan' }}
            </p>
            <p class="text-[11px] font-extrabold text-amber-300">
              Rp {{ formatRupiah(item.product?.price || 0) }}
            </p>
          </div>
          <span class="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-md shrink-0">
            Beli
          </span>
        </NuxtLink>

        <!-- Creator Username -->
        <NuxtLink
          :to="`/seller/${item.user_id}`"
          class="block font-outfit font-black text-sm sm:text-base text-white hover:underline drop-shadow-md truncate"
        >
          @{{ item.user_name }}
        </NuxtLink>

        <!-- Caption -->
        <p class="text-xs sm:text-sm text-white/95 mt-1 font-normal line-clamp-2 drop-shadow-sm leading-relaxed">
          {{ item.content || item.title }}
        </p>

        <!-- Audio Info -->
        <div class="flex items-center gap-1.5 mt-2 text-white/75 text-xs">
          <Music class="w-3 h-3 text-white/80 shrink-0" />
          <span class="truncate font-medium">
            {{ item.music || 'Original video sound' }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Music,
  Radio,
  ShoppingBag,
} from 'lucide-vue-next'
import type { VideoFeedItem } from '~/types/video'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  item: VideoFeedItem
  isActive?: boolean
}>()

defineEmits<{
  like: [item: VideoFeedItem]
  comment: [item: VideoFeedItem]
  share: [item: VideoFeedItem]
  delete: [item: VideoFeedItem]
}>()

const authStore = useAuthStore()
const videoPlayerRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const avatarErr = ref(false)

const livePosterUrl = computed(() => {
  return sanitizeMediaUrl(props.item.user_avatar || props.item.thumbnail, '')
})

const sanitizedAvatar = computed(() => {
  return sanitizeMediaUrl(props.item.user_avatar, '')
})

const isOwner = computed(() => {
  return authStore.isLoggedIn && authStore.userId === props.item.user_id
})

watch(
  () => props.item._id || props.item.id,
  () => {
    avatarErr.value = false
  }
)

watch(
  () => props.isActive,
  (active) => {
    if (!videoPlayerRef.value) return
    if (active) {
      videoPlayerRef.value.play().then(() => {
        isPlaying.value = true
      }).catch(() => {
        isPlaying.value = false
      })
    } else {
      videoPlayerRef.value.pause()
      isPlaying.value = false
    }
  }
)

onMounted(() => {
  if (props.isActive && videoPlayerRef.value) {
    videoPlayerRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      isPlaying.value = false
    })
  }
})

function togglePlay() {
  if (!videoPlayerRef.value) return
  if (videoPlayerRef.value.paused) {
    videoPlayerRef.value.play()
    isPlaying.value = true
  } else {
    videoPlayerRef.value.pause()
    isPlaying.value = false
  }
}

function formatCompact(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>

