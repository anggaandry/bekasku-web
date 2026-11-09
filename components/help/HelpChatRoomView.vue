<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Headset } from 'lucide-vue-next'
import { useHelpChatStore } from '~/stores/helpChat'
import { useChatMedia, type PreparedImage } from '~/composables/useChatMedia'
import { HELP_QUICK_EXPRESSIONS } from '~/utils/constants'
import HelpConversationHeader from '~/components/help/HelpConversationHeader.vue'
import HelpChatInputBar from '~/components/help/HelpChatInputBar.vue'
import ChatBubble from '~/components/chat/ChatBubble.vue'
import ChatTypingIndicator from '~/components/chat/ChatTypingIndicator.vue'
import ChatSecurityGuideModal from '~/components/chat/modals/ChatSecurityGuideModal.vue'
import ChatImageSendModal from '~/components/chat/modals/ChatImageSendModal.vue'
import ChatMediaViewerModal from '~/components/chat/modals/ChatMediaViewerModal.vue'

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

const helpChatStore = useHelpChatStore()
const { showNotification } = useNotification()
const { fileToPreparedImage } = useChatMedia()

const scrollContainerRef = ref<HTMLElement | null>(null)
const showSecurityModal = ref(false)
const showImageSendModal = ref(false)
const imageModalMode = ref<'camera' | 'gallery'>('camera')
const initialPreparedImage = ref<PreparedImage | null>(null)

const showMediaViewer = ref(false)
const viewerMediaUrl = ref('')
const viewerIsVideo = ref(false)

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

onMounted(() => {
  if (helpChatStore.messages.length > 0) {
    scrollToBottom(false)
    setTimeout(() => scrollToBottom(false), 120)
  }
})

watch(
  () => helpChatStore.loadingMessages,
  (loading) => {
    if (!loading && helpChatStore.page <= 2) {
      scrollToBottom(false)
      setTimeout(() => scrollToBottom(false), 120)
    }
  },
)

watch(
  () => helpChatStore.messages.length,
  (newLen, oldLen) => {
    if (newLen > 0 && oldLen === 0) {
      scrollToBottom(false)
      setTimeout(() => scrollToBottom(false), 120)
    } else if (newLen > oldLen && helpChatStore.page <= 2) {
      scrollToBottom(true)
    }
  },
)

function onScrollMessages(ev: Event) {
  const el = ev.target as HTMLElement
  if (!el) return
  if (
    el.scrollTop <= 40 &&
    helpChatStore.hasMoreMessages &&
    !helpChatStore.loadingOlderMessages
  ) {
    const prevHeight = el.scrollHeight
    helpChatStore.loadOlderMessages().then(() => {
      nextTick(() => {
        if (scrollContainerRef.value) {
          scrollContainerRef.value.scrollTop =
            scrollContainerRef.value.scrollHeight - prevHeight
        }
      })
    })
  }
}

async function handleCopyMessage(text: string) {
  if (!import.meta.client || !text) return
  try {
    await navigator.clipboard.writeText(text)
    showNotification({ type: 'success', message: 'Berhasil menyalin pesan' })
  } catch {
    showNotification({ type: 'error', message: 'Gagal menyalin pesan' })
  }
}

async function handleSendText() {
  await helpChatStore.sendMessage()
  scrollToBottom(true)
}

function handleQuickReply(text: string) {
  helpChatStore.draftMessage = text
}

function openCameraPhoto() {
  initialPreparedImage.value = null
  imageModalMode.value = 'camera'
  showImageSendModal.value = true
}

async function handleSelectGalleryPhoto(file: File) {
  try {
    initialPreparedImage.value = await fileToPreparedImage(file, file.name)
    imageModalMode.value = 'gallery'
    showImageSendModal.value = true
  } catch {
    showNotification({ type: 'error', message: 'Gagal memproses file foto' })
  }
}

async function handleConfirmSendImage(payload: { base64: string; caption: string }) {
  await helpChatStore.sendMessage({
    text: payload.caption,
    imageBase64: payload.base64,
  })
  scrollToBottom(true)
}

function handlePreviewMedia(payload: { url: string; isVideo: boolean }) {
  viewerMediaUrl.value = payload.url
  viewerIsVideo.value = payload.isVideo
  showMediaViewer.value = true
}

function handleOpenFaq() {
  if (props.isFloating) {
    helpChatStore.minimizeToFloatingIcon()
  }
  navigateTo('/faq')
}
</script>

