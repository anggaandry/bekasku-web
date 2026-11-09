<script setup lang="ts">
import { MessageSquare, Send, X } from 'lucide-vue-next'
import type { ProductDiscussion } from '~/types/product'

const props = defineProps<{
  discussions: ProductDiscussion[]
  totalDiscussion: number
  isLoading?: boolean
  isSending?: boolean
  isMine?: boolean
  isLoggedIn?: boolean
}>()

const emit = defineEmits<{
  (e: 'send-discussion', text: string): void
  (e: 'require-auth'): void
}>()

const isAllModalOpen = ref(false)
const newComment = ref('')

const topDiscussions = computed(() => props.discussions.slice(0, 2))
const countLabel = computed(() => props.totalDiscussion || props.discussions.length || 0)

function getCommentText(item: ProductDiscussion): string {
  return item.comment || item.discussion || ''
}

function getDateText(item: ProductDiscussion): string {
  if (item.time) return item.time
  if (!item.createdAt) return ''
  try {
    const d = new Date(item.createdAt)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return item.createdAt
  }
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function handleStartDiscussion() {
  if (!props.isLoggedIn) {
    emit('require-auth')
    return
  }
  isAllModalOpen.value = true
}

function handleSubmit() {
  if (!props.isLoggedIn) {
    emit('require-auth')
    return
  }
  if (!newComment.value.trim() || props.isSending) return
  emit('send-discussion', newComment.value.trim())
  newComment.value = ''
}
</script>

<template>
  <div class="space-y-3.5">
    <!-- Header with total and see all -->
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold text-text">
        Diskusi {{ countLabel > 0 ? `(${countLabel})` : '' }}
      </h2>

      <button
        v-if="discussions.length > 0"
        type="button"
        class="text-xs text-primary font-semibold hover:underline cursor-pointer"
        @click="isAllModalOpen = true"
      >
        Lihat semua
      </button>
    </div>

    <!-- Top 2 Discussions Preview (product_discuss_preview.dart) -->
    <div v-if="topDiscussions.length > 0" class="space-y-3">
      <div
        v-for="item in topDiscussions"
        :key="item._id || item.id"
        class="space-y-2 pb-3 border-b border-border/50 last:border-b-0 last:pb-0 text-xs"
      >
        <div class="flex items-start gap-2.5">
          <!-- User Avatar -->
          <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden text-[11px]">
            <img
              v-if="item.user_avatar"
              :src="sanitizeMediaUrl(item.user_avatar, '')"
              :alt="item.user_name"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ getInitials(item.user_name) }}</span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="font-semibold text-text truncate">{{ item.user_name }}</span>
                <span
                  v-if="item.seller"
                  class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold shrink-0"
                >
                  Penjual
                </span>
              </div>
              <span class="text-[11px] text-text-muted shrink-0">{{ getDateText(item) }}</span>
            </div>
            <p class="text-text/80 leading-relaxed">{{ getCommentText(item) }}</p>
          </div>
        </div>

        <!-- Replies -->
        <div
          v-if="item.reply && item.reply.length > 0"
          class="pl-7 border-l-2 border-border/70 ml-3.5 space-y-2 pt-1"
        >
          <div
            v-for="(rep, rIdx) in item.reply"
            :key="rep._id || rIdx"
            class="flex items-start gap-2"
          >
            <div class="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden text-[10px]">
              <img
                v-if="rep.user_avatar"
                :src="sanitizeMediaUrl(rep.user_avatar, '')"
                :alt="rep.user_name"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(rep.user_name) }}</span>
            </div>
            <div class="flex-1 min-w-0 space-y-0.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-semibold text-text truncate text-[11px]">{{ rep.user_name }}</span>
                  <span
                    v-if="rep.seller"
                    class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[9px] font-bold shrink-0"
                  >
                    Penjual
                  </span>
                </div>
                <span class="text-[10px] text-text-muted shrink-0">{{ rep.time }}</span>
              </div>
              <p class="text-text/80 text-[11px] leading-relaxed">{{ rep.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="py-2 text-xs text-text-muted">
      Belum ada diskusi untuk produk ini
    </div>

    <!-- Mulai Diskusi Button (shown when not seller's own product, matching mobile V3) -->
    <button
      v-if="!isMine"
      type="button"
      class="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 text-xs font-semibold transition-colors cursor-pointer"
      @click="handleStartDiscussion"
    >
      Mulai diskusi
    </button>

    <!-- All Discussions & Input Modal -->
    <Teleport to="body">
      <div
        v-if="isAllModalOpen"
        class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click="isAllModalOpen = false"
      >
        <div
          class="bg-white text-text w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl max-h-[85vh]"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h3 class="text-base font-bold text-text">Diskusi Produk ({{ countLabel }})</h3>
            <button
              type="button"
              class="text-text-muted hover:text-text p-1 rounded-lg cursor-pointer"
              @click="isAllModalOpen = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body: Full Discussion List -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="discussions.length > 0" class="space-y-4">
              <div
                v-for="item in discussions"
                :key="item._id || item.id"
                class="space-y-2 pb-3 border-b border-border/60 last:border-b-0 text-xs"
              >
                <div class="flex items-start gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden text-[11px]">
                    <img
                      v-if="item.user_avatar"
                      :src="sanitizeMediaUrl(item.user_avatar, '')"
                      :alt="item.user_name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{ getInitials(item.user_name) }}</span>
                  </div>
                  <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="font-semibold text-text truncate">{{ item.user_name }}</span>
                        <span
                          v-if="item.seller"
                          class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold shrink-0"
                        >
                          Penjual
                        </span>
                      </div>
                      <span class="text-[11px] text-text-muted shrink-0">{{ getDateText(item) }}</span>
                    </div>
                    <p class="text-text/85 leading-relaxed">{{ getCommentText(item) }}</p>
                  </div>
                </div>

                <!-- Replies -->
                <div
                  v-if="item.reply && item.reply.length > 0"
                  class="pl-7 border-l-2 border-border/70 ml-3.5 space-y-2 pt-1"
                >
                  <div
                    v-for="(rep, rIdx) in item.reply"
                    :key="rep._id || rIdx"
                    class="flex items-start gap-2"
                  >
                    <div class="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden text-[10px]">
                      <img
                        v-if="rep.user_avatar"
                        :src="sanitizeMediaUrl(rep.user_avatar, '')"
                        :alt="rep.user_name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else>{{ getInitials(rep.user_name) }}</span>
                    </div>
                    <div class="flex-1 min-w-0 space-y-0.5">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="font-semibold text-text truncate text-[11px]">{{ rep.user_name }}</span>
                          <span
                            v-if="rep.seller"
                            class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[9px] font-bold shrink-0"
                          >
                            Penjual
                          </span>
                        </div>
                        <span class="text-[10px] text-text-muted shrink-0">{{ rep.time }}</span>
                      </div>
                      <p class="text-text/80 text-[11px] leading-relaxed">{{ rep.comment }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-10 text-xs text-text-muted space-y-1">
              <MessageSquare class="w-8 h-8 mx-auto text-text-muted/40 mb-2" />
              <p class="font-semibold text-text">Belum ada diskusi</p>
              <p>Tanyakan ketersediaan stok atau kondisi barang kepada penjual.</p>
            </div>
          </div>

          <!-- Modal Footer: Send Comment Form -->
          <form
            v-if="!isMine"
            class="p-3.5 border-t border-border flex items-center gap-2 bg-surface/50 rounded-b-2xl"
            @submit.prevent="handleSubmit"
          >
            <input
              v-model="newComment"
              type="text"
              placeholder="Tulis pertanyaan seputar produk..."
              class="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white border border-border focus:border-primary outline-hidden transition-colors"
            />
            <button
              type="submit"
              :disabled="!newComment.trim() || isSending"
              class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
