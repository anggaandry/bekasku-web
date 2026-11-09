<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { ArrowLeft, CircleHelp, Headset, LogIn } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useHelpChatStore } from '~/stores/helpChat'
import { useAuthModal } from '~/composables/useAuthModal'
import HelpChatRoomView from '~/components/help/HelpChatRoomView.vue'

useHead({
  title: 'BekasKu Center Live Chat - BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Hubungi tim Customer Support resmi BekasKu Center secara langsung melalui live chat.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/help/chat' }],
})

const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()
const helpChatStore = useHelpChatStore()

async function initHelpChatPage() {
  helpChatStore.isFloatingOpen = false
  helpChatStore.isFloatingMinimized = false
  if (!authStore.isLoggedIn) return
  helpChatStore.connectWebSocket()
  await helpChatStore.fetchMessages({ resetPage: true, silent: helpChatStore.messages.length > 0 })
}

onMounted(() => {
  initHelpChatPage()
})

watch(
  () => authStore.isLoggedIn,
  (logged) => {
    if (logged) {
      initHelpChatPage()
    }
  },
)

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/help')
  }
}

function handleLogin() {
  authModal.openLogin({
    featureTitle: 'BekasKu Center Live Chat',
    redirectPath: '/help/chat',
  })
}
</script>

<template>
  <div class="bg-bg min-h-[100dvh] md:min-h-0 md:h-[calc(100dvh-106px)] md:py-3.5 font-outfit md:flex md:flex-col">
    <!-- Desktop Breadcrumb -->
    <div class="hidden md:block w-full max-w-4xl mx-auto px-4 lg:px-6 pb-2.5 shrink-0">
      <nav aria-label="Breadcrumb" class="flex items-center justify-between text-xs text-text-muted">
        <div class="flex items-center gap-1.5">
          <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
          <span class="text-text-subtle">/</span>
          <NuxtLink to="/help" class="hover:text-primary transition-colors">Pusat Bantuan</NuxtLink>
          <span class="text-text-subtle">/</span>
          <span class="text-text font-semibold">BekasKu Center</span>
        </div>

        <NuxtLink
          to="/help"
          class="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
        >
          <CircleHelp class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Lihat FAQ</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="w-full max-w-4xl mx-auto md:px-4 lg:px-6 md:flex-1 md:min-h-0">
      <!-- Guest Gate -->
      <div
        v-if="!authStore.isLoggedIn"
        class="bg-white md:rounded-2xl md:border md:border-border-light md:shadow-xs overflow-hidden"
      >
        <div class="md:hidden px-3 h-14 border-b border-border flex items-center gap-2">
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-2 text-text cursor-pointer"
            aria-label="Kembali"
            @click="goBack"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="font-bold text-base text-text">BekasKu Center</span>
        </div>

        <div class="px-6 py-16 text-center space-y-4">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Headset class="w-8 h-8" aria-hidden="true" />
          </div>
          <div class="space-y-1.5 max-w-md mx-auto">
            <h1 class="font-outfit font-bold text-lg sm:text-xl text-text">
              Masuk untuk Chat BekasKu Center
            </h1>
            <p class="font-outfit text-xs sm:text-sm text-text-muted leading-relaxed">
              Silakan masuk ke akun BekasKu Anda agar tim Customer Support dapat membantu kendala akun, pesanan, atau saldo secara langsung.
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              class="min-h-[44px] px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              @click="handleLogin"
            >
              <LogIn class="w-4 h-4" aria-hidden="true" />
              <span>Masuk ke Akun</span>
            </button>
            <NuxtLink
              to="/help"
              class="min-h-[44px] px-5 py-2.5 rounded-full border border-border bg-white hover:bg-surface-2 text-text font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
            >
              <CircleHelp class="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Buka Pusat Bantuan</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Full-Page Authenticated Chat Container -->
      <div
        v-else
        class="bg-white md:rounded-2xl md:border md:border-border-light md:shadow-xs overflow-hidden h-[100dvh] md:h-full md:min-h-[380px] flex flex-col"
      >
        <HelpChatRoomView
          show-back-button
          @back="goBack"
        />
      </div>
    </div>
  </div>
</template>

