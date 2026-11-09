<script setup lang="ts">
import { ref } from 'vue'
import { Play, Video, X } from 'lucide-vue-next'

defineProps<{
  videoUrl: string
  thumbnailUrl?: string
  title?: string
}>()

const isPlayerOpen = ref(false)
</script>

<template>
  <div v-if="videoUrl" class="space-y-2.5">
    <h2 class="font-outfit font-semibold text-sm text-text">Video Produk</h2>

    <button
      type="button"
      @click="isPlayerOpen = true"
      class="relative w-[180px] h-[125px] rounded-xl overflow-hidden bg-surface-2 border border-border group cursor-pointer block"
      aria-label="Putar Video Produk"
    >
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="title || 'Video Thumbnail'"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-text-subtle">
        <Video class="w-8 h-8" />
      </div>

      <!-- Dark Scrim -->
      <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>

      <!-- Play Circle -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-11 h-11 rounded-full bg-black/60 border border-white/80 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
          <Play class="w-5 h-5 fill-white text-white ml-0.5" />
        </div>
      </div>

      <!-- Bottom "Putar Video" Badge -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/70 text-white font-outfit font-semibold text-[10px] flex items-center gap-1 whitespace-nowrap">
        <Video class="w-3 h-3 text-white" />
        <span>Putar Video</span>
      </div>
    </button>

    <!-- Video Player Lightbox -->
    <Teleport to="body">
      <div
        v-if="isPlayerOpen"
        class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        @click="isPlayerOpen = false"
      >
        <div class="relative w-full max-w-2xl" @click.stop>
          <button
            type="button"
            @click="isPlayerOpen = false"
            class="absolute -top-11 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
          <video
            :src="videoUrl"
            controls
            autoplay
            playsinline
            class="w-full max-h-[80vh] rounded-2xl bg-black"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

