<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Send,
  Camera,
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
  Ban,
  Smile,
} from 'lucide-vue-next'
import { CHAT_QUICK_REPLIES } from '~/utils/constants'
import type { ProductChatModel, TransactionChatModel } from '~/types/chat'
import ChatAttachmentPreviewBar from '~/components/chat/ChatAttachmentPreviewBar.vue'

const props = defineProps<{
  modelValue: string
  replyQuote?: string
  attachedProduct?: ProductChatModel | null
  attachedTransaction?: TransactionChatModel | null
  activeContextProduct?: ProductChatModel | null
  isBlocked?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'typing'): void
  (e: 'send'): void
  (e: 'quick-reply', text: string): void
  (e: 'clear-reply'): void
  (e: 'clear-product'): void
  (e: 'clear-transaction'): void
  (e: 'open-camera-photo'): void
  (e: 'select-gallery-photo', file: File): void
  (e: 'open-camera-video'): void
  (e: 'select-gallery-video', file: File): void
  (e: 'request-live-photo', product: ProductChatModel): void
  (e: 'request-live-video', product: ProductChatModel): void
}>()

const showAttachMenu = ref(false)
const showQuickPhrasesMenu = ref(false)
const photoInputRef = ref<HTMLInputElement | null>(null)
const videoInputRef = ref<HTMLInputElement | null>(null)

const quickExpressions = [
  'Halo kak, apakah stok masih ada?',
  'Bisa kurang sedikit harganya kak?',
  'Kondisi barangnya masih mulus kak?',
  'Siap kak, saya checkout sekarang ya!',
  'Terima kasih banyak kak!',
]

const canSend = computed(() => {
  return Boolean(
    props.modelValue.trim().length > 0 ||
      props.attachedProduct ||
      props.attachedTransaction,
  )
})

const requestableProduct = computed(() => {
  const prod = props.attachedProduct || props.activeContextProduct || null
  if (!prod || !prod.id || prod.is_seller) return null
  return prod
})

function onInput(ev: Event) {
  const target = ev.target as HTMLTextAreaElement
  const cleaned = target.value.replace(/[<>]/g, '')
  if (target.value !== cleaned) {
    target.value = cleaned
  }
  emit('update:modelValue', cleaned)
  emit('typing')
}

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Enter' && !ev.shiftKey) {
    ev.preventDefault()
    if (canSend.value) {
      emit('send')
    }
  }
}

function insertExpression(text: string) {
  showQuickPhrasesMenu.value = false
  emit('update:modelValue', text)
  emit('typing')
}

function onPhotoSelected(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('select-gallery-photo', file)
  }
  target.value = ''
}

function onVideoSelected(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('select-gallery-video', file)
  }
  target.value = ''
}
</script>

