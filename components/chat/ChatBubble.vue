<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  RotateCcw,
  Trash2,
  Copy,
  CornerUpLeft,
  Play,
} from 'lucide-vue-next'
import {
  CHAT_STATUS_LOADING,
  CHAT_STATUS_FAIL,
  CHAT_STATUS_SENT,
  CHAT_STATUS_READ,
} from '~/utils/constants'
import type {
  ChatMessage,
  NegotiationChatModel,
  ProductChatModel,
  RequestChatModel,
  TransactionChatModel,
} from '~/types/chat'
import ChatBubbleLiveRequest from '~/components/chat/bubbles/ChatBubbleLiveRequest.vue'
import ChatBubbleNegotiation from '~/components/chat/bubbles/ChatBubbleNegotiation.vue'
import ChatBubbleProduct from '~/components/chat/bubbles/ChatBubbleProduct.vue'
import ChatBubbleTransaction from '~/components/chat/bubbles/ChatBubbleTransaction.vue'

const props = defineProps<{
  chat: ChatMessage
  showDateSeparator?: boolean
  compact?: boolean
  isActionLoading?: boolean
  hideReply?: boolean
}>()

const emit = defineEmits<{
  (e: 'copy', text: string): void
  (e: 'reply', text: string): void
  (e: 'retry', chat: ChatMessage): void
  (e: 'delete-failed', chat: ChatMessage): void
  (e: 'preview-media', payload: { url: string; isVideo: boolean }): void
  (e: 'show-live-info'): void
  (e: 'take-live-photo', req: RequestChatModel): void
  (e: 'take-live-video', req: RequestChatModel): void
  (e: 'accept-nego', nego: NegotiationChatModel): void
  (e: 'decline-nego', nego: NegotiationChatModel): void
  (e: 'update-nego', nego: NegotiationChatModel): void
  (e: 'add-cart-product', product: ProductChatModel): void
  (e: 'buy-now-product', product: ProductChatModel): void
  (e: 'add-cart-nego', nego: NegotiationChatModel): void
  (e: 'open-product', id: string): void
  (e: 'open-transaction', id: string): void
}>()

const showActionMenu = ref(false)

const isMe = computed(() => props.chat.type === 0)

const isLiveMessageType = computed(() =>
  Boolean(props.chat.request_id || (props.chat.request && props.chat.request.id)),
)

const resolvedLiveType = computed<'req-live-photo' | 'req-live-video' | 'live-photo' | 'live-video'>(() => {
  const rType = props.chat.request?.type || 'photo'
  if (props.chat.image) return 'live-photo'
  if (props.chat.video || props.chat.video_expired) return 'live-video'
  return rType === 'video' ? 'req-live-video' : 'req-live-photo'
})

const SAFE_HTTP_URL_RE = /^https?:\/\//i
const SAFE_DATA_IMAGE_RE = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i
const SAFE_STATIC_PATH_RE = /^\/(?:images|assets)\/[^\s]+$/
const BASE64_BODY_RE = /^\/?[A-Za-z0-9+/=]+$/

const imagePreviewSrc = computed(() => {
  const raw = (props.chat.image || '').trim()
  if (!raw) return ''
  if (SAFE_HTTP_URL_RE.test(raw) || SAFE_DATA_IMAGE_RE.test(raw) || SAFE_STATIC_PATH_RE.test(raw)) {
    return raw
  }
  if (/^data:/i.test(raw)) {
    return ''
  }
  const compact = raw.replace(/\s+/g, '')
  if (BASE64_BODY_RE.test(compact)) {
    return `data:image/jpeg;base64,${compact}`
  }
  return ''
})

const safeVideoSrc = computed(() => {
  const raw = (props.chat.video || '').trim()
  if (!raw) return ''
  if (/^(?:https?:\/\/|blob:|\/[^/])/i.test(raw)) {
    return raw
  }
  return ''
})

const hasStandaloneMedia = computed(() => {
  if (isLiveMessageType.value) return false
  return Boolean(props.chat.image || props.chat.video || props.chat.video_expired)
})

const hasTextBubble = computed(() => {
  if (props.chat.anomaly) return true
  if (isLiveMessageType.value) return false
  return Boolean(
    props.chat.message ||
      props.chat.reply ||
      hasStandaloneMedia.value,
  )
})
</script>

