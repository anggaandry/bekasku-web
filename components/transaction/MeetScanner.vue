<script setup lang="ts">
import { CameraOff, Keyboard } from 'lucide-vue-next'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'scanned', code: string): void
}>()

const manualCode = ref('')
const hasCamera = ref(true)
const cameraError = ref<string | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
let stream: MediaStream | null = null
let animationFrameId: number | null = null

async function startCamera() {
  cameraError.value = null
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      hasCamera.value = false
      cameraError.value = 'Browser tidak mendukung akses kamera'
      return
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.setAttribute('playsinline', 'true')
      await videoRef.value.play()
      startBarcodeDetection()
    }
  } catch {
    hasCamera.value = false
    cameraError.value = 'Izin kamera tidak diberikan atau perangkat tidak memiliki webcam'
  }
}

function stopCamera() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}

async function startBarcodeDetection() {
  if ('BarcodeDetector' in window) {
    try {
      const DetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (el: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector
      const barcodeDetector = new DetectorClass({ formats: ['qr_code'] })
      const detect = async () => {
        if (videoRef.value && videoRef.value.readyState === videoRef.value.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.value)
            if (barcodes.length > 0 && barcodes[0]?.rawValue) {
              stopCamera()
              emit('scanned', barcodes[0].rawValue)
              return
            }
          } catch {
            // Frame not ready for decode yet
          }
        }
        animationFrameId = requestAnimationFrame(detect)
      }
      animationFrameId = requestAnimationFrame(detect)
    } catch {
      // Browser lacks qr_code format support in BarcodeDetector; manual input remains active
    }
  }
}

function handleManualSubmit() {
  const code = manualCode.value.trim()
  if (!code) return
  emit('scanned', code)
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div class="space-y-4">
    <div class="relative bg-black rounded-2xl overflow-hidden aspect-square sm:aspect-4/3 flex items-center justify-center border border-border shadow-md">
      <video
        ref="videoRef"
        class="w-full h-full object-cover"
        muted
      />

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
        <div class="w-64 h-64 border-2 border-primary/60 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <div class="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div class="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div class="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div class="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

          <div class="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-sm shadow-primary animate-bounce" />
        </div>
      </div>

      <div
        v-if="cameraError"
        class="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <div class="w-12 h-12 rounded-full bg-surface-2/20 flex items-center justify-center mb-3">
          <CameraOff class="w-6 h-6 text-white" />
        </div>
        <p class="font-outfit text-sm text-white/90 max-w-xs mb-3">
          {{ cameraError }}
        </p>
        <span class="text-xs text-primary font-semibold font-outfit">
          Gunakan input kode manual di bawah ini
        </span>
      </div>

      <div
        v-if="loading"
        class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20"
      >
        <div class="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <span class="font-outfit font-semibold text-sm text-white">Memverifikasi QR Code...</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-5 border border-border space-y-3 shadow-2xs">
      <div class="flex items-center gap-2 text-text font-outfit font-semibold text-sm">
        <Keyboard class="w-4 h-4 text-text-muted" />
        <span>Atau Masukkan Kode Transaksi Manual</span>
      </div>

      <div class="flex items-center gap-2">
        <input
          v-model="manualCode"
          type="text"
          placeholder="Contoh: jjGQThmaF3396..."
          class="flex-1 h-11 px-3.5 rounded-xl border border-border bg-surface-2 text-sm text-text font-outfit focus:outline-none focus:border-primary transition-colors"
          @keyup.enter="handleManualSubmit"
        />
        <button
          type="button"
          :disabled="!manualCode.trim() || loading"
          class="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-outfit font-semibold text-sm transition-colors cursor-pointer shrink-0"
          @click="handleManualSubmit"
        >
          Proses
        </button>
      </div>
    </div>
  </div>
</template>

