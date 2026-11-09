<template>
  <aside class="w-full bg-white rounded-2xl p-4 sm:p-5 border border-border shadow-2xs select-none">
    <h2 class="hidden lg:block font-outfit font-bold text-base text-text pb-3 border-b border-border mb-3">
      {{ t('Pengaturan Akun') }}
    </h2>

    <div class="space-y-6">
      <!-- Section 1: Akun Saya -->
      <div>
        <p class="px-1 mb-1.5 text-xs font-semibold text-text-muted font-outfit">
          {{ t('Akun Saya') }}
        </p>
        <div class="divide-y divide-border/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'profile' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'profile')"
          >
            <div class="flex items-center gap-3">
              <CircleUser class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'profile' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Ubah Profil') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'address' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'address')"
          >
            <div class="flex items-center gap-3">
              <MapPin class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'address' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Daftar Alamat') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'bank' && activeMenu !== 'payment-method' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'bank')"
          >
            <div class="flex items-center gap-3">
              <Landmark class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'bank' && activeMenu !== 'payment-method' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Rekening Bank') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'security' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'security')"
          >
            <div class="flex items-center gap-3">
              <Lock class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'security' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Ubah Password') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeMenu === 'payment-method' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'payment-method')"
          >
            <div class="flex items-center gap-3">
              <CreditCard class="w-5 h-5 shrink-0 transition-colors" :class="activeMenu === 'payment-method' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Metode Pembayaran') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer text-left group"
            @click="navigateTo('/balance')"
          >
            <div class="flex items-center gap-3">
              <Wallet class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Saldo Saya') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'identity' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'identity')"
          >
            <div class="flex items-center gap-3">
              <Contact class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'identity' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Kartu Identitas Pengguna') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <!-- Section 2: Preferensi Aplikasi -->
      <div>
        <p class="px-1 mb-1.5 text-xs font-semibold text-text-muted font-outfit">
          {{ t('Preferensi Aplikasi') }}
        </p>
        <div class="divide-y divide-border/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer text-left group"
            @click="$emit('open-language')"
          >
            <div class="flex items-center gap-3">
              <Languages class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Bahasa / Language') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-bold text-primary-dark">
                {{ currentLocaleMeta.shortLabel }}
              </span>
              <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
            </div>
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'notifications' ? 'bg-primary/5 text-primary font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'notifications')"
          >
            <div class="flex items-center gap-3">
              <Bell class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === 'notifications' ? 'text-primary' : 'text-text'" />
              <span>{{ t('Notifikasi') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <!-- Section 3: Bantuan -->
      <div>
        <p class="px-1 mb-1.5 text-xs font-semibold text-text-muted font-outfit">
          {{ t('Bantuan') }}
        </p>
        <div class="divide-y divide-border/50">
          <NuxtLink
            to="/faq"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <CircleHelp class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('FAQ & Bantuan') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </NuxtLink>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group cursor-pointer"
            @click="openBekaskuCenterChat"
          >
            <div class="flex items-center gap-3">
              <Headset class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('BekasKu Center') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </button>

          <NuxtLink
            to="/safety-guide"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <ShieldAlert class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Panduan Keamanan') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </NuxtLink>

          <NuxtLink
            to="/policy/terms"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <FileText class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Syarat & Ketentuan') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </NuxtLink>

          <NuxtLink
            to="/policy/privacy"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <ShieldCheck class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Kebijakan Privasi') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </NuxtLink>

          <a
            :href="playStoreUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <Star class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Puas dengan BekasKu? Rating kami') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </a>

          <NuxtLink
            to="/about"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-text hover:bg-surface-2 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <Info class="w-5 h-5 shrink-0 text-text" />
              <span>{{ t('Tentang Kami') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-primary transition-colors" />
          </NuxtLink>
        </div>
      </div>

      <!-- Section 4: Data Akun -->
      <div>
        <div class="divide-y divide-border/50">
          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold transition-colors cursor-pointer text-left group"
            :class="activeTab === 'delete' ? 'bg-red-50 text-red-600 font-bold' : 'text-text hover:bg-surface-2'"
            @click="$emit('select-tab', 'delete')"
          >
            <div class="flex items-center gap-3">
              <Trash2 class="w-5 h-5 shrink-0" :class="activeTab === 'delete' ? 'text-red-600' : 'text-text'" />
              <span :class="isDeleting ? 'text-red-600 font-semibold' : ''">
                {{ isDeleting ? `Akun akan dihapus (${deleteDays || 14} hari)` : t('Ajukan Penghapusan Akun') }}
              </span>
            </div>
            <ChevronRight class="w-4 h-4 text-text/50 group-hover:text-red-500 transition-colors" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between py-3.5 px-2 rounded-xl text-sm font-outfit font-semibold text-red-600 hover:bg-red-50/70 transition-colors cursor-pointer text-left group"
            @click="$emit('logout')"
          >
            <div class="flex items-center gap-3">
              <LogOut class="w-5 h-5 shrink-0 text-red-600" />
              <span>{{ t('Keluar Akun') }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>

      <!-- App Version Footer (as in Mobile V3) -->
      <div class="pt-4 pb-2 text-center">
        <p class="text-xs text-text-muted font-outfit">
          {{ t('Versi') }} {{ APP_VERSION_DISPLAY }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CircleUser,
  MapPin,
  Landmark,
  Lock,
  CreditCard,
  Wallet,
  Contact,
  Languages,
  Bell,
  CircleHelp,
  Headset,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Star,
  Info,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-vue-next'
import { APP_VERSION_DISPLAY, PLAY_STORE_URL } from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'
import { useLocale } from '~/composables/useLocale'

defineProps<{
  activeTab: string
  activeMenu?: string
  isDeleting?: boolean
  deleteDays?: number
}>()

defineEmits<{
  (e: 'select-tab', tab: string): void
  (e: 'open-language'): void
  (e: 'logout'): void
}>()

const config = useRuntimeConfig()
const helpChatStore = useHelpChatStore()
const { t, currentLocaleMeta } = useLocale()
const playStoreUrl = computed(() => config.public.playStoreUrl || PLAY_STORE_URL)

function openBekaskuCenterChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>
