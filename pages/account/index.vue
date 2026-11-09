<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-vue-next'

import AccountUserSummaryCard from '~/components/account/AccountUserSummaryCard.vue'
import AccountSidebar from '~/components/account/AccountSidebar.vue'
import AccountProfileView from '~/components/account/AccountProfileView.vue'
import AccountAddressTab from '~/components/account/AccountAddressTab.vue'
import AccountBankTab from '~/components/account/AccountBankTab.vue'
import AccountSecurityTab from '~/components/account/AccountSecurityTab.vue'
import AccountIdentityTab from '~/components/account/AccountIdentityTab.vue'
import AccountNotificationsTab from '~/components/account/AccountNotificationsTab.vue'
import AccountDeleteTab from '~/components/account/AccountDeleteTab.vue'
import AccountEditNameModal from '~/components/account/AccountEditNameModal.vue'
import AccountEditBioModal from '~/components/account/AccountEditBioModal.vue'
import AccountGenderModal from '~/components/account/AccountGenderModal.vue'
import AccountDatebirthModal from '~/components/account/AccountDatebirthModal.vue'
import AccountSocialModal from '~/components/account/AccountSocialModal.vue'
import AccountLanguageModal from '~/components/account/AccountLanguageModal.vue'
import AccountInfoTooltipModal from '~/components/account/AccountInfoTooltipModal.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'
import AppModal from '~/components/shared/AppModal.vue'
import { useChatStore } from '~/stores/chat'
import { useHelpChatStore } from '~/stores/helpChat'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Pengaturan Akun - BekasKu',
  meta: [
    { name: 'description', content: 'Kelola informasi profil, alamat, keamanan, dan pengaturan akun BekasKu Anda.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const helpChatStore = useHelpChatStore()
const { t } = useLocale()

const {
  profile,
  accountSetting,
  identityInfo,
  notificationList,
  isLoading,
  isSubmitting,
  errorMessage,
  fetchProfileInfo,
  fetchAccountSetting,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  cancelDeleteAccount,
  fetchNotifications,
  updateNotifications,
  verifySocialCode,
  disconnectSocial,
  fetchIdentityInfo,
} = useProfile()

const { addresses, fetchAddresses } = useAddress()

type AccountTabId = 'profile' | 'address' | 'bank' | 'security' | 'identity' | 'notifications' | 'delete'
const ACCOUNT_TAB_IDS: readonly AccountTabId[] = [
  'profile',
  'address',
  'bank',
  'security',
  'identity',
  'notifications',
  'delete',
]

// Active Tab ('profile' | 'address' | 'bank' | 'security' | 'identity' | 'notifications' | 'delete')
const activeTab = computed<AccountTabId>({
  get: () => {
    const q = String(route.query.tab || 'profile') as AccountTabId
    if (ACCOUNT_TAB_IDS.includes(q)) {
      return q
    }
    return 'profile'
  },
  set: (val) => {
    router.replace({ query: { ...route.query, tab: val } })
  },
})

// Mobile Drill-down Navigation State
const isMobileDetailActive = ref(Boolean(route.query.tab))

const tabTitles: Record<string, string> = {
  profile: 'Ubah Profil',
  address: 'Daftar Alamat',
  bank: 'Rekening Bank',
  security: 'Ubah Password',
  identity: 'Kartu Identitas',
  notifications: 'Notifikasi',
  delete: 'Hapus Akun',
}
const activeMenu = computed(() => String(route.query.menu || ''))

const currentTabTitle = computed(() => {
  if (activeMenu.value === 'payment-method') return t('Metode Pembayaran')
  return t(tabTitles[activeTab.value] || 'Pengaturan Akun')
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab) {
      isMobileDetailActive.value = true
    } else {
      isMobileDetailActive.value = false
    }
  }
)

function handleSelectTab(tab: string) {
  isMobileDetailActive.value = true
  const nextQuery: Record<string, string | (string | null)[] | null | undefined> = { ...route.query }
  if (tab === 'payment-method') {
    nextQuery.tab = 'bank'
    nextQuery.menu = 'payment-method'
  } else {
    delete nextQuery.menu
    nextQuery.tab = tab
  }
  delete nextQuery.modal
  router.push({ query: nextQuery })
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleBackToMobileMenu() {
  if (route.query.tab) {
    router.back()
  } else {
    isMobileDetailActive.value = false
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handlePageBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

// Modal Visibility State
const showEditNameModal = ref(false)
const showEditBioModal = ref(false)
const showGenderModal = ref(false)
const showDatebirthModal = ref(false)
const showSocialModal = ref(false)
const socialModalType = ref<'instagram' | 'tiktok'>('instagram')
const showLanguageModal = ref(false)
const showTooltipModal = ref(false)
const tooltipData = ref({ title: '', description: '' })
const isAddressModalOpen = ref(false)
const showDeleteConfirmModal = ref(false)
const showLogoutConfirmModal = ref(false)

// Notifications local state
const notifOrder = ref(true)
const notifPromo = ref(true)
const notifFeed = ref(true)
const notifChat = ref(true)

function syncNotifSwitches() {
  const list = notificationList.value
  notifOrder.value = list.includes('Pesanan') || list.includes('Transaction') || list.length === 0
  notifPromo.value = list.includes('Promo') || list.length === 0
  notifFeed.value = list.includes('Feed') || list.length === 0
  notifChat.value = list.includes('Chat') || list.length === 0
}

// Single-field handlers (Immediate save per field, Mobile V3 pattern)
async function handleSaveName(name: string) {
  const res = await updateProfile({ name: name.trim() })
  if (res.success) {
    showEditNameModal.value = false
  }
}

async function handleSaveBio(bio: string) {
  const res = await updateProfile({ bio: bio.trim() })
  if (res.success) {
    showEditBioModal.value = false
  }
}

async function handleSaveGender(gender: 'L' | 'P') {
  const res = await updateProfile({ gender })
  if (res.success) {
    showGenderModal.value = false
  }
}

async function handleSaveDatebirth(datebirth: string) {
  const res = await updateProfile({ datebirth })
  if (res.success) {
    showDatebirthModal.value = false
  }
}

async function handleUploadAvatar(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Ukuran foto maksimal 5 MB'
    return
  }
  await uploadAvatar(file)
}

function handleOpenSocial(type: 'instagram' | 'tiktok') {
  socialModalType.value = type
  showSocialModal.value = true
}

async function handleVerifySocial(payload: { type: 'instagram' | 'tiktok'; username: string }) {
  const res = await verifySocialCode(payload.type, payload.username, true)
  if (res.success) {
    showSocialModal.value = false
  }
}

async function handleDisconnectSocial(type: 'instagram' | 'tiktok') {
  const res = await disconnectSocial(type)
  if (res.success) {
    showSocialModal.value = false
  }
}

function handleOpenTooltip(info: { title: string; description: string }) {
  tooltipData.value = info
  showTooltipModal.value = true
}

function handleEditPhone() {
  navigateTo('/phone/verify')
}

async function handleToggleNotif(key: 'order' | 'promo' | 'feed' | 'chat') {
  if (key === 'order') notifOrder.value = !notifOrder.value
  if (key === 'promo') notifPromo.value = !notifPromo.value
  if (key === 'feed') notifFeed.value = !notifFeed.value
  if (key === 'chat') notifChat.value = !notifChat.value

  const newList: string[] = []
  if (notifOrder.value) newList.push('Pesanan', 'Transaction')
  if (notifPromo.value) newList.push('Promo')
  if (notifFeed.value) newList.push('Feed')
  if (notifChat.value) newList.push('Chat')

  await updateNotifications(newList)
}

async function handleConfirmDeleteAccount() {
  showDeleteConfirmModal.value = false
  await deleteAccount()
}

async function handleCancelDelete() {
  await cancelDeleteAccount()
}

function handleLogout() {
  showLogoutConfirmModal.value = false
  chatStore.disconnectAll()
  helpChatStore.disconnectAll()
  authStore.clearSession()
  navigateTo('/')
}

async function loadIdentityData() {
  await fetchIdentityInfo()
}

onMounted(async () => {
  if (String(route.query.modal || '') === 'language') {
    showLanguageModal.value = true
  }
  await Promise.allSettled([
    fetchProfileInfo(),
    fetchAccountSetting(),
    fetchAddresses(),
    fetchNotifications(),
  ])
  syncNotifSwitches()
  if (activeTab.value === 'identity') {
    loadIdentityData()
  }
})

watch(
  () => route.query.modal,
  (modalVal) => {
    if (String(modalVal || '') === 'language') {
      showLanguageModal.value = true
    }
  },
)

watch(showLanguageModal, (open) => {
  if (!open && route.query.modal) {
    const nextQuery = { ...route.query }
    delete nextQuery.modal
    router.replace({ query: nextQuery })
  }
})

watch(activeTab, (tab) => {
  if (tab === 'identity' && !identityInfo.value) {
    loadIdentityData()
  }
})

watch(notificationList, () => {
  syncNotifSwitches()
})
</script>

<template>
  <div class="min-h-screen bg-bg pb-16 pt-4 text-text font-outfit">
    <div class="max-w-[1200px] mx-auto px-4 sm:px-6">
      <!-- Mobile Top Bar: Back Button & Title (Left) + Breadcrumb (Right) -->
      <div
        v-if="!isMobileDetailActive"
        class="lg:hidden flex items-center justify-between gap-3 mb-4"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-white border border-border/80 flex items-center justify-center text-text hover:text-primary active:scale-95 transition-all shadow-2xs cursor-pointer shrink-0"
            aria-label="Kembali ke halaman sebelumnya"
            @click="handlePageBack"
          >
            <ChevronLeft class="w-5 h-5 text-text" />
          </button>
          <h1 class="font-bold text-base sm:text-lg text-text truncate">
            {{ t('Pengaturan Akun') }}
          </h1>
        </div>

        <!-- Breadcrumb on the Right -->
        <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit min-w-0" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-primary transition-colors truncate">{{ t('Beranda') }}</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5 shrink-0 text-text-muted/60" />
          <span class="text-text font-medium truncate">{{ t('Akun') }}</span>
        </nav>
      </div>

      <!-- Desktop Breadcrumb (Left-aligned) -->
      <nav class="hidden lg:flex items-center gap-1.5 text-xs text-text-muted mb-4 font-outfit" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">{{ t('Beranda') }}</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="text-text font-medium">{{ t('Pengaturan Akun') }}</span>
        <template v-if="activeTab !== 'profile'">
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-primary font-semibold">{{ currentTabTitle }}</span>
        </template>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- ========================================== -->
        <!-- LEFT SIDEBAR: PROFILE SUMMARY & MENUS      -->
        <!-- ========================================== -->
        <div
          class="lg:col-span-4 space-y-4"
          :class="{ 'hidden lg:block': isMobileDetailActive }"
        >
          <!-- User Summary Profile Card (Desktop only, hidden on mobile) -->
          <ClientOnly>
            <AccountUserSummaryCard
              :profile="profile"
              @upload-avatar="handleUploadAvatar"
            />
            <template #fallback>
              <div class="hidden lg:block bg-white rounded-2xl p-5 border border-border shadow-2xs space-y-4 animate-pulse">
                <div class="flex items-center gap-3.5">
                  <div class="w-16 h-16 rounded-full bg-surface-2 border border-border shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-surface-2 rounded-md w-3/4"></div>
                    <div class="h-3 bg-surface-2 rounded-md w-1/2"></div>
                  </div>
                </div>
              </div>
            </template>
          </ClientOnly>

          <!-- Complete Menu Navigation Sidebar -->
          <AccountSidebar
            class="lg:sticky lg:top-[118px]"
            :active-tab="activeTab"
            :active-menu="activeMenu"
            :is-deleting="Boolean(accountSetting?.is_deleting || profile?.is_deleting)"
            :delete-days="accountSetting?.delete_days || profile?.delete_days"
            @select-tab="handleSelectTab"
            @open-language="showLanguageModal = true"
            @logout="showLogoutConfirmModal = true"
          />
        </div>

        <!-- ========================================== -->
        <!-- RIGHT CONTENT PANEL (lg:col-span-8)        -->
        <!-- ========================================== -->
        <main
          class="lg:col-span-8"
          :class="{ 'hidden lg:block': !isMobileDetailActive }"
        >
          <!-- Mobile Back to Menu Bar -->
          <div
            v-if="isMobileDetailActive"
            class="lg:hidden mb-3.5 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-border shadow-2xs"
          >
            <button
              type="button"
              class="flex items-center gap-2 text-xs font-bold text-text hover:text-primary transition-colors cursor-pointer"
              @click="handleBackToMobileMenu"
            >
              <ChevronLeft class="w-4 h-4 text-primary shrink-0" />
              <span>{{ t('Pengaturan Akun') }}</span>
            </button>
            <span class="text-xs text-text-muted font-semibold font-outfit">{{ currentTabTitle }}</span>
          </div>

          <div class="lg:sticky lg:top-[118px]">
            <ClientOnly>
              <div v-if="errorMessage" class="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {{ errorMessage }}
              </div>

              <div v-if="isLoading && !profile" class="p-8 bg-white rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                <Loader2 class="w-8 h-8 text-primary animate-spin mb-3" />
                <p class="text-xs text-text-muted">{{ t('Memuat data akun...') }}</p>
              </div>

              <template v-else>
                <AccountProfileView
                  v-if="activeTab === 'profile'"
                  :profile="profile"
                  @edit-name="showEditNameModal = true"
                  @edit-bio="showEditBioModal = true"
                  @edit-phone="handleEditPhone"
                  @edit-datebirth="showDatebirthModal = true"
                  @choose-gender="showGenderModal = true"
                  @open-social="handleOpenSocial"
                  @upload-avatar="handleUploadAvatar"
                  @open-tooltip="handleOpenTooltip"
                />

                <AccountAddressTab
                  v-else-if="activeTab === 'address'"
                  :addresses="addresses"
                  @open-address-modal="isAddressModalOpen = true"
                />

                <AccountBankTab
                  v-else-if="activeTab === 'bank'"
                />

                <AccountSecurityTab
                  v-else-if="activeTab === 'security'"
                />

                <AccountIdentityTab
                  v-else-if="activeTab === 'identity'"
                  :identity-info="identityInfo"
                  :profile-name="profile?.name || authStore.displayName"
                />

                <AccountNotificationsTab
                  v-else-if="activeTab === 'notifications'"
                  :notif-order="notifOrder"
                  :notif-promo="notifPromo"
                  :notif-feed="notifFeed"
                  :notif-chat="notifChat"
                  @toggle="handleToggleNotif"
                />

                <AccountDeleteTab
                  v-else-if="activeTab === 'delete'"
                  :is-deleting="Boolean(accountSetting?.is_deleting || profile?.is_deleting)"
                  :deleted-date="accountSetting?.deleted || profile?.deleted"
                  :delete-days="accountSetting?.delete_days || profile?.delete_days || 14"
                  :is-submitting="isSubmitting"
                  @cancel-delete="handleCancelDelete"
                  @request-delete="showDeleteConfirmModal = true"
                />
              </template>
              <template #fallback>
                <div class="p-8 bg-white rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                  <Loader2 class="w-8 h-8 text-primary animate-spin mb-3" />
                  <p class="text-xs text-text-muted">Memuat data akun...</p>
                </div>
              </template>
            </ClientOnly>
          </div>
        </main>
      </div>
    </div>

    <!-- Modals for Ubah Profil & Account Actions -->
    <AccountEditNameModal
      v-model="showEditNameModal"
      :initial-name="profile?.name || authStore.displayName"
      :is-submitting="isSubmitting"
      @save="handleSaveName"
    />

    <AccountEditBioModal
      v-model="showEditBioModal"
      :initial-bio="profile?.bio || ''"
      :is-submitting="isSubmitting"
      @save="handleSaveBio"
    />

    <AccountGenderModal
      v-model="showGenderModal"
      :initial-gender="profile?.gender || ''"
      :is-submitting="isSubmitting"
      @save="handleSaveGender"
    />

    <AccountDatebirthModal
      v-model="showDatebirthModal"
      :initial-datebirth="profile?.datebirth || ''"
      :is-submitting="isSubmitting"
      @save="handleSaveDatebirth"
    />

    <AccountSocialModal
      v-model="showSocialModal"
      :type="socialModalType"
      :username="socialModalType === 'instagram' ? profile?.instagram : profile?.tiktok"
      :is-verified="Boolean(socialModalType === 'instagram' ? profile?.instagram_verify : profile?.tiktok_verify)"
      :is-submitting="isSubmitting"
      @verify="handleVerifySocial"
      @disconnect="handleDisconnectSocial"
    />

    <AccountLanguageModal
      v-model="showLanguageModal"
    />


    <AccountInfoTooltipModal
      v-model="showTooltipModal"
      :title="tooltipData.title"
      :description="tooltipData.description"
    />

    <AppAddressModal
      v-model="isAddressModalOpen"
    />

    <AppModal
      v-model="showDeleteConfirmModal"
      title="Hapus Akun BekasKu"
    >
      <div class="space-y-4 text-xs text-text leading-relaxed">
        <p>
          Apakah Anda yakin ingin mengajukan penghapusan akun BekasKu ini? Akun Anda akan memasuki masa tenggang 14 hari sebelum dihapus permanen.
        </p>
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            class="flex-1 h-10 rounded-xl border border-border text-text font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            @click="showDeleteConfirmModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
            @click="handleConfirmDeleteAccount"
          >
            Ya, Hapus Akun
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      v-model="showLogoutConfirmModal"
      title="Keluar dari Akun"
    >
      <div class="space-y-4 text-xs text-text leading-relaxed">
        <p>Apakah Anda yakin ingin keluar dari akun BekasKu?</p>
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            class="flex-1 h-10 rounded-xl border border-border text-text font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            @click="showLogoutConfirmModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors cursor-pointer"
            @click="handleLogout"
          >
            Keluar
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
