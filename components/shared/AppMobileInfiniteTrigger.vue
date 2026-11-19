<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    hasMore: boolean
    loading?: boolean
    loadingText?: string
    buttonText?: string
    buttonClass?: string
  }>(),
  {
    loading: false,
    loadingText: 'Memuat produk...',
    buttonText: 'Muat Lebih Banyak',
    buttonClass:
      'bg-white hover:bg-surface-2 border-2 border-text text-text font-outfit font-bold text-xs sm:text-sm px-8 py-2.5 rounded-full shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2',
  }
)

const emit = defineEmits<{
  loadMore: []
}>()

const sentinelRef = ref<HTMLElement | null>(null)
const isIntersecting = ref(false)
let observer: IntersectionObserver | null = null
let lastEmitAt = 0

function tryLoadMore() {
  if (!import.meta.client) return
  if (window.innerWidth >= 768) return
  if (!props.hasMore || props.loading) return

  const now = Date.now()
  if (now - lastEmitAt < 250) return
  lastEmitAt = now
  emit('loadMore')
}

function setupObserver() {
  if (!import.meta.client || !sentinelRef.value) return
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      isIntersecting.value = Boolean(entry?.isIntersecting)
      if (isIntersecting.value) {
        tryLoadMore()
      }
    },
    { rootMargin: '260px 0px', threshold: 0 }
  )
  observer.observe(sentinelRef.value)
}

onMounted(() => {
  setupObserver()
})

watch(sentinelRef, () => {
  setupObserver()
})

watch(
  () => [props.loading, props.hasMore] as const,
  ([loading, hasMore]) => {
    if (!loading && hasMore && isIntersecting.value) {
      setTimeout(tryLoadMore, 150)
    }
  }
)

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div v-if="hasMore || loading">
    <!-- Mobile (< md): Auto infinite scroll sentinel -->
    <div ref="sentinelRef" class="md:hidden flex items-center justify-center py-4 min-h-[40px]">
      <div v-if="loading" class="inline-flex items-center gap-2 text-xs font-medium text-text-muted">
        <RefreshCw class="w-4 h-4 animate-spin text-primary" />
        <span>{{ loadingText }}</span>
      </div>
    </div>

    <!-- Desktop (>= md): Manual Load More button -->
    <div v-if="hasMore" class="hidden md:flex justify-center pt-5 pb-2">
      <button
        type="button"
        :disabled="loading"
        :class="buttonClass"
        @click="emit('loadMore')"
      >
        <RefreshCw v-if="loading" class="w-4 h-4 animate-spin" />
        <span>{{ loading ? loadingText : buttonText }}</span>
      </button>
    </div>
  </div>
</template>
