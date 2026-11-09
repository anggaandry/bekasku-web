<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type Component } from 'vue'
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  CircleUser,
  Pencil,
  Settings,
  Crown,
  Wallet,
  Package,
  Truck,
  CircleCheck,
  TriangleAlert,
  Store,
  Heart,
  TrendingUp,
  Newspaper,
  ArrowRight,
  CircleHelp,
  Headset,
  FileText,
  Info,
  LogOut,
  Lock,
  Landmark,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Contact,
  Languages,
  Bell,
  Trash2,
  X,
} from 'lucide-vue-next'
import { APP_VERSION_DISPLAY } from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useTransactionStore } from '~/stores/transaction'
import { useHelpChatStore } from '~/stores/helpChat'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open-address'): void
  (e: 'logout'): void
}>()

const authStore = useAuthStore()
const authModal = useAuthModal()
const transactionStore = useTransactionStore()
const helpChatStore = useHelpChatStore()
const { t } = useLocale()

const subView = ref<'profile' | 'settings'>('profile')
const avatarLoadError = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      subView.value = 'profile'
      if (authStore.isLoggedIn) {
        transactionStore.fetchTabCounts()
        authStore.fetchProfile()
      }
    }
  },
  { immediate: true }
)

watch(
  () => authStore.userAvatar,
  () => {
    avatarLoadError.value = false
  },
)

function closeDrawer() {
  emit('update:modelValue', false)
}

