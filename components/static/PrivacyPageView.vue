<script setup lang="ts">
import { computed } from 'vue'
import type { LegalLanguage } from '~/types/legal'
import { getPrivacyDocument, useLegalReader } from '~/composables/useLegalPolicy'
import { useHelpChatStore } from '~/stores/helpChat'
import HelpSubpageBar from '~/components/help/HelpSubpageBar.vue'
import LegalDocHeader from '~/components/static/LegalDocHeader.vue'
import LegalSearchHighlight from '~/components/static/LegalSearchHighlight.vue'
import LegalTableOfContents from '~/components/static/LegalTableOfContents.vue'
import LegalBodyContent from '~/components/static/LegalBodyContent.vue'
import StaticQuickLinks from '~/components/static/StaticQuickLinks.vue'

const props = withDefaults(
  defineProps<{
    canonicalPath?: string
  }>(),
  {
    canonicalPath: '/policy/privacy',
  },
)

const route = useRoute()
const router = useRouter()
const helpChatStore = useHelpChatStore()

const currentLang = computed<LegalLanguage>(() => {
  const q = String(route.query.lang || '').toLowerCase()
  return q === 'en' ? 'en' : 'id'
})

const { data: doc, pending, refresh } = await useAsyncData(
  () => `legal-privacy-document-${currentLang.value}`,
  async () => getPrivacyDocument(currentLang.value),
  { watch: [currentLang] },
)

const sections = computed(() => doc.value?.sections || [])

const {
  searchQuery,
  matchCount,
  activeMatchIndex,
  activeSectionId,
  nextMatch,
  prevMatch,
  clearSearch,
} = useLegalReader(sections)

const crumbs = computed(() => [
  { label: currentLang.value === 'en' ? 'Home' : 'Beranda', to: '/' },
  { label: currentLang.value === 'en' ? 'Help & FAQ' : 'Pusat Bantuan', to: '/faq' },
  { label: currentLang.value === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi' },
])

function setLanguage(lang: LegalLanguage) {
  router.push({
    query: {
      ...route.query,
      lang,
    },
  })
}

useHead(() => {
  const isEn = currentLang.value === 'en'
  const pageTitle = isEn ? 'Privacy Policy - BekasKu' : 'Kebijakan Privasi Pengguna - BekasKu'
  const pageDesc = isEn
    ? 'Official Privacy Policy of BekasKu platform operated by PT Jantaka Ladang Unggul under Law No. 27/2022 (UU PDP) and Google Play Data Safety standards.'
    : 'Kebijakan Privasi resmi platform BekasKu sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) dan deklarasi keamanan data Google Play.'

  return {
    htmlAttrs: { lang: currentLang.value },
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDesc },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDesc },
      { property: 'og:type', content: 'website' },
    ],
    link: [{ rel: 'canonical', href: `https://bekasku.id${props.canonicalPath}` }],
  }
})

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14 print:bg-white print:pb-0">
    <HelpSubpageBar
      :crumbs="crumbs"
      :mobile-title="currentLang === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'"
      back-fallback="/account"
      @open-help-chat="handleOpenHelpChat"
    />

    <LegalDocHeader
      v-if="doc"
      kind="privacy"
      :title="doc.title"
      :version="doc.version"
      :last-updated="doc.lastUpdated"
      :lang="currentLang"
      show-language-toggle
      @change-lang="setLanguage"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 print:max-w-none print:px-0 print:py-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <LegalTableOfContents
          v-if="sections.length > 0"
          :sections="sections"
          :active-section-id="activeSectionId"
          :lang="currentLang"
          show-privacy-deletion-box
        />

        <div class="lg:col-span-8 space-y-4 min-w-0">
          <LegalSearchHighlight
            v-if="doc"
            v-model="searchQuery"
            :match-count="matchCount"
            :active-index="activeMatchIndex"
            :lang="currentLang"
            @next="nextMatch"
            @prev="prevMatch"
            @clear="clearSearch"
          />

          <LegalBodyContent
            :html="doc?.contentHtml || ''"
            :loading="pending"
            :search-query="searchQuery"
            :active-match-index="activeMatchIndex"
            @retry="refresh()"
            @update:match-count="matchCount = $event"
          />
        </div>
      </div>

      <StaticQuickLinks current="/policy/privacy" :lang="currentLang" />
    </main>
  </div>
</template>
