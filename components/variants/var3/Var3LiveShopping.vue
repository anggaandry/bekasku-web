<template>
  <div class="w-full bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
    <!-- Header: Editorial Style -->
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
      <div>
        <h3 class="font-outfit font-black text-gray-900 text-sm sm:text-base tracking-tight uppercase">
          CREATOR LIVE &amp; VIDEO SHOWCASE
        </h3>
        <p class="text-[11px] text-gray-500 hidden sm:block">
          Kurasi video ulasan mendalam &amp; siaran interaktif dari komunitas seller terpercaya
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          @click="scrollTrack('left')"
          aria-label="Scroll Kiri"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          class="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          @click="scrollTrack('right')"
          aria-label="Scroll Kanan"
        >
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Scroll Track (Editorial Creator Showcase Style using Real API Video Sessions) -->
    <div
      ref="scrollRef"
      class="flex gap-3 overflow-x-auto scrollbar-none scroll-smooth pt-3.5 pb-1 select-none"
    >
      <template v-if="loading">
        <div
          v-for="n in 4"
          :key="n"
          class="w-[170px] sm:w-[185px] aspect-[9/13.5] shrink-0 rounded-2xl bg-gray-200 animate-shimmer"
        />
      </template>

      <template v-else>
        <div
          v-for="card in displayCards"
          :key="card.id"
          class="group relative w-[170px] sm:w-[185px] aspect-[9/13.5] shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 bg-neutral-900"
          @click="handleCardClick(card)"
        >
          <!-- Stream Background Thumbnail -->
          <img
            :src="card.thumbnail || card.user_avatar"
            :alt="card.title || card.user_name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

          <!-- Top Section: Creator Avatar + Live Ring -->
          <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div class="flex items-center gap-1.5">
              <div class="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-[#2563EB] to-[#EBAD25] shrink-0">
                <img :src="card.user_avatar || card.thumbnail" :alt="card.user_name" class="w-full h-full object-cover rounded-full bg-white" />
              </div>
              <span class="text-[11px] font-bold text-white truncate max-w-[85px] drop-shadow-xs">
                @{{ card.user_name }}
              </span>
            </div>

            <!-- Status Pill -->
            <span
              v-if="card.is_live"
              class="text-[9px] font-bold text-white bg-[#E31B23] px-2 py-0.5 rounded-full uppercase"
            >
              LIVE
            </span>
            <span
              v-else
              class="text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10 uppercase"
            >
              VIDEO
            </span>
          </div>

          <!-- Bottom: Clean Editorial Title & Live State -->
          <div class="absolute bottom-2.5 left-2.5 right-2.5 text-white space-y-1 z-10">
            <div class="flex items-center gap-1 text-[10px] text-gray-300">
              <span class="w-1.5 h-1.5 rounded-full" :class="card.is_live ? 'bg-[#E31B23] animate-ping' : 'bg-[#16A34A]'" />
              <span>{{ card.city || 'Indonesia' }}</span>
              <span>•</span>
              <span>{{ card.is_live ? `${card.viewers || 180} penonton` : `${card.likes || 120} suka` }}</span>
            </div>
            <h4 class="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-xs group-hover:text-blue-300 transition-colors">
              {{ card.title || card.content }}
            </h4>
          </div>
        </div>
      </template>
    </div>

    <!-- Video Modal for Video Playback -->
    <div
      v-if="selectedVideo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      @click.self="selectedVideo = null"
    >
      <div class="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between">
        <button
          type="button"
          class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          @click="selectedVideo = null"
        >
          <X class="w-4 h-4" />
        </button>

        <video
          :src="selectedVideo.video_url"
          controls
          autoplay
          playsinline
          class="w-full h-full object-cover"
        />

        <div class="absolute bottom-4 left-4 right-4 z-10 text-white pointer-events-none space-y-1">
          <div class="flex items-center gap-2">
            <img :src="selectedVideo.user_avatar || selectedVideo.thumbnail" :alt="selectedVideo.user_name" class="w-8 h-8 rounded-full border border-white/60 object-cover" />
            <div>
              <p class="font-bold text-xs">@{{ selectedVideo.user_name }}</p>
              <p class="text-[10px] text-gray-300">{{ selectedVideo.city || 'Indonesia' }}</p>
            </div>
          </div>
          <p class="text-xs text-gray-100 line-clamp-2">{{ selectedVideo.title || selectedVideo.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import type { VideoFeedItem } from '~/composables/useLiveShopping'

interface Props {
  sessions?: VideoFeedItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sessions: () => [],
  loading: false,
})

const scrollRef = ref<HTMLElement | null>(null)
const selectedVideo = ref<VideoFeedItem | null>(null)

// Fallback verified MongoDB items if props.sessions is not yet loaded
const fallbackDataset: VideoFeedItem[] = [
  {
    id: 'live_session_sulistya',
    title: 'Sesi Jualan Live: Spill Baju & Blazer Preloved',
    content: 'Halo teman-teman! Masuk live sekarang buat dapetin potongan harga spesial blazer dan sweater impor no minus!',
    video_url: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/videos-mobile%2Fvideo_260209_1651_44.mp4?alt=media&token=d1f4d9b4-3a25-419d-bd7d-7871b6194b15',
    thumbnail: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-177063202004391142.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=B4VSWQMvotI63xnGVMUJMeVHMgI53ZyrZh3BWOjZOXJFCl%2FTFyt3qhrCvGru%2BLpuJU9Xqp4MSMMP9pNJBcK%2BCVrknTegjwtuGK1S%2Bl%2Fx%2FMfDp7Se5JvQnQQl%2FO8UA9XEyrfIqLQUDZgdBQY29O6aqqEalEO0cgcZh4E0inaCH41be5ZNtvJhsv%2B7AY9lI2VGpUxoN2NpnM9mpDHDB7%2BOQRQlBp8TJJhi0pUxUGgEWQmu9dibtK6AQ2c5m8mixIfDt55VJgk858fbrBHyzVNgcNkfDG6ZPS5mcSqALoXtQMQEN4ofDmiIuDE5lUZvOju3rjIq4k%2F4tDI9H6FOso5PZA%3D%3D',
    user_name: 'Leo_preloved',
    user_avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-177063202004391142.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=B4VSWQMvotI63xnGVMUJMeVHMgI53ZyrZh3BWOjZOXJFCl%2FTFyt3qhrCvGru%2BLpuJU9Xqp4MSMMP9pNJBcK%2BCVrknTegjwtuGK1S%2Bl%2Fx%2FMfDp7Se5JvQnQQl%2FO8UA9XEyrfIqLQUDZgdBQY29O6aqqEalEO0cgcZh4E0inaCH41be5ZNtvJhsv%2B7AY9lI2VGpUxoN2NpnM9mpDHDB7%2BOQRQlBp8TJJhi0pUxUGgEWQmu9dibtK6AQ2c5m8mixIfDt55VJgk858fbrBHyzVNgcNkfDG6ZPS5mcSqALoXtQMQEN4ofDmiIuDE5lUZvOju3rjIq4k%2F4tDI9H6FOso5PZA%3D%3D',
    city: 'Jakarta Selatan',
    viewers: 184,
    likes: 850,
    comments: 64,
    is_live: true,
  },
  {
    id: '6989ae3936cb8e1d858bd54d',
    title: 'Preloved Vest Putih Tebal',
    content: 'Preloved vest putih, masih seperti baru bahan tebal harga di Rp 85.000 saja mulus banget!',
    video_url: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/videos-mobile%2Fvideo_260209_1651_44.mp4?alt=media&token=d1f4d9b4-3a25-419d-bd7d-7871b6194b15',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/thumbnail-mobile%2Fthumbnail_260209_1651_4.jpeg?alt=media&token=9165652e-40e9-4b3d-9b84-b39b07f8cf39',
    user_name: 'Leo_preloved',
    user_avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-177063202004391142.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=B4VSWQMvotI63xnGVMUJMeVHMgI53ZyrZh3BWOjZOXJFCl%2FTFyt3qhrCvGru%2BLpuJU9Xqp4MSMMP9pNJBcK%2BCVrknTegjwtuGK1S%2Bl%2Fx%2FMfDp7Se5JvQnQQl%2FO8UA9XEyrfIqLQUDZgdBQY29O6aqqEalEO0cgcZh4E0inaCH41be5ZNtvJhsv%2B7AY9lI2VGpUxoN2NpnM9mpDHDB7%2BOQRQlBp8TJJhi0pUxUGgEWQmu9dibtK6AQ2c5m8mixIfDt55VJgk858fbrBHyzVNgcNkfDG6ZPS5mcSqALoXtQMQEN4ofDmiIuDE5lUZvOju3rjIq4k%2F4tDI9H6FOso5PZA%3D%3D',
    city: 'Jakarta Selatan',
    likes: 165,
    comments: 21,
    is_live: false,
  },
  {
    id: '6a5d838539154a0d2be704c8',
    title: 'Senapan Angin Paser Ikan Full Set',
    content: 'Senapan angin paser ikan full set siap pakai no minus.',
    video_url: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/videos-mobile%2Fvideo_260720_0910_49.mp4?alt=media&token=d961a09a-c4a3-49d9-8630-35e61eda6a41',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/thumbnail-mobile%2Fthumbnail_260720_0910_25.jpeg?alt=media&token=ecc6c6b5-9e57-459f-90a6-7df52cb3dbc4',
    user_name: 'sengin sport',
    user_avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-178379401493712208.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=G3xRSbO7Uk%2FN85pthKtdDX4G4RWQR1q%2FIhp7nl6H3bLa%2BT60DddGCNsaHwzI3tGil4lm9FsvBPKZFcJBdEy2T0uH17I6p2TtjFIGOYppWC5Ake6TYU3FV9c1yt67OtU3W65mIV9%2FptQg3a2pk7fVsLxXjiepdYgEeVikRSJzw7wL%2FfoDTENPVgzai6BmzF7wyNg5Xg5Jt9grK%2BUoBuAlzAInEKGNZ%2FsBBmRKu0qMLlESQQyp9ORQp7DFD8TBTDikw1dJ0mQsn5CQ71abakBnXqDi9z8LK96GgKCFCxw%2BiW0tqSyrIZ3RPy0x9Zr%2Bv%2BukY52wsAzq02M3tVYo66IKrw%3D%3D',
    city: 'Indonesia',
    likes: 95,
    comments: 14,
    is_live: false,
  },
  {
    id: '691aef7644635d9b4a5295d5',
    title: 'Jaket Turing Keren No Minus',
    content: 'Jaket turing.msh bagus.no minus 150.000 saja',
    video_url: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/videos-mobile%2Fvideo_251117_1648_26.mp4?alt=media&token=b4ba2cbe-4602-4676-9c46-988f8d4dde41',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/thumbnail-mobile%2Fthumbnail_251117_1648_7.jpeg?alt=media&token=03668993-73c6-44fe-870b-f13c6fe231cb',
    user_name: 'pedagang kaki lima',
    user_avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-176337226905063986.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=ZO5OnfobE1CZovDymubn2cLCg76%2BxD3Tfk1BSE%2F%2BJRrPnwCD8oXptRHSZlh5Vc1rlD2UQMOBgNmA1UnHxk8an4ogMRnVxBjSSzsATtR70bBM9FhnZubFEW95gIGyDsFweDMd8%2Fkgg2RHjt%2FeXxhl%2BshsPdsuwXPiMhVI11Lc0KBi%2B3NpjIynwU8tkvZYP0jZXcw%2FtL2yA6TXVr8dg0N0N1%2BUmuuyBwb%2Fpb3g%2Bnx2HGErQscSB9g7SfVX07F3mUiRrXD94EEGU7It8I9svM6peAUVCrRr1ZJZxEsl9IEh9ZggH%2FXhKjePaHishM1zy0EWhIYjDvJGtF6V5NVCdMHgDQ%3D%3D',
    city: 'Bandung',
    likes: 255,
    comments: 35,
    is_live: false,
  },
]

const displayCards = computed<VideoFeedItem[]>(() => {
  if (props.sessions && props.sessions.length > 0) {
    return props.sessions
  }
  return fallbackDataset
})

function scrollTrack(direction: 'left' | 'right') {
  if (!scrollRef.value) return
  const distance = 300
  scrollRef.value.scrollBy({
    left: direction === 'left' ? -distance : distance,
    behavior: 'smooth',
  })
}

function handleCardClick(card: VideoFeedItem) {
  selectedVideo.value = card
}
</script>
