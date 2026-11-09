<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X, Video, Play, Pause, RotateCcw, Send, Upload, Square, AlertCircle } from 'lucide-vue-next'
import { useChatMedia, type PreparedVideo } from '~/composables/useChatMedia'

const props = defineProps<{
  modelValue: boolean
  initialMode?: 'camera' | 'gallery'
  initialVideo?: PreparedVideo | null
  requestId?: string
  title?: string
  isUploading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'send', payload: { file: File; caption: string; requestId?: string }): void
}>()

const {
  isCameraActive,
  cameraError,
  isRecordingVideo,
  recordingSeconds,
  facingMode,
  fileToPreparedVideo,
  startCamera,
  startVideoRecording,
  stopVideoRecording,
  stopCamera,
} = useChatMedia()

const cameraVideoRef = ref<HTMLVideoElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const preparedVideo = ref<PreparedVideo | null>(null)
const caption = ref('')

// Playback state for preview video (matches video_send_controller.dart)
const isPlaying = ref(false)
const currentPosition = ref(0)
const videoDuration = ref(0)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      caption.value = ''
      isPlaying.value = false
      currentPosition.value = 0
      videoDuration.value = 0
      if (props.initialVideo) {
        preparedVideo.value = props.initialVideo
      } else {
        preparedVideo.value = null
        if (props.initialMode === 'camera') {
          await nextTick()
          await startCamera(cameraVideoRef.value, { withAudio: true })
        }
      }
    } else {
      cleanupAndStop()
    }
  },
)

function cleanupAndStop() {
  stopCamera()
  if (preparedVideo.value?.objectUrl && !props.initialVideo) {
    URL.revokeObjectURL(preparedVideo.value.objectUrl)
  }
  preparedVideo.value = null
  caption.value = ''
  isPlaying.value = false
}

async function toggleFacingMode() {
  const nextMode = facingMode.value === 'environment' ? 'user' : 'environment'
  await startCamera(cameraVideoRef.value, { withAudio: true, mode: nextMode })
}

async function handleToggleRecord() {
  if (isRecordingVideo.value) {
    const recorded = await stopVideoRecording()
    if (recorded) {
      preparedVideo.value = recorded
    }
  } else {
    startVideoRecording()
  }
}

async function handleRetake() {
  if (preparedVideo.value?.objectUrl) {
    URL.revokeObjectURL(preparedVideo.value.objectUrl)
  }
  preparedVideo.value = null
  isPlaying.value = false
  currentPosition.value = 0
  videoDuration.value = 0
  if (props.initialMode === 'camera') {
    await nextTick()
    await startCamera(cameraVideoRef.value, { withAudio: true })
  }
}

function handleFileSelect(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  stopCamera()
  preparedVideo.value = fileToPreparedVideo(file)
  target.value = ''
}

function togglePlayPreview() {
  const vid = previewVideoRef.value
  if (!vid) return
  if (vid.paused) {
    vid.play()
    isPlaying.value = true
  } else {
    vid.pause()
    isPlaying.value = false
  }
}

function onTimeUpdate() {
  const vid = previewVideoRef.value
  if (!vid) return
  currentPosition.value = vid.currentTime
}

function onLoadedMetadata() {
  const vid = previewVideoRef.value
  if (!vid) return
  videoDuration.value = vid.duration || 0
}

function onSeekInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  const val = parseFloat(target.value)
  if (previewVideoRef.value && !Number.isNaN(val)) {
    previewVideoRef.value.currentTime = val
    currentPosition.value = val
  }
}

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

function handleSend() {
  if (!preparedVideo.value?.file || props.isUploading) return
  emit('send', {
    file: preparedVideo.value.file,
    caption: caption.value.replace(/[<>]/g, '').trim(),
    requestId: props.requestId || undefined,
  })
}

