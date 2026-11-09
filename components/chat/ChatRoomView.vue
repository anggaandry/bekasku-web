<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { MessageSquare, Maximize2, X } from 'lucide-vue-next'
import { useChatStore } from '~/stores/chat'
import { useCartStore } from '~/stores/cart'
import { useChatMedia, type PreparedImage, type PreparedVideo } from '~/composables/useChatMedia'
import type {
  NegotiationChatModel,
  ProductChatModel,
  RequestChatModel,
} from '~/types/chat'
import ChatConversationHeader from '~/components/chat/ChatConversationHeader.vue'
import ChatBubble from '~/components/chat/ChatBubble.vue'
import ChatTypingIndicator from '~/components/chat/ChatTypingIndicator.vue'
import ChatInputArea from '~/components/chat/ChatInputArea.vue'
import ChatSecurityGuideModal from '~/components/chat/modals/ChatSecurityGuideModal.vue'
import ChatLiveInfoModal from '~/components/chat/modals/ChatLiveInfoModal.vue'
import ChatReportModal from '~/components/chat/modals/ChatReportModal.vue'
import ChatImageSendModal from '~/components/chat/modals/ChatImageSendModal.vue'
import ChatVideoSendModal from '~/components/chat/modals/ChatVideoSendModal.vue'
import ChatMediaViewerModal from '~/components/chat/modals/ChatMediaViewerModal.vue'
import ProductNegotiateModal from '~/components/product/ProductNegotiateModal.vue'
import ProductAddCartModal from '~/components/product/ProductAddCartModal.vue'

const props = defineProps<{
  showBackButton?: boolean
  isFloating?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'expand-fullpage'): void
  (e: 'minimize-floating'): void
  (e: 'close-floating'): void
}>()

const chatStore = useChatStore()
const cartStore = useCartStore()
const { showNotification } = useNotification()
const { fileToPreparedImage, fileToPreparedVideo } = useChatMedia()

const scrollContainerRef = ref<HTMLElement | null>(null)

// ── Modals State ────────────────────────────────────────────────────────
const showSecurityModal = ref(false)
const showReportModal = ref(false)
const showLiveInfoModal = ref(false)

// Media Send Modals
const showImageSendModal = ref(false)
const imageModalMode = ref<'camera' | 'gallery'>('camera')
const initialPreparedImage = ref<PreparedImage | null>(null)
const activeMediaRequestId = ref<string>('')

const showVideoSendModal = ref(false)
const videoModalMode = ref<'camera' | 'gallery'>('camera')
const initialPreparedVideo = ref<PreparedVideo | null>(null)

// Media Viewer Lightbox
const showMediaViewer = ref(false)
const viewerMediaUrl = ref('')
const viewerIsVideo = ref(false)

// Negotiation Update Modal
const showNegotiateModal = ref(false)
const activeNegoEdit = ref<NegotiationChatModel | null>(null)

// Add Cart Modal
const showAddCartModal = ref(false)
const addCartStatus = ref<0 | 1>(0)

// Find latest product in conversation for quick Live Photo / Video requests
const latestContextProduct = computed<ProductChatModel | null>(() => {
  for (const msg of chatStore.messages) {
    if (msg.product && msg.product.id && !msg.product.is_seller) {
      return msg.product
    }
    if (msg.negotiation && msg.negotiation.product_id && !msg.negotiation.seller) {
      return {
        id: msg.negotiation.product_id,
        title: msg.negotiation.title,
        image: msg.negotiation.image,
        price: msg.negotiation.price,
        is_seller: msg.negotiation.seller,
      }
    }
  }
  return null
})

function scrollToBottom(smooth = false) {
  if (!import.meta.client) return
  nextTick(() => {
    const el = scrollContainerRef.value
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  })
}

watch(
  () => chatStore.activePartnerId,
  () => {
    scrollToBottom(false)
  },
)

watch(
  () => chatStore.loadingMessages,
  (loading) => {
    if (!loading && chatStore.messagePage <= 2) {
      scrollToBottom(false)
    }
  },
)

watch(
  () => chatStore.messages.length,
  (newLen, oldLen) => {
    if (newLen > 0 && oldLen === 0) {
      scrollToBottom(false)
    } else if (newLen > oldLen && chatStore.messagePage <= 2) {
      scrollToBottom(true)
    }
  },
)

