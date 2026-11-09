<script setup lang="ts">
import { computed } from 'vue'
import { useLegalPolicy } from '~/composables/useLegalPolicy'
import { useHelpChatStore } from '~/stores/helpChat'
import HelpSubpageBar from '~/components/help/HelpSubpageBar.vue'
import AboutCompanyHero from '~/components/static/AboutCompanyHero.vue'
import AboutContactSection from '~/components/static/AboutContactSection.vue'
import StaticQuickLinks from '~/components/static/StaticQuickLinks.vue'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'

const helpChatStore = useHelpChatStore()
const { fetchCompanyInfo } = useLegalPolicy()

const { data: companyInfo, pending } = await useAsyncData('about-company-info', () =>
  fetchCompanyInfo(),
)

const company = computed(() => companyInfo.value)

const crumbs = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang Kami' },
]

useHead(() => ({
  title: 'Tentang Kami - BekasKu Marketplace Preloved',
  meta: [
    {
      name: 'description',
      content:
        'Kenali lebih dekat PT Jantaka Ladang Unggul (BekasKu), marketplace jual beli barang baru dan preloved terpercaya dengan sistem Rekening Bersama dan dukungan kurasi BekasKu+.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Tentang Kami - BekasKu Marketplace Preloved' },
    {
      property: 'og:description',
      content:
        'Profil perusahaan, visi misi ekonomi sirkular, kantor operasional Medan, dan kontak resmi platform BekasKu.',
    },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/about' }],
}))

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14">
    <HelpSubpageBar
      :crumbs="crumbs"
      mobile-title="Tentang Kami"
      back-fallback="/account"
      @open-help-chat="handleOpenHelpChat"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-8">
      <div v-if="pending && !company" class="space-y-6">
        <div class="bg-surface border border-border rounded-3xl p-8 space-y-4">
          <AppSkeleton width="180px" height="24px" rounded="rounded-full" />
          <AppSkeleton width="75%" height="36px" rounded="rounded-lg" />
          <AppSkeleton width="90%" height="18px" rounded="rounded-md" />
          <AppSkeleton width="65%" height="18px" rounded="rounded-md" />
        </div>
      </div>

      <template v-else-if="company">
        <AboutCompanyHero :company="company" />
        <AboutContactSection :company="company" />
        <StaticQuickLinks current="/about" />
      </template>
    </main>
  </div>
</template>

