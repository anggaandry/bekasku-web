<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useBekaskuPlus } from '~/composables/useBekaskuPlus'
import CategoryMultiSelector from '~/components/bekasku-plus/CategoryMultiSelector.vue'
import BekaskuPlusConfirmModal from '~/components/bekasku-plus/BekaskuPlusConfirmModal.vue'
import type { BekaskuPlusCategory } from '~/types/bekasku-plus'

useHead({
  title: 'Form Pendaftaran BekasKu+ — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Form Pendaftaran resmi mitra seller terkurasi BekasKu+.',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://bekasku.id/bekasku-plus/apply' }],
})

const router = useRouter()
const authStore = useAuthStore()
const authModal = useAuthModal()

const {
  status,
  application,
  categories: availableCategories,
  loadingCategories,
  submitting,
  fetchStatus,
  fetchCategories,
  submitApplication,
} = useBekaskuPlus()

// Form states
const fullName = ref('')
const shopName = ref('')
const whatsapp = ref('')
const email = ref('')
const instagram = ref('')
const tiktok = ref('')
const selectedCategories = ref<Array<{ id: string; name: string }>>([])

const errorMessage = ref<string | null>(null)
const showConfirmModal = ref(false)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      redirectPath: '/bekasku-plus/apply',
      featureTitle: 'Daftar BekasKu+',
    })
    return
  }

  const res = await fetchStatus()
  await fetchCategories()

  if (res?.status === 'pending' || res?.status === 'approved') {
    router.replace('/bekasku-plus/status')
    return
  }

  if (res?.application) {
    fullName.value = res.application.full_name || ''
    shopName.value = res.application.shop_name || ''
    whatsapp.value = res.application.whatsapp || ''
    email.value = res.application.email || ''
    instagram.value = res.application.instagram || ''
    tiktok.value = res.application.tiktok || ''
    if (res.application.categories && Array.isArray(res.application.categories)) {
      selectedCategories.value = res.application.categories.map((c) => ({
        id: c.category_id,
        name: c.category_name,
      }))
    }
  } else {
    const u = authStore.user
    if (u) {
      if (u.name) fullName.value = u.name
      if (u.username) shopName.value = u.username
      if (u.phone) whatsapp.value = u.phone
      if (u.email) email.value = u.email
    }
  }
})

function validateForm(): boolean {
  errorMessage.value = null

  if (!fullName.value.trim()) {
    errorMessage.value = 'Nama Lengkap (KTP) wajib diisi'
    return false
  }
  if (!shopName.value.trim()) {
    errorMessage.value = 'Nama Toko / Creator wajib diisi'
    return false
  }
  if (!whatsapp.value.trim()) {
    errorMessage.value = 'Nomor WhatsApp wajib diisi'
    return false
  }
  if (!email.value.trim()) {
    errorMessage.value = 'Email wajib diisi'
    return false
  }
  if (!instagram.value.trim()) {
    errorMessage.value = 'Akun Instagram wajib diisi'
    return false
  }
  if (!tiktok.value.trim()) {
    errorMessage.value = 'Akun TikTok wajib diisi'
    return false
  }
  if (selectedCategories.value.length === 0) {
    errorMessage.value = 'Pilih minimal 1 kategori barang yang dijual'
    return false
  }

  return true
}

function handleOpenConfirm() {
  if (validateForm()) {
    showConfirmModal.value = true
  }
}

async function handleConfirmSubmit() {
  const payloadCategories: BekaskuPlusCategory[] = selectedCategories.value.map((c) => ({
    category_id: c.id,
    category_name: c.name,
  }))

  const res = await submitApplication({
    full_name: fullName.value.trim(),
    shop_name: shopName.value.trim(),
    whatsapp: whatsapp.value.trim(),
    email: email.value.trim(),
    instagram: instagram.value.trim(),
    tiktok: tiktok.value.trim(),
    categories: payloadCategories,
  })

  showConfirmModal.value = false

  if (res.success) {
    router.push('/bekasku-plus/status')
  } else {
    errorMessage.value = res.message
  }
}
</script>

