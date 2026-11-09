<script setup lang="ts">
import { onMounted, computed } from 'vue'
import {
  ArrowLeft,
  Headset,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'
import { useSubscribeVip } from '~/composables/useSubscribeVip'
import { formatRupiah } from '~/utils/format'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useHelpChatStore } from '~/stores/helpChat'
import VipStatusCard from '~/components/subscribe/VipStatusCard.vue'
import VipDurationCards from '~/components/subscribe/VipDurationCards.vue'
import VipSummaryCard from '~/components/subscribe/VipSummaryCard.vue'
import VipBenefitList from '~/components/subscribe/VipBenefitList.vue'
import SubscribeWizardStep from '~/components/subscribe/SubscribeWizardStep.vue'

useHead({
  title: 'Pilih Paket VIP — BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Nikmati kuota posting iklan tanpa batas, posting cepat dengan AI, bebas iklan, dan badge VIP eksklusif di BekasKu.',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/subscribe/vip' }],
})

const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()
const helpChatStore = useHelpChatStore()
const formatPrice = formatRupiah

const {
  loading,
  error,
  packages,
  selectedPackage,
  mySubscribedDays,
  isVipActive,
  activeDisplayName,
  fetchInitialSubscribeData,
  selectPackage,
  saveSubscribeDraft,
} = useSubscribeVip()

onMounted(() => {
  fetchInitialSubscribeData()
})

const ctaButtonLabel = computed(() => {
  const pkg = selectedPackage.value
  if (!pkg) {
    return isVipActive.value ? 'Pilih Paket Perpanjangan' : 'Pilih Paket VIP'
  }
  const formatted = formatPrice(pkg.final_price)
  return isVipActive.value
    ? `Perpanjang VIP ${formatted}`
    : `Langganan VIP ${formatted}`
})

const discountAmount = computed(() => {
  if (!selectedPackage.value) return 0
  return Math.max(0, selectedPackage.value.price - selectedPackage.value.final_price)
})

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

function openBekaskuCenter() {
  const statusLine = isVipActive.value
    ? `Status: Aktif (${mySubscribedDays.value} hari tersisa).`
    : 'Status: Belum Berlangganan VIP.'
  const text = `Halo Tim BekasKu Center, saya butuh informasi / bantuan terkait langganan VIP BekasKu. ${statusLine} Mohon info panduan benefit / perpanjangan VIP.`

  helpChatStore.openHelpChat({
    topic: 'vip',
    referenceTitle: 'Langganan VIP BekasKu',
    initialMessage: text,
  })
}

function handleProceedToPayment() {
  if (!selectedPackage.value) return

  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      redirectPath: '/subscribe/vip',
      featureTitle: 'Langganan VIP',
    })
    return
  }

  saveSubscribeDraft(selectedPackage.value)
  navigateTo(`/subscribe/vip/payment?days=${selectedPackage.value.days}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white md:bg-bg font-outfit">
    <!-- ================================================================= -->
    <!-- Mobile Sticky AppBar (< md) — 1:1 Gambar 3                        -->
    <!-- ================================================================= -->
    <header class="md:hidden sticky top-0 z-30 bg-white border-b border-border/60">
      <div class="px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
        </button>

        <h1 class="text-base font-bold text-text truncate">
          Pilih Paket VIP
        </h1>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-surface-2 border border-border-light flex items-center justify-center text-text hover:text-primary transition-colors cursor-pointer"
          aria-label="Hubungi Bantuan BekasKu Center"
          title="Bantuan Langganan VIP"
          @click="openBekaskuCenter"
        >
          <Headset class="w-4 h-4 stroke-[2]" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- ================================================================= -->
    <!-- Main Content                                                      -->
    <!-- ================================================================= -->
    <main class="flex-1 pb-28 lg:pb-16">
      <!-- Step Wizard Minimalis untuk Alur Pembelian VIP (Desktop md+) -->
      <SubscribeWizardStep :current-step="1" />

      <div class="max-w-[1200px] mx-auto px-5 sm:px-4 py-4 md:py-4">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white md:rounded-3xl md:border md:border-border"
        >
          <Loader2 class="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
          <p class="text-xs sm:text-sm text-text-muted">
            Memuat paket langganan VIP...
          </p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error && packages.length === 0"
          class="py-16 bg-white rounded-3xl border border-border p-6 text-center space-y-4 max-w-md mx-auto"
        >
          <div
            class="w-12 h-12 mx-auto rounded-full bg-danger/10 text-danger flex items-center justify-center"
          >
            <AlertCircle class="w-6 h-6" aria-hidden="true" />
          </div>
          <div class="space-y-1">
            <h2 class="text-base font-bold text-text">Gagal Memuat Paket VIP</h2>
            <p class="text-xs text-text-muted">{{ error }}</p>
          </div>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer"
            @click="fetchInitialSubscribeData"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Loaded Layout: Mobile Single Column / Desktop 2-Column (8 : 4) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <!-- ============================================================= -->
          <!-- Kolom Kiri (lg:col-span-8): Status + Pilihan Durasi + Benefit -->
          <!-- ============================================================= -->
          <div class="lg:col-span-8 space-y-8 md:bg-white md:rounded-3xl md:border md:border-border md:p-7 md:shadow-2xs">
            <!-- 1. Jika Sudah Member VIP Aktif: Tampilkan Status Card + Header Perpanjang -->
            <template v-if="isVipActive">
              <VipStatusCard
                :display-name="activeDisplayName"
                :remaining-days="mySubscribedDays"
              />

              <div class="space-y-4">
                <div class="space-y-1">
                  <h2 class="text-base sm:text-lg font-bold text-text">
                    Perpanjang Masa Aktif
                  </h2>
                  <p class="text-xs sm:text-[13px] text-text-muted">
                    Pilih durasi berikut untuk menambah masa aktif VIP kamu.
                  </p>
                </div>

                <VipDurationCards
                  :packages="packages"
                  :selected-package="selectedPackage"
                  @select="selectPackage"
                />
              </div>
            </template>

            <!-- 2. Jika Belum Member VIP: Langsung Tampilkan 3 Kartu Durasi (Sesuai Gambar 3) -->
            <template v-else>
              <VipDurationCards
                :packages="packages"
                :selected-package="selectedPackage"
                @select="selectPackage"
              />
            </template>

            <!-- 3. Daftar 8 Benefit Langganan / Benefit Aktif -->
            <VipBenefitList :is-vip-active="isVipActive" />
          </div>

          <!-- ============================================================= -->
          <!-- Kolom Kanan Desktop (lg:col-span-4): Sticky Summary & CTA     -->
          <!-- ============================================================= -->
          <aside class="hidden lg:block lg:col-span-4 sticky top-24">
            <VipSummaryCard
              :selected-package="selectedPackage"
              :is-vip-active="isVipActive"
              :my-subscribed-days="mySubscribedDays"
              :discount-amount="discountAmount"
              :cta-label="ctaButtonLabel"
              @proceed="handleProceedToPayment"
            />
          </aside>
        </div>
      </div>
    </main>

    <!-- ================================================================= -->
    <!-- Mobile Sticky Bottom CTA Bar (< lg) — 1:1 Gambar 3                -->
    <!-- ================================================================= -->
    <div
      v-if="!loading && packages.length > 0"
      class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border px-5 py-3 shadow-md"
    >
      <button
        type="button"
        :disabled="!selectedPackage"
        class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-99"
        @click="handleProceedToPayment"
      >
        {{ ctaButtonLabel }}
      </button>
    </div>
  </div>
</template>
