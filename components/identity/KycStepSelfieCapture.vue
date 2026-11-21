<script setup lang="ts">
import { SwitchCamera, Upload, AlertCircle } from 'lucide-vue-next'
import { useKycCamera } from '~/composables/useKycCamera'

defineProps<{
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'captured', base64: string): void
  (e: 'error', message: string): void
}>()

const camera = useKycCamera(
  (base64) => emit('captured', base64),
  (message) => emit('error', message),
  'user',
)

onMounted(() => {
  camera.start()
})
</script>

<template>
  <div class="relative bg-text text-white flex flex-col items-center justify-between min-h-[480px] p-4 sm:p-6">
    <canvas :ref="(el) => (camera.canvasRef.value = el as HTMLCanvasElement | null)" class="hidden" />

    <input
      :ref="(el) => (camera.fileInputRef.value = el as HTMLInputElement | null)"
      type="file"
      accept="image/*"
      capture="user"
      class="hidden"
      aria-label="Pilih berkas foto selfie bersama KTP"
      @change="camera.handleFileChange"
    />

    <div class="relative w-full max-w-sm aspect-[3/4] sm:aspect-[4/4] rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/10">
      <video
        :ref="(el) => (camera.videoRef.value = el as HTMLVideoElement | null)"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover scale-x-[-1]"
      />

      <!-- Oval Face Guide + Card Area Guide -->
      <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-3 p-4">
        <div class="w-40 h-52 sm:w-44 sm:h-56 rounded-full border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        <div class="w-44 h-24 rounded-xl border-2 border-dashed border-primary/90 bg-black/20 flex items-center justify-center">
          <span class="text-[11px] font-semibold text-white/90 px-2 text-center">
            Posisikan KTP di sini
          </span>
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
          <span>Unggah Foto Selfie</span>
        </button>
      </div>
    </div>

    <p class="text-xs sm:text-sm text-white/80 text-center font-medium mt-4">
      Posisikan wajah di dalam bingkai oval dan pegang KTP di bawahnya
    </p>

    <div
      v-if="errorMessage"
      class="w-full max-w-sm mt-3 px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs flex items-start gap-2"
      role="alert"
    >
      <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="w-full flex items-center justify-around pt-4 pb-1">
      <button
        type="button"
        class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        aria-label="Pilih berkas foto selfie"
        @click="camera.openFilePicker"
      >
        <Upload class="w-5 h-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        :disabled="!camera.isActive.value"
        class="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Ambil foto selfie"
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
