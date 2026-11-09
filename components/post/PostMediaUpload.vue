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
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showVideoInput = ref(Boolean(props.video))
const localVideoUrl = ref(props.video)
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

function handleVideoBlur() {
  emit('update:video', localVideoUrl.value.trim())
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
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-text">
            {{ videoLabel }} <span class="text-text-muted font-normal text-xs">(Opsional)</span>
          </label>
          <p class="text-[11px] text-text-muted mt-0.5">
            {{ sellMethod === SELL_METHOD_SERVICE ? 'Tautkan video portofolio atau penjelasan layanan Anda.' : sellMethod === SELL_METHOD_NEEDED ? 'Tautkan video referensi barang yang dibutuhkan.' : 'Tautkan video produk atau video review untuk meningkatkan kepercayaan calon pembeli.' }}
          </p>
        </div>
        <button
          v-if="!showVideoInput"
          type="button"
          class="text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          @click="showVideoInput = true"
        >
          + Tambah Video
        </button>
      </div>

      <div v-if="showVideoInput" class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border-light text-text-subtle flex items-center justify-center shrink-0">
          <Video class="w-5 h-5" aria-hidden="true" />
        </div>
        <input
          v-model="localVideoUrl"
          type="url"
          placeholder="Masukkan tautan video YouTube / video produk..."
          class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border-light text-xs text-text placeholder:text-text-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          @blur="handleVideoBlur"
        />
        <button
          type="button"
          class="p-2 text-text-muted hover:text-danger rounded-xl hover:bg-surface-2 transition-colors cursor-pointer"
          title="Hapus Video"
          @click="localVideoUrl = ''; emit('update:video', ''); showVideoInput = false"
        >
          <Trash2 class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
