<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Camera,
  Video,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'
import {
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import type { UploadedImage } from '~/types/post'

interface UploadProgress {
  current: number
  total: number
  message: string
}

const props = withDefaults(
  defineProps<{
    images: UploadedImage[]
    video?: string
    maxPhotos: number
    sellMethod?: number
    error?: string
    isUploading?: boolean
    uploadProgress?: UploadProgress
  }>(),
  {
    video: '',
    sellMethod: SELL_METHOD_DIRECT,
    error: '',
    isUploading: false,
    uploadProgress: () => ({ current: 0, total: 0, message: '' }),
  },
)

const photoLabel = computed(() => {
  if (props.sellMethod === SELL_METHOD_NEEDED) return 'Foto Dibutuhkan'
  if (props.sellMethod === SELL_METHOD_SERVICE) return 'Foto Jasa'
  return 'Foto Barang'
})

const photoDescription = computed(() => {
  if (props.sellMethod === SELL_METHOD_NEEDED) {
    return 'Foto pertama akan otomatis menjadi foto sampul barang yang dicari.'
  }
  if (props.sellMethod === SELL_METHOD_SERVICE) {
    return 'Foto pertama akan otomatis menjadi foto sampul/portofolio jasa Anda.'
  }
  return 'Foto pertama akan otomatis menjadi foto sampul utama produk.'
})

const videoLabel = computed(() => {
  if (props.sellMethod === SELL_METHOD_NEEDED) return 'Video Dibutuhkan'
  if (props.sellMethod === SELL_METHOD_SERVICE) return 'Video Jasa'
  return 'Video Barang'
})

const emit = defineEmits<{
  (e: 'add-images', files: FileList | File[]): void
  (e: 'remove-image', index: number): void
  (e: 'set-cover', index: number): void
  (e: 'update:video', val: string): void
  (e: 'update:video-thumbnail', val: string): void
}>()

const { uploadFileToStorage } = useFirebase()

const fileInputRef = ref<HTMLInputElement | null>(null)
const videoInputRef = ref<HTMLInputElement | null>(null)
const isUploadingVideo = ref(false)
const videoUploadPercent = ref(0)
const videoError = ref('')
const isDragging = ref(false)

function triggerFileInput() {
  if (props.isUploading) return
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const fileList = Array.from(target.files)
    emit('add-images', fileList)
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (props.isUploading) return
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const fileList = Array.from(e.dataTransfer.files)
    emit('add-images', fileList)
  }
}

function triggerVideoInput() {
  if (isUploadingVideo.value) return
  videoInputRef.value?.click()
}

function captureVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const videoEl = document.createElement('video')
      const objUrl = URL.createObjectURL(file)
      videoEl.preload = 'metadata'
      videoEl.muted = true
      videoEl.playsInline = true
      videoEl.src = objUrl

      const cleanup = () => URL.revokeObjectURL(objUrl)

      videoEl.onloadeddata = () => {
        videoEl.currentTime = Math.min(0.5, videoEl.duration ? videoEl.duration / 2 : 0)
      }
      videoEl.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = videoEl.videoWidth || 480
          canvas.height = videoEl.videoHeight || 480
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            cleanup()
            resolve(null)
            return
          }
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            (blob) => {
              cleanup()
              resolve(blob)
            },
            'image/jpeg',
            0.75,
          )
        } catch {
          cleanup()
          resolve(null)
        }
      }
      videoEl.onerror = () => {
        cleanup()
        resolve(null)
      }
    } catch {
      resolve(null)
    }
  })
}

async function handleVideoFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  videoError.value = ''
  if (!file.type.startsWith('video/')) {
    videoError.value = 'Format file harus berupa video (MP4, MOV, WebM).'
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    videoError.value = 'Ukuran video maksimal 50 MB.'
    return
  }

  isUploadingVideo.value = true
  videoUploadPercent.value = 0

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const ts = Date.now()
    const videoPath = `videos/video_${ts}.${ext}`

    const [videoUrl, thumbBlob] = await Promise.all([
      uploadFileToStorage(videoPath, file, (fraction) => {
        videoUploadPercent.value = Math.round(fraction * 100)
      }),
      captureVideoThumbnail(file),
    ])

    emit('update:video', videoUrl)

    if (thumbBlob) {
      const thumbUrl = await uploadFileToStorage(`thumbnail/thumb_${ts}.jpeg`, thumbBlob)
      emit('update:video-thumbnail', thumbUrl)
    } else {
      emit('update:video-thumbnail', '')
    }
  } catch (err: any) {
    videoError.value = err?.message || 'Gagal mengunggah video ke server. Silakan coba lagi.'
  } finally {
    isUploadingVideo.value = false
  }
}