<template>
  <div class="flex flex-col h-full bg-white overflow-hidden font-outfit">
    <!-- 1. Top Header -->
    <HelpConversationHeader
      :status-text="helpChatStore.adminStatus"
      :is-typing="helpChatStore.isAdminTyping"
      :ws-connected="helpChatStore.wsConnected"
      :show-back-button="props.showBackButton"
      :is-floating="props.isFloating"
      @back="emit('back')"
      @open-faq="handleOpenFaq"
      @open-security="showSecurityModal = true"
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
      <!-- Official Help Disclaimer -->
      <div class="max-w-xl mx-auto px-2 py-1.5 text-center">
        <p class="font-outfit text-xs text-text-muted leading-relaxed">
          Tim BekasKu Center siap membantu kendala akun, pembayaran, dan transaksi Anda. Jangan bagikan OTP atau kata sandi Anda kepada siapa pun.
          <button
            type="button"
            class="font-outfit font-medium text-xs text-text underline hover:text-primary transition-colors cursor-pointer ml-0.5"
            @click="showSecurityModal = true"
          >
            Panduan Keamanan
          </button>
        </p>
      </div>

      <!-- Older Messages Spinner -->
      <div
        v-if="helpChatStore.loadingOlderMessages"
        class="py-2 flex items-center justify-center"
      >
        <span class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>

      <!-- Loading Skeleton -->
      <div
        v-if="helpChatStore.loadingMessages && helpChatStore.messages.length === 0"
        class="space-y-4 py-4"
      >
        <div class="flex justify-end">
          <div class="w-52 h-12 rounded-2xl bg-surface-2 animate-pulse"></div>
        </div>
        <div class="flex justify-start">
          <div class="w-60 h-14 rounded-2xl bg-surface-2 animate-pulse"></div>
        </div>
        <div class="flex justify-end">
          <div class="w-44 h-10 rounded-2xl bg-surface-2 animate-pulse"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="helpChatStore.chronologicalMessages.length === 0"
        class="py-8 px-4 flex flex-col items-center text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 text-primary flex items-center justify-center mb-3">
          <Headset class="w-7 h-7" aria-hidden="true" />
        </div>
        <h2 class="font-outfit font-bold text-sm sm:text-base text-text">
          Belum ada percakapan bantuan
        </h2>
        <p class="font-outfit text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
          Tulis kendala Anda di bawah atau pilih salah satu pertanyaan cepat untuk langsung terhubung dengan admin BekasKu.
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-1.5">
          <button
            v-for="expr in HELP_QUICK_EXPRESSIONS.slice(0, 3)"
            :key="expr"
            type="button"
            class="min-h-[44px] md:min-h-[34px] px-3 py-1.5 rounded-full bg-surface-2 hover:bg-chip-soft-bg border border-border hover:border-primary/40 font-outfit text-[11px] text-text hover:text-primary transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            @click="handleQuickReply(expr)"
          >
            {{ expr }}
          </button>
        </div>
      </div>

      <!-- Chronological Messages -->
      <template v-else>
        <ChatBubble
          v-for="(msg, idx) in helpChatStore.chronologicalMessages"
          :key="msg.id || idx"
          :chat="msg"
          :compact="props.compact"
          :is-action-loading="helpChatStore.actionLoading"
          hide-reply
          :show-date-separator="
            idx === 0 ||
            helpChatStore.chronologicalMessages[idx - 1]?.date !== msg.date
          "
          @copy="handleCopyMessage"
          @retry="helpChatStore.retryFailedMessage"
          @delete-failed="helpChatStore.deleteFailedMessage"
          @preview-media="handlePreviewMedia"
        />
      </template>

      <!-- Admin Typing Indicator -->
      <ChatTypingIndicator v-if="helpChatStore.isAdminTyping" />
    </div>

    <!-- 3. Bottom Input Bar -->
    <HelpChatInputBar
      v-model="helpChatStore.draftMessage"
      :topic-context="helpChatStore.activeTopicContext"
      :compact="props.compact"
      @typing="helpChatStore.notifyTyping"
      @send="handleSendText"
      @quick-reply="handleQuickReply"
      @clear-topic="helpChatStore.clearTopicContext"
      @open-camera-photo="openCameraPhoto"
      @select-gallery-photo="handleSelectGalleryPhoto"
    />

    <!-- Shared Security & Media Modals -->
    <ChatSecurityGuideModal v-model="showSecurityModal" />

    <ChatImageSendModal
      v-model="showImageSendModal"
      :initial-mode="imageModalMode"
      :initial-image="initialPreparedImage"
      title="Kirim Foto ke BekasKu Center"
      @send="handleConfirmSendImage"
    />

    <ChatMediaViewerModal
      v-model="showMediaViewer"
      :media-url="viewerMediaUrl"
      :is-video="viewerIsVideo"
    />
  </div>
</template>