function closeModal() {
  if (props.isUploading) return
  cleanupAndStop()
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[85] bg-black/95 flex flex-col justify-between font-outfit overscroll-contain"
    >
      <!-- Top Bar -->
      <div class="px-4 py-3.5 flex items-center justify-between text-white border-b border-white/10">
        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="isUploading"
            @click="closeModal"
            class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
          <div>
            <h3 class="font-outfit font-semibold text-base text-white">
              {{ title || (requestId ? 'Kirim Live Video' : 'Kirim Video') }}
            </h3>
            <p v-if="requestId" class="text-xs text-white/70">
              Memenuhi permintaan Live Video pembeli
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Recording Timer Pill -->
          <div
            v-if="isRecordingVideo"
            class="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{{ formatDuration(recordingSeconds) }}</span>
          </div>

          <button
            v-if="preparedVideo && !isUploading"
            type="button"
            @click="handleRetake"
            class="px-3 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Ulangi</span>
          </button>

          <button
            v-else-if="isCameraActive && !isRecordingVideo"
            type="button"
            @click="toggleFacingMode"
            class="px-3 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Putar Kamera</span>
          </button>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="video/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Center Viewport -->
      <div class="flex-1 relative flex items-center justify-center overflow-hidden p-4">
        <!-- Prepared Video Player with Play/Pause Overlay (matches video_send_view.dart) -->
        <div
          v-if="preparedVideo"
          class="relative max-w-2xl w-full max-h-[68vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black border border-white/15"
        >
          <video
            ref="previewVideoRef"
            :src="preparedVideo.objectUrl"
            playsinline
            class="max-h-[68vh] w-auto object-contain cursor-pointer"
            @click="togglePlayPreview"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="isPlaying = false"
          />

          <button
            type="button"
            @click="togglePlayPreview"
            class="w-14 h-14 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer absolute"
            aria-label="Putar atau Jeda Video"
          >
            <Pause v-if="isPlaying" class="w-7 h-7 text-white" />
            <Play v-else class="w-7 h-7 text-white fill-white ml-0.5" />
          </button>
        </div>

        <!-- Live Camera Video Stream -->
        <div
          v-else
          class="w-full max-w-xl aspect-4/3 rounded-2xl overflow-hidden bg-black border border-white/15 relative flex items-center justify-center"
        >
          <video
            ref="cameraVideoRef"
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
            <Video v-else class="w-10 h-10 text-white/60 mb-3" />
            <p class="text-sm text-white/90 max-w-sm mb-4">
              {{ cameraError || 'Rekam video langsung dari kamera atau pilih file video dari perangkat Anda.' }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                @click="startCamera(cameraVideoRef, { withAudio: true })"
                class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Video class="w-4 h-4" />
                <span>Buka Kamera Video</span>
              </button>
              <button
                type="button"
                @click="fileInputRef?.click()"
                class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload class="w-4 h-4 text-white" />
                <span class="text-white">Pilih File Video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Control Bar -->
      <div class="p-4 bg-black/80 border-t border-white/10">
        <!-- Camera Record Shutter -->
        <div
          v-if="!preparedVideo && isCameraActive"
          class="max-w-xl mx-auto flex items-center justify-center gap-6 py-2"
        >
          <button
            v-if="!isRecordingVideo"
            type="button"
            @click="fileInputRef?.click()"
            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload class="w-4 h-4" />
            <span>Galeri</span>
          </button>
          <div v-else class="w-20"></div>

          <button
            type="button"
            @click="handleToggleRecord"
            class="w-16 h-16 rounded-full border-4 border-white p-1.5 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            :aria-label="isRecordingVideo ? 'Hentikan Rekaman' : 'Mulai Rekam Video'"
          >
            <Square v-if="isRecordingVideo" class="w-6 h-6 text-red-500 fill-red-500" />
            <span v-else class="w-full h-full rounded-full bg-red-600"></span>
          </button>

          <div class="w-20"></div>
        </div>

        <!-- Timeline Slider + Caption + Send (matches video_send_view.dart lines 69-145) -->
        <div
          v-else-if="preparedVideo"
          class="max-w-2xl mx-auto space-y-3"
        >
          <div class="flex items-center gap-3 text-xs text-white/80">
            <span class="w-11 text-right font-mono">{{ formatDuration(currentPosition) }}</span>
            <input
              type="range"
              min="0"
              :max="videoDuration || 1"
              step="0.1"
              :value="currentPosition"
              @input="onSeekInput"
              class="flex-1 accent-primary cursor-pointer"
            />
            <span class="w-11 font-mono">{{ formatDuration(videoDuration) }}</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex-1 bg-white rounded-xl px-4 py-2.5 flex items-center">
              <input
                v-model="caption"
                type="text"
                :disabled="isUploading"
                placeholder="Tambah keterangan..."
                class="w-full bg-transparent font-outfit text-sm text-text outline-hidden"
                @keydown.enter.prevent="handleSend"
              />
            </div>

            <button
              type="button"
              :disabled="isUploading"
              @click="handleSend"
              class="w-11 h-11 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-60 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              aria-label="Kirim Video"
            >
              <span
                v-if="isUploading"
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              <Send v-else class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

