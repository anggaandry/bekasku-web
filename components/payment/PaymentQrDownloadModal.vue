<script setup lang="ts">
import {
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ImageIcon,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  isCompleted: boolean
  errorMessage?: string | null
  progress: number
  fileName: string
  blobUrl?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

function openQrImage() {
  if (props.blobUrl) {
    window.open(props.blobUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        class="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- State: Error -->
        <template v-if="errorMessage">
          <div
            class="w-14 h-14 mx-auto rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-4"
          >
            <AlertCircle class="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 id="qr-modal-title" class="text-base font-bold text-text">
            Gagal Mengunduh
          </h3>
          <p class="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
            {{ errorMessage }}
          </p>
          <div class="mt-6">
            <button
              type="button"
              class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              @click="close"
            >
              Tutup
            </button>
          </div>
        </template>

        <!-- State: Selesai Diunduh -->
        <template v-else-if="isCompleted">
          <div
            class="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4"
          >
            <CheckCircle2 class="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 id="qr-modal-title" class="text-base sm:text-lg font-bold text-text">
            Kode QR Berhasil Diunduh
          </h3>
          <p class="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
            Gambar QR siap dibuka atau dibagikan.
          </p>

          <div
            class="mt-4 p-3 rounded-2xl bg-surface-2 border border-border-light flex items-center gap-2.5 text-left"
          >
            <div
              class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
            >
              <ImageIcon class="w-5 h-5 stroke-[2]" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold text-text truncate">
                {{ fileName }}
              </p>
              <p class="text-[11px] text-text-muted mt-0.5 truncate">
                Tersimpan di perangkat Anda
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-2.5">
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl border border-border bg-white hover:bg-surface-2 text-text text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              @click="close"
            >
              Tutup
            </button>
            <button
              v-if="blobUrl"
              type="button"
              class="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              @click="openQrImage"
            >
              <ExternalLink class="w-4 h-4 stroke-[2]" />
              <span>Buka QR</span>
            </button>
          </div>
        </template>

        <!-- State: Sedang Mengunduh -->
        <template v-else>
          <div
            class="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4"
          >
            <Download class="w-7 h-7 stroke-[2.2] animate-bounce" />
          </div>
          <h3 id="qr-modal-title" class="text-base font-bold text-text">
            Mengunduh Kode QR...
          </h3>
          <p class="text-xs text-text-muted mt-1 truncate">
            {{ fileName }}
          </p>

          <div class="mt-5 w-full bg-surface-3 rounded-full h-2 overflow-hidden">
            <div
              class="bg-primary h-full transition-all duration-300 rounded-full"
              :style="{ width: `${Math.max(10, Math.round(progress * 100))}%` }"
            />
          </div>
          <p class="text-[11px] font-semibold text-primary mt-2">
            {{ Math.round(progress * 100) }}%
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

