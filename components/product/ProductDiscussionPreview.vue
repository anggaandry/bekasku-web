<script setup lang="ts">
import { ArrowLeft, Loader2, MessageSquare, Send, X } from 'lucide-vue-next'
import type { ProductDiscussion } from '~/types/product'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  discussions: ProductDiscussion[]
  allDiscussions?: ProductDiscussion[]
  totalDiscussion: number
  isLoading?: boolean
  isAllLoading?: boolean
  isSending?: boolean
  replies?: any[]
  repliesLoading?: boolean
  replySending?: boolean
  isMine?: boolean
  isLoggedIn?: boolean
}>()

const emit = defineEmits<{
  (e: 'send-discussion', text: string): void
  (e: 'open-all'): void
  (e: 'open-sub-discussion', discussionId: string): void
  (e: 'send-reply', payload: { discussionId: string; text: string }): void
  (e: 'require-auth'): void
}>()

const isAllModalOpen = ref(false)
const activeSubDiscussion = ref<ProductDiscussion | null>(null)
const newComment = ref('')
const newReply = ref('')

const topDiscussions = computed(() => props.discussions.slice(0, 2))
const modalDiscussions = computed(() => {
  if (props.allDiscussions && props.allDiscussions.length > 0) {
    return props.allDiscussions
  }
  return props.discussions
})
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

function openAllModal() {
  activeSubDiscussion.value = null
  isAllModalOpen.value = true
  emit('open-all')
}

function handleStartDiscussion() {
  if (!props.isLoggedIn) {
    emit('require-auth')
    return
  }
  openAllModal()
}

function openSubDiscussion(item: ProductDiscussion) {
  const id = String(item._id || item.id || '')
  if (!id) return
  activeSubDiscussion.value = item
  isAllModalOpen.value = true
  emit('open-sub-discussion', id)
}