function goToSettings() {
  closeDrawer()
  navigateTo('/account')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const isVip = computed(() => {
  return authStore.user?.subscribe === 'yes' || authStore.user?.subscribe_type === 'vip'
})

const profileOrderTabs = computed(() => [
  {
    label: 'Bayar',
    icon: Wallet,
    to: '/transaction?tab=unpaid',
    badge: transactionStore.counts[1] || 0,
  },
  {
    label: 'Dikemas',
    icon: Package,
    to: '/transaction?tab=packed',
    badge: transactionStore.counts[2] || 0,
  },
  {
    label: 'Dikirim',
    icon: Truck,
    to: '/transaction?tab=shipped',
    badge: transactionStore.counts[3] || 0,
  },
  {
    label: 'Selesai',
    icon: CircleCheck,
    to: '/transaction?tab=done',
    badge: transactionStore.counts[4] || 0,
  },
  {
    label: 'Return',
    icon: TriangleAlert,
    to: '/transaction?tab=return',
    badge: transactionStore.counts[5] || 0,
  },
])

const profileFeatureMenus = computed(() => [
  { label: 'Buka Toko', icon: Store, to: '/seller', badge: 0 },
  {
    label: 'Wishlist',
    icon: Heart,
    to: '/favorite',
    badge: authStore.user?.badge_wishlist || 0,
  },
  {
    label: 'Sundul',
    icon: TrendingUp,
    to: '/sundul',
    badge: authStore.user?.badge_promotion || 0,
  },
  { label: 'Saldo', icon: Wallet, to: '/balance', badge: 0 },
  { label: 'Iklan Saya', icon: Newspaper, to: '/catalog', badge: 0 },
])

interface ProfileHelpMenuItem {
  label: string
  icon: Component
  to?: string
  action?: 'help-chat'
}

const profileHelpMenus: ProfileHelpMenuItem[] = [
  { label: 'FAQ & Bantuan', icon: CircleHelp, to: '/faq' },
  { label: 'BekasKu Center', icon: Headset, action: 'help-chat' },
  { label: 'Panduan Keamanan', icon: ShieldAlert, to: '/safety-guide' },
  { label: 'Syarat & Ketentuan', icon: FileText, to: '/policy/terms' },
  { label: 'Kebijakan Privasi', icon: ShieldCheck, to: '/policy/privacy' },
  { label: 'Tentang Kami', icon: Info, to: '/about' },
]

function handleProfileHelpClick(helpItem: ProfileHelpMenuItem) {
  closeDrawer()
  if (helpItem.action === 'help-chat') {
    helpChatStore.openHelpChat({ topic: 'general' })
  }
}

interface AccountSettingItem {
  label: string
  icon: Component
  to: string
}

const accountSettingItems: AccountSettingItem[] = [
  { label: 'Ubah Profil', icon: CircleUser, to: '/account?tab=profile' },
  { label: 'Daftar Alamat', icon: MapPin, to: '/account?tab=address' },
  { label: 'Rekening Bank', icon: Landmark, to: '/account?tab=bank' },
  { label: 'Ubah Password', icon: Lock, to: '/account?tab=security' },
  { label: 'Metode Pembayaran', icon: CreditCard, to: '/account?tab=bank&menu=payment-method' },
  { label: 'Saldo Saya', icon: Wallet, to: '/balance' },
  { label: 'Kartu Identitas Pengguna', icon: Contact, to: '/account?tab=identity' },
]

const preferenceSettingItems: AccountSettingItem[] = [
  { label: 'Bahasa / Language', icon: Languages, to: '/account?modal=language' },
  { label: 'Notifikasi', icon: Bell, to: '/account?tab=notifications' },
]

function handleAccountSettingClick(item: AccountSettingItem) {
  closeDrawer()
  navigateTo(item.to)
}

function handleLogoutClick() {
  closeDrawer()
  emit('logout')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="account-drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[75] flex justify-end bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Akun BekasKu"
        @click.self="closeDrawer()"
      >
        <!-- Full-Height Right Slide-Over Drawer (Navigation Sheet) -->
        <aside
          class="account-drawer-panel w-full max-w-[390px] h-dvh bg-surface-2 shadow-2xl flex flex-col overflow-hidden select-none text-text"
        >
          <!-- ========================================================= -->
          <!-- VIEW 1: MAIN PROFILE VIEW (Sesuai profile_view.dart)      -->
          <!-- ========================================================= -->
          <div v-if="subView === 'profile'" class="flex-1 overflow-y-auto flex flex-col">
            <!-- Red Gradient Header (_buildHeader) -->
            <div class="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark px-5 pt-4 pb-5 text-white shrink-0">
              <!-- Watermark Icons -->
              <img
                src="/images/icon_only.png"
                alt=""
                width="128"
                height="128"
                aria-hidden="true"
                class="w-32 h-32 object-contain opacity-5 absolute -right-5 -top-4 pointer-events-none"
              />
              <img
                src="/images/icon_only.png"
                alt=""
                width="112"
                height="112"
                aria-hidden="true"
                class="w-28 h-28 object-contain opacity-[0.03] -rotate-12 absolute -left-6 -bottom-4 pointer-events-none"
              />

              <!-- Top Utility Bar: Settings + Close Drawer -->
              <div class="relative z-10 flex items-center justify-end gap-2 mb-3">
                <button
                  type="button"
                  class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Pengaturan Akun"
                  @click="goToSettings"
                >
                  <Settings class="w-5 h-5" />
                </button>
                <button
                  type="button"
                  class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Tutup panel akun"
                  title="Tutup"
                  @click="closeDrawer()"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- User Profile Module (Avatar + Pencil + Name + Follower/Following) -->
              <div class="relative z-10 flex items-center gap-3.5">
                <NuxtLink
                  to="/account?tab=profile"
                  class="relative shrink-0 group"
                  @click="closeDrawer()"
                >
                  <div class="w-15 h-15 rounded-full p-0.5 bg-white shadow-xs">
                    <div class="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-base font-bold text-primary">
                      <img
                        v-if="authStore.userAvatar && !avatarLoadError"
                        :src="authStore.userAvatar"
                        :alt="authStore.displayName"
                        width="60"
                        height="60"
                        class="w-full h-full object-cover"
                        @error="avatarLoadError = true"
                      />
                      <CircleUser v-else class="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <!-- Edit Pencil Overlay -->
                  <span class="absolute bottom-0 -right-0.5 w-5 h-5 rounded-full bg-black/45 border border-white/60 flex items-center justify-center text-white">
                    <Pencil class="w-2.5 h-2.5" />
                  </span>
                </NuxtLink>

                <div class="min-w-0 flex-1">
                  <NuxtLink
                    to="/account?tab=profile"
                    class="block text-lg font-semibold text-white truncate hover:underline"
                    @click="closeDrawer()"
                  >
                    {{ authStore.displayName }}
                  </NuxtLink>
                  <p class="text-xs text-white/85 mt-0.5">
                    {{ authStore.user?.follower_count ?? 0 }} Follower &bull; {{ authStore.user?.following_count ?? 0 }} Following
                  </p>
                </div>
              </div>

              <!-- Premium VIP Sub Banner (_buildPremiumVipBanner) -->
              <NuxtLink
                to="/subscribe/vip"
                class="relative z-10 mt-4 flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl border shadow-sm transition-transform active:scale-[0.99]"
                :class="
                  isVip
                    ? 'bg-[#FF4D55] border-[#FF7A82] text-white'
                    : 'bg-[#FFF5E6] border-[#FDE68A] text-[#C09440]'
                "
                @click="closeDrawer()"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <Crown
                    class="w-4 h-4 shrink-0"
                    :class="isVip ? 'text-[#FFD700]' : 'text-[#C09440]'"
                  />
                  <span class="text-xs sm:text-sm font-bold font-outfit truncate">
                    {{ isVip ? t('VIP Aktif') : t('Gabung BekasKu VIP') }}
                  </span>
                </div>
                <ChevronRight
                  class="w-4 h-4 shrink-0"
                  :class="isVip ? 'text-white' : 'text-[#C09440]'"
                />
              </NuxtLink>
            </div>

            <!-- Section 1: Pesanan Saya (_buildOrderSection) -->
            <div class="bg-white px-5 py-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-semibold text-gray-900">{{ t('Pesanan Saya') }}</span>
                <NuxtLink
                  to="/transaction"
                  class="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary transition-colors"
                  @click="closeDrawer()"
                >
                  <span>{{ t('Lihat Riwayat Pesanan') }}</span>
                  <ChevronRight class="w-3.5 h-3.5 text-gray-400" />
                </NuxtLink>
              </div>
              <div class="grid grid-cols-5 gap-1">
                <NuxtLink
                  v-for="orderTab in profileOrderTabs"
                  :key="orderTab.label"
                  :to="orderTab.to"
                  class="flex flex-col items-center justify-start py-1.5 px-0.5 rounded-xl hover:bg-gray-50 group transition-colors"
                  @click="closeDrawer()"
                >
                  <div class="relative flex items-center justify-center">
                    <component
                      :is="orderTab.icon"
                      class="w-6 h-6 text-gray-900 group-hover:text-primary stroke-[1.75] transition-colors"
                    />
                    <span
                      v-if="orderTab.badge > 0"
                      class="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold font-outfit flex items-center justify-center border-2 border-white shadow-2xs leading-none select-none"
                    >
                      {{ orderTab.badge > 99 ? '99+' : orderTab.badge }}
                    </span>
                  </div>
                  <span class="text-[11px] font-medium text-gray-900 group-hover:text-primary mt-2 leading-tight text-center">
                    {{ t(orderTab.label) }}
                  </span>
                </NuxtLink>
              </div>
            </div>

            <!-- Section 2: Menu Lainnya (_buildMenuLainnya + _buildBekaskuPlusCard) -->
            <div class="bg-white px-5 py-4 mt-2">
              <p class="text-sm font-semibold text-gray-900 mb-4">
                {{ t('Menu Lainnya') }}
              </p>
              <div class="grid grid-cols-5 gap-1">
                <NuxtLink
                  v-for="item in profileFeatureMenus"
                  :key="item.label"
                  :to="item.to"
                  class="flex flex-col items-center justify-start py-1.5 px-0.5 rounded-xl hover:bg-gray-50 group transition-colors"
                  @click="closeDrawer()"
                >
                  <div class="relative flex items-center justify-center">
                    <component
                      :is="item.icon"
                      class="w-6 h-6 text-gray-900 group-hover:text-primary stroke-[1.75] transition-colors"
                    />
                    <span
                      v-if="item.badge > 0"
                      class="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold font-outfit flex items-center justify-center border-2 border-white shadow-2xs leading-none select-none"
                    >
                      {{ item.badge > 99 ? '99+' : item.badge }}
                    </span>
                  </div>
                  <span class="text-[11px] font-medium text-gray-900 group-hover:text-primary mt-2 leading-tight text-center">
                    {{ t(item.label) }}
                  </span>
                </NuxtLink>
              </div>

              <!-- BekasKu+ Registration Card (_buildBekaskuPlusCard) -->
              <div class="mt-4 bg-[#F0F6FE] border border-[#E0EBFF] rounded-2xl p-4">
                <img
                  src="/images/bekasku_plus_variant_6.png"
                  alt="BekasKu+"
                  width="112"
                  height="46"
                  class="h-10 w-auto object-contain"
                />
                <p class="text-xs text-primary leading-snug mt-2">
                  Dapatkan Badge Verified &amp; Prioritas Tampil.<br />
                  Daftar BekasKu+ Sekarang
                </p>
                <NuxtLink
                  to="/bekasku-plus"
                  class="mt-3 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  @click="closeDrawer()"
                >
                  <ArrowRight class="w-4 h-4" />
                  <span>{{ t('Daftar Sekarang') }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Section 3: Bantuan (_buildBantuanSection) -->
            <div class="bg-white pt-4 pb-1 mt-2">
              <p class="px-5 pb-1.5 text-sm font-semibold text-gray-900">
                {{ t('Bantuan') }}
              </p>
              <template v-for="(helpItem, idx) in profileHelpMenus" :key="helpItem.label">
                <button
                  v-if="helpItem.action === 'help-chat'"
                  type="button"
                  class="w-full flex items-center gap-3.5 px-5 hover:bg-gray-50 transition-colors group cursor-pointer text-left"
                  @click="handleProfileHelpClick(helpItem)"
                >
                  <component :is="helpItem.icon" class="w-4 h-4 text-gray-900 group-hover:text-primary shrink-0" />
                  <div
                    class="flex-1 flex items-center justify-between py-3 text-xs sm:text-[13px] font-medium text-gray-900 group-hover:text-primary"
                    :class="idx < profileHelpMenus.length - 1 ? 'border-b border-gray-100' : ''"
                  >
                    <span>{{ t(helpItem.label) }}</span>
                    <ChevronRight class="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <NuxtLink
                  v-else
                  :to="helpItem.to || '/help'"
                  class="flex items-center gap-3.5 px-5 hover:bg-gray-50 transition-colors group"
                  @click="closeDrawer()"
                >
                  <component :is="helpItem.icon" class="w-4 h-4 text-gray-900 group-hover:text-primary shrink-0" />
                  <div
                    class="flex-1 flex items-center justify-between py-3 text-xs sm:text-[13px] font-medium text-gray-900 group-hover:text-primary"
                    :class="idx < profileHelpMenus.length - 1 ? 'border-b border-gray-100' : ''"
                  >
                    <span>{{ t(helpItem.label) }}</span>
                    <ChevronRight class="w-4 h-4 text-gray-400" />
                  </div>
                </NuxtLink>
              </template>
            </div>

            <!-- Footer: Keluar Akun -->
            <div class="bg-white px-5 py-4 mt-2 flex-1">
              <button
                type="button"
                class="w-full flex items-center gap-3.5 py-1.5 text-xs sm:text-[13px] font-medium text-red-600 hover:opacity-80 transition-opacity cursor-pointer"
                @click="handleLogoutClick()"
              >
                <LogOut class="w-4 h-4 text-red-600 shrink-0" />
                <span>{{ t('Keluar Akun') }}</span>
              </button>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- VIEW 2: PENGATURAN AKUN VIEW (Sesuai account_setting_view)-->
          <!-- ========================================================= -->
          <div v-else class="flex-1 overflow-y-auto flex flex-col">
            <!-- AppBar Pengaturan Akun -->
            <div class="sticky top-0 z-10 bg-white px-4 py-3.5 border-b border-border flex items-center justify-between shrink-0">
              <button
                type="button"
                class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer"
                aria-label="Kembali"
                @click="subView = 'profile'"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <span class="text-sm font-medium text-text">{{ t('Pengaturan Akun') }}</span>
              <button
                type="button"
                class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
                aria-label="Tutup panel akun"
                @click="closeDrawer()"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Section 1: Akun Saya -->
            <div class="bg-white pt-3.5">
              <p class="px-5 pb-1 text-xs font-medium text-text-muted">{{ t('Akun Saya') }}</p>
              <button
                v-for="(item, idx) in accountSettingItems"
                :key="item.label"
                type="button"
                class="w-full flex items-center gap-3.5 pl-5 hover:bg-surface-2 transition-colors text-left cursor-pointer group"
                @click="handleAccountSettingClick(item)"
              >
                <component :is="item.icon" class="w-4 h-4 text-text group-hover:text-primary shrink-0" />
                <div
                  class="flex-1 flex items-center justify-between py-3.5 pr-5 text-xs sm:text-[13px] font-medium text-text group-hover:text-primary"
                  :class="idx < accountSettingItems.length - 1 ? 'border-b border-border/70' : ''"
                >
                  <span>{{ t(item.label) }}</span>
                  <ChevronRight class="w-4 h-4 text-text-muted/60" />
                </div>
              </button>
            </div>

            <!-- Section 2: Preferensi Aplikasi -->
            <div class="bg-white pt-3.5 mt-2">
              <p class="px-5 pb-1 text-xs font-medium text-text-muted">{{ t('Preferensi Aplikasi') }}</p>
              <button
                v-for="(item, idx) in preferenceSettingItems"
                :key="item.label"
                type="button"
                class="w-full flex items-center gap-3.5 pl-5 hover:bg-surface-2 transition-colors text-left cursor-pointer group"
                @click="handleAccountSettingClick(item)"
              >
                <component :is="item.icon" class="w-4 h-4 text-text group-hover:text-primary shrink-0" />
                <div
                  class="flex-1 flex items-center justify-between py-3.5 pr-5 text-xs sm:text-[13px] font-medium text-text group-hover:text-primary"
                  :class="idx < preferenceSettingItems.length - 1 ? 'border-b border-border/70' : ''"
                >
                  <span>{{ t(item.label) }}</span>
                  <ChevronRight class="w-4 h-4 text-text-muted/60" />
                </div>
              </button>
            </div>

            <!-- Section 3: Bantuan -->
            <div class="bg-white pt-3.5 mt-2">
              <p class="px-5 pb-1 text-xs font-medium text-text-muted">{{ t('Bantuan') }}</p>
              <template v-for="(helpItem, idx) in profileHelpMenus" :key="helpItem.label">
                <button
                  v-if="helpItem.action === 'help-chat'"
                  type="button"
                  class="w-full flex items-center gap-3.5 pl-5 hover:bg-surface-2 transition-colors group cursor-pointer text-left"
                  @click="handleProfileHelpClick(helpItem)"
                >
                  <component :is="helpItem.icon" class="w-4 h-4 text-text group-hover:text-primary shrink-0" />
                  <div
                    class="flex-1 flex items-center justify-between py-3.5 pr-5 text-xs sm:text-[13px] font-medium text-text group-hover:text-primary"
                    :class="idx < profileHelpMenus.length - 1 ? 'border-b border-border/70' : ''"
                  >
                    <span>{{ t(helpItem.label) }}</span>
                    <ChevronRight class="w-4 h-4 text-text-muted/60" />
                  </div>
                </button>
                <NuxtLink
                  v-else
                  :to="helpItem.to || '/help'"
                  class="flex items-center gap-3.5 pl-5 hover:bg-surface-2 transition-colors group"
                  @click="closeDrawer()"
                >
                  <component :is="helpItem.icon" class="w-4 h-4 text-text group-hover:text-primary shrink-0" />
                  <div
                    class="flex-1 flex items-center justify-between py-3.5 pr-5 text-xs sm:text-[13px] font-medium text-text group-hover:text-primary"
                    :class="idx < profileHelpMenus.length - 1 ? 'border-b border-border/70' : ''"
                  >
                    <span>{{ t(helpItem.label) }}</span>
                    <ChevronRight class="w-4 h-4 text-text-muted/60" />
                  </div>
                </NuxtLink>
              </template>
            </div>

            <!-- Section 4: Data Akun & Keluar Akun -->
            <div class="bg-white pt-3.5 pb-6 mt-2 flex-1">
              <p class="px-5 pb-1 text-xs font-medium text-text-muted">{{ t('Data Akun') }}</p>
              <NuxtLink
                to="/account?tab=delete"
                class="flex items-center gap-3.5 pl-5 hover:bg-surface-2 transition-colors group"
                @click="closeDrawer()"
              >
                <Trash2 class="w-4 h-4 text-text group-hover:text-red-600 shrink-0" />
                <div class="flex-1 flex items-center justify-between py-3.5 pr-5 text-xs sm:text-[13px] font-medium text-text group-hover:text-red-600">
                  <span>{{ t('Ajukan Penghapusan Akun') }}</span>
                  <ChevronRight class="w-4 h-4 text-text-muted/60" />
                </div>
              </NuxtLink>

              <button
                type="button"
                class="w-full flex items-center gap-3.5 px-5 py-3.5 text-xs sm:text-[13px] font-medium text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer"
                @click="handleLogoutClick()"
              >
                <LogOut class="w-4 h-4 text-red-600 shrink-0" />
                <span>{{ t('Keluar Akun') }}</span>
              </button>

              <p class="text-xs text-text-muted text-center mt-4">
                {{ t('Versi') }} {{ APP_VERSION_DISPLAY }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.account-drawer-enter-active,
.account-drawer-leave-active {
  transition: opacity 0.22s ease;
}
.account-drawer-enter-active .account-drawer-panel,
.account-drawer-leave-active .account-drawer-panel {
  transition: transform 0.26s cubic-bezier(0.32, 0.72, 0, 1);
}
.account-drawer-enter-from,
.account-drawer-leave-to {
  opacity: 0;
}
.account-drawer-enter-from .account-drawer-panel,
.account-drawer-leave-to .account-drawer-panel {
  transform: translateX(100%);
}
</style>

