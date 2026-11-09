<script setup lang="ts">
import { onMounted } from 'vue'
import { Check, ArrowLeft, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useBekaskuPlus } from '~/composables/useBekaskuPlus'

useHead({
  title: 'Daftar Menjadi Penjual Resmi BekasKu+ — BekasKu',
  meta: [
    {
      name: 'description',
      content:
        'Bergabung & raih kepercayaan lebih bersama BekasKu+. Dapatkan badge verified centang emas di profil & produk, prioritas tampil di pencarian & beranda.',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/bekasku-plus' }],
})

const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()

const { status, fetchStatus } = useBekaskuPlus()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await fetchStatus()
  }
})

const benefits = [
  'Badge Verified Centang Emas di Profil & Produk.',
  'Prioritas Tampil di Pencarian & Beranda.',
  'Profil Tampil di Section Influencer Beranda.',
  'Bebas Biaya Sundul & Highlight Produk.',
]

const handleAction = () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      redirectPath: '/bekasku-plus/apply',
      featureTitle: 'Daftar BekasKu+',
    })
    return
  }

  if (status.value === 'pending' || status.value === 'approved' || status.value === 'rejected') {
    router.push('/bekasku-plus/status')
    return
  }

  router.push('/bekasku-plus/apply')
}
</script>

<template>
  <div class="min-h-screen bg-white md:bg-surface-2 flex flex-col justify-between md:justify-center py-0 md:py-12">
    <!-- Breadcrumb (desktop) -->
    <div class="hidden md:block max-w-5xl w-full mx-auto px-4 sm:px-6 mb-4">
      <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="text-text font-medium">Daftar BekasKu+</span>
      </nav>
    </div>

    <!-- Main Container -->
    <main class="w-full max-w-5xl mx-auto bg-white md:rounded-3xl md:border md:border-border md:shadow-xs p-5 sm:p-8 lg:p-12 flex-1 md:flex-none flex flex-col justify-between">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        <!-- Left: Official Illustration (Desktop Only) -->
        <div class="hidden md:flex md:col-span-5 items-center justify-center bg-surface-2 rounded-2xl p-6 lg:p-8 border border-border-light">
          <img
            src="/images/bekasku-plus/bekasku_plus_approved.png"
            alt="Ilustrasi Seller Resmi BekasKu+"
            width="320"
            height="280"
            class="w-full max-w-xs h-auto object-contain"
          />
        </div>

        <!-- Right (Desktop) / Full Column (Mobile): Logo, Headline, Benefits, CTA -->
        <div class="md:col-span-7 flex flex-col justify-between h-full md:h-auto space-y-6">
          <div class="space-y-6">
            <!-- Mobile Top Bar -->
            <div class="flex md:hidden items-center gap-3 pb-3 border-b border-border-light">
              <button
                type="button"
                class="p-1 -ml-1 text-text hover:text-primary transition-colors cursor-pointer"
                aria-label="Kembali"
                @click="router.back()"
              >
                <ArrowLeft class="w-5 h-5" />
              </button>
              <span class="text-base font-semibold text-text font-outfit">
                Daftar Bekasku+
              </span>
            </div>

            <!-- Logo BekasKu+ -->
            <div class="flex justify-center md:justify-start pt-2 md:pt-0">
              <img
                src="/images/bekasku-plus/bekasku_plus_variant_6_horizontal.png"
                alt="BekasKu+"
                width="180"
                height="40"
                class="h-10 md:h-9 w-auto object-contain"
              />
            </div>

            <!-- Headline -->
            <h1 class="text-lg md:text-xl lg:text-2xl font-bold text-text font-outfit leading-snug">
              Bergabung & Raih Kepercayaan Lebih Bersama Bekasku+
            </h1>

            <!-- 4 Benefits List with Checkmarks -->
            <ul class="space-y-4 pt-1">
              <li
                v-for="(benefit, idx) in benefits"
                :key="idx"
                class="flex items-center gap-3.5"
              >
                <div class="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                  <Check class="w-3.5 h-3.5 text-white stroke-[3]" />
                </div>
                <span class="text-xs sm:text-sm text-text font-medium font-outfit leading-relaxed">
                  {{ benefit }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Action Button -->
          <div class="pt-8 md:pt-4">
            <button
              type="button"
              class="w-full md:w-auto md:px-8 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-98"
              @click="handleAction"
            >
              <template v-if="status === 'none'">Daftar Sekarang</template>
              <template v-else-if="status === 'pending'">Cek Status Pengajuan (Menunggu)</template>
              <template v-else-if="status === 'approved'">Kelola Toko BekasKu+</template>
              <template v-else>Daftar Ulang / Ajukan Kembali</template>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