function closeModal() {
  isAllModalOpen.value = false
  activeSubDiscussion.value = null
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

function handleSubmitReply() {
  if (!props.isLoggedIn) {
    emit('require-auth')
    return
  }
  const discussionId = String(activeSubDiscussion.value?._id || activeSubDiscussion.value?.id || '')
  if (!discussionId || !newReply.value.trim() || props.replySending) return
  emit('send-reply', { discussionId, text: newReply.value.trim() })
  newReply.value = ''
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
        @click="openAllModal"
      >
        Lihat semua
      </button>
    </div>

    <!-- Top 2 Discussions Preview -->
    <div v-if="topDiscussions.length > 0" class="space-y-3">
      <div
        v-for="item in topDiscussions"
        :key="item._id || item.id"
        class="space-y-2 pb-3 border-b border-border/50 last:border-b-0 last:pb-0 text-xs"
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
            <p class="text-text/80 leading-relaxed">{{ getCommentText(item) }}</p>
            <button
              type="button"
              class="text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
              @click="openSubDiscussion(item)"
            >
              {{ item.reply && item.reply.length > 0 ? `Lihat ${item.reply.length} balasan` : 'Balas diskusi' }}
            </button>
          </div>
        </div>

        <!-- Preview Replies -->
        <div
          v-if="item.reply && item.reply.length > 0"
          class="pl-7 border-l-2 border-border/70 ml-3.5 space-y-2 pt-1"
        >
          <div
            v-for="(rep, rIdx) in item.reply.slice(0, 2)"
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

    <!-- Mulai Diskusi Button -->
    <button
      v-if="!isMine"
      type="button"
      class="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 text-xs font-semibold transition-colors cursor-pointer"
      @click="handleStartDiscussion"
    >
      Mulai diskusi
    </button>

    <!-- All Discussions & Sub-Discussion Modal (Responsive Mobile Bottom Sheet + Desktop Dialog) -->
    <Teleport to="body">
      <div
        v-if="isAllModalOpen"
        class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click="closeModal"
      >
        <div
          class="bg-white text-text w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl max-h-[85vh]"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-border shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <button
                v-if="activeSubDiscussion"
                type="button"
                class="p-1 -ml-1 text-text-muted hover:text-text rounded-lg cursor-pointer"
                aria-label="Kembali ke daftar diskusi"
                @click="activeSubDiscussion = null"
              >
                <ArrowLeft class="w-5 h-5" />
              </button>
              <h3 class="text-base font-bold text-text truncate">
                {{ activeSubDiscussion ? 'Sub-Diskusi' : `Diskusi Produk (${countLabel})` }}
              </h3>
            </div>
            <button
              type="button"
              class="text-text-muted hover:text-text p-1 rounded-lg cursor-pointer shrink-0"
              aria-label="Tutup modal"
              @click="closeModal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- VIEW 1: Sub-Diskusi (Replies Thread) -->
          <template v-if="activeSubDiscussion">
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <!-- Parent Question -->
              <div class="p-3 rounded-xl bg-surface-2/70 border border-border/60 text-xs space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-bold text-text truncate">{{ activeSubDiscussion.user_name }}</span>
                    <span
                      v-if="activeSubDiscussion.seller"
                      class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold shrink-0"
                    >
                      Penjual
                    </span>
                  </div>
                  <span class="text-[11px] text-text-muted shrink-0">{{ getDateText(activeSubDiscussion) }}</span>
                </div>
                <p class="text-text/90 leading-relaxed">{{ getCommentText(activeSubDiscussion) }}</p>
              </div>

              <!-- Replies Loading Shimmer -->
              <div v-if="repliesLoading" class="space-y-3">
                <div v-for="n in 3" :key="`rep-skel-${n}`" class="h-12 rounded-xl bg-surface-2 animate-shimmer" />
              </div>

              <!-- Replies List -->
              <div v-else-if="replies && replies.length > 0" class="space-y-3 pl-3 border-l-2 border-border">
                <div
                  v-for="(rep, rIdx) in replies"
                  :key="rep._id || rep.id || rIdx"
                  class="flex items-start gap-2.5 text-xs"
                >
                  <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden text-[10px]">
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
                        <span class="font-semibold text-text truncate">{{ rep.user_name }}</span>
                        <span
                          v-if="rep.seller"
                          class="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[9px] font-bold shrink-0"
                        >
                          Penjual
                        </span>
                      </div>
                      <span class="text-[10px] text-text-muted shrink-0">{{ rep.time || getDateText(rep) }}</span>
                    </div>
                    <p class="text-text/85 leading-relaxed">{{ rep.comment || rep.discussion }}</p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-6 text-xs text-text-muted">
                Belum ada balasan pada diskusi ini.
              </div>
            </div>

            <!-- Send Reply Form -->
            <form
              class="p-3.5 border-t border-border flex items-center gap-2 bg-surface/50 rounded-b-2xl shrink-0"
              @submit.prevent="handleSubmitReply"
            >
              <input
                v-model="newReply"
                type="text"
                placeholder="Tulis balasan diskusi..."
                class="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white border border-border focus:border-primary outline-hidden transition-colors"
              />
              <button
                type="submit"
                :disabled="!newReply.trim() || replySending"
                class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Loader2 v-if="replySending" class="w-3.5 h-3.5 animate-spin" />
                <Send v-else class="w-3.5 h-3.5" />
                <span>{{ replySending ? 'Mengirim...' : 'Balas' }}</span>
              </button>
            </form>
          </template>

          <!-- VIEW 2: Full Discussion List -->
          <template v-else>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="isAllLoading && modalDiscussions.length === 0" class="space-y-3">
                <div v-for="n in 3" :key="`disc-skel-${n}`" class="h-16 rounded-xl bg-surface-2 animate-shimmer" />
              </div>

              <div v-else-if="modalDiscussions.length > 0" class="space-y-4">
                <div
                  v-for="item in modalDiscussions"
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
                      <button
                        type="button"
                        class="text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                        @click="openSubDiscussion(item)"
                      >
                        {{ item.reply && item.reply.length > 0 ? `Lihat ${item.reply.length} balasan` : 'Balas diskusi' }}
                      </button>
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
              class="p-3.5 border-t border-border flex items-center gap-2 bg-surface/50 rounded-b-2xl shrink-0"
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
                <Loader2 v-if="isSending" class="w-3.5 h-3.5 animate-spin" />
                <Send v-else class="w-3.5 h-3.5" />
                <span>{{ isSending ? 'Mengirim...' : 'Kirim' }}</span>
              </button>
            </form>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>
