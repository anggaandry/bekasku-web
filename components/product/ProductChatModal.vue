<script setup lang="ts">
import { MessageCircle, Camera, Video, X, ChevronRight } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select', option: 0 | 1 | 2): void
}>()

function close() {
  emit('update:modelValue', false)
}

function choose(opt: 0 | 1 | 2) {
  emit('select', opt)
  close()
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
        class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl pb-6 pt-3 shadow-xl overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="px-4 py-2 flex items-center gap-3">
          <button
            type="button"
            @click="close"
            class="p-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
          <h3 class="font-outfit font-bold text-lg text-text">Hubungi Penjual</h3>
        </div>

        <!-- Options -->
        <div class="mt-2 divide-y divide-border/50">
          <button
            type="button"
            @click="choose(0)"
            class="w-full px-5 py-3.5 flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-text">
              <MessageCircle class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-outfit font-semibold text-sm text-text">Chat Penjual</div>
              <div class="font-outfit text-xs text-text-muted">Tanya stok atau detail umum</div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" />
          </button>

          <button
            type="button"
            @click="choose(1)"
            class="w-full px-5 py-3.5 flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-text">
              <Camera class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-outfit font-semibold text-sm text-text">Minta Live Foto Barang</div>
              <div class="font-outfit text-xs text-text-muted">Pastikan kondisi barang saat ini</div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" />
          </button>

          <button
            type="button"
            @click="choose(2)"
            class="w-full px-5 py-3.5 flex items-center gap-3.5 hover:bg-surface-2 transition-colors text-left cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-text">
              <Video class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-outfit font-semibold text-sm text-text">Minta Live Video Barang</div>
              <div class="font-outfit text-xs text-text-muted">Lihat fungsionalitas barang selengkapnya</div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

