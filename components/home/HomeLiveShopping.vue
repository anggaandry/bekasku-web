<template>
  <div class="space-y-3 flex flex-col h-full">
    <!-- Header with Title & Navigation Arrows -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-base sm:text-lg font-black text-gray-900 tracking-tight font-outfit">
          Sedang Tayang
        </h3>
      </div>

      <!-- Carousel Navigation Arrows -->
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentIndex === 0"
          title="Video sebelumnya"
          @click="scrollPrev"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentIndex >= feedVideos.length - 4"
          title="Video selanjutnya"
          @click="scrollNext"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Video & Live Cards Container (4 Visible Cards side by side) -->
    <div
      ref="feedContainerRef"
      class="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 overflow-x-auto no-scrollbar scroll-smooth"
    >
      <!-- Shimmer Loading Skeletons matching Mobile V3 -->
      <template v-if="loading">
        <div
          v-for="n in 4"
          :key="`live-skel-${n}`"
          class="aspect-[9/13.5] sm:aspect-[9/13] rounded-2xl bg-gray-200 animate-shimmer border border-gray-100 shadow-2xs"
        />
      </template>

      <template v-else v-for="(item, idx) in visibleCards" :key="item.id">
        <!-- LIVE CARD: Gradient ring border + Full Avatar Background + Host Avatar Profile -->
        <div
          v-if="item.is_live"
          class="relative rounded-2xl overflow-hidden aspect-[9/13.5] sm:aspect-[9/13] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl p-[2px] bg-gradient-to-tr from-[#FF2D20] via-[#FF7332] to-[#FF2D20]"
          @click="openVideoModal(item)"
        >
          <div class="relative w-full h-full rounded-[14px] overflow-hidden bg-black flex flex-col justify-between">
            <!-- Background Image Fill -->
            <img
              :src="item.user_avatar || item.thumbnail"
              :alt="item.user_name"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            <!-- Dark Gradient Overlay for text contrast -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            <!-- Top Row: LIVE Badge & Viewers -->
            <div class="relative z-10 p-1.5 sm:p-2 flex items-center justify-between gap-1">
              <div class="flex items-center gap-1 bg-[#EF4444] text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>LIVE</span>
              </div>

              <div class="flex items-center gap-0.5 bg-black/60 backdrop-blur-xs text-white text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full border border-white/10">
                <Eye class="w-2.5 h-2.5 text-white/90" />
                <span>{{ formatCompact(item.viewers || 180) }}</span>
              </div>
            </div>

            <!-- Center Live Broadcast Beacon on Hover -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xs border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Radio class="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <!-- Bottom Overlay: Host Circular Avatar Profile + Name + Sesi Jualan Live -->
            <div class="relative z-10 p-1.5 sm:p-2 text-white">
              <div class="flex items-center gap-1.5">
                <!-- Circular Host Avatar Profile with gold badge -->
                <div class="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1.5 ring-white/90 overflow-hidden bg-gray-800 shadow-md shrink-0">
                  <img
                    :src="item.user_avatar || item.thumbnail"
                    :alt="item.user_name"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#EBAD25] flex items-center justify-center ring-1 ring-white text-white shadow-2xs">
                    <Check class="w-1.5 h-1.5 text-white stroke-[3.5]" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="font-outfit font-black text-[10px] sm:text-[11px] text-white drop-shadow-md truncate">
                    {{ item.user_name }}
                  </p>
                  <p class="text-[8px] sm:text-[8.5px] text-amber-300 font-semibold drop-shadow-sm truncate">
                    Sesi Jualan Live
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between mt-1 pt-1 border-t border-white/15 text-[8.5px] text-white/80">
                <span class="truncate">{{ item.city || 'Indonesia' }}</span>
                <span class="text-[#EF4444] font-bold bg-white/95 px-1.5 py-0.2 rounded-full text-[8px] shadow-xs">Tonton</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VIDEO FEED CARD: Video Thumbnail + Right Side Interactions -->
        <div
          v-else
          class="relative rounded-2xl overflow-hidden bg-black aspect-[9/13.5] sm:aspect-[9/13] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-[#2563EB]/40 flex flex-col justify-between border border-gray-200/20"
          @click="openVideoModal(item)"
        >
          <!-- Background Poster / Thumbnail -->
          <img
            :src="item.thumbnail"
            :alt="item.title || item.content || 'Video BekasKu'"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <!-- Dark Gradient Overlays for readable text -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />

          <!-- Top Row: VIDEO Badge & City -->
          <div class="relative z-10 p-2 sm:p-2.5 flex items-center justify-between gap-1">
            <div class="flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/20">
              <Play class="w-2 h-2 fill-white text-white" />
              <span>VIDEO</span>
            </div>

            <div class="text-[9px] text-white/80 font-medium truncate max-w-[65px] bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full">
              {{ item.city || 'Indonesia' }}
            </div>
          </div>

          <!-- Center Play Overlay Button on Hover -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xs border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Play class="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
          </div>

          <!-- Right Side Floating Actions (TikTok style as in video_feed_view.dart) -->
          <div class="absolute right-1.5 bottom-12 sm:bottom-14 z-10 flex flex-col items-center gap-2" @click.stop>
            <!-- Host Avatar with Border -->
            <NuxtLink
              :to="`/seller/${item.id}`"
              class="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1.5 ring-white overflow-hidden bg-gray-800 shadow-md group/avatar"
              title="Kunjungi Profil"
            >
              <img
                :src="item.user_avatar"
                :alt="item.user_name"
                class="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
              />
            </NuxtLink>

            <!-- Like Action -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-red-400 transition-colors"
              @click.stop="toggleLike(item)"
            >
              <Heart
                class="w-4 h-4 transition-transform active:scale-125"
                :class="likedMap[item.id] ? 'fill-red-500 text-red-500' : 'text-white'"
              />
              <span class="text-[9px] font-bold text-white mt-0.5 shadow-xs">
                {{ formatCompact((item.likes || 0) + (likedMap[item.id] ? 1 : 0)) }}
              </span>
            </button>

            <!-- Comment Action -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-blue-300 transition-colors"
              @click.stop="openVideoModal(item)"
            >
              <MessageCircle class="w-4 h-4 text-white" />
              <span class="text-[9px] font-bold text-white mt-0.5 shadow-xs">
                {{ formatCompact(item.comments || 0) }}
              </span>
            </button>

            <!-- Share Action -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-yellow-300 transition-colors"
              @click.stop="shareVideo(item)"
            >
              <Share2 class="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <!-- Bottom Info (Username, Content, Audio info) -->
          <div class="relative z-10 p-2 sm:p-2.5 pr-8 text-white">
            <p class="font-outfit font-extrabold text-[11px] sm:text-xs text-white drop-shadow-md truncate">
              @{{ item.user_name }}
            </p>

            <p class="text-[10px] text-white/90 line-clamp-1 sm:line-clamp-2 mt-0.5 font-normal leading-tight drop-shadow-sm">
              {{ item.content || item.title }}
            </p>

            <!-- Music/Sound Track Row -->
            <div class="flex items-center gap-1 mt-1 text-white/75 text-[9px]">
              <Music class="w-2.5 h-2.5 text-white/90 shrink-0" />
              <span class="truncate font-medium">
                {{ item.music || 'Original sound' }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Interactive Video Player Modal (Full TikTok/Reels Style View) -->
    <Teleport to="body">
      <div
        v-if="activeModalVideo"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4"
        @click.self="closeVideoModal"
      >
        <div class="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[740px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/20">
          <!-- Video Element -->
          <video
            ref="modalVideoPlayerRef"
            :src="activeModalVideo.video_url"
            :poster="activeModalVideo.thumbnail"
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            playsinline
            loop
            @click="togglePlayPause"
          />

          <!-- Gradient Overlays -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

          <!-- Top Header inside Modal -->
          <div class="relative z-20 p-4 flex items-center justify-between text-white">
            <div class="flex items-center gap-2">
              <span
                v-if="activeModalVideo.is_live"
                class="bg-[#EF4444] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse"
              >
                <Radio class="w-3 h-3" />
                <span>SEDANG LIVE</span>
              </span>
              <span v-else class="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Video Feed
              </span>
            </div>

            <button
              type="button"
              class="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-md"
              title="Tutup"
              @click.stop="closeVideoModal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Center Play/Pause Indicator -->
          <div
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div class="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl">
              <Play class="w-8 h-8 fill-white text-white ml-1" />
            </div>
          </div>

          <!-- Side Interaction Column inside Modal -->
          <div class="absolute right-4 bottom-24 z-10 flex flex-col items-center gap-4">
            <!-- Creator Avatar -->
            <NuxtLink
              :to="`/seller/${activeModalVideo.id}`"
              class="w-11 h-11 rounded-full ring-2 ring-white overflow-hidden bg-gray-800 shadow-lg"
              @click="closeVideoModal"
            >
              <img
                :src="activeModalVideo.user_avatar"
                :alt="activeModalVideo.user_name"
                class="w-full h-full object-cover"
              />
            </NuxtLink>

            <!-- Like -->
            <button
              type="button"
              class="flex flex-col items-center text-white"
              @click="toggleLike(activeModalVideo)"
            >
              <Heart
                class="w-7 h-7"
                :class="likedMap[activeModalVideo.id] ? 'fill-red-500 text-red-500' : 'text-white'"
              />
              <span class="text-xs font-bold mt-1">
                {{ formatCompact((activeModalVideo.likes || 0) + (likedMap[activeModalVideo.id] ? 1 : 0)) }}
              </span>
            </button>

            <!-- Comment -->
            <div class="flex flex-col items-center text-white">
              <MessageCircle class="w-7 h-7 text-white" />
              <span class="text-xs font-bold mt-1">
                {{ formatCompact(activeModalVideo.comments || 0) }}
              </span>
            </div>

            <!-- Volume Mute/Unmute -->
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center"
              @click="toggleMute"
            >
              <VolumeX v-if="isMuted" class="w-5 h-5 text-white" />
              <Volume2 v-else class="w-5 h-5 text-white" />
            </button>
          </div>

          <!-- Bottom Description inside Modal -->
          <div class="relative z-10 p-4 pr-16 text-white space-y-1.5">
            <h4 class="font-outfit font-black text-base">
              @{{ activeModalVideo.user_name }}
            </h4>
            <p class="text-xs text-white/90 leading-relaxed">
              {{ activeModalVideo.content || activeModalVideo.title }}
            </p>
            <div class="flex items-center gap-2 pt-1 text-white/80 text-xs">
              <Music class="w-3.5 h-3.5" />
              <span class="truncate">{{ activeModalVideo.music || 'Original sound' }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Music,
  X,
  Volume2,
  VolumeX,
  Check,
} from 'lucide-vue-next'
import type { VideoFeedItem } from '~/composables/useLiveShopping'

interface Props {
  sessions?: VideoFeedItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sessions: () => [],
  loading: false,
})