<template>
  <div class="min-h-screen bg-white md:bg-surface-2 py-0 md:py-10">
    <!-- Breadcrumb (desktop) -->
    <div class="hidden md:block max-w-3xl mx-auto px-4 mb-4">
      <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <NuxtLink to="/bekasku-plus" class="hover:text-primary transition-colors">BekasKu+</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="text-text font-medium">Form Pendaftaran</span>
      </nav>
    </div>

    <!-- Main Form Container -->
    <main class="w-full max-w-3xl mx-auto bg-white md:rounded-2xl md:border md:border-border md:shadow-xs p-5 sm:p-8">
      <!-- Header with Back Button (matches Image 3) -->
      <div class="flex items-center gap-3 pb-5 border-b border-border-light mb-6">
        <button
          type="button"
          class="p-1 -ml-1 text-text hover:text-primary transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-text font-outfit">
          Form Pendaftaran Bekasku+
        </h1>
      </div>

      <!-- Error Alert Banner -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form (split left-right on desktop, single-column on mobile) -->
      <form class="space-y-6" @submit.prevent="handleOpenConfirm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <!-- Kolom Kiri -->
          <div class="space-y-4">
            <!-- Field 1: Nama Lengkap (KTP) -->
            <div class="space-y-2">
              <label for="fullName" class="block text-sm font-bold text-text font-outfit">
                Nama Lengkap (KTP)
              </label>
              <input
                id="fullName"
                v-model="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>

            <!-- Field 2: Nama Toko / Creator -->
            <div class="space-y-2">
              <label for="shopName" class="block text-sm font-bold text-text font-outfit">
                Nama Toko / Creator
              </label>
              <input
                id="shopName"
                v-model="shopName"
                name="shopName"
                type="text"
                placeholder="Cth. bekasku"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>

            <!-- Field 3: Nomor Whatsapp -->
            <div class="space-y-2">
              <label for="whatsapp" class="block text-sm font-bold text-text font-outfit">
                Nomor Whatsapp
              </label>
              <input
                id="whatsapp"
                v-model="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="Cth. 081xxxxxxx"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>

            <!-- Field 4: Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-bold text-text font-outfit">
                Email
              </label>
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                placeholder="Cth. bekasku@email.co"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>
          </div>

          <!-- Kolom Kanan -->
          <div class="space-y-4">
            <!-- Field 5: Akun Instagram -->
            <div class="space-y-2">
              <label for="instagram" class="block text-sm font-bold text-text font-outfit">
                Akun Instagram
              </label>
              <input
                id="instagram"
                v-model="instagram"
                name="instagram"
                type="text"
                placeholder="@username"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>

            <!-- Field 6: Akun TikTok -->
            <div class="space-y-2">
              <label for="tiktok" class="block text-sm font-bold text-text font-outfit">
                Akun TikTok
              </label>
              <input
                id="tiktok"
                v-model="tiktok"
                name="tiktok"
                type="text"
                placeholder="@username"
                class="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>

            <!-- Field 7: Kategori Utama Barang yang Dijual -->
            <div class="space-y-2">
              <label class="block text-sm font-bold text-text font-outfit">
                Kategori Utama Barang yang Dijual
              </label>
              <CategoryMultiSelector
                v-model="selectedCategories"
                :categories="availableCategories"
                :loading="loadingCategories"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button (Full width at bottom) -->
        <div class="pt-4 border-t border-border-light">
          <button
            type="submit"
            class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            :disabled="submitting"
          >
            <Loader2 v-if="submitting" class="w-4 h-4 animate-spin mr-2" />
            <span>Kirim Pengajuan Bekasku+</span>
          </button>
        </div>
      </form>
    </main>

    <!-- Confirmation Modal Dialog -->
    <BekaskuPlusConfirmModal
      v-model="showConfirmModal"
      :loading="submitting"
      @confirm="handleConfirmSubmit"
    />
  </div>
</template>
