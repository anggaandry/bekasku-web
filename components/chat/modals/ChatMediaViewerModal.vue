<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { X, ZoomIn, ZoomOut } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  mediaUrl: string
  isVideo?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const zoomed = ref(false)

const SAFE_MEDIA_URL_RE = /^(?:https?:\/\/|blob:|\/[^/]|data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$)/i

const safeMediaUrl = computed(() => {
  const raw = (props.mediaUrl || '').trim()
  if (!raw) return ''
  return SAFE_MEDIA_URL_RE.test(raw) ? raw : ''
})

function handleWindowKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      zoomed.value = false
      if (import.meta.client) {
        window.addEventListener('keydown', handleWindowKeydown)
      }
    } else if (import.meta.client) {
      window.removeEventListener('keydown', handleWindowKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleWindowKeydown)
  }
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue && safeMediaUrl"
      class="fixed inset-0 z-[90] bg-black/95 flex flex-col justify-between font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Media Chat"
      @click="close"
    >
      <!-- Header -->
      <div
        class="px-4 py-3.5 flex items-center justify-between text-white border-b border-white/10"
        @click.stop
      >
        <button
          type="button"
          @click="close"
          class="w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Tutup Pratinjau"
        >
          <X class="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          v-if="!isVideo"
          type="button"
          @click="zoomed = !zoomed"
          class="w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          :aria-label="zoomed ? 'Perkecil Gambar' : 'Perbesar Gambar'"
        >
          <ZoomOut v-if="zoomed" class="w-4 h-4" aria-hidden="true" />
          <ZoomIn v-else class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Content -->
      <div
        class="flex-1 flex items-center justify-center overflow-auto p-4"
        @click.stop
      >
        <video
          v-if="isVideo"
          :src="safeMediaUrl"
          controls
          autoplay
          playsinline
          class="max-h-[82vh] max-w-full rounded-xl"
        />
        <img
          v-else
          :src="safeMediaUrl"
          alt="Media Chat"
          class="max-h-[82vh] w-auto object-contain rounded-xl transition-transform duration-200"
          :class="zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'"
          @click="zoomed = !zoomed"
        />
      </div>
    </div>
  </Teleport>
</template>

