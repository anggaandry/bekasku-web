<template>
  <div class="mx-4 mt-3 mb-2 p-2.5 rounded-2xl bg-surface-2 border border-border flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <div class="w-[52px] h-[52px] rounded-xl overflow-hidden bg-border/50 flex items-center justify-center shrink-0">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Foto Pencarian Visual"
          width="52"
          height="52"
          class="w-full h-full object-cover"
        />
        <Camera v-else class="w-6 h-6 text-text-muted" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <Search class="w-3.5 h-3.5 text-text-muted shrink-0" />
          <h3 class="font-outfit font-semibold text-xs sm:text-sm text-text truncate">
            Pencarian Berdasarkan Foto
          </h3>
        </div>
        <p class="font-outfit text-xs text-text-muted mt-0.5 line-clamp-2">
          <template v-if="!previewUrl">
            Unggah foto untuk mencari barang serupa di BekasKu.
          </template>
          <template v-else-if="isEmpty && !loading">
            Belum ada produk yang cocok dengan foto ini.
          </template>
          <template v-else>
            Menampilkan produk dengan kemiripan visual terbaik
            <span v-if="durationMs && durationMs > 0">({{ durationMs }} ms)</span>
          </template>
        </p>
      </div>
    </div>

    <div>
      <input
        ref="reuploadInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileChange"
      />
      <button
        type="button"
        class="px-3 py-1.5 rounded-xl bg-white hover:bg-surface-2 border border-border text-xs font-outfit font-semibold text-primary cursor-pointer shrink-0 transition-colors"
        @click="reuploadInputRef?.click()"
      >
        {{ previewUrl ? 'Ganti Foto' : 'Pilih Foto' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Camera, Search } from 'lucide-vue-next'

defineProps<{
  previewUrl?: string
  isEmpty?: boolean
  loading?: boolean
  durationMs?: number
}>()

const emit = defineEmits<{
  selectFile: [file: File]
}>()

const reuploadInputRef = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('selectFile', file)
    input.value = ''
  }
}
</script>

