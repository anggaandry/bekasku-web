<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, ChevronDown, Headset } from 'lucide-vue-next'
import type { FaqItem } from '~/types/help'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import FaqHtmlBody from '~/components/help/FaqHtmlBody.vue'
import FaqFeedbackWidget from '~/components/help/FaqFeedbackWidget.vue'

const props = defineProps<{
  items: FaqItem[]
  loading?: boolean
  error?: string
  feedbackMap?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'vote', payload: { faqId: string; isSatisfied: boolean }): void
  (e: 'open-help-chat'): void
}>()

const openId = ref<string>('')

function toggleItem(id: string) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <div class="font-outfit">
    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="bg-white rounded-2xl border border-border p-4 sm:p-5 space-y-2.5"
      >
        <AppSkeleton width="78%" height="18px" />
        <AppSkeleton width="45%" height="12px" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="props.error"
      class="bg-white rounded-2xl border border-border p-6"
    >
      <AppErrorState
        title="Gagal memuat pusat bantuan"
        :message="props.error"
        @retry="emit('retry')"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="props.items.length === 0"
      class="bg-white rounded-2xl border border-border p-6"
    >
      <AppEmptyState
        title="Pertanyaan tidak ditemukan"
        description="Pertanyaan tidak ditemukan. Coba gunakan kata kunci lain atau hubungi tim CS BekasKu Center kami."
      >
        <template #action>
          <button
            type="button"
            class="min-h-[44px] px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            @click="emit('open-help-chat')"
          >
            <Headset class="w-4 h-4" aria-hidden="true" />
            <span>Tanya BekasKu Center</span>
          </button>
        </template>
      </AppEmptyState>
    </div>

    <!-- Accordion Items -->
    <div
      v-else
      class="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-2xs"
    >
      <div
        v-for="item in props.items"
        :key="item.id"
        class="transition-colors"
      >
        <button
          :id="`faq-trigger-${item.id}`"
          type="button"
          :aria-expanded="openId === item.id"
          :aria-controls="`faq-panel-${item.id}`"
          class="w-full min-h-[56px] px-4 sm:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-surface-2/70 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
          @click="toggleItem(item.id)"
        >
          <span class="font-outfit font-semibold text-sm sm:text-base text-text leading-snug">
            {{ item.question }}
          </span>
          <ChevronDown
            class="w-5 h-5 text-text-muted shrink-0 transition-transform duration-200"
            :class="openId === item.id ? 'rotate-180 text-primary' : ''"
            aria-hidden="true"
          />
        </button>

        <div
          v-show="openId === item.id"
          :id="`faq-panel-${item.id}`"
          role="region"
          :aria-labelledby="`faq-trigger-${item.id}`"
          class="px-4 sm:px-6 pb-5 pt-1 space-y-4 bg-white"
        >
          <!-- Sanitized Backend HTML -->
          <FaqHtmlBody :html="item.answerHtml" size="sm" />

          <!-- Deep Link to Dedicated Article Page -->
          <div class="flex items-center justify-end">
            <NuxtLink
              :to="`/faq/${item.slug}`"
              class="min-h-[44px] md:min-h-[36px] inline-flex items-center gap-1 font-outfit font-semibold text-xs text-primary hover:underline"
            >
              <span>Buka halaman artikel</span>
              <ArrowUpRight class="w-3.5 h-3.5" aria-hidden="true" />
            </NuxtLink>
          </div>

          <!-- Article Feedback -->
          <FaqFeedbackWidget
            compact
            :faq-id="item.id"
            :submitted="Boolean(props.feedbackMap?.[item.id])"
            @vote="emit('vote', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
