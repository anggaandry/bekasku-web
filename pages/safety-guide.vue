<script setup lang="ts">
import { useHelpChatStore } from '~/stores/helpChat'
import HelpSubpageBar from '~/components/help/HelpSubpageBar.vue'
import SafetyGuideSection from '~/components/static/SafetyGuideSection.vue'
import StaticQuickLinks from '~/components/static/StaticQuickLinks.vue'

const helpChatStore = useHelpChatStore()

const crumbs = [
  { label: 'Beranda', to: '/' },
  { label: 'Pusat Bantuan', to: '/faq' },
  { label: 'Panduan Keamanan' },
]

useHead({
  title: 'Panduan Keamanan Bertransaksi - BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Pelajari 5 aturan utama bertransaksi aman di BekasKu, kewajiban Rekber, kehati-hatian terhadap tautan palsu, kerahasiaan OTP, serta scan QR Code COD.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Panduan Keamanan Bertransaksi - BekasKu' },
    {
      property: 'og:description',
      content:
        'Panduan keamanan bertransaksi jual beli barang bekas dan preloved agar terhindar dari penipuan.',
    },
    { property: 'og:type', content: 'website' },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/safety-guide' }],
})

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-outfit pb-20 md:pb-14">
    <HelpSubpageBar
      :crumbs="crumbs"
      mobile-title="Panduan Keamanan"
      back-fallback="/account"
      @open-help-chat="handleOpenHelpChat"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <SafetyGuideSection />
      <StaticQuickLinks current="/safety-guide" />
    </main>
  </div>
</template>

