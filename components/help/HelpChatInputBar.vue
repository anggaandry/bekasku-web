<script setup lang="ts">
import { computed, ref } from 'vue'
import { Camera, Image as ImageIcon, Plus, Send, Smile, X } from 'lucide-vue-next'
import { HELP_QUICK_EXPRESSIONS, HELP_QUICK_REPLIES } from '~/utils/constants'
import type { HelpCenterOpenOptions } from '~/types/help'

const props = defineProps<{
  modelValue: string
  topicContext?: HelpCenterOpenOptions | null
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'typing'): void
  (e: 'send'): void
  (e: 'quick-reply', text: string): void
  (e: 'clear-topic'): void
  (e: 'open-camera-photo'): void
  (e: 'select-gallery-photo', file: File): void
}>()

const showAttachMenu = ref(false)
const showQuickPhrasesMenu = ref(false)
const photoInputRef = ref<HTMLInputElement | null>(null)

const canSend = computed(() => props.modelValue.trim().length > 0)

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
</script>

<template>
  <div class="bg-white border-t border-border-light shrink-0 relative font-outfit">
    <!-- Hidden Photo File Input -->
    <input
      id="help-chat-photo-input"
      ref="photoInputRef"
      name="photo"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onPhotoSelected"
    />

    <!-- 1. Quick Help Topic Chips -->
    <div class="px-3.5 pt-2.5 pb-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="chip in HELP_QUICK_REPLIES"
        :key="chip"
        type="button"
        class="min-h-[44px] md:min-h-[30px] px-3 py-1 rounded-full bg-white hover:bg-primary/8 border border-primary/40 font-outfit font-medium text-xs text-primary whitespace-nowrap transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
        @click="emit('quick-reply', `Halo BekasKu Center, saya butuh bantuan terkait ${chip.toLowerCase()}.`)"
      >
        {{ chip }}
      </button>
    </div>

    <!-- 2. Optional Active Context Reference Banner -->
    <div
      v-if="props.topicContext?.referenceTitle || props.topicContext?.referenceId"
      class="mx-3.5 mb-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-border-light flex items-center justify-between gap-2"
    >
      <p class="font-outfit text-xs text-text-muted truncate">
        Topik bantuan:
        <span class="font-semibold text-text">
          {{ props.topicContext?.referenceTitle || props.topicContext?.referenceId }}
        </span>
      </p>
      <button
        type="button"
        class="min-w-[44px] min-h-[44px] md:min-w-[28px] md:min-h-[28px] p-1 rounded-full hover:bg-white text-text-muted hover:text-text flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Hapus konteks topik"
        @click="emit('clear-topic')"
      >
        <X class="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>

    <!-- 3. Input Bar (Exact Match to ChatInputArea.vue Pill + Circular Send) -->
    <div
      class="flex items-center gap-2 pt-1.5"
      :class="props.compact ? 'px-3 pb-2.5' : 'px-3.5 pb-3'"
    >
      <div class="flex-1 rounded-full border border-border bg-white focus-within:border-primary px-2 md:px-3 py-0.5 md:py-1.5 flex items-center gap-1 md:gap-2 transition-colors relative">
        <!-- Left Smile / Instant Help Messages -->
        <div
          class="relative shrink-0 flex items-center"
          @keydown.esc.stop="showQuickPhrasesMenu = false"
        >
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] md:min-w-[30px] md:min-h-[30px] rounded-full text-text-muted hover:text-primary flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Sapaan Cepat"
            aria-haspopup="menu"
            :aria-expanded="showQuickPhrasesMenu"
            @click="showQuickPhrasesMenu = !showQuickPhrasesMenu; showAttachMenu = false"
          >
            <Smile class="w-5 h-5" aria-hidden="true" />
          </button>

          <div
            v-if="showQuickPhrasesMenu"
            class="fixed inset-0 z-10"
            aria-hidden="true"
            @click="showQuickPhrasesMenu = false"
          ></div>

          <div
            v-if="showQuickPhrasesMenu"
            role="menu"
            aria-label="Pesan Instan CS"
            class="absolute bottom-12 md:bottom-10 left-0 w-68 rounded-2xl bg-white border border-border-light shadow-xl py-2 z-20 space-y-0.5"
          >
            <p class="px-3.5 py-1 font-outfit font-semibold text-[11px] text-text-muted uppercase tracking-wider">
              Pesan Instan CS
            </p>
            <button
              v-for="expr in HELP_QUICK_EXPRESSIONS"
              :key="expr"
              type="button"
              role="menuitem"
              class="w-full min-h-[44px] md:min-h-[34px] px-3.5 py-2 text-left font-outfit text-xs text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              @click="insertExpression(expr)"
            >
              {{ expr }}
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          id="help-chat-message-input"
          name="message"
          :value="props.modelValue"
          rows="1"
          aria-label="Ketik pesan bantuan"
          placeholder="Ketik pesan kamu..."
          class="flex-1 bg-transparent font-outfit text-sm text-text placeholder:text-text-muted outline-hidden resize-none max-h-20 leading-snug"
          @input="onInput"
          @keydown="onKeydown"
        />

        <!-- Right (+) Camera / Gallery Menu -->
        <div
          class="relative shrink-0 flex items-center"
          @keydown.esc.stop="showAttachMenu = false"
        >
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] md:min-w-[30px] md:min-h-[30px] rounded-full text-text-muted hover:text-primary flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Lampirkan Foto Bukti"
            aria-haspopup="menu"
            :aria-expanded="showAttachMenu"
            @click="showAttachMenu = !showAttachMenu; showQuickPhrasesMenu = false"
          >
            <Plus
              class="w-5 h-5 rounded-full border border-current p-0.5 transition-transform duration-200"
              :class="showAttachMenu ? 'rotate-45 text-primary' : ''"
              aria-hidden="true"
            />
          </button>

          <div
            v-if="showAttachMenu"
            class="fixed inset-0 z-10"
            aria-hidden="true"
            @click="showAttachMenu = false"
          ></div>

          <div
            v-if="showAttachMenu"
            role="menu"
            aria-label="Lampirkan Foto Bukti"
            class="absolute bottom-12 md:bottom-10 right-0 w-52 rounded-2xl bg-white border border-border-light shadow-xl py-2 z-20 space-y-0.5"
          >
            <button
              type="button"
              role="menuitem"
              class="w-full min-h-[44px] md:min-h-[36px] px-3.5 py-2 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              @click="showAttachMenu = false; emit('open-camera-photo')"
            >
              <Camera class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>Ambil Foto Kamera</span>
            </button>

            <button
              type="button"
              role="menuitem"
              class="w-full min-h-[44px] md:min-h-[36px] px-3.5 py-2 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              @click="showAttachMenu = false; photoInputRef?.click()"
            >
              <ImageIcon class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>Pilih Foto dari Galeri</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Circular Send Button -->
      <button
        type="button"
        :disabled="!canSend"
        class="w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="
          canSend
            ? 'bg-primary hover:bg-primary-dark text-white shadow-2xs'
            : 'bg-muted text-text-muted border border-border'
        "
        aria-label="Kirim Pesan"
        @click="emit('send')"
      >
        <Send class="w-4 h-4 ml-0.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
