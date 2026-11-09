<template>
  <div class="h-[100dvh] md:h-[calc(100vh-114px)] bg-[#0B0D10] flex flex-col justify-between overflow-hidden">
    <!-- Main Video Feed Viewport -->
    <main class="flex-1 min-h-0 flex items-center justify-center relative w-full pb-16 md:py-4 md:px-4">
      <!-- Desktop (Instagram-Style 2-Column) & Mobile Container -->
      <div
        class="relative w-full h-full md:max-w-4xl lg:max-w-5xl md:max-h-[680px] md:my-auto md:rounded-3xl overflow-hidden shadow-2xl bg-black flex flex-col md:flex-row border-0 md:border md:border-white/10"
      >
        <!-- ── LEFT COLUMN: VIDEO FEED STAGE ── -->
        <div class="relative flex-1 md:max-w-[520px] lg:max-w-[560px] h-full bg-black flex flex-col justify-between overflow-hidden">
          <!-- Top Bar Overlay (Sama seperti Mobile, overlay di atas video) -->
          <header class="absolute top-0 left-0 right-0 z-30 pt-3 px-4 flex items-center justify-between pointer-events-none">
            <!-- Left: + LIVE Pill Button -->
            <button
              type="button"
              class="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-primary hover:from-red-700 hover:to-red-600 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              title="Mulai Live di Aplikasi BekasKu"
              @click="showDownloadModal = true"
            >
              <Plus class="w-3.5 h-3.5 stroke-[3]" />
              <span class="tracking-wide">LIVE</span>
            </button>

            <!-- Center: Feed Tabs (Semua | Saya) -->
            <div class="pointer-events-auto flex items-center gap-4 text-sm font-bold text-white drop-shadow-md">
              <button
                type="button"
                class="relative py-1 cursor-pointer transition-colors"
                :class="selectedTab === 0 ? 'text-white' : 'text-white/60 hover:text-white/90'"
                @click="changeTab(0)"
              >
                Semua
                <span
                  v-if="selectedTab === 0"
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full shadow-xs"
                />
              </button>

              <button
                type="button"
                class="relative py-1 cursor-pointer transition-colors"
                :class="selectedTab === 1 ? 'text-white' : 'text-white/60 hover:text-white/90'"
                @click="changeTab(1)"
              >
                Saya
                <span
                  v-if="selectedTab === 1"
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full shadow-xs"
                />
              </button>
            </div>

            <!-- Right: Post Video Pill Button -->
            <button
              type="button"
              class="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              title="Posting Video Jualan"
              @click="handlePostVideoClick"
            >
              <Video class="w-3.5 h-3.5 text-primary" />
              <span class="text-[11px] sm:text-xs">Post Video</span>
            </button>
          </header>

          <!-- Video Snap Scroller -->
          <div
            ref="feedScrollerRef"
            class="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
            @scroll="handleScroll"
          >
            <!-- Loading State -->
            <div v-if="loading && videos.length === 0" class="w-full h-full flex flex-col items-center justify-center text-white/70">
              <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p class="text-xs font-medium">Memuat video feed...</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="videos.length === 0"
              class="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white"
            >
              <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50 mb-4">
                <Video class="w-8 h-8" />
              </div>
              <h3 class="font-outfit font-bold text-lg text-white mb-1">
                {{ selectedTab === 1 ? 'Belum Ada Video Anda' : 'Belum Ada Video' }}
              </h3>
              <p class="text-xs text-white/70 max-w-xs mb-6">
                {{ selectedTab === 1 ? 'Anda belum pernah memposting video singkat untuk jualan Anda.' : 'Jadilah yang pertama mengunggah video preloved atau showcase barang jualan Anda!' }}
              </p>
              <button
                type="button"
                class="px-6 py-2.5 rounded-full bg-primary hover:bg-red-700 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                @click="handlePostVideoClick"
              >
                Unggah Video Sekarang
              </button>
            </div>

            <!-- Video Items List -->
            <template v-else>
              <div
                v-for="(item, idx) in videos"
                :key="item._id || item.id"
                class="w-full h-full snap-start snap-always relative shrink-0"
              >
                <VideoCard
                  :item="item"
                  :is-active="currentActiveIndex === idx"
                  @like="handleLike"
                  @comment="handleOpenComments"
                  @share="handleShare"
                  @delete="handleDelete"
                />
              </div>
            </template>
          </div>

          <!-- Desktop Navigation Floating Buttons (Up/Down) -->
          <div class="hidden md:flex flex-col gap-2 absolute left-4 bottom-6 z-30">
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-90"
              :disabled="currentActiveIndex <= 0"
              title="Video sebelumnya"
              @click="scrollPrevVideo"
            >
              <ChevronUp class="w-5 h-5" />
            </button>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-90"
              :disabled="currentActiveIndex >= videos.length - 1"
              title="Video selanjutnya"
              @click="scrollNextVideo"
            >
              <ChevronDown class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- ── RIGHT COLUMN: INSTAGRAM-STYLE COMMENTS & DETAILS SIDEBAR (Desktop) ── -->
        <div
          v-if="currentVideo"
          class="hidden md:flex w-[380px] lg:w-[420px] h-full bg-white flex-col justify-between text-gray-900 border-l border-border shrink-0 select-text overflow-hidden"
        >
          <!-- 1. Creator Profile Header -->
          <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <NuxtLink
                :to="`/seller/${currentVideo.user_id}`"
                class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 bg-gray-100 shrink-0 block"
              >
                <img
                  v-if="currentVideoAvatar && !desktopCreatorAvatarErr"
                  :src="currentVideoAvatar"
                  :alt="currentVideo.user_name"
                  class="w-full h-full object-cover"
                  @error="desktopCreatorAvatarErr = true"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200 select-none">
                  {{ (currentVideo.user_name || 'U').charAt(0).toUpperCase() }}
                </div>
              </NuxtLink>

              <div class="min-w-0">
                <NuxtLink
                  :to="`/seller/${currentVideo.user_id}`"
                  class="text-xs sm:text-sm font-bold text-gray-900 hover:text-primary transition-colors truncate block"
                >
                  @{{ currentVideo.user_name }}
                </NuxtLink>
                <p class="text-[10px] text-gray-400 font-medium">Seller Resmi BekasKu</p>
              </div>
            </div>

            <NuxtLink
              :to="`/seller/${currentVideo.user_id}`"
              class="text-xs font-bold text-primary hover:text-red-700 bg-red-50/70 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer shrink-0"
            >
              Kunjungi Toko
            </NuxtLink>
          </div>

          <!-- 2. Body: Caption + Pinned Product + Comments List (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Caption Block -->
            <div class="text-xs text-gray-800 leading-relaxed">
              <span class="font-bold text-gray-900 mr-1.5">@{{ currentVideo.user_name }}</span>
              <span>{{ currentVideo.content || currentVideo.title }}</span>
            </div>

            <!-- Pinned Product Chip (if attached) -->
            <NuxtLink
              v-if="currentVideo.product || currentVideo.product_id"
              :to="`/product/${currentVideo.product?._id || currentVideo.product_id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 hover:bg-red-50/50 border border-gray-200 transition-colors"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                <img
                  v-if="sanitizeMediaUrl(currentVideo.product?.image || currentVideo.thumbnail, '')"
                  :src="sanitizeMediaUrl(currentVideo.product?.image || currentVideo.thumbnail, '')"
                  :alt="currentVideo.product?.title || 'Produk Terkait'"
                  class="w-full h-full object-cover"
                />
                <ShoppingBag v-else class="w-4 h-4 text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-gray-900 truncate">{{ currentVideo.product?.title || 'Produk Terkait' }}</p>
                <p class="text-[11px] font-black text-primary">Rp {{ formatRupiah(currentVideo.product?.price || 0) }}</p>
              </div>
              <span class="text-[10px] font-bold text-white bg-primary px-2.5 py-1 rounded-md shrink-0">
                Beli
              </span>
            </NuxtLink>

            <!-- Audio sound track -->
            <div class="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Music class="w-3 h-3 text-gray-400 shrink-0" />
              <span class="truncate">{{ currentVideo.music || 'Original video sound' }}</span>
            </div>

            <!-- Divider & Comments Header -->
            <div class="border-t border-gray-100 pt-3">
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-xs font-bold text-gray-800">
                  Komentar ({{ desktopCommentsTotal }})
                </h5>
              </div>

              <!-- Loading Indicator -->
              <div v-if="desktopCommentsLoading" class="flex justify-center py-8">
                <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>

              <!-- Empty State -->
              <div v-else-if="desktopComments.length === 0" class="text-center py-10 text-gray-400 space-y-1">
                <MessageSquare class="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
                <p class="text-xs font-medium text-gray-500">Belum ada komentar</p>
                <p class="text-[11px] text-gray-400">Jadilah yang pertama menuliskan komentar!</p>
              </div>

              <!-- Real Comments List -->
              <div v-else class="space-y-3.5">
                <div
                  v-for="c in desktopComments"
                  :key="c._id"
                  class="flex items-start gap-2.5 text-xs"
                >
                  <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200">
                    <img
                      v-if="c.user_avatar && sanitizeMediaUrl(c.user_avatar, '')"
                      :src="sanitizeMediaUrl(c.user_avatar, '')"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-500 bg-gray-200 select-none">
                      {{ c.user_name.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-gray-900">{{ c.user_name }}</span>
                      <span class="text-[10px] text-gray-400">{{ c.time || 'Baru saja' }}</span>
                    </div>
                    <p class="text-gray-700 mt-0.5 break-words leading-relaxed">{{ c.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Footer: Action Counters & Sticky Comment Input Bar -->
          <div class="p-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
            <!-- Action Icons Row -->
            <div class="flex items-center justify-between text-gray-700">
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  class="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer"
                  @click="handleLike(currentVideo)"
                >
                  <Heart
                    class="w-5 h-5 transition-transform active:scale-125"
                    :class="currentVideo.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'"
                  />
                  <span class="text-xs font-bold">
                    {{ formatCompact(currentVideo.total_like || currentVideo.likes || 0) }}
                  </span>
                </button>

                <button
                  type="button"
                  class="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                  @click="focusDesktopCommentInput"
                >
                  <MessageCircle class="w-5 h-5 text-gray-700" />
                  <span class="text-xs font-bold">{{ desktopCommentsTotal }}</span>
                </button>

                <button
                  type="button"
                  class="hover:text-amber-500 transition-colors cursor-pointer"
                  title="Bagikan Video"
                  @click="handleShare(currentVideo)"
                >
                  <Share2 class="w-4 h-4 text-gray-700" />
                </button>
              </div>

              <!-- Delete if owner -->
              <button
                v-if="authStore.isLoggedIn && authStore.userId === currentVideo.user_id"
                type="button"
                class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Hapus Video Saya"
                @click="handleDelete(currentVideo)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Sticky Comment Input Form -->
            <form class="flex items-center gap-2" @submit.prevent="submitDesktopComment">
              <input
                ref="desktopCommentInputRef"
                v-model="desktopCommentInput"
                type="text"
                placeholder="Tulis komentar..."
                maxlength="500"
                class="flex-1 px-3.5 py-2 text-xs bg-gray-100 rounded-full border border-transparent focus:border-primary focus:bg-white focus:outline-hidden transition-all text-gray-900 placeholder:text-gray-400"
                :disabled="isSubmittingDesktopComment"
              />
              <button
                type="submit"
                class="w-8 h-8 rounded-full bg-primary hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                :disabled="!desktopCommentInput.trim() || isSubmittingDesktopComment"
              >
                <Send class="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- App Bottom Nav for Mobile -->
    <AppBottomNav />

    <!-- Modals & Drawers -->
    <AppDownloadModal v-model="showDownloadModal" />

    <AppConfirmModal
      v-model="showDeleteConfirmModal"
      title="Hapus Video"
      description="Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan."
      confirm-label="Ya, Hapus"
      :is-danger="true"
      :loading="isDeleting"
      @confirm="confirmDeleteVideo"
    />

    <VideoCommentDrawer
      v-model="showCommentDrawer"
      :video-id="activeCommentVideoId"
      :initial-count="activeCommentCount"
      @count-updated="onCommentCountUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  Plus,
  Video,
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Music,
  Send,
  MessageSquare,
  ShoppingBag,
} from 'lucide-vue-next'
import { useVideoFeed } from '~/composables/useVideoFeed'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useNotification } from '~/composables/useNotification'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'
import type { VideoFeedItem, VideoCommentItem } from '~/types/video'
import VideoCard from '~/components/video/VideoCard.vue'
import VideoCommentDrawer from '~/components/video/VideoCommentDrawer.vue'
import AppDownloadModal from '~/components/shared/AppDownloadModal.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'

useHead({
  title: 'Video Feed & Live Shopping — BekasKu',
  link: [{ rel: 'canonical', href: 'https://bekasku.id/showcase/video' }],
  meta: [
    {
      name: 'description',
      content: 'Tonton video showcase barang preloved, review barang bekas berkualitas, dan keseruan Live Shopping di BekasKu.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Video Feed & Live Shopping — BekasKu' },
    { property: 'og:description', content: 'Tonton video showcase dan Live Shopping di BekasKu.' },
  ],
})

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()
const { showNotification } = useNotification()
const {
  videos,
  loading,
  selectedTab,
  hasNextPage,
  fetchVideos,
  toggleLike,
  deleteVideo,
  fetchComments,
  postComment,
} = useVideoFeed()

const feedScrollerRef = ref<HTMLDivElement | null>(null)
const desktopCommentInputRef = ref<HTMLInputElement | null>(null)
const currentActiveIndex = ref(0)
const showDownloadModal = ref(false)
const showCommentDrawer = ref(false)
const activeCommentVideoId = ref('')
const activeCommentCount = ref(0)

// Delete Confirm Modal State
const showDeleteConfirmModal = ref(false)
const pendingDeleteItem = ref<VideoFeedItem | null>(null)
const isDeleting = ref(false)

// Desktop Comments Panel State
const desktopCreatorAvatarErr = ref(false)
const desktopComments = ref<VideoCommentItem[]>([])
const desktopCommentsLoading = ref(false)
const desktopCommentsTotal = ref(0)
const desktopCommentInput = ref('')
const isSubmittingDesktopComment = ref(false)

const currentVideo = computed<VideoFeedItem | null>(() => {
  return videos.value[currentActiveIndex.value] || null
})

const currentVideoAvatar = computed(() => {
  return currentVideo.value ? sanitizeMediaUrl(currentVideo.value.user_avatar, '') : ''
})

watch(
  () => currentVideo.value?._id || currentVideo.value?.id,
  (newId) => {
    desktopCreatorAvatarErr.value = false
    if (newId) {
      loadDesktopComments(newId)
    } else {
      desktopComments.value = []
      desktopCommentsTotal.value = 0
    }
  }
)

function handleKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    scrollPrevVideo()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    scrollNextVideo()
  }
}

onMounted(async () => {
  authStore.initFromStorage()
  window.addEventListener('keydown', handleKeyDown)
  await fetchVideos({ refresh: true })
  const targetId = String(route.query.id || '')
  if (targetId && videos.value.length > 0) {
    const idx = videos.value.findIndex((v) => v._id === targetId || v.id === targetId)
    if (idx > 0) {
      currentActiveIndex.value = idx
      await nextTick()
      if (feedScrollerRef.value) {
        feedScrollerRef.value.scrollTop = idx * feedScrollerRef.value.clientHeight
      }
    }
  }
  if (currentVideo.value) {
    loadDesktopComments(currentVideo.value._id || currentVideo.value.id)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

async function loadDesktopComments(videoId: string) {
  desktopCommentsLoading.value = true
  try {
    const res = await fetchComments(videoId, 1)
    desktopComments.value = res.comments
    desktopCommentsTotal.value = res.total
  } catch {
    desktopComments.value = []
    desktopCommentsTotal.value = 0
  } finally {
    desktopCommentsLoading.value = false
  }
}

function focusDesktopCommentInput() {
  desktopCommentInputRef.value?.focus()
}

async function submitDesktopComment() {
  const text = desktopCommentInput.value.trim()
  if (!text || isSubmittingDesktopComment.value || !currentVideo.value) return

  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Kirim Komentar Video',
      redirectPath: '/showcase/video',
    })
    return
  }

  isSubmittingDesktopComment.value = true
  try {
    const videoId = currentVideo.value._id || currentVideo.value.id
    const created = await postComment(videoId, text)
    desktopComments.value.unshift(created)
    desktopCommentsTotal.value += 1
    if (currentVideo.value.total_comment !== undefined) {
      currentVideo.value.total_comment += 1
    }
    desktopCommentInput.value = ''
  } catch (err: any) {
    showNotification({
      type: 'error',
      message: err?.message || 'Gagal mengirim komentar.',
    })
  } finally {
    isSubmittingDesktopComment.value = false
  }
}

function changeTab(tabIndex: number) {
  if (tabIndex === 1 && !authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Postingan Video Saya',
      redirectPath: '/showcase/video',
    })
    return
  }
  selectedTab.value = tabIndex
  currentActiveIndex.value = 0
  fetchVideos({ refresh: true })
}

