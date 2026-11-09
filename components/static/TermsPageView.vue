<script setup lang="ts">
import { computed } from 'vue'
import {
  LEGAL_TERMS_UPDATED,
  LEGAL_TERMS_VERSION,
} from '~/utils/constants'
import { useLegalPolicy, useLegalReader } from '~/composables/useLegalPolicy'
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
    canonicalPath: '/policy/terms',
  },
)

const helpChatStore = useHelpChatStore()
const { fetchTermsDocument } = useLegalPolicy()

const {
  data: termsResult,
  pending,
  refresh,
} = await useAsyncData('legal-terms-document', () => fetchTermsDocument())

const doc = computed(() => termsResult.value?.document || null)
const docError = computed(() => termsResult.value?.error || '')
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

const crumbs = [
  { label: 'Beranda', to: '/' },
  { label: 'Pusat Bantuan', to: '/faq' },
  { label: 'Syarat & Ketentuan' },
]

useHead(() => ({
  title: 'Syarat dan Ketentuan Layanan - BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Pelajari Syarat dan Ketentuan resmi platform jual beli barang baru dan preloved BekasKu, Rekening Bersama (Rekber), video packing/unboxing, serta aturan transaksi aman.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Syarat dan Ketentuan Layanan - BekasKu' },
    {
      property: 'og:description',
      content:
        'Syarat dan Ketentuan resmi penggunaan marketplace BekasKu oleh PT Jantaka Ladang Unggul.',
    },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: `https://bekasku.id${props.canonicalPath}` }],
}))

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14 print:bg-white print:pb-0">
    <HelpSubpageBar
      :crumbs="crumbs"
      mobile-title="Syarat & Ketentuan"
      back-fallback="/account"
      @open-help-chat="handleOpenHelpChat"
    />

    <LegalDocHeader
      kind="terms"
      :title="doc?.title || 'Syarat & Ketentuan Layanan'"
      :version="doc?.version || LEGAL_TERMS_VERSION"
      :last-updated="doc?.lastUpdated || LEGAL_TERMS_UPDATED"
      lang="id"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 print:max-w-none print:px-0 print:py-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <LegalTableOfContents
          v-if="sections.length > 0 && !docError"
          :sections="sections"
          :active-section-id="activeSectionId"
          lang="id"
        />

        <div
          class="space-y-4 min-w-0"
          :class="sections.length > 0 && !docError ? 'lg:col-span-8' : 'lg:col-span-12'"
        >
          <LegalSearchHighlight
            v-if="doc && !docError"
            v-model="searchQuery"
            :match-count="matchCount"
            :active-index="activeMatchIndex"
            lang="id"
            @next="nextMatch"
            @prev="prevMatch"
            @clear="clearSearch"
          />

          <LegalBodyContent
            :html="doc?.contentHtml || ''"
            :loading="pending"
            :error="docError"
            :search-query="searchQuery"
            :active-match-index="activeMatchIndex"
            @retry="refresh()"
            @update:match-count="matchCount = $event"
          />
        </div>
      </div>

      <StaticQuickLinks current="/policy/terms" />
    </main>
  </div>
</template>
