<script setup lang="ts">
import { X, Camera } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
        @click.stop
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Camera class="w-4 h-4" />
            </div>
            <h3 class="font-outfit font-bold text-base text-text">
              Tentang Live Photo &amp; Video
            </h3>
          </div>
          <button
            type="button"
            @click="close"
            class="p-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="font-outfit text-sm text-text-muted leading-relaxed">
          Fitur <strong class="text-text">Live Photo</strong> &amp; <strong class="text-text">Live Video</strong> digunakan untuk meminta penjual mengambil foto atau video kondisi barang secara langsung (real-time) dari kamera tanpa mengunggah file lama dari galeri.
        </p>

        <button
          type="button"
          @click="close"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          <span class="text-white">Mengerti</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

