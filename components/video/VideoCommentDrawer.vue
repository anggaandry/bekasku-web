<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="font-outfit font-bold text-gray-900 text-sm sm:text-base">
              Komentar
            </h3>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {{ totalCount }}
            </span>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            @click="$emit('update:modelValue', false)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Comments List -->
        <div
          ref="scrollContainerRef"
          class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[240px] max-h-[420px]"
          @scroll="onScroll"
        >
          <!-- Loading state -->
          <div v-if="loading && comments.length === 0" class="flex justify-center py-8">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="comments.length === 0"
            class="text-center py-12 text-gray-400 space-y-2"
          >
            <MessageSquare class="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
            <p class="text-xs sm:text-sm text-gray-500 font-medium">
              Belum ada komentar.
            </p>
            <p class="text-xs text-gray-400">
              Jadilah yang pertama menuliskan komentar!
            </p>
          </div>

          <!-- Items -->
          <template v-else>
            <div
              v-for="item in comments"
              :key="item._id"
              class="flex items-start gap-3 group"
            >
              <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200">
                <img
                  v-if="item.user_avatar && sanitizeMediaUrl(item.user_avatar, '')"
                  :src="sanitizeMediaUrl(item.user_avatar, '')"
                  :alt="item.user_name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200 select-none">
                  {{ (item.user_name || 'U').charAt(0).toUpperCase() }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-gray-900 truncate">
                    {{ item.user_name }}
                  </span>
                  <span class="text-[10px] text-gray-400 shrink-0">
                    {{ item.time || 'Baru saja' }}
                  </span>
                </div>
                <p class="text-xs text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                  {{ item.comment }}
                </p>
              </div>
            </div>

            <!-- Loading more indicator -->
            <div v-if="loadingMore" class="flex justify-center py-2">
              <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </template>
        </div>

        <!-- Sticky Footer Input Bar -->
        <div class="p-3 sm:p-4 border-t border-gray-100 bg-white">
          <form class="flex items-center gap-2" @submit.prevent="handleSubmit">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200 hidden sm:block">
              <img
                v-if="authStore.userAvatar && sanitizeMediaUrl(authStore.userAvatar, '')"
                :src="sanitizeMediaUrl(authStore.userAvatar, '')"
                :alt="authStore.userName || 'User'"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200 select-none">
                {{ (authStore.userName || 'U').charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="flex-1 relative">
              <input
                v-model="inputComment"
                type="text"
                placeholder="Tulis komentar..."
                maxlength="500"
                class="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-100 rounded-full border border-transparent focus:border-primary focus:bg-white focus:outline-hidden transition-all text-gray-900 placeholder:text-gray-400"
                :disabled="isSending"
              />
            </div>

            <button
              type="submit"
              class="w-9 h-9 rounded-full bg-primary hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              :disabled="!inputComment.trim() || isSending"
            >
              <div v-if="isSending" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <Send v-else class="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Send, MessageSquare } from 'lucide-vue-next'
import type { VideoCommentItem } from '~/types/video'
import { useAuthStore } from '~/stores/auth'
import { useVideoFeed } from '~/composables/useVideoFeed'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  modelValue: boolean
  videoId: string
  initialCount?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'countUpdated': [newCount: number]
}>()

const authStore = useAuthStore()
const { fetchComments, postComment } = useVideoFeed()

const comments = ref<VideoCommentItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const isSending = ref(false)
const inputComment = ref('')
const totalCount = ref(props.initialCount || 0)
const page = ref(1)
const hasNextPage = ref(false)
const scrollContainerRef = ref<HTMLDivElement | null>(null)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.videoId) {
      page.value = 1
      comments.value = []
      loading.value = true
      try {
        const res = await fetchComments(props.videoId, 1)
        comments.value = res.comments
        hasNextPage.value = res.hasNextPage
        totalCount.value = res.total
        emit('countUpdated', totalCount.value)
      } finally {
        loading.value = false
      }
    }
  }
)

async function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
    if (!loadingMore.value && hasNextPage.value) {
      loadingMore.value = true
      try {
        const nextPage = page.value + 1
        const res = await fetchComments(props.videoId, nextPage)
        comments.value.push(...res.comments)
        hasNextPage.value = res.hasNextPage
        page.value = nextPage
      } finally {
        loadingMore.value = false
      }
    }
  }
}

async function handleSubmit() {
  const text = inputComment.value.trim()
  if (!text || isSending.value) return

  isSending.value = true
  try {
    const created = await postComment(props.videoId, text)
    comments.value.unshift(created)
    totalCount.value += 1
    emit('countUpdated', totalCount.value)
    inputComment.value = ''

    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = 0
    }
  } catch {
    // silent fail
  } finally {
    isSending.value = false
  }
}
</script>

