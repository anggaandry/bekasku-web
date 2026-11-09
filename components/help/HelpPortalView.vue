<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Headset, ShieldCheck } from 'lucide-vue-next'
import type { FaqCategoryId } from '~/types/help'
import { defaultHelpContact, useHelpCenter } from '~/composables/useHelpCenter'
import { SAFETY_GUIDE_ITEMS } from '~/composables/useLegalPolicy'
import { useHelpChatStore } from '~/stores/helpChat'
import HelpSubpageBar from '~/components/help/HelpSubpageBar.vue'
import HelpCenterHero from '~/components/help/HelpCenterHero.vue'
import HelpCategoryGrid from '~/components/help/HelpCategoryGrid.vue'
import FaqAccordion from '~/components/help/FaqAccordion.vue'
import FaqFeedbackModal from '~/components/help/FaqFeedbackModal.vue'
import HelpContactSidebar from '~/components/help/HelpContactSidebar.vue'
import StaticQuickLinks from '~/components/static/StaticQuickLinks.vue'

const props = withDefaults(
  defineProps<{
    canonicalPath?: string
  }>(),
  {
    canonicalPath: '/help',
  },
)

const helpChatStore = useHelpChatStore()
const {
  categories,
  feedbackMap,
  feedbackModalOpen,
  feedbackIsSatisfied,
  loadFeedbackFromStorage,
  openFeedbackModal,
  submitFeedbackReasons,
  fetchFaqList,
  fetchContactInfo,
  filterFaqItems,
  categoryCounts,
} = useHelpCenter()

const {
  data: portalData,
  pending,
  refresh,
} = await useAsyncData('help-center-portal-data', async () => {
  const [faqRes, contact] = await Promise.all([
    fetchFaqList(''),
    fetchContactInfo(),
  ])
  return {
    items: faqRes.items,
    error: faqRes.error,
    contact,
  }
})

const searchQuery = ref('')
const selectedCategory = ref<FaqCategoryId>('all')

onMounted(() => {
  loadFeedbackFromStorage()
})

const allItems = computed(() => portalData.value?.items || [])
const faqError = computed(() => portalData.value?.error || '')
const contactInfo = computed(() => portalData.value?.contact || defaultHelpContact())

const counts = computed(() => categoryCounts(allItems.value))

const filteredItems = computed(() =>
  filterFaqItems(allItems.value, searchQuery.value, selectedCategory.value),
)

const portalCrumbs = [
  { label: 'Beranda', to: '/' },
  { label: 'Pusat Bantuan & FAQ' },
]

const faqJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allItems.value.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answerText,
    },
  })),
}))

useHead(() => ({
  title: 'Pusat Bantuan & FAQ - BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Temukan panduan lengkap bertransaksi aman, cara bayar, pengiriman barang bekas, komplain barang, dan live chat BekasKu Center.',
    },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: `https://bekasku.id${props.canonicalPath}` }],
  script:
    allItems.value.length > 0
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(faqJsonLd.value),
          },
        ]
      : [],
}))

const securityTips = SAFETY_GUIDE_ITEMS

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({
    topic: 'general',
  })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14">
    <HelpSubpageBar
      :crumbs="portalCrumbs"
      mobile-title="FAQ & Bantuan"
      back-fallback="/"
      @open-help-chat="handleOpenHelpChat"
    />

    <!-- Hero Header & Search Bar -->
    <HelpCenterHero v-model="searchQuery" />

    <!-- Main Content Container -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Category Tabs / Grid -->
      <HelpCategoryGrid
        :categories="categories"
        :selected-category="selectedCategory"
        :counts="counts"
        @select="selectedCategory = $event"
      />

      <!-- 2 Columns: FAQ List Left + Sticky Contact Sidebar Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div class="lg:col-span-8 space-y-6">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-outfit font-bold text-base sm:text-lg text-text">
              Pertanyaan yang Sering Diajukan
            </h2>
            <span class="font-outfit text-xs text-text-muted">
              {{ filteredItems.length }} topik
            </span>
          </div>

          <FaqAccordion
            :items="filteredItems"
            :loading="pending"
            :error="faqError"
            :feedback-map="feedbackMap"
            @retry="refresh()"
            @vote="openFeedbackModal($event.faqId, $event.isSatisfied)"
            @open-help-chat="handleOpenHelpChat"
          />

          <!-- Security Guide Section (#panduan-keamanan) -->
          <section
            id="panduan-keamanan"
            class="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs"
          >
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 class="font-outfit font-bold text-base text-text">
                  Panduan Keamanan Transaksi
                </h2>
                <p class="font-outfit text-xs text-text-muted">
                  Langkah penting agar transaksi jual beli barang bekas tetap aman.
                </p>
              </div>
            </div>

            <ol class="space-y-2.5 pl-4 list-decimal text-xs sm:text-sm text-text-muted leading-relaxed">
              <li v-for="tip in securityTips" :key="tip.id">
                <strong class="text-text">{{ tip.title }}:</strong> {{ tip.description }}
              </li>
            </ol>

            <div class="pt-1">
              <NuxtLink
                to="/safety-guide"
                class="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold text-primary-dark hover:underline"
              >
                <span>Buka Panduan Keamanan Lengkap</span>
                <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
              </NuxtLink>
            </div>
          </section>
        </div>

        <!-- Sticky Support Contact Column -->
        <div class="lg:col-span-4 lg:sticky lg:top-24">
          <HelpContactSidebar
            :contact="contactInfo"
            @open-help-chat="handleOpenHelpChat"
          />
        </div>
      </div>

      <StaticQuickLinks current="/faq" />
    </main>

    <!-- Mobile Floating CS Quick Button (< md) -->
    <div class="md:hidden fixed bottom-5 right-4 z-40">
      <button
        type="button"
        class="h-12 px-4 rounded-full bg-primary hover:bg-primary-dark text-white font-outfit font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Chat BekasKu Center"
        @click="handleOpenHelpChat"
      >
        <Headset class="w-4.5 h-4.5" aria-hidden="true" />
        <span>BekasKu Center</span>
      </button>
    </div>

    <!-- Article Feedback Modal -->
    <FaqFeedbackModal
      v-model="feedbackModalOpen"
      :is-satisfied="feedbackIsSatisfied"
      @submit="submitFeedbackReasons"
    />
  </div>
</template>

