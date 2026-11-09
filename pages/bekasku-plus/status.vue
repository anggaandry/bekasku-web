<script setup lang="ts">
import { onMounted } from 'vue'
import {
  ChevronRight,
  ArrowLeft,
  Headset,
  Loader2,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useBekaskuPlus } from '~/composables/useBekaskuPlus'
import { useHelpChatStore } from '~/stores/helpChat'
import BekaskuPlusStatusCard from '~/components/bekasku-plus/BekaskuPlusStatusCard.vue'

useHead({
  title: 'Status Pengajuan BekasKu+ — BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Pantau status verifikasi dan kurasi toko resmi BekasKu+. Dapatkan informasi persetujuan atau catatan perbaikan langsung dari tim admin.',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/bekasku-plus/status' }],
})

const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()
const helpChatStore = useHelpChatStore()

function openBekaskuCenterCs() {
  helpChatStore.openHelpChat({
    topic: 'bekaskuPlus',
    referenceTitle: 'Status Verifikasi BekasKu+',
    initialMessage: 'Halo Admin BekasKu, saya ingin bertanya mengenai status pengajuan BekasKu+.',
  })
}

const {
  status,
  isRegistered,
  adminNote,
  application,
  loading,
  fetchStatus,
} = useBekaskuPlus()

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      redirectPath: '/bekasku-plus/status',
      featureTitle: 'Status BekasKu+',
    })
    return
  }

  const res = await fetchStatus()
  if (!res || res.status === 'none') {
    // If not registered yet, redirect to landing
    router.replace('/bekasku-plus')
  }
})

const handleReapply = () => {
  router.push('/bekasku-plus/apply')
}

const handleBackHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-surface-2 py-6 sm:py-10">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
      <!-- Breadcrumb (desktop) -->
      <nav class="hidden md:flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <NuxtLink to="/bekasku-plus" class="hover:text-primary transition-colors">BekasKu+</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="text-text font-medium">Status Pengajuan</span>
      </nav>

      <!-- Mobile Top Bar with Back and CS button -->
      <div class="flex items-center justify-between md:hidden">
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-text cursor-pointer"
          @click="router.push('/bekasku-plus')"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <h1 class="text-base font-bold text-text font-outfit">
          Status Bekasku+
        </h1>
        <button
          type="button"
          aria-label="Hubungi Customer Service BekasKu"
          class="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-primary cursor-pointer"
          @click="openBekaskuCenterCs"
        >
          <Headset class="w-4 h-4" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-3xl p-12 border border-border text-center space-y-4 shadow-xs">
        <Loader2 class="w-8 h-8 text-primary animate-spin mx-auto" />
        <p class="text-xs sm:text-sm text-text-muted">
          Memeriksa status pendaftaran BekasKu+ Anda...
        </p>
      </div>

      <!-- Main Status Card -->
      <BekaskuPlusStatusCard
        v-else
        :status="status"
        :admin-note="adminNote"
        :application="application"
        :loading="loading"
        @reapply="handleReapply"
        @back-home="handleBackHome"
      />
    </div>
  </div>
</template>

