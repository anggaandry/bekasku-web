<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X, Camera, RotateCcw, Send, Upload, ZoomIn, ZoomOut, AlertCircle } from 'lucide-vue-next'
import { useChatMedia, type PreparedImage } from '~/composables/useChatMedia'

const props = defineProps<{
  modelValue: boolean
  initialMode?: 'camera' | 'gallery'
  initialImage?: PreparedImage | null
  requestId?: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'send', payload: { base64: string; caption: string; requestId?: string }): void
}>()

const {
  isCameraActive,
  cameraError,
  facingMode,
  fileToPreparedImage,
  startCamera,
  capturePhotoFromVideo,
  stopCamera,
} = useChatMedia()

const videoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const preparedImage = ref<PreparedImage | null>(null)
const caption = ref('')
const zoomScale = ref(1)

function handleWindowKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      if (import.meta.client) {
        window.addEventListener('keydown', handleWindowKeydown)
      }
      caption.value = ''
      zoomScale.value = 1
      if (props.initialImage) {
        preparedImage.value = props.initialImage
      } else {
        preparedImage.value = null
        if (props.initialMode === 'camera') {
          await nextTick()
          await startCamera(videoRef.value, { withAudio: false })
        }
      }
    } else {
      if (import.meta.client) {
        window.removeEventListener('keydown', handleWindowKeydown)
      }
      stopCamera()
      preparedImage.value = null
      caption.value = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleWindowKeydown)
  }
})

async function toggleFacingMode() {
  const nextMode = facingMode.value === 'environment' ? 'user' : 'environment'
  await startCamera(videoRef.value, { withAudio: false, mode: nextMode })
}

function handleTakeSnapshot() {
  const result = capturePhotoFromVideo(videoRef.value)
  if (result) {
    preparedImage.value = result
  }
}

async function handleRetake() {
  preparedImage.value = null
  zoomScale.value = 1
  if (props.initialMode === 'camera') {
    await nextTick()
    await startCamera(videoRef.value, { withAudio: false })
  }
}

async function handleFileSelect(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    stopCamera()
    preparedImage.value = await fileToPreparedImage(file, file.name)
  } catch {
    cameraError.value = 'Gagal memproses gambar yang dipilih.'
  } finally {
    target.value = ''
  }
}

function handleSend() {
  if (!preparedImage.value?.base64) return
  emit('send', {
    base64: preparedImage.value.base64,
    caption: caption.value.replace(/[<>]/g, '').trim(),
    requestId: props.requestId || undefined,
  })
  closeModal()
}

function closeModal() {
  stopCamera()
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[85] bg-black/95 flex flex-col justify-between font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-send-modal-title"
    >
      <!-- Top Bar -->
      <div class="px-4 py-3.5 flex items-center justify-between text-white border-b border-white/10">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="closeModal"
            class="w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h3 id="image-send-modal-title" class="font-outfit font-semibold text-base text-white">
              {{ title || (requestId ? 'Kirim Live Photo' : 'Kirim Foto') }}
            </h3>
            <p v-if="requestId" class="text-xs text-white/70">
              Memenuhi permintaan Live Photo pembeli
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Zoom Controls when previewing image -->
          <template v-if="preparedImage">
            <button
              type="button"
              @click="zoomScale = zoomScale > 1 ? 1 : 2"
              class="w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              :aria-label="zoomScale > 1 ? 'Perkecil Gambar' : 'Perbesar Gambar'"
            >
              <ZoomOut v-if="zoomScale > 1" class="w-4 h-4" aria-hidden="true" />
              <ZoomIn v-else class="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              @click="handleRetake"
              class="px-3 h-11 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-medium text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <RotateCcw class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ulangi</span>
            </button>
          </template>

          <!-- Switch Camera when live stream active -->
          <button
            v-else-if="isCameraActive"
            type="button"
            @click="toggleFacingMode"
            class="px-3 h-11 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-medium text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <RotateCcw class="w-3.5 h-3.5" aria-hidden="true" />
            <span>Putar Kamera</span>
          </button>
        </div>
      </div>

      <!-- Hidden File Input Fallback -->
      <input
        id="chat-image-file-input"
        ref="fileInputRef"
        name="image"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Center Viewport: Image Preview OR Live Camera Stream -->
      <div class="flex-1 relative flex items-center justify-center overflow-hidden p-4">
        <!-- Prepared Image Preview -->
        <div
          v-if="preparedImage"
          class="max-w-full max-h-full flex items-center justify-center overflow-auto"
        >
          <img
            :src="preparedImage.dataUrl"
            :alt="preparedImage.name"
            class="max-h-[70vh] w-auto object-contain rounded-xl transition-transform duration-200"
            :class="zoomScale > 1 ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'"
            @click="zoomScale = zoomScale > 1 ? 1 : 1.5"
          />
        </div>

        <!-- Live Camera Video Stream -->
        <div
          v-else
          class="w-full max-w-xl aspect-4/3 rounded-2xl overflow-hidden bg-black border border-white/15 relative flex items-center justify-center"
        >
          <video
            ref="videoRef"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
          />

          <div
            v-if="!isCameraActive"
            class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80"
          >
            <AlertCircle v-if="cameraError" class="w-10 h-10 text-amber-400 mb-3" />
            <Camera v-else class="w-10 h-10 text-white/60 mb-3" />
            <p class="text-sm text-white/90 max-w-sm mb-4">
              {{ cameraError || 'Pilih foto dari perangkat atau aktifkan kamera untuk mengambil foto langsung.' }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                @click="startCamera(videoRef, { withAudio: false })"
                class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Camera class="w-4 h-4" />
                <span>Buka Kamera</span>
              </button>
              <button
                type="button"
                @click="fileInputRef?.click()"
                class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload class="w-4 h-4 text-white" />
                <span class="text-white">Pilih dari Perangkat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Control Bar -->
      <div class="p-4 bg-black/80 border-t border-white/10">
        <!-- Camera Shutter Mode -->
        <div
          v-if="!preparedImage && isCameraActive"
          class="max-w-xl mx-auto flex items-center justify-center gap-6 py-2"
        >
          <button
            type="button"
            @click="fileInputRef?.click()"
            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload class="w-4 h-4" />
            <span>Galeri</span>
          </button>

          <button
            type="button"
            @click="handleTakeSnapshot"
            class="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Ambil Foto"
          >
            <span class="w-full h-full rounded-full bg-white"></span>
          </button>

          <div class="w-20"></div>
        </div>

        <!-- Caption + Send Bar (matches image_send_view.dart) -->
        <div
          v-else-if="preparedImage"
          class="max-w-2xl mx-auto flex items-center gap-3"
        >
          <div class="flex-1 bg-white rounded-xl px-4 py-2.5 flex items-center min-h-[44px]">
            <input
              id="chat-image-caption"
              v-model="caption"
              name="caption"
              type="text"
              aria-label="Keterangan foto"
              placeholder="Tambah keterangan..."
              class="w-full bg-transparent font-outfit text-sm text-text placeholder:text-text-muted outline-hidden"
              @keydown.enter.prevent="handleSend"
            />
          </div>

          <button
            type="button"
            @click="handleSend"
            class="w-11 h-11 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            aria-label="Kirim Foto"
          >
            <Send class="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