const { liveSessions, fetchLiveSessions } = useLiveShopping()

// Feed video list: prioritize props or composable
const feedVideos = computed(() => {
  if (props.sessions && props.sessions.length > 0) {
    return props.sessions
  }
  return liveSessions.value
})

onMounted(async () => {
  if (feedVideos.value.length === 0) {
    await fetchLiveSessions()
  }
})

// Carousel Pagination Index
const currentIndex = ref(0)
const visibleCards = computed(() => {
  const list = feedVideos.value
  if (list.length === 0) return []
  return list.slice(currentIndex.value, currentIndex.value + 4)
})

function scrollPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value = Math.max(0, currentIndex.value - 1)
  }
}

function scrollNext() {
  const maxIdx = Math.max(0, feedVideos.value.length - 4)
  if (currentIndex.value < maxIdx) {
    currentIndex.value = Math.min(maxIdx, currentIndex.value + 1)
  }
}

// Like state map
const likedMap = reactive<Record<string, boolean>>({})

function toggleLike(item: VideoFeedItem) {
  likedMap[item.id] = !likedMap[item.id]
}

function shareVideo(item: VideoFeedItem) {
  if (navigator.share) {
    navigator.share({
      title: item.title || 'Video BekasKu',
      text: item.content || 'Lihat video ini di BekasKu!',
      url: window.location.href,
    }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(window.location.href)
  }
}

// Modal Video Player State
const activeModalVideo = ref<VideoFeedItem | null>(null)
const modalVideoPlayerRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(true)
const isMuted = ref(false)

function openVideoModal(item: VideoFeedItem) {
  activeModalVideo.value = item
  isPlaying.value = true
  isMuted.value = false
}

function closeVideoModal() {
  if (modalVideoPlayerRef.value) {
    modalVideoPlayerRef.value.pause()
  }
  activeModalVideo.value = null
}

function togglePlayPause() {
  if (!modalVideoPlayerRef.value) return
  if (modalVideoPlayerRef.value.paused) {
    modalVideoPlayerRef.value.play()
    isPlaying.value = true
  } else {
    modalVideoPlayerRef.value.pause()
    isPlaying.value = false
  }
}

function toggleMute() {
  if (!modalVideoPlayerRef.value) return
  isMuted.value = !isMuted.value
  modalVideoPlayerRef.value.muted = isMuted.value
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}
</script>

