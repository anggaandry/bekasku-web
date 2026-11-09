<script setup lang="ts">
import { ref } from 'vue'
import { Brain, Camera, X, Sparkles, Loader2 } from 'lucide-vue-next'
import type { UploadedImage } from '~/types/post'

const props = withDefaults(
  defineProps<{
    images: UploadedImage[]
    modelValue: string
    maxPhotos?: number
    isLoading?: boolean
    inModal?: boolean
  }>(),
  {
    maxPhotos: 10,
    isLoading: false,
    inModal: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'add-files', files: FileList | File[]): void
  (e: 'remove-image', index: number): void
  (e: 'submit'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFilePicker() {
  if (props.isLoading) return
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('add-files', target.files)
    target.value = ''
  }
}

function onInputNote(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div
    :class="[
      inModal
        ? 'flex flex-col flex-1 overflow-hidden'
        : 'space-y-8 pb-24 md:pb-4',
    ]"
  >
    <div
      :class="[
        inModal
          ? 'overflow-y-auto p-5 sm:p-6 space-y-5 flex-1'
          : 'space-y-8',
      ]"
    >
      <!-- 1. Asisten AI BekasKu Banner (Mobile V3 Parity) -->
      <div
        class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-white to-purple-500/5 border border-primary/10 shadow-2xs flex items-center gap-3.5 sm:gap-4"
      >
        <div
          class="w-11 h-11 rounded-full bg-white border border-primary/15 text-primary flex items-center justify-center shrink-0 shadow-xs"
        >
          <Brain class="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 class="text-sm sm:text-base font-bold text-text">
            Asisten AI Bekasku
          </h2>
          <p class="text-xs text-text-muted mt-0.5">
            Cukup upload foto, biar AI yang buat detailnya.
          </p>
        </div>
      </div>

      <!-- 2. Foto Barang Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 :class="[inModal ? 'text-sm' : 'text-base', 'font-bold text-text']">
            Foto Barang
          </h3>
          <span class="text-xs font-semibold text-text-muted">
            {{ images.length }}/{{ maxPhotos }}
          </span>
        </div>

        <!-- Thumbnails and Add Button Grid -->
        <div class="flex flex-wrap items-center gap-3">
          <div
            v-for="(img, idx) in images"
            :key="img.id || idx"
            :class="[
              inModal ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-24 h-24 sm:w-28 sm:h-28',
              'rounded-2xl overflow-hidden relative group/img bg-surface-2 border border-border-light shrink-0 shadow-2xs',
            ]"
          >
            <img
              :src="img.url"
              alt="Foto Barang"
              class="w-full h-full object-cover"
            />
            <button
              type="button"
              class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              aria-label="Hapus Foto"
              @click="emit('remove-image', idx)"
            >
              <X class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <!-- Add Photo Slot -->
          <button
            v-if="images.length < maxPhotos"
            type="button"
            :class="[
              inModal ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-24 h-24 sm:w-28 sm:h-28',
              'rounded-2xl border border-border-light hover:border-primary/50 bg-surface-2 hover:bg-primary/5 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group shrink-0',
            ]"
            :disabled="isLoading"
            @click="triggerFilePicker"
          >
            <Camera
              class="w-5 h-5 sm:w-6 sm:h-6 text-text-subtle group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
            <span
              class="text-xs font-medium text-text-muted group-hover:text-primary mt-1.5 transition-colors"
            >
              Tambah
            </span>
          </button>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onFileChange"
          />
        </div>
      </div>

      <!-- 3. Catatan Tambahan (Opsional) Section -->
      <div class="space-y-2.5">
        <label
          for="ai-note-input"
          :class="[inModal ? 'text-sm' : 'text-base', 'block font-bold text-text']"
        >
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          id="ai-note-input"
          name="ai_note"
          :value="modelValue"
          :rows="inModal ? 3 : 4"
          maxlength="500"
          placeholder="Contoh: Ini HP Samsung S21 Ultra, baru pake 1 bulan, mulus banget..."
          class="w-full bg-surface-2 border border-border-light rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-text placeholder:text-text-subtle focus:bg-white focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
          @input="onInputNote"
        />
      </div>
    </div>

    <!-- 4. Bottom Action Bar -->
    <div
      :class="[
        inModal
          ? 'p-4 sm:p-5 border-t border-border-light bg-surface-1 shrink-0'
          : 'fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-light p-4 md:static md:bg-transparent md:border-0 md:p-0 md:pt-4',
      ]"
    >
      <div :class="[inModal ? '' : 'max-w-2xl mx-auto']">
        <button
          type="button"
          class="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || (inModal && images.length === 0)"
          @click="emit('submit')"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" aria-hidden="true" />
          <Sparkles v-else class="w-5 h-5" aria-hidden="true" />
          <span>Mulai Analisis AI</span>
        </button>
      </div>
    </div>
  </div>
</template>