<template>
  <div class="bg-white border-t border-border-light shrink-0 relative">
    <!-- Hidden File Inputs -->
    <input
      ref="photoInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onPhotoSelected"
    />
    <input
      ref="videoInputRef"
      type="file"
      accept="video/*"
      class="hidden"
      @change="onVideoSelected"
    />

    <!-- Blocked State Banner -->
    <div
      v-if="isBlocked"
      class="px-4 py-3.5 bg-surface-2 flex items-center justify-center gap-2 text-text-muted"
    >
      <Ban class="w-4 h-4 text-danger shrink-0" />
      <span class="font-outfit text-xs sm:text-sm font-medium">
        Percakapan dengan pengguna ini telah diblokir.
      </span>
    </div>

    <template v-else>
      <!-- 1. Quick Reply Chips Row (Top row like Tokopedia reference) -->
      <div
        class="px-3.5 pt-2.5 pb-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar"
      >
        <button
          v-for="chip in CHAT_QUICK_REPLIES"
          :key="chip"
          type="button"
          @click="emit('quick-reply', chip)"
          class="px-3 py-1 rounded-full bg-white hover:bg-primary/8 border border-primary/40 font-outfit font-medium text-xs text-primary whitespace-nowrap transition-colors cursor-pointer shrink-0"
        >
          {{ chip }}
        </button>

        <!-- Quick Live Photo / Video Request Chips when a buyer product is in context -->
        <template v-if="requestableProduct">
          <button
            type="button"
            @click="emit('request-live-photo', requestableProduct)"
            class="px-3 py-1 rounded-full bg-primary/8 hover:bg-primary/15 border border-primary/30 font-outfit font-medium text-xs text-primary flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            <Camera class="w-3.5 h-3.5 text-primary" />
            <span>Minta Live Photo</span>
          </button>
          <button
            type="button"
            @click="emit('request-live-video', requestableProduct)"
            class="px-3 py-1 rounded-full bg-primary/8 hover:bg-primary/15 border border-primary/30 font-outfit font-medium text-xs text-primary flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            <Video class="w-3.5 h-3.5 text-primary" />
            <span>Minta Live Video</span>
          </button>
        </template>
      </div>

      <!-- 2. Floating Context Attachment / Reply Card -->
      <ChatAttachmentPreviewBar
        :reply-quote="replyQuote"
        :attached-product="attachedProduct"
        :attached-transaction="attachedTransaction"
        @clear-reply="emit('clear-reply')"
        @clear-product="emit('clear-product')"
        @clear-transaction="emit('clear-transaction')"
      />

      <!-- 3. Input Bar: Rounded Pill Input (Smile Left + Textarea + Plus Right) + Circular Send Button (Tokopedia style) -->
      <div
        class="px-3.5 pb-3 pt-1.5 flex items-center gap-2"
        :class="compact ? 'px-3 pb-2.5' : 'px-3.5 pb-3'"
      >
        <!-- Unified Pill Input Container -->
        <div class="flex-1 rounded-full border border-border bg-white focus-within:border-primary px-3 py-1.5 flex items-center gap-2 transition-colors relative">
          <!-- Left Smile / Quick Expression Trigger -->
          <div class="relative shrink-0 flex items-center">
            <button
              type="button"
              @click="showQuickPhrasesMenu = !showQuickPhrasesMenu; showAttachMenu = false"
              class="text-text-muted hover:text-primary transition-colors cursor-pointer"
              aria-label="Sapaan Cepat"
            >
              <Smile class="w-5 h-5" />
            </button>

            <div
              v-if="showQuickPhrasesMenu"
              class="fixed inset-0 z-10"
              @click="showQuickPhrasesMenu = false"
            ></div>

            <div
              v-if="showQuickPhrasesMenu"
              class="absolute bottom-10 left-0 w-64 rounded-2xl bg-white border border-border-light shadow-xl py-2 z-20 space-y-0.5"
            >
              <p class="px-3.5 py-1 font-outfit font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Pesan Instan
              </p>
              <button
                v-for="expr in quickExpressions"
                :key="expr"
                type="button"
                @click="insertExpression(expr)"
                class="w-full px-3.5 py-2 text-left font-outfit text-xs text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                {{ expr }}
              </button>
            </div>
          </div>

          <!-- Textarea -->
          <textarea
            :value="modelValue"
            @input="onInput"
            @keydown="onKeydown"
            rows="1"
            placeholder="Tulis pesan..."
            class="flex-1 bg-transparent font-outfit text-sm text-text outline-hidden resize-none max-h-20 leading-snug"
          />

          <!-- Right (+) Attachment Popover Button inside Pill -->
          <div class="relative shrink-0 flex items-center">
            <button
              type="button"
              @click="showAttachMenu = !showAttachMenu; showQuickPhrasesMenu = false"
              class="text-text-muted hover:text-primary transition-colors cursor-pointer"
              aria-label="Lampirkan Media"
            >
              <Plus class="w-5 h-5 rounded-full border border-current p-0.5 transition-transform duration-200" :class="showAttachMenu ? 'rotate-45 text-primary' : ''" />
            </button>

            <div
              v-if="showAttachMenu"
              class="fixed inset-0 z-10"
              @click="showAttachMenu = false"
            ></div>

            <!-- Popover Menu -->
            <div
              v-if="showAttachMenu"
              class="absolute bottom-10 right-0 w-56 rounded-2xl bg-white border border-border-light shadow-xl py-2 z-20 space-y-0.5"
            >
              <button
                type="button"
                @click="showAttachMenu = false; emit('open-camera-photo')"
                class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Camera class="w-4 h-4 text-primary shrink-0" />
                <span>Ambil Foto Kamera</span>
              </button>

              <button
                type="button"
                @click="showAttachMenu = false; photoInputRef?.click()"
                class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ImageIcon class="w-4 h-4 text-primary shrink-0" />
                <span>Pilih Foto dari Galeri</span>
              </button>

              <button
                type="button"
                @click="showAttachMenu = false; emit('open-camera-video')"
                class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Video class="w-4 h-4 text-primary shrink-0" />
                <span>Rekam Video Kamera</span>
              </button>

              <button
                type="button"
                @click="showAttachMenu = false; videoInputRef?.click()"
                class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Film class="w-4 h-4 text-primary shrink-0" />
                <span>Pilih Video dari Galeri</span>
              </button>

              <template v-if="requestableProduct">
                <div class="my-1 border-t border-border-light"></div>
                <button
                  type="button"
                  @click="showAttachMenu = false; emit('request-live-photo', requestableProduct)"
                  class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-primary hover:bg-primary/8 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Sparkles class="w-4 h-4 text-primary shrink-0" />
                  <span>Minta Live Photo Produk</span>
                </button>
                <button
                  type="button"
                  @click="showAttachMenu = false; emit('request-live-video', requestableProduct)"
                  class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-primary hover:bg-primary/8 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Video class="w-4 h-4 text-primary shrink-0" />
                  <span>Minta Live Video Produk</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Circular Send Button (matches Tokopedia reference) -->
        <button
          type="button"
          :disabled="!canSend"
          @click="emit('send')"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          :class="
            canSend
              ? 'bg-primary hover:bg-primary-dark text-white shadow-2xs'
              : 'bg-primary/45 text-white/90'
          "
          aria-label="Kirim Pesan"
        >
          <Send class="w-4 h-4 text-white ml-0.5" />
        </button>
      </div>
    </template>
  </div>
</template>