function onScrollMessages(ev: Event) {
  const el = ev.target as HTMLElement
  if (!el) return
  if (el.scrollTop <= 40 && chatStore.hasMoreMessages && !chatStore.loadingOlderMessages) {
    const prevHeight = el.scrollHeight
    chatStore.loadOlderMessages().then(() => {
      nextTick(() => {
        if (scrollContainerRef.value) {
          scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight - prevHeight
        }
      })
    })
  }
}

// ── Message Actions ─────────────────────────────────────────────────────
async function handleCopyMessage(text: string) {
  if (!import.meta.client || !text) return
  try {
    await navigator.clipboard.writeText(text)
    showNotification({ type: 'success', message: 'Berhasil menyalin pesan' })
  } catch {
    showNotification({ type: 'error', message: 'Gagal menyalin pesan' })
  }
}

function handleReplyMessage(text: string) {
  chatStore.replyQuote = text
}

async function handleSendText() {
  await chatStore.sendMessage()
  scrollToBottom(true)
}

function handleQuickReply(chipText: string) {
  chatStore.draftMessage = chipText
}

// ── Photo & Video Capture / Upload Actions ──────────────────────────────
function openCameraPhoto(reqId = '') {
  activeMediaRequestId.value = reqId
  initialPreparedImage.value = null
  imageModalMode.value = 'camera'
  showImageSendModal.value = true
}

async function handleSelectGalleryPhoto(file: File) {
  try {
    activeMediaRequestId.value = ''
    initialPreparedImage.value = await fileToPreparedImage(file, file.name)
    imageModalMode.value = 'gallery'
    showImageSendModal.value = true
  } catch {
    showNotification({ type: 'error', message: 'Gagal memproses file foto' })
  }
}

async function handleConfirmSendImage(payload: { base64: string; caption: string; requestId?: string }) {
  await chatStore.sendMessage({
    text: payload.caption,
    imageBase64: payload.base64,
    reqId: payload.requestId || '',
    reqType: payload.requestId ? 'photo' : '',
  })
  scrollToBottom(true)
}

function openCameraVideo(reqId = '') {
  activeMediaRequestId.value = reqId
  initialPreparedVideo.value = null
  videoModalMode.value = 'camera'
  showVideoSendModal.value = true
}

function handleSelectGalleryVideo(file: File) {
  activeMediaRequestId.value = ''
  initialPreparedVideo.value = fileToPreparedVideo(file)
  videoModalMode.value = 'gallery'
  showVideoSendModal.value = true
}

async function handleConfirmSendVideo(payload: { file: File; caption: string; requestId?: string }) {
  const ok = await chatStore.sendVideoFile({
    file: payload.file,
    caption: payload.caption,
    reqId: payload.requestId || '',
  })
  if (ok) {
    showVideoSendModal.value = false
    scrollToBottom(true)
  }
}

// ── Live Photo / Video Request & Fulfillment ────────────────────────────
async function handleRequestLivePhoto(product: ProductChatModel) {
  await chatStore.sendLiveRequest({
    id: product.id,
    title: product.title,
    image: product.image,
    type: 'photo',
    price: product.price,
  })
  scrollToBottom(true)
}

async function handleRequestLiveVideo(product: ProductChatModel) {
  await chatStore.sendLiveRequest({
    id: product.id,
    title: product.title,
    image: product.image,
    type: 'video',
    price: product.price,
  })
  scrollToBottom(true)
}

function handleSellerTakeLivePhoto(req: RequestChatModel) {
  chatStore.pendingLiveRequest = { ...req, type: 'photo' }
  openCameraPhoto(req.id)
}

function handleSellerTakeLiveVideo(req: RequestChatModel) {
  chatStore.pendingLiveRequest = { ...req, type: 'video' }
  openCameraVideo(req.id)
}

function handlePreviewMedia(payload: { url: string; isVideo: boolean }) {
  viewerMediaUrl.value = payload.url
  viewerIsVideo.value = payload.isVideo
  showMediaViewer.value = true
}

// ── Negotiation Actions ─────────────────────────────────────────────────
async function handleAcceptNego(nego: NegotiationChatModel) {
  await chatStore.respondNegotiation('accept', nego)
}

async function handleDeclineNego(nego: NegotiationChatModel) {
  await chatStore.respondNegotiation('decline', nego)
}

function handleOpenUpdateNego(nego: NegotiationChatModel) {
  activeNegoEdit.value = nego
  showNegotiateModal.value = true
}

async function handleSubmitUpdateNego(newPrice: number) {
  if (!activeNegoEdit.value) return
  const ok = await chatStore.updateNegotiationOffer({
    negoId: activeNegoEdit.value.nego_id,
    productId: activeNegoEdit.value.product_id,
    newPrice,
  })
  if (ok) {
    showNegotiateModal.value = false
    activeNegoEdit.value = null
  }
}