function handlePostVideoClick() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Posting Video Baru',
      redirectPath: '/showcase/video/post',
    })
    return
  }
  navigateTo('/showcase/video/post')
}

function handleScroll() {
  if (!feedScrollerRef.value) return
  const el = feedScrollerRef.value
  const itemHeight = el.clientHeight
  if (itemHeight <= 0) return

  const newIdx = Math.round(el.scrollTop / itemHeight)
  if (newIdx !== currentActiveIndex.value) {
    currentActiveIndex.value = newIdx
  }

  // Infinite load check
  if (el.scrollTop + itemHeight >= el.scrollHeight - 100) {
    if (!loading.value && hasNextPage.value) {
      fetchVideos()
    }
  }
}

function scrollPrevVideo() {
  if (currentActiveIndex.value > 0 && feedScrollerRef.value) {
    const itemHeight = feedScrollerRef.value.clientHeight
    feedScrollerRef.value.scrollTo({
      top: (currentActiveIndex.value - 1) * itemHeight,
      behavior: 'smooth',
    })
  }
}

function scrollNextVideo() {
  if (currentActiveIndex.value < videos.value.length - 1 && feedScrollerRef.value) {
    const itemHeight = feedScrollerRef.value.clientHeight
    feedScrollerRef.value.scrollTo({
      top: (currentActiveIndex.value + 1) * itemHeight,
      behavior: 'smooth',
    })
  }
}

