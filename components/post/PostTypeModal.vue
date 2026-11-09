<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import {
  Sparkles,
  Tag,
  ShoppingBag,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-vue-next'
import {
  POST_TYPE_AI,
  POST_TYPE_SELL,
  POST_TYPE_NEEDED,
  POST_TYPE_SERVICE,
} from '~/utils/constants'
import { useAiPost } from '~/composables/useAiPost'
import type { AiPostAnalysisResult } from '~/types/post'
import AiInputSection from '~/components/post/ai/AiInputSection.vue'
import AiAnalyzingOverlay from '~/components/post/ai/AiAnalyzingOverlay.vue'
import AiPreviewSection from '~/components/post/ai/AiPreviewSection.vue'
import AiVipModal from '~/components/post/ai/AiVipModal.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select', type: number): void
  (e: 'ai-applied', data: AiPostAnalysisResult & { images: string[]; stock: number }): void
}>()

const route = useRoute()
const {
  images,
  message,
  isLoading,
  aiResult,
  showVipModal,
  vipModalMessage,
  maxPhotos,
  addImageFiles,
  removeImage,
  askAi,
  buildAutoPostPayload,
} = useAiPost()

type Step = 'type' | 'ai_input' | 'ai_analyzing' | 'ai_preview'
const currentStep = ref<Step>('type')

function close() {
  emit('update:modelValue', false)
  setTimeout(() => {
    currentStep.value = 'type'
  }, 200)
}

function handleSelect(typeNum: number) {
  if (typeNum === POST_TYPE_AI) {
    currentStep.value = 'ai_input'
    return
  }
  emit('select', typeNum)
  close()
}

function handleBack() {
  if (currentStep.value === 'ai_preview') {
    currentStep.value = 'ai_input'
  } else if (currentStep.value === 'ai_input') {
    currentStep.value = 'type'
  }
}

async function handleStartAiAnalysis() {
  if (images.value.length === 0 || isLoading.value) return
  currentStep.value = 'ai_analyzing'
  const success = await askAi()
  if (success && aiResult.value) {
    currentStep.value = 'ai_preview'
  } else {
    currentStep.value = 'ai_input'
  }
}

function handleContinueToPost() {
  const data = buildAutoPostPayload()
  if (!data) return

  emit('ai-applied', data)
  close()

  if (route.path !== '/post/sell') {
    navigateTo('/post/sell')
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
    if (!open) {
      setTimeout(() => {
        currentStep.value = 'type'
      }, 200)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
      @click.self="close"
    >
      <div
        :class="[
          'w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200 transition-all',
          currentStep === 'type' ? 'sm:max-w-md' : 'sm:max-w-lg md:max-w-xl',
        ]"
      >
        <!-- Mobile drag handle -->
        <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-border-light" />
        </div>

        <!-- ── Modal Header ─────────────────────────────────────────────── -->
        <div class="px-5 pt-3 sm:pt-5 pb-3 border-b border-border-light/70 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <!-- Back button (for AI wizard steps) -->
            <button
              v-if="currentStep !== 'type' && currentStep !== 'ai_analyzing'"
              type="button"
              class="p-1.5 -ml-1.5 text-text hover:text-primary rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Kembali"
              @click="handleBack"
            >
              <ArrowLeft class="w-5 h-5" aria-hidden="true" />
            </button>

            <!-- Sparkle icon for AI header -->
            <div
              v-if="currentStep !== 'type'"
              class="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Sparkles class="w-4 h-4" aria-hidden="true" />
            </div>

            <div>
              <h2 id="post-modal-title" class="text-base sm:text-lg font-bold text-text">
                {{
                  currentStep === 'type'
                    ? 'Pilih Jenis Postingan'
                    : currentStep === 'ai_preview'
                      ? 'Hasil Analisis AI'
                      : 'Posting dengan AI'
                }}
              </h2>
              <p v-if="currentStep === 'type'" class="text-xs text-text-muted mt-0.5">
                Pilih jenis iklan yang ingin kamu buat
              </p>
            </div>
          </div>

          <button
            type="button"
            class="p-1.5 -mr-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- ── STEP 1: Type Selection (Parity with Mobile V3 ChoosePostTypeModal) ── -->
        <div
          v-if="currentStep === 'type'"
          class="divide-y divide-border-light/70 overflow-y-auto pb-4"
        >
          <!-- 1. Posting dengan AI -->
          <button
            type="button"
            class="w-full px-5 py-3.5 hover:bg-purple-50/40 transition-colors flex items-center justify-between text-left cursor-pointer group"
            @click="handleSelect(POST_TYPE_AI)"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Posting dengan AI
                </p>
                <p class="text-xs text-purple-600/80 mt-0.5 font-medium">
                  Buat postingan otomatis secepat kilat
                </p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle group-hover:translate-x-0.5 group-hover:text-purple-600 transition-all" aria-hidden="true" />
          </button>

          <!-- 2. Jual Barang -->
          <button
            type="button"
            class="w-full px-5 py-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between text-left cursor-pointer group"
            @click="handleSelect(POST_TYPE_SELL)"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Tag class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  Jual Barang
                </p>
                <p class="text-xs text-text-muted mt-0.5">
                  Jual barang bekasmu
                </p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle group-hover:translate-x-0.5 group-hover:text-text transition-all" aria-hidden="true" />
          </button>

          <!-- 3. Dibutuhkan -->
          <button
            type="button"
            class="w-full px-5 py-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between text-left cursor-pointer group"
            @click="handleSelect(POST_TYPE_NEEDED)"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShoppingBag class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-semibold text-text group-hover:text-purple-600 transition-colors">
                  Dibutuhkan
                </p>
                <p class="text-xs text-text-muted mt-0.5">
                  Cari barang yang kamu butuhkan
                </p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle group-hover:translate-x-0.5 group-hover:text-text transition-all" aria-hidden="true" />
          </button>

          <!-- 4. Jasa & Lowongan -->
          <button
            type="button"
            class="w-full px-5 py-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between text-left cursor-pointer group"
            @click="handleSelect(POST_TYPE_SERVICE)"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p class="text-sm font-semibold text-text group-hover:text-emerald-600 transition-colors">
                  Jasa & Lowongan
                </p>
                <p class="text-xs text-text-muted mt-0.5">
                  Tawarkan jasa atau lowongan
                </p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-text-subtle group-hover:translate-x-0.5 group-hover:text-text transition-all" aria-hidden="true" />
          </button>
        </div>

        <!-- ── STEP 2: AI Input (Photos & Notes) ────────────────────────── -->
        <AiInputSection
          v-else-if="currentStep === 'ai_input'"
          v-model="message"
          in-modal
          :images="images"
          :max-photos="maxPhotos"
          :is-loading="isLoading"
          @add-files="addImageFiles"
          @remove-image="removeImage"
          @submit="handleStartAiAnalysis"
        />

        <!-- ── STEP 3: AI Analyzing Animation ───────────────────────────── -->
        <AiAnalyzingOverlay
          v-else-if="currentStep === 'ai_analyzing'"
          in-modal
          :active="true"
        />

        <!-- ── STEP 4: AI Preview Section ───────────────────────────────── -->
        <AiPreviewSection
          v-else-if="currentStep === 'ai_preview' && aiResult"
          in-modal
          :images="images"
          :ai-result="aiResult"
          @retry="currentStep = 'ai_input'"
          @continue="handleContinueToPost"
        />
      </div>
    </div>

    <!-- VIP Limit Modal -->
    <AiVipModal
      v-model="showVipModal"
      :message="vipModalMessage"
    />
  </Teleport>
</template>
