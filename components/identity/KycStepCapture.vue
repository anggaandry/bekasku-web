<script setup lang="ts">
import { SwitchCamera, Upload, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useKycCamera } from '~/composables/useKycCamera'

defineProps<{
  isOcrLoading: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'captured', base64: string): void
  (e: 'error', message: string): void
}>()

const camera = useKycCamera(
  (base64) => emit('captured', base64),
  (message) => emit('error', message),
)

onMounted(() => {
  camera.start()
})
</script>

<template>
  <div class="relative bg-text text-white flex flex-col items-center justify-between min-h-[460px] p-4 sm:p-6">
    <canvas :ref="(el) => (camera.canvasRef.value = el as HTMLCanvasElement | null)" class="hidden" />

    <input
      :ref="(el) => (camera.fileInputRef.value = el as HTMLInputElement | null)"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      aria-label="Pilih berkas foto kartu identitas"
      @change="camera.handleFileChange"
    />

    <div class="relative w-full max-w-sm aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/10">
      <video
        :ref="(el) => (camera.videoRef.value = el as HTMLVideoElement | null)"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      />

      <div class="absolute inset-4 rounded-xl border-2 border-dashed border-white/60 pointer-events-none flex flex-col items-center justify-between p-3">
        <div class="w-full flex justify-between">
          <div class="w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-sm" />
          <div class="w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-sm" />
        </div>
        <div class="w-full flex justify-between">
          <div class="w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-sm" />
          <div class="w-5 h-5 border-b-2 border-r-2 border-white rounded-br-sm" />
        </div>
      </div>

      <div
        v-if="camera.cameraError.value"
        class="absolute inset-0 bg-black/85 p-5 flex flex-col items-center justify-center text-center space-y-3 z-10"
        role="alert"
      >
        <AlertCircle class="w-10 h-10 text-warning" aria-hidden="true" />
        <p class="text-xs text-white/90 leading-relaxed max-w-xs">
          {{ camera.cameraError.value }}
        </p>
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          @click="camera.openFilePicker"
        >
          <Upload class="w-4 h-4" aria-hidden="true" />
          <span>Unggah Foto Kartu</span>
        </button>
      </div>

      <div
        v-if="isOcrLoading"
        class="absolute inset-0 bg-black/80 p-5 flex flex-col items-center justify-center text-center space-y-3 z-20"
        role="status"
      >
        <Loader2 class="w-10 h-10 text-primary animate-spin" aria-hidden="true" />
        <p class="text-xs text-white font-semibold">
          Membaca data identitas...
        </p>
        <p class="text-[11px] text-white/70">
          Memvalidasi ketajaman foto kartu
        </p>
      </div>
    </div>

    <p class="text-xs sm:text-sm text-white/80 text-center font-medium mt-4">
      Letakkan bagian depan kartu identitas di dalam frame
    </p>
    <p v-if="errorMessage" class="text-xs text-warning text-center mt-2" role="alert">
      {{ errorMessage }}
    </p>
    <div class="h-4" />

    <div class="w-full flex items-center justify-around pt-2 pb-1">
      <button
        type="button"
        class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        aria-label="Pilih berkas foto"
        @click="camera.openFilePicker"
      >
        <Upload class="w-5 h-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        :disabled="!camera.isActive.value || isOcrLoading"
        class="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Ambil foto"
        @click="camera.capture"
      >
        <span class="w-full h-full rounded-full bg-primary block" />
      </button>

      <button
        type="button"
        class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        aria-label="Ganti kamera"
        @click="camera.toggleFacing"
      >
        <SwitchCamera class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