async function handleLike(item: VideoFeedItem) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Menyukai Video',
      redirectPath: '/showcase/video',
    })
    return
  }
  await toggleLike(item)
}

function handleOpenComments(item: VideoFeedItem) {
  // On desktop, focus the sidebar comment input
  if (window.innerWidth >= 768) {
    focusDesktopCommentInput()
    return
  }
  // On mobile, open comment drawer
  activeCommentVideoId.value = item._id || item.id
  activeCommentCount.value = item.total_comment || item.comments || 0
  showCommentDrawer.value = true
}

function onCommentCountUpdated(newCount: number) {
  const current = videos.value[currentActiveIndex.value]
  if (current) {
    current.total_comment = newCount
    current.comments = newCount
  }
  desktopCommentsTotal.value = newCount
}

function handleShare(item: VideoFeedItem) {
  const videoId = encodeURIComponent(item._id || item.id)
  const shareUrl = `${window.location.origin}/showcase/video?id=${videoId}`
  if (navigator.share) {
    navigator.share({
      title: item.title || 'Video BekasKu',
      text: item.content || 'Lihat video ini di BekasKu!',
      url: shareUrl,
    }).catch(() => {})
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification({
        type: 'success',
        message: 'Tautan video berhasil disalin.',
      })
    }).catch(() => {})
  }
}

function handleDelete(item: VideoFeedItem) {
  pendingDeleteItem.value = item
  showDeleteConfirmModal.value = true
}

async function confirmDeleteVideo() {
  if (!pendingDeleteItem.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await deleteVideo(pendingDeleteItem.value)
    showNotification({
      type: 'success',
      message: 'Video berhasil dihapus.',
    })
    showDeleteConfirmModal.value = false
    pendingDeleteItem.value = null
  } catch (err: any) {
    showNotification({
      type: 'error',
      message: err?.message || 'Gagal menghapus video.',
    })
  } finally {
    isDeleting.value = false
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