function removeVideo() {
  emit('update:video', '')
  emit('update:video-thumbnail', '')
  videoError.value = ''
}
</script>

<template>
  <div class="space-y-5 font-outfit">
    <!-- ── 1. Foto Barang Section ─────────────────────────────────────────── -->
    <div
      class="space-y-3 p-4 sm:p-5 rounded-2xl border transition-colors"
      :class="isDragging ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border-light bg-white'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-text">
            {{ photoLabel }} <span class="text-danger">*</span>
          </label>
          <p class="text-[11px] text-text-muted mt-0.5">
            {{ photoDescription }} ({{ images.length }}/{{ maxPhotos }})
          </p>
        </div>
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          :class="images.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-2 text-text-muted'"
        >
          {{ images.length }}/{{ maxPhotos }} Foto
        </span>
      </div>

      <!-- Compression / Upload Progress Banner (Mobile V3 parity) -->
      <div
        v-if="isUploading"
        class="px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-between text-xs animate-in fade-in duration-200"
      >
        <div class="flex items-center gap-2">
          <Loader2 class="w-4 h-4 text-primary animate-spin shrink-0" aria-hidden="true" />
          <span class="font-semibold">
            {{ uploadProgress?.message || 'Mengompres dan memproses gambar...' }}
          </span>
        </div>
        <span
          v-if="uploadProgress?.total"
          class="font-bold text-[11px] bg-primary/20 text-primary px-2 py-0.5 rounded-full shrink-0"
        >
          {{ uploadProgress.current }}/{{ uploadProgress.total }}
        </span>
      </div>

      <!-- Photo Upload Grid -->
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <!-- Add Photo Trigger Box -->
        <button
          v-if="images.length < maxPhotos && !isUploading"
          type="button"
          class="aspect-square rounded-2xl border-2 border-dashed border-border-light hover:border-primary/50 bg-surface-2 hover:bg-primary/5 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group"
          :disabled="isUploading"
          @click="triggerFileInput"
        >
          <div class="w-9 h-9 rounded-xl bg-white group-hover:bg-primary/10 text-text-subtle group-hover:text-primary flex items-center justify-center transition-colors shadow-2xs">
            <Camera class="w-5 h-5" aria-hidden="true" />
          </div>
          <span class="text-[11px] font-semibold text-text group-hover:text-primary mt-2">
            Tambah Foto
          </span>
        </button>

        <!-- Active Compressing Placeholder Slot (Visual Loading Indicator) -->
        <div
          v-if="isUploading"
          class="aspect-square rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 flex flex-col items-center justify-center p-2 text-center"
        >
          <Loader2 class="w-6 h-6 text-primary animate-spin mb-1.5" aria-hidden="true" />
          <span class="text-[10px] font-bold text-primary">Mengompres...</span>
          <span v-if="uploadProgress?.total" class="text-[9px] text-text-muted mt-0.5">
            {{ uploadProgress.current }}/{{ uploadProgress.total }}
          </span>
        </div>

        <!-- Hidden input for file picker -->
        <input
          id="post-media-file-input"
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileChange"
        />

        <!-- Uploaded Images Thumbnails -->
        <div
          v-for="(img, idx) in images"
          :key="img.id || img.url"
          class="aspect-square rounded-2xl border border-border-light overflow-hidden relative group/img bg-surface-2 shadow-2xs"
        >
          <img
            :src="img.url"
            alt="Foto Produk"
            class="w-full h-full object-cover"
          />

          <!-- Cover Badge on First Photo -->
          <div
            v-if="idx === 0"
            class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5"
          >
            <Star class="w-2.5 h-2.5 fill-white" aria-hidden="true" />
            <span>Utama</span>
          </div>

          <!-- Actions Overlay on Hover -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1.5">
            <button
              v-if="idx !== 0"
              type="button"
              class="p-1.5 rounded-lg bg-white/90 text-text hover:bg-white hover:text-emerald-700 transition-colors shadow-xs cursor-pointer"
              title="Jadikan Foto Utama"
              @click="emit('set-cover', idx)"
            >
              <Star class="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="p-1.5 rounded-lg bg-white/90 text-text hover:bg-white hover:text-danger transition-colors shadow-xs cursor-pointer"
              title="Hapus Foto"
              @click="emit('remove-image', idx)"
            >
              <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- Drag & Drop Hint for Desktop -->
      <p class="hidden sm:block text-[11px] text-text-subtle pt-1">
        Tarik dan lepaskan file foto langsung ke area ini, atau klik Tambah Foto (JPG, PNG, WEBP, maks 1080px otomatis terkompres).
      </p>

      <!-- Error message -->
      <p v-if="error" class="text-xs text-danger font-medium flex items-center gap-1 mt-1">
        <AlertCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{{ error }}</span>
      </p>
    </div>

    <!-- ── 2. Video Barang Section ─────────────────────────────────────────── -->
    <div class="p-4 sm:p-5 rounded-2xl border border-border-light bg-white space-y-3">
      <div class="flex items-center justify-between gap-2">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-text">
            {{ videoLabel }} <span class="text-text-muted font-normal text-xs">(Opsional)</span>
          </label>
          <p class="text-[11px] text-text-muted mt-0.5">
            {{ sellMethod === SELL_METHOD_SERVICE ? 'Unggah video portofolio atau penjelasan layanan Anda (maks. 50 MB).' : sellMethod === SELL_METHOD_NEEDED ? 'Unggah video referensi barang yang dibutuhkan (maks. 50 MB).' : 'Unggah video produk atau video review untuk meningkatkan kepercayaan calon pembeli (maks. 50 MB).' }}
          </p>
        </div>
        <button
          v-if="!video && !isUploadingVideo"
          type="button"
          class="text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer shrink-0"
          @click="triggerVideoInput"
        >
          + Pilih Video
        </button>
      </div>

      <input
        ref="videoInputRef"
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        class="hidden"
        @change="handleVideoFileChange"
      />

      <!-- Upload Progress -->
      <div v-if="isUploadingVideo" class="p-3.5 rounded-xl bg-surface-2 border border-border-light space-y-2">
        <div class="flex items-center justify-between text-xs font-medium text-text">
          <span class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 text-primary animate-spin" aria-hidden="true" />
            Mengunggah video...
          </span>
          <span class="text-primary font-semibold">{{ videoUploadPercent }}%</span>
        </div>
        <div class="w-full h-1.5 rounded-full bg-border-light overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-150"
            :style="{ width: `${videoUploadPercent}%` }"
          ></div>
        </div>
      </div>

      <!-- Video Preview when uploaded -->
      <div v-else-if="video" class="space-y-2">
        <div class="relative rounded-xl overflow-hidden bg-black border border-border-light">
          <video
            :src="video"
            controls
            playsinline
            preload="metadata"
            class="w-full max-h-56 object-contain"
          ></video>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] text-emerald-700 font-medium">
            Video berhasil diunggah
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-xs font-semibold text-primary hover:underline cursor-pointer"
              @click="triggerVideoInput"
            >
              Ganti Video
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline cursor-pointer"
              @click="removeVideo"
            >
              <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty Upload Box -->
      <button
        v-else
        type="button"
        class="w-full py-5 px-4 rounded-xl border-2 border-dashed border-border hover:border-primary bg-surface-2/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
        @click="triggerVideoInput"
      >
        <Video class="w-6 h-6 text-text-subtle group-hover:text-primary transition-colors" aria-hidden="true" />
        <span class="text-xs font-semibold text-text group-hover:text-primary">
          Pilih File Video dari Perangkat
        </span>
        <span class="text-[11px] text-text-muted">
          MP4, MOV, WebM (Maks. 50 MB)
        </span>
      </button>

      <p v-if="videoError" class="text-xs text-danger font-medium flex items-center gap-1">
        <AlertCircle class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{{ videoError }}</span>
      </p>
    </div>
  </div>
</template>
