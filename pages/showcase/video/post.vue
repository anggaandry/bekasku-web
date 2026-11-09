<template>
  <div class="h-[100dvh] md:h-[calc(100vh-114px)] bg-[#0B0D10] flex items-center justify-center p-0 md:p-4 overflow-hidden">
    <!-- Smartphone Frame Container -->
    <div
      class="relative w-full h-full md:max-w-[430px] md:max-h-[680px] bg-black md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border-0 md:border md:border-white/10 select-none"
    >
      <!-- ── 1. BACKGROUND VIDEO PREVIEW OR EMPTY PLACEHOLDER ── -->
      <div class="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
        <!-- Video Preview if loaded -->
        <video
          v-if="videoFileObjectUrl"
          ref="previewVideoRef"
          :src="videoFileObjectUrl"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
        />

        <!-- Empty Placeholder Matching Screenshot -->
        <div v-else class="flex flex-col items-center justify-center p-6 pb-56 text-center">
          <div class="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-6">
            <Video class="w-10 h-10" />
          </div>

          <button
            type="button"
            class="px-8 py-3 rounded-full bg-primary hover:bg-red-700 text-white font-bold text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
            @click="triggerVideoInput"
          >
            Pilih Video
          </button>
        </div>
      </div>

      <!-- ── 2. GRADIENT OVERLAYS ── -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      <!-- ── 3. TOP NAVIGATION ── -->
      <header class="relative z-20 pt-4 px-4 flex items-center justify-between">
        <button
          type="button"
          class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
          @click="handleBack"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
      </header>

      <!-- ── 4. RIGHT ACTIONS SIDEBAR (Ganti, Produk) ── -->
      <aside class="absolute right-4 top-20 z-20 flex flex-col items-center gap-6">
        <!-- Ganti Video Button -->
        <button
          type="button"
          class="flex flex-col items-center gap-1.5 text-white group cursor-pointer"
          title="Ganti Video"
          @click="triggerVideoInput"
        >
          <div class="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-black/70 group-hover:scale-105 transition-all shadow-lg">
            <Video class="w-5 h-5 text-white" />
          </div>
          <span class="text-xs font-semibold text-white drop-shadow-md">Ganti</span>
        </button>

        <!-- Sematkan Produk Button -->
        <button
          type="button"
          class="flex flex-col items-center gap-1.5 text-white group cursor-pointer"
          title="Sematkan Produk Jualan"
          @click="showProductModal = true"
        >
          <div
            class="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center group-hover:scale-105 transition-all shadow-lg"
            :class="selectedProduct ? 'bg-primary text-white border-2 border-white' : 'bg-black/50 border border-white/20 text-white group-hover:bg-black/70'"
          >
            <Package class="w-5 h-5" />
          </div>
          <span class="text-xs font-semibold text-white drop-shadow-md">Produk</span>
        </button>
      </aside>

      <!-- ── 5. BOTTOM FORM AREA (Caption Input + Selected Product Chip + Posting CTA) ── -->
      <footer class="relative z-20 p-4 sm:p-5 pb-6 sm:pb-6 flex flex-col gap-3">
        <!-- Attached Product Chip (if selected) -->
        <div
          v-if="selectedProduct"
          class="flex items-center gap-2.5 p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white max-w-sm"
        >
          <div class="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 shrink-0">
            <img
              :src="sanitizeMediaUrl(selectedProduct.image, '')"
              :alt="selectedProduct.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold truncate">{{ selectedProduct.title }}</p>
            <p class="text-[11px] font-bold text-amber-300">
              Rp {{ formatRupiah(selectedProduct.price) }}
            </p>
          </div>
          <button
            type="button"
            class="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            @click="selectedProduct = null"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Caption Input Box -->
        <div class="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3.5 focus-within:border-primary/60 transition-colors">
          <textarea
            v-model="caption"
            rows="3"
            placeholder="Tulis caption untuk videomu..."
            maxlength="300"
            class="w-full bg-transparent text-white placeholder:text-white/50 text-xs sm:text-sm resize-none focus:outline-hidden"
          />
          <div class="text-[10px] text-white/50 text-right mt-1">
            {{ caption.length }}/300
          </div>
        </div>

        <!-- Posting CTA Button -->
        <button
          type="button"
          class="w-full py-3.5 rounded-2xl bg-primary hover:bg-red-700 text-white font-bold text-base shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          :disabled="!selectedVideoFile || isPosting"
          @click="handlePostSubmit"
        >
          <div v-if="isPosting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span v-else>Posting</span>
        </button>
      </footer>

      <!-- ── 6. UPLOAD PROGRESS OVERLAY ── -->
      <div
        v-if="isPosting"
        class="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
      >
        <div class="relative w-20 h-20 mb-4 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              class="text-white/20"
              stroke-width="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="text-primary transition-all duration-300"
              stroke-dasharray="100, 100"
              :stroke-dashoffset="100 - uploadProgress"
              stroke-width="3"
              stroke-linecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="absolute text-sm font-black text-white font-outfit">
            {{ Math.round(uploadProgress) }}%
          </span>
        </div>
        <h4 class="font-outfit font-bold text-white text-base mb-1">
          Mengunggah Video...
        </h4>
        <p class="text-xs text-white/60">
          Mohon jangan tutup halaman ini hingga proses selesai.
        </p>
      </div>

      <!-- Hidden Native Video File Input -->
      <input
        ref="videoFileInputRef"
        type="file"
        accept="video/*"
        class="hidden"
        @change="onVideoFileSelected"
      />

      <!-- Hidden Canvas for Thumbnail Extraction -->
      <canvas ref="thumbnailCanvasRef" class="hidden" />

      <!-- Product Picker Modal -->
      <VideoChooseProductModal
        v-model="showProductModal"
        @select="onProductSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeft, Video, Package, X } from 'lucide-vue-next'
