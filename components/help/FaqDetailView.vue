<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ChevronRight, CircleHelp, Headset } from 'lucide-vue-next'
import { defaultHelpContact, useHelpCenter } from '~/composables/useHelpCenter'
import { useHelpChatStore } from '~/stores/helpChat'
import HelpSubpageBar from '~/components/help/HelpSubpageBar.vue'
import FaqHtmlBody from '~/components/help/FaqHtmlBody.vue'
import FaqFeedbackWidget from '~/components/help/FaqFeedbackWidget.vue'
import FaqFeedbackModal from '~/components/help/FaqFeedbackModal.vue'
import HelpContactSidebar from '~/components/help/HelpContactSidebar.vue'

const route = useRoute()
const helpChatStore = useHelpChatStore()
const {
  feedbackModalOpen,
  feedbackIsSatisfied,
  loadFeedbackFromStorage,
  isFeedbackSubmitted,
  openFeedbackModal,
  submitFeedbackReasons,
  fetchFaqList,
  fetchContactInfo,
  findFaqBySlug,
} = useHelpCenter()

const slugParam = computed(() => String(route.params.slug || '').trim())

const { data: detailData } = await useAsyncData(
  () => `faq-detail-${slugParam.value}`,
  async () => {
    const [faqRes, contact] = await Promise.all([
      fetchFaqList(''),
      fetchContactInfo(),
    ])
    return {
      items: faqRes.items,
      contact,
    }
  },
)

onMounted(() => {
  loadFeedbackFromStorage()
})

const allItems = computed(() => detailData.value?.items || [])
const article = computed(() => findFaqBySlug(allItems.value, slugParam.value))
const relatedItems = computed(() => {
  if (!article.value) return allItems.value.slice(0, 4)
  return allItems.value
    .filter(item => item.id !== article.value?.id)
    .sort((a, b) =>
      a.category === article.value?.category ? -1 : b.category === article.value?.category ? 1 : 0,
    )
    .slice(0, 4)
})

const contactInfo = computed(() => detailData.value?.contact || defaultHelpContact())

const crumbs = computed(() => [
  { label: 'Beranda', to: '/' },
  { label: 'Pusat Bantuan', to: '/help' },
  { label: article.value?.question || 'Detail Topik' },
])

const articleJsonLd = computed(() => {
  if (!article.value) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: article.value.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.value.answerText,
        },
      },
    ],
  }
})

useHead(() => ({
  title: article.value
    ? `${article.value.question} - Pusat Bantuan BekasKu`
    : 'Topik Bantuan Tidak Ditemukan - BekasKu',
  meta: [
    {
      name: 'description',
      content:
        article.value?.answerText?.slice(0, 155) ||
        'Temukan jawaban pertanyaan seputar transaksi dan akun di Pusat Bantuan BekasKu.',
    },
    {
      name: 'robots',
      content: article.value ? 'index, follow' : 'noindex, follow',
    },
  ],
  link: [{ rel: 'canonical', href: `https://bekasku.id/faq/${slugParam.value}` }],
  script: articleJsonLd.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(articleJsonLd.value),
        },
      ]
    : [],
}))

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({
    topic: 'general',
    referenceId: article.value?.id,
    referenceTitle: article.value?.question,
    initialMessage: article.value
      ? `Halo BekasKu Center, saya ingin bertanya lebih lanjut mengenai: ${article.value.question}`
      : undefined,
  })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14">
    <HelpSubpageBar
      :crumbs="crumbs"
      mobile-title="FAQ & Bantuan"
      back-fallback="/help"
      @open-help-chat="handleOpenHelpChat"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div class="lg:col-span-8 space-y-6">
          <article
            v-if="article"
            class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs"
          >
            <div class="p-5 sm:p-7 space-y-5">
              <h1 class="font-outfit font-bold text-xl sm:text-2xl text-text leading-snug">
                {{ article.question }}
              </h1>

              <FaqHtmlBody :html="article.answerHtml" size="base" />
            </div>

            <div class="h-2 bg-bg border-y border-border" />

            <div class="p-5 sm:px-7">
              <FaqFeedbackWidget
                :faq-id="article.id"
                :submitted="isFeedbackSubmitted(article.id)"
                @vote="openFeedbackModal($event.faqId, $event.isSatisfied)"
              />
            </div>
          </article>

          <div
            v-else
            class="bg-white rounded-2xl border border-border p-8 text-center space-y-4 shadow-2xs"
          >
            <div class="w-14 h-14 mx-auto rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted">
              <CircleHelp class="w-7 h-7" aria-hidden="true" />
            </div>
            <div class="space-y-1">
              <h1 class="font-outfit font-bold text-lg text-text">
                Topik Bantuan Tidak Ditemukan
              </h1>
              <p class="font-outfit text-xs sm:text-sm text-text-muted max-w-md mx-auto">
                Artikel bantuan yang Anda cari tidak tersedia atau telah diperbarui. Anda bisa mencarinya lagi atau langsung bertanya ke tim BekasKu Center.
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
              <NuxtLink
                to="/help"
                class="min-h-[44px] px-5 py-2.5 rounded-full border border-border bg-white hover:bg-surface-2 font-outfit font-semibold text-xs sm:text-sm text-text inline-flex items-center"
              >
                Kembali ke Pusat Bantuan
              </NuxtLink>
              <button
                type="button"
                class="min-h-[44px] px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark font-outfit font-semibold text-xs sm:text-sm text-white inline-flex items-center gap-2 cursor-pointer"
                @click="handleOpenHelpChat"
              >
                <Headset class="w-4 h-4" aria-hidden="true" />
                <span>Chat BekasKu Center</span>
              </button>
            </div>
          </div>

          <section
            v-if="relatedItems.length > 0"
            class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs"
          >
            <div class="px-5 py-4 border-b border-border">
              <h2 class="font-outfit font-bold text-base text-text">
                Topik Bantuan Lainnya
              </h2>
            </div>

            <div class="divide-y divide-border">
              <NuxtLink
                v-for="rel in relatedItems"
                :key="rel.id"
                :to="`/faq/${rel.slug}`"
                class="min-h-[52px] px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors group"
              >
                <span class="font-outfit font-medium text-sm text-text group-hover:text-primary transition-colors">
                  {{ rel.question }}
                </span>
                <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary shrink-0" aria-hidden="true" />
              </NuxtLink>
            </div>
          </section>
        </div>

        <div class="lg:col-span-4 lg:sticky lg:top-24">
          <HelpContactSidebar
            :contact="contactInfo"
            @open-help-chat="handleOpenHelpChat"
          />
        </div>
      </div>
    </main>

    <FaqFeedbackModal
      v-model="feedbackModalOpen"
      :is-satisfied="feedbackIsSatisfied"
      @submit="submitFeedbackReasons"
    />
  </div>
</template>