<template>
  <div class="space-y-3">
    <!-- Date Separator Pill -->
    <div v-if="showDateSeparator && chat.date" class="flex justify-center py-1">
      <span class="px-3 py-1 rounded-lg bg-surface-2 border border-border-light font-outfit font-medium text-[11px] text-text-muted">
        {{ chat.date }}
      </span>
    </div>

    <!-- Message Row -->
    <div
      class="flex flex-col"
      :class="isMe ? 'items-end' : 'items-start'"
    >
      <div
        class="flex flex-col space-y-2 max-w-[88%] sm:max-w-[78%]"
        :class="isMe ? 'items-end' : 'items-start'"
      >
        <!-- 1. Anomaly / Moderation Filtered Bubble -->
        <div
          v-if="chat.anomaly"
          class="px-3.5 py-2.5 rounded-2xl bg-surface-2 border border-border inline-flex items-center gap-2 text-text-muted"
        >
          <AlertCircle class="w-4 h-4 shrink-0 text-text-muted" />
          <span class="font-outfit italic text-xs sm:text-sm">
            Pesan tidak dapat ditampilkan
          </span>
        </div>

        <template v-else>
          <!-- 2. Live Photo / Live Video Request or Fulfillment Card -->
          <div
            v-if="isLiveMessageType && chat.request"
            class="flex flex-col"
            :class="isMe ? 'items-end' : 'items-start'"
          >
            <ChatBubbleLiveRequest
              :request="chat.request"
              :type="resolvedLiveType"
              :media-url="resolvedLiveType === 'live-video' ? safeVideoSrc : imagePreviewSrc"
              :caption="chat.message"
              :compact="compact"
              @show-info="emit('show-live-info')"
              @take-photo="emit('take-live-photo', $event)"
              @take-video="emit('take-live-video', $event)"
              @preview-media="emit('preview-media', $event)"
              @open-product="emit('open-product', $event.id)"
            />

            <!-- Timestamp & Status below Live Card -->
            <div class="flex items-center gap-1 mt-1 px-1">
              <span class="font-outfit text-[11px] text-text-muted">{{ chat.time }}</span>
              <template v-if="isMe">
                <Clock v-if="chat.status === CHAT_STATUS_LOADING" class="w-3 h-3 text-text-muted" />
                <AlertCircle v-else-if="chat.status === CHAT_STATUS_FAIL" class="w-3.5 h-3.5 text-danger" />
                <CheckCheck v-else-if="chat.status === CHAT_STATUS_READ" class="w-3.5 h-3.5 text-primary" />
                <Check v-else-if="chat.status === CHAT_STATUS_SENT" class="w-3.5 h-3.5 text-text-muted" />
              </template>
            </div>
          </div>

          <!-- 3. Negotiation Card -->
          <div
            v-if="chat.negotiation && (chat.negotiation.nego_id || chat.negotiation.product_id)"
            class="flex flex-col"
            :class="isMe ? 'items-end' : 'items-start'"
          >
            <ChatBubbleNegotiation
              :nego="chat.negotiation"
              :compact="compact"
              :is-action-loading="isActionLoading"
              @accept="emit('accept-nego', $event)"
              @decline="emit('decline-nego', $event)"
              @update-offer="emit('update-nego', $event)"
              @add-cart="emit('add-cart-nego', $event)"
              @open-product="emit('open-product', $event.product_id)"
            />
            <div v-if="!hasTextBubble" class="flex items-center gap-1 mt-1 px-1">
              <span class="font-outfit text-[11px] text-text-muted">{{ chat.time }}</span>
            </div>
          </div>

          <!-- 4. Product Context Card -->
          <div
            v-if="chat.product && chat.product.id && (!chat.negotiation || !chat.negotiation.nego_id)"
            class="flex flex-col"
            :class="isMe ? 'items-end' : 'items-start'"
          >
            <ChatBubbleProduct
              :product="chat.product"
              :compact="compact"
              @add-cart="emit('add-cart-product', $event)"
              @buy-now="emit('buy-now-product', $event)"
              @open-product="emit('open-product', $event.id)"
            />
            <div v-if="!hasTextBubble" class="flex items-center gap-1 mt-1 px-1">
              <span class="font-outfit text-[11px] text-text-muted">{{ chat.time }}</span>
            </div>
          </div>

          <!-- 5. Transaction Context Card -->
          <div
            v-if="chat.transaction && chat.transaction.id"
            class="flex flex-col"
            :class="isMe ? 'items-end' : 'items-start'"
          >
            <ChatBubbleTransaction
              :transaction="chat.transaction"
              :compact="compact"
              @open-transaction="emit('open-transaction', $event.id)"
            />
            <div v-if="!hasTextBubble" class="flex items-center gap-1 mt-1 px-1">
              <span class="font-outfit text-[11px] text-text-muted">{{ chat.time }}</span>
            </div>
          </div>

          <!-- 6. Text / Reply / Standalone Photo / Video Bubble -->
          <div
            v-if="hasTextBubble"
            class="relative group"
            @mouseenter="showActionMenu = true"
            @mouseleave="showActionMenu = false"
          >
            <!-- Hover Quick Action Bar (Copy & Reply) -->
            <div
              v-if="chat.message && showActionMenu"
              class="absolute -top-8 z-10 bg-white border border-border-light rounded-lg shadow-md px-1.5 py-1 flex items-center gap-1"
              :class="isMe ? 'right-0' : 'left-0'"
            >
              <button
                v-if="!hideReply"
                type="button"
                @click.stop="emit('reply', chat.message)"
                class="px-2 py-0.5 rounded-md hover:bg-surface-2 text-[11px] font-outfit font-medium text-text flex items-center gap-1 cursor-pointer"
                title="Balas Pesan"
              >
                <CornerUpLeft class="w-3 h-3 text-text-muted" />
                <span>Balas</span>
              </button>
              <button
                type="button"
                @click.stop="emit('copy', chat.message)"
                class="px-2 py-0.5 rounded-md hover:bg-surface-2 text-[11px] font-outfit font-medium text-text flex items-center gap-1 cursor-pointer"
                title="Salin Pesan"
              >
                <Copy class="w-3 h-3 text-text-muted" />
                <span>Salin</span>
              </button>
            </div>

            <!-- Bubble Container (matches chat_bubble.dart: my=#FCECEF, partner=#F5F5F5) -->
            <div
              class="rounded-2xl px-3.5 py-2.5 space-y-2 shadow-2xs"
              :class="
                isMe
                  ? 'bg-chip-soft-bg border border-chip-soft-border rounded-br-xs'
                  : 'bg-surface-2 border border-border-light rounded-bl-xs'
              "
            >
              <!-- Quoted Reply Block -->
              <div
                v-if="chat.reply"
                class="px-2.5 py-1.5 rounded-lg border-l-3 border-primary bg-black/5 font-outfit text-xs text-text-muted line-clamp-2"
              >
                {{ chat.reply }}
              </div>

              <!-- Standalone Image Attachment -->
              <div
                v-if="imagePreviewSrc && !isLiveMessageType"
                class="rounded-xl overflow-hidden bg-black/5 max-w-[260px] max-h-[260px] cursor-pointer"
                @click.stop="emit('preview-media', { url: imagePreviewSrc, isVideo: false })"
              >
                <img
                  :src="imagePreviewSrc"
                  alt="Lampiran Foto"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>

              <!-- Standalone Video Attachment -->
              <div v-if="(chat.video || chat.video_expired) && !isLiveMessageType">
                <div
                  v-if="!safeVideoSrc || chat.video_expired"
                  class="rounded-xl bg-white/80 border border-border p-2.5 flex items-center gap-2 text-text-muted"
                >
                  <AlertCircle class="w-4 h-4 shrink-0 text-text-muted" />
                  <span class="font-outfit italic text-xs">Video telah kadaluarsa</span>
                </div>

                <div
                  v-else
                  class="relative rounded-xl overflow-hidden bg-black max-w-[260px] aspect-4/3 cursor-pointer group/vid"
                  @click.stop="emit('preview-media', { url: safeVideoSrc, isVideo: true })"
                >
                  <video
                    :src="safeVideoSrc"
                    preload="metadata"
                    muted
                    playsinline
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/vid:bg-black/40 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <Play class="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Text + Inline Timestamp & Check Icon (matches reference screenshot 2 & 3) -->
              <div class="flex items-end justify-between gap-3 flex-wrap">
                <p
                  v-if="chat.message"
                  class="font-outfit text-sm text-text leading-relaxed whitespace-pre-line break-words"
                >
                  {{ chat.message }}
                </p>

                <div class="flex items-center gap-1 ml-auto shrink-0 pt-0.5">
                  <span class="font-outfit text-[11px] text-text-muted leading-none">
                    {{ chat.time }}
                  </span>

                  <template v-if="isMe">
                    <Clock
                      v-if="chat.status === CHAT_STATUS_LOADING"
                      class="w-3 h-3 text-text-muted"
                    />
                    <AlertCircle
                      v-else-if="chat.status === CHAT_STATUS_FAIL"
                      class="w-3.5 h-3.5 text-danger"
                    />
                    <CheckCheck
                      v-else-if="chat.status === CHAT_STATUS_READ"
                      class="w-3.5 h-3.5 text-primary"
                    />
                    <Check
                      v-else-if="chat.status === CHAT_STATUS_SENT"
                      class="w-3.5 h-3.5 text-text-muted"
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Failed Message Action Row (Retry / Delete) -->
        <div
          v-if="isMe && chat.status === CHAT_STATUS_FAIL"
          class="flex items-center gap-3 px-1 pt-0.5"
        >
          <span class="font-outfit text-[11px] text-danger">Gagal terkirim</span>
          <button
            type="button"
            @click="emit('retry', chat)"
            class="inline-flex items-center gap-1 font-outfit font-semibold text-[11px] text-primary hover:underline cursor-pointer"
          >
            <RotateCcw class="w-3 h-3" />
            <span>Kirim Ulang</span>
          </button>
          <button
            type="button"
            @click="emit('delete-failed', chat)"
            class="inline-flex items-center gap-1 font-outfit font-semibold text-[11px] text-text-muted hover:text-danger cursor-pointer"
          >
            <Trash2 class="w-3 h-3" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