// ── Cart & Checkout Actions from Chat Bubbles ───────────────────────────
async function handleAddCartFromChat(productId: string) {
  if (!productId) return
  addCartStatus.value = 0
  showAddCartModal.value = true
  const res = await cartStore.addToCart(productId, 1)
  if (res.success) {
    addCartStatus.value = 1
  } else {
    showAddCartModal.value = false
    showNotification({ type: 'error', message: res.message || 'Gagal menambahkan ke keranjang' })
  }
}

async function handleBuyNowFromChat(product: ProductChatModel) {
  if (!product.id) return
  const res = await cartStore.addToCart(product.id, 1)
  if (res.success) {
    await navigateTo('/checkout')
  } else {
    showNotification({ type: 'error', message: res.message || 'Gagal memproses pembelian' })
  }
}

async function handleConfirmBlock(reason: string) {
  const ok = await chatStore.blockPartner(reason)
  if (ok) {
    showReportModal.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Empty Conversation Placeholder when no partner selected -->
    <div
      v-if="!chatStore.activePartnerId"
      class="flex-1 flex flex-col h-full bg-surface-2/40 overflow-hidden"
    >
      <!-- Floating action controls when in floating mode -->
      <div
        v-if="isFloating"
        class="px-4 py-3 bg-white border-b border-border-light flex items-center justify-end gap-0.5 shrink-0"
      >
        <button
          type="button"
          @click="emit('expand-fullpage')"
          class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          title="Buka Halaman Chat Penuh"
          aria-label="Buka Halaman Chat Penuh"
        >
          <Maximize2 class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="emit('minimize-floating')"
          class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          title="Perkecil ke Tombol Bawah"
          aria-label="Perkecil Chat ke Tombol Bawah"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-white border border-border-light shadow-2xs flex items-center justify-center text-primary mb-4">
          <MessageSquare class="w-8 h-8" />
        </div>
        <h2 class="font-outfit font-bold text-base sm:text-lg text-text">
          Selamat Datang di Chat BekasKu
        </h2>
        <p class="font-outfit text-xs sm:text-sm text-text-muted mt-1.5 max-w-xs leading-relaxed">
          Pilih salah satu percakapan di sebelah kiri untuk mulai berdiskusi, negosiasi harga, atau meminta live photo &amp; video produk.
        </p>
      </div>
    </div>

    <!-- Active Conversation Room -->
    <template v-else>
      <!-- 1. Top Header -->
      <ChatConversationHeader
        :partner="chatStore.activePartnerProfile"
        :status-text="chatStore.partnerStatus"
        :is-typing="chatStore.isPartnerTyping"
        :is-blocked="chatStore.isBlocked"
        :show-back-button="showBackButton"
        :is-floating="isFloating"
        @back="emit('back')"
        @open-security="showSecurityModal = true"
        @open-block="showReportModal = true"
        @expand-fullpage="emit('expand-fullpage')"
        @minimize-floating="emit('minimize-floating')"
        @close-floating="emit('close-floating')"
      />

      <!-- 2. Scrollable Message List -->
      <div
        ref="scrollContainerRef"
        class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 bg-white"
        @scroll="onScrollMessages"
      >
        <!-- Security Disclaimer Banner (exact copy from chat_view.dart lines 301-329) -->
        <div class="max-w-xl mx-auto px-2 py-2 text-center">
          <p class="font-outfit text-xs text-text-muted leading-relaxed">
            Untuk menghindari penipuan, jangan klik tautan atau lakukan pembayaran di luar BekasKu. Semua transaksi, konfirmasi pembayaran, dan pengiriman dilakukan melalui aplikasi. Jaga kerahasiaan OTP, password, dan data pribadi kamu.
            <button
              type="button"
              @click="showSecurityModal = true"
              class="font-outfit font-medium text-xs text-text underline hover:text-primary transition-colors cursor-pointer ml-0.5"
            >
              Cek Panduan Keamanan
            </button>
          </p>
        </div>

        <!-- Older Messages Spinner -->
        <div
          v-if="chatStore.loadingOlderMessages"
          class="py-2 flex items-center justify-center"
        >
          <span class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>

        <!-- Initial Messages Skeleton -->
        <div v-if="chatStore.loadingMessages && chatStore.messages.length === 0" class="space-y-4 py-4">
          <div class="flex justify-end">
            <div class="w-56 h-12 rounded-2xl bg-surface-2 animate-pulse"></div>
          </div>
          <div class="flex justify-start">
            <div class="w-64 h-16 rounded-2xl bg-surface-2 animate-pulse"></div>
          </div>
          <div class="flex justify-end">
            <div class="w-48 h-10 rounded-2xl bg-surface-2 animate-pulse"></div>
          </div>
        </div>

        <!-- Chronological Messages List -->
        <template v-else>
          <ChatBubble
            v-for="(msg, idx) in chatStore.chronologicalMessages"
            :key="msg.id || idx"
            :chat="msg"
            :compact="compact"
            :is-action-loading="chatStore.actionLoading"
            :show-date-separator="
              idx === 0 ||
              chatStore.chronologicalMessages[idx - 1]?.date !== msg.date
            "
            @copy="handleCopyMessage"
            @reply="handleReplyMessage"
            @retry="chatStore.retryFailedMessage"
            @delete-failed="chatStore.deleteFailedMessage"
            @preview-media="handlePreviewMedia"
            @show-live-info="showLiveInfoModal = true"
            @take-live-photo="handleSellerTakeLivePhoto"
            @take-live-video="handleSellerTakeLiveVideo"
            @accept-nego="handleAcceptNego"
            @decline-nego="handleDeclineNego"
            @update-nego="handleOpenUpdateNego"
            @add-cart-product="handleAddCartFromChat($event.id)"
            @buy-now-product="handleBuyNowFromChat"
            @add-cart-nego="handleAddCartFromChat($event.product_id)"
            @open-product="navigateTo(`/product/${$event}`)"
            @open-transaction="navigateTo(`/transaction/${$event}`)"
          />
        </template>

        <!-- Real-Time Typing Indicator Bubble -->
        <ChatTypingIndicator v-if="chatStore.isPartnerTyping" />
      </div>

      <!-- 3. Bottom Input Area -->
      <ChatInputArea
        v-model="chatStore.draftMessage"
        :reply-quote="chatStore.replyQuote"
        :attached-product="chatStore.attachedProduct"
        :attached-transaction="chatStore.attachedTransaction"
        :active-context-product="latestContextProduct"
        :is-blocked="chatStore.isBlocked"
        :compact="compact"
        @typing="chatStore.notifyTyping"
        @send="handleSendText"
        @quick-reply="handleQuickReply"
        @clear-reply="chatStore.replyQuote = ''"
        @clear-product="chatStore.attachedProduct = null"
        @clear-transaction="chatStore.attachedTransaction = null"
        @open-camera-photo="openCameraPhoto('')"
        @select-gallery-photo="handleSelectGalleryPhoto"
        @open-camera-video="openCameraVideo('')"
        @select-gallery-video="handleSelectGalleryVideo"
        @request-live-photo="handleRequestLivePhoto"
        @request-live-video="handleRequestLiveVideo"
      />
    </template>

    <!-- Modals -->
    <ChatSecurityGuideModal v-model="showSecurityModal" />

    <ChatLiveInfoModal v-model="showLiveInfoModal" />

    <ChatReportModal
      v-model="showReportModal"
      :user-name="chatStore.activePartnerProfile.name"
      :is-submitting="chatStore.actionLoading"
      @submit="handleConfirmBlock"
    />

    <ChatImageSendModal
      v-model="showImageSendModal"
      :initial-mode="imageModalMode"
      :initial-image="initialPreparedImage"
      :request-id="activeMediaRequestId"
      @send="handleConfirmSendImage"
    />

    <ChatVideoSendModal
      v-model="showVideoSendModal"
      :initial-mode="videoModalMode"
      :initial-video="initialPreparedVideo"
      :request-id="activeMediaRequestId"
      :is-uploading="chatStore.actionLoading"
      @send="handleConfirmSendVideo"
    />

    <ChatMediaViewerModal
      v-model="showMediaViewer"
      :media-url="viewerMediaUrl"
      :is-video="viewerIsVideo"
    />

    <ProductNegotiateModal
      v-model="showNegotiateModal"
      :current-price="activeNegoEdit?.price || 0"
      :init-price="activeNegoEdit?.nego_price || 0"
      :old-id="activeNegoEdit?.nego_id || ''"
      :title="activeNegoEdit?.title"
      :image="activeNegoEdit?.image"
      :is-submitting="chatStore.actionLoading"
      @submit="handleSubmitUpdateNego"
    />

    <ProductAddCartModal
      v-model="showAddCartModal"
      :status="addCartStatus"
      @view-cart="showAddCartModal = false; navigateTo('/cart')"
      @continue="showAddCartModal = false"
    />
  </div>
</template>