import { useFirebase } from '~/composables/useFirebase'
import { useVideoFeed } from '~/composables/useVideoFeed'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useNotification } from '~/composables/useNotification'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'
import VideoChooseProductModal from '~/components/video/VideoChooseProductModal.vue'

useHead({
  title: 'Posting Video — BekasKu',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const authModal = useAuthModal()
const { showNotification } = useNotification()
const { uploadFileToStorage } = useFirebase()
const { postVideo } = useVideoFeed()

const videoFileInputRef = ref<HTMLInputElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const thumbnailCanvasRef = ref<HTMLCanvasElement | null>(null)

const selectedVideoFile = ref<File | null>(null)
const videoFileObjectUrl = ref<string | null>(null)
const caption = ref('')
const selectedProduct = ref<{
  _id: string
  title: string
  price: number
  image?: string
} | null>(null)

const showProductModal = ref(false)
const isPosting = ref(false)
const uploadProgress = ref(0)

onMounted(() => {
  authStore.initFromStorage()
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Posting Video Baru',
      redirectPath: '/showcase/video/post',
    })
  }
})

onBeforeUnmount(() => {
  if (videoFileObjectUrl.value) {
    URL.revokeObjectURL(videoFileObjectUrl.value)
    videoFileObjectUrl.value = null
  }
})

function handleBack() {
  navigateTo('/showcase/video')
}

function triggerVideoInput() {
  videoFileInputRef.value?.click()
}

function onVideoFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Max 100MB
  if (file.size > 100 * 1024 * 1024) {
    showNotification({
      type: 'warning',
      message: 'Ukuran video maksimal 100MB.',
    })
    return
  }

  selectedVideoFile.value = file
  if (videoFileObjectUrl.value) {
    URL.revokeObjectURL(videoFileObjectUrl.value)
  }
  videoFileObjectUrl.value = URL.createObjectURL(file)
}

function onProductSelected(product: any) {
  selectedProduct.value = product
}

async function extractThumbnailFromVideo(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.muted = true
    video.playsInline = true
    video.currentTime = 0.5

    video.onloadeddata = () => {
      video.play()
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 720
      canvas.height = video.videoHeight || 1280
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src)
          resolve(blob || new Blob())
        }, 'image/jpeg', 0.8)
      } else {
        URL.revokeObjectURL(video.src)
        resolve(new Blob())
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve(new Blob())
    }
  })
}

async function handlePostSubmit() {
  if (!selectedVideoFile.value) return
  if (isPosting.value) return

  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Posting Video Baru',
      redirectPath: '/showcase/video/post',
    })
    return
  }

  isPosting.value = true
  uploadProgress.value = 5

  try {
    const now = Date.now()

    // 1. Extract thumbnail frame
    const thumbnailBlob = await extractThumbnailFromVideo(selectedVideoFile.value)

    // 2. Upload thumbnail to Firebase Storage
    uploadProgress.value = 15
    const thumbPath = `thumbnail-mobile/thumb_${now}.jpg`
    const thumbUrl = await uploadFileToStorage(thumbPath, thumbnailBlob)

    // 3. Upload video to Firebase Storage
    const videoPath = `videos-mobile/vid_${now}.mp4`
    const videoUrl = await uploadFileToStorage(videoPath, selectedVideoFile.value, (fraction) => {
      // Scale from 20% to 90%
      uploadProgress.value = 20 + Math.round(fraction * 70)
    })

    uploadProgress.value = 95

    // 4. Submit to BekasKu API
    await postVideo({
      content: caption.value.trim(),
      videoUrl,
      thumbUrl,
      productId: selectedProduct.value?._id || null,
    })

    uploadProgress.value = 100
    showNotification({
      type: 'success',
      message: 'Video berhasil diposting!',
    })
    navigateTo('/showcase/video')
  } catch (err: any) {
    showNotification({
      type: 'error',
      message: err?.message || 'Gagal memposting video. Silakan coba lagi.',
    })
  } finally {
    isPosting.value = false
  }
}

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>

