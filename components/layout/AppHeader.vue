<template>
  <header class="w-full sticky top-0 z-50 shadow-xs">
    <!-- Top Row: BekasKu Brand Red Header (matching BekasKu V3 Mobile Theme) -->
    <div class="bg-primary text-white py-2.5">
      <div class="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
        <!-- Brand Logo Image (White Vector from BekasKu Mobile V3) -->
        <NuxtLink to="/" class="shrink-0 flex items-center hover:opacity-95 transition-opacity" title="BekasKu">
          <img
            src="/images/logo_white.png"
            alt="BekasKu Logo"
            width="128"
            height="36"
            class="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-xs"
          />
        </NuxtLink>

        <!-- Center: Modern Squircle Search Bar with Integrated Kategori Dropdown (Uses shared SearchBar.vue) -->
        <div class="flex-1 min-w-0 max-w-2xl">
          <SearchBar
            v-model="searchQuery"
            variant="header-desktop"
            input-id="desktop-search-input"
            placeholder="Cari di BekasKu..."
            :category-id="selectedCategoryId"
            :category-name="selectedCategoryName || ''"
            @submit="handleSearch"
          >
            <template #prepend>
              <!-- Integrated Kategori Dropdown Trigger inside Search Bar -->
              <div class="relative shrink-0">
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-gray-700 hover:text-primary transition-colors cursor-pointer text-xs font-semibold select-none group"
                  @click.stop="isCategoryMenuOpen = !isCategoryMenuOpen"
                >
                  <span class="max-w-[90px] sm:max-w-[120px] truncate">
                    {{ selectedCategoryName ? t(selectedCategoryName) : t('Semua Kategori') }}
                  </span>
                  <ChevronDown
                    class="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-180': isCategoryMenuOpen }"
                  />
                </button>

                <!-- Category Popover Menu -->
                <div
                  v-if="isCategoryMenuOpen"
                  class="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-gray-800 max-h-80 overflow-y-auto"
                >
                  <div class="px-2.5 pb-1 pt-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    {{ t('Pilih Kategori') }} (A-Z)
                  </div>

                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 hover:text-primary transition-all text-left cursor-pointer group"
                    :class="{ 'text-primary bg-red-50/80 font-bold': !selectedCategoryName }"
                    @click="selectCategory(null)"
                  >
                    <span>{{ t('Semua Kategori') }}</span>
                    <Check v-if="!selectedCategoryName" class="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>

                  <div class="h-px bg-gray-100 my-1 mx-2" />

                  <button
                    v-for="cat in sortedCategories"
                    :key="cat.id || cat._id"
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 hover:text-primary transition-all text-left cursor-pointer group"
                    :class="{ 'text-primary font-bold bg-red-50/80': selectedCategoryName === cat.name }"
                    @click="selectCategory(cat)"
                  >
                    <span class="truncate transition-transform group-hover:translate-x-0.5">{{ t(cat.name) }}</span>
                    <Check v-if="selectedCategoryName === cat.name" class="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>
                </div>
              </div>

              <!-- Subtle Divider -->
              <div class="h-6 w-px bg-gray-200 mx-1 shrink-0" />
            </template>
          </SearchBar>
        </div>

        <!-- Right: Action Icons & User / Login State -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <!-- Chat Button (Requires Auth - Opens Floating Popup on Desktop) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Pesan"
            @click="handleChatClick"
          >
            <MessageSquareMore class="w-5 h-5" />
            <span
              v-if="isHydratedLoggedIn && chatStore.totalUnread > 0"
              class="absolute top-1 right-1 bg-badge-bg text-badge-text text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-primary"
            >
              {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
            </span>
          </button>

          <!-- Notification Bell (Opens Notification Drawer) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Notifikasi"
            @click="handleNotificationClick"
          >
            <Bell class="w-5 h-5" />
            <span
              v-if="isHydratedLoggedIn && notifStore.totalUnread > 0"
              class="absolute top-1 right-1 bg-badge-bg text-badge-text text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-primary"
            >
              {{ notifStore.totalUnread > 99 ? '99+' : notifStore.totalUnread }}
            </span>
          </button>

          <!-- Cart Button (Requires Auth) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Keranjang"
            @click="handleAuthAction('/cart', 'Keranjang Belanja')"
          >
            <ShoppingCart class="w-5 h-5" />
            <span
              v-if="isHydratedLoggedIn && cartStore.totalItems > 0"
              class="absolute top-1 right-1 bg-badge-bg text-badge-text text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-primary"
            >
              {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
            </span>
          </button>

          <!-- + Jual Button (Requires Auth & Identity) -->
          <button
            type="button"
            class="bg-white hover:bg-gray-100 text-primary px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ml-1 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            :disabled="isCheckingKyc"
            @click="handleSellClick"
          >
            <div v-if="isCheckingKyc" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Plus v-else class="w-3.5 h-3.5 stroke-[3]" />
            <span>{{ t('Jual') }}</span>
          </button>

          <!-- Divider -->
          <div class="h-6 w-px bg-white/30 hidden sm:block mx-1" />

          <!-- Logged In User Profile OR Masuk Button -->
          <ClientOnly>
            <div v-if="authStore.isLoggedIn" class="relative">
              <button
                type="button"
                class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-white/15 text-white transition-colors cursor-pointer"
                @click.stop="isUserMenuOpen = true"
              >
                <div class="w-7 h-7 rounded-full overflow-hidden border border-white/50 bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  <img
                    v-if="authStore.userAvatar && !avatarLoadError"
                    :src="authStore.userAvatar"
                    :alt="authStore.displayName"
                    class="w-full h-full object-cover"
                    @error="avatarLoadError = true"
                  />
                  <span v-else>{{ authStore.displayName.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="text-xs font-semibold max-w-[90px] truncate hidden md:inline">
                  {{ authStore.displayName }}
                </span>
                <ChevronDown
                  class="w-3 h-3 text-white/80 transition-transform duration-200"
                  :class="{ 'rotate-180': isUserMenuOpen }"
                />
              </button>
            </div>

            <!-- If Not Logged In: Masuk Button (Opens Unified 2-Column Auth Modal) -->
            <div v-else class="flex items-center gap-1.5">
              <button
                type="button"
                class="flex items-center gap-1.5 text-white bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-bold py-2 px-3.5 rounded-xl transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                @click="authModal.openLogin()"
              >
                <User class="w-3.5 h-3.5" />
                <span>{{ t('Masuk') }}</span>
              </button>
            </div>
            <template #fallback>
              <div class="w-20 h-8 rounded-xl bg-white/10 animate-pulse"></div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Bottom Sub-navbar: White Row with Location Pill (Opens Address Modal) & Nav Links -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-3 py-1.5 text-xs">
        <!-- Left Side: Location Pill Connected to AppAddressModal -->
        <div class="flex items-center shrink-0">
          <button
            type="button"
            class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-full text-gray-700 hover:text-primary cursor-pointer group transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-primary"
            :title="t('Pilih Alamat Pengiriman')"
            @click="isAddressModalOpen = true"
          >
            <MapPin class="w-3.5 h-3.5 text-primary shrink-0" />
            <span class="text-gray-500 font-medium hidden lg:inline">{{ t('Kirim ke:') }}</span>
            <span class="font-bold text-gray-900 group-hover:text-primary transition-colors truncate max-w-[110px] lg:max-w-[220px]">
              {{ t(currentAddressText) }}
            </span>
            <ChevronDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600 shrink-0" />
          </button>
        </div>

        <!-- Right Side: Navigation Tabs aligned with Auth State (Guest prompts login except Video Feed & FAQ) -->
        <nav
          aria-label="Navigasi fitur BekasKu"
          class="flex items-center justify-end gap-1 xl:gap-2 font-medium overflow-x-auto scrollbar-none min-w-0 py-0.5"
        >
          <button
            v-for="item in protectedNavItems"
            :key="item.path"
            type="button"
            class="px-2 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            :class="getNavButtonClass(isRoutePrefixActive(item.matchPrefixes), true)"
            :title="isHydratedLoggedIn ? t(item.loggedInTitle) : t(item.guestTitle)"
            @click="handleAuthAction(item.path, t(item.featureTitle))"
          >
            {{ t(item.label) }}
          </button>

          <button
            type="button"
            class="px-2 py-0.5 rounded-lg transition-all flex items-center shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            :class="isRoutePrefixActive(['/bekasku-plus']) ? 'bg-red-50/80 ring-1 ring-primary/20' : 'hover:bg-red-50/70'"
            :title="isHydratedLoggedIn ? 'BekasKu+ Curated Partner' : 'Masuk untuk mengakses BekasKu+'"
            @click="handleAuthAction('/bekasku-plus', 'BekasKu+ Official Seller')"
          >
            <img
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              width="96"
              height="16"
              class="h-4 max-h-4 w-auto max-w-[96px] object-contain shrink-0"
            />
          </button>

          <!-- Public Link: Live & Video (Accessible with or without login) -->
          <NuxtLink
            to="/showcase/video"
            class="px-2 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
            :class="getNavButtonClass(isRoutePrefixActive(['/showcase/video', '/live']), false)"
            title="Live & Video"
          >
            {{ t('Live & Video') }}
          </NuxtLink>

          <div class="h-3.5 w-px bg-gray-200 mx-0.5 shrink-0" aria-hidden="true" />

          <!-- Split Bantuan into FAQ (public) & BekasKu Center (auth-gated popup chat) -->
          <NuxtLink
            to="/faq"
            class="px-2 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
            :class="getNavButtonClass(isFaqActive, false)"
            :title="t('Pusat Bantuan & FAQ')"
          >
            FAQ
          </NuxtLink>

          <button
            type="button"
            class="px-2 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            :class="getNavButtonClass(isBekaskuCenterActive, true)"
            :title="t('BekasKu Center')"
            @click="handleBekaskuCenterClick"
          >
            <Headset class="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{{ t('BekasKu Center') }}</span>
            <span
              v-if="isHydratedLoggedIn && helpChatStore.wsConnected"
              class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
              aria-hidden="true"
            />
          </button>

          <div class="h-3.5 w-px bg-gray-200 mx-0.5 shrink-0" aria-hidden="true" />

          <!-- Global 4-Language Switcher Trigger -->
          <button
            type="button"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-primary hover:bg-red-50/70 font-semibold transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            :title="t('Bahasa / Language')"
            :aria-label="t('Bahasa / Language')"
            @click="isHeaderLangModalOpen = true"
          >
            <Languages class="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
            <span class="text-[11px] font-bold uppercase">{{ currentLocaleMeta.shortLabel }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Address Selection & Addition Modal (BekasKu Mobile V3 Flow) -->
    <AppAddressModal v-model="isAddressModalOpen" />

    <!-- Global Language Switcher Modal -->
    <AccountLanguageModal v-model="isHeaderLangModalOpen" />

    <!-- Logout Confirmation Modal -->
    <AppModal
      v-model="showLogoutConfirm"
      :title="t('Keluar dari Akun')"
    >
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        {{ t('Apakah Anda yakin ingin keluar dari akun BekasKu?') }}
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
            @click="showLogoutConfirm = false"
          >
            {{ t('Batal') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer"
            @click="confirmLogout()"
          >
            {{ t('Keluar') }}
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Post Type & Category Modals for Header Sell Action -->
    <PostTypeModal
      v-model="showPostTypeModal"
      @select="onSelectHeaderPostType"
      @ai-applied="onHeaderAiPostApplied"
    />

    <PostCategoryModal
      v-model="showPostCategoryModal"
      :title="headerCategoryModalTitle"
      :categories="headerPostCategories"
      :subcategories="postSubcategories"
      :is-subcategories-loading="isPostSubcategoriesLoading"
      :selected-category="selectedPostCategory"
      @select-category="onSelectHeaderCategory"
      @select-subcategory="onSelectHeaderSubcategory"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  MessageSquareMore,
  Bell,
  ShoppingCart,
  Plus,
  ChevronDown,
  MapPin,
  User,
  Check,
  Headset,
  Languages,
} from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useHelpChatStore } from '~/stores/helpChat'
import { useNotificationStore } from '~/stores/notification'
import { useAuthModal } from '~/composables/useAuthModal'
import { useIdentityKyc, useIdentityKycModal } from '~/composables/useIdentityKyc'
import { useCategories, type Category } from '~/composables/useCategories'
import { useAddress } from '~/composables/useAddress'
import { useLocale } from '~/composables/useLocale'
import SearchBar from '~/components/search/SearchBar.vue'
import AppModal from '~/components/shared/AppModal.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'
import AccountLanguageModal from '~/components/account/AccountLanguageModal.vue'
import PostTypeModal from '~/components/post/PostTypeModal.vue'
import PostCategoryModal from '~/components/post/PostCategoryModal.vue'
import {
  POST_TYPE_AI,
  POST_TYPE_SELL,
  POST_TYPE_NEEDED,
  POST_TYPE_SERVICE,
  API_CATEGORY_LIST,
  API_SUBCATEGORY_LIST,
} from '~/utils/constants'
import type { CategoryItem, SubcategoryItem } from '~/types/post'
import { useNotification } from '~/composables/useNotification'

import { useAccountDrawer } from '~/composables/useAccountDrawer'
import { useNotificationDrawer } from '~/composables/useNotificationDrawer'

const api = useApi()
const cartStore = useCartStore()
const authStore = useAuthStore()
const chatStore = useChatStore()
const helpChatStore = useHelpChatStore()
const notifStore = useNotificationStore()
const hasMounted = ref(false)
const isHydratedLoggedIn = computed(() => hasMounted.value && authStore.isLoggedIn)

interface HeaderNavItem {
  label: string
  path: string
  featureTitle: string
  loggedInTitle: string
  guestTitle: string
  matchPrefixes: string[]
}

const protectedNavItems: HeaderNavItem[] = [
  {
    label: 'Saldo',
    path: '/balance',
    featureTitle: 'Saldo & Dompet',
    loggedInTitle: 'Saldo & Dompet BekasKu',
    guestTitle: 'Masuk untuk membuka Saldo & Dompet',
    matchPrefixes: ['/balance'],
  },
  {
    label: 'Subscribe',
    path: '/subscribe/vip',
    featureTitle: 'Langganan VIP',
    loggedInTitle: 'Langganan VIP BekasKu',
    guestTitle: 'Masuk untuk berlangganan VIP',
    matchPrefixes: ['/subscribe'],
  },
]

function isRoutePrefixActive(prefixes: string[]): boolean {
  const path = route.path || ''
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

const isFaqActive = computed(() => {
  const path = route.path || ''
  return path === '/help' || path === '/faq' || path.startsWith('/faq/')
})

const isBekaskuCenterActive = computed(
  () =>
    isHydratedLoggedIn.value &&
    (helpChatStore.isFloatingOpen || (route.path || '').startsWith('/help/chat')),
)

function getNavButtonClass(isActive: boolean, requiresAuth: boolean): string {
  if (isActive && (!requiresAuth || isHydratedLoggedIn.value)) {
    return 'text-primary bg-red-50/80 font-semibold'
  }
  if (requiresAuth && !isHydratedLoggedIn.value) {
    return 'text-gray-600 hover:text-primary hover:bg-red-50/70 font-medium'
  }
  return 'text-gray-700 hover:text-primary hover:bg-red-50/70 font-semibold'
}
const authModal = useAuthModal()
const kyc = useIdentityKyc()
const kycModal = useIdentityKycModal()
const accountDrawer = useAccountDrawer()
const notificationDrawer = useNotificationDrawer()
const { showNotification } = useNotification()
const { categories, fetchCategories } = useCategories()
const { currentAddressText, fetchAddresses: fetchUserAddresses } = useAddress()
const { t, currentLocaleMeta } = useLocale()
const route = useRoute()
const isHeaderLangModalOpen = ref(false)

const showPostTypeModal = ref(false)
const showPostCategoryModal = ref(false)
const headerCategoryModalTitle = ref('Pilih Kategori Barang')
const serviceCategories = ref<CategoryItem[]>([])
const isServiceCategoriesLoading = ref(false)
const postSubcategories = ref<SubcategoryItem[]>([])
const isPostSubcategoriesLoading = ref(false)
const selectedPostCategory = ref<CategoryItem | null>(null)
const selectedPostType = ref<number>(POST_TYPE_SELL)

const headerPostCategories = computed<CategoryItem[]>(() => {
  if (selectedPostType.value === POST_TYPE_SERVICE) {
    return serviceCategories.value
  }
  return categories.value.map((c) => ({
    _id: String(c.id || c._id || ''),
    name_id: c.name || '',
    name_en: c.name || '',
    image: c.image,
  }))
})

const showLogoutConfirm = ref(false)
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedCategoryName = ref<string | null>(null)
const isCategoryMenuOpen = ref(false)
const isUserMenuOpen = accountDrawer.isOpen
const isAddressModalOpen = ref(false)
const avatarLoadError = ref(false)

watch(
  () => authStore.userAvatar,
  () => {
    avatarLoadError.value = false
  },
)

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

const promptLogout = () => {
  isUserMenuOpen.value = false
  showLogoutConfirm.value = true
}

const confirmLogout = () => {
  showLogoutConfirm.value = false
  authStore.clearSession()
  const protectedPrefixes = [
    '/profile',
    '/account',
    '/transactions',
    '/cart',
    '/balance',
    '/sundul',
    '/catalog',
    '/favorite',
    '/chat',
    '/notifications',
    '/post',
    '/phone/verify',
  ]
  const isProtectedRoute = protectedPrefixes.some((prefix) => route.path.startsWith(prefix))
  authModal.triggerAuthReload(
    'Sedang Keluar...',
    'Mengakhiri sesi akun Anda...',
    isProtectedRoute ? '/' : undefined,
  )
}

const isCheckingKyc = ref(false)

const handleSellClick = async () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Jual Barang',
      redirectPath: '/post/sell',
    })
    return
  }

  isCheckingKyc.value = true
  try {
    const verified = await kyc.ensureIdentityInfo()
    if (!verified) {
      kycModal.open({
        reason: 'sell',
        featureName: 'Jual Barang',
        onSuccess: () => {
          showPostTypeModal.value = true
        },
      })
      return
    }
  } catch {
    // Abaikan jika error jaringan sesaat, izinkan lanjut
  } finally {
    isCheckingKyc.value = false
  }

  showPostTypeModal.value = true
}

const onHeaderAiPostApplied = () => {
  showPostTypeModal.value = false
  if (route.path !== '/post/sell') {
    navigateTo('/post/sell')
  }
}

const onSelectHeaderPostType = async (type: number) => {
  selectedPostType.value = type
  showPostTypeModal.value = false

  if (type === POST_TYPE_SERVICE) {
    headerCategoryModalTitle.value = 'Tambah Iklan (Jasa)'
    if (serviceCategories.value.length === 0) {
      isServiceCategoriesLoading.value = true
      try {
        const res = await api.post<any>(API_CATEGORY_LIST, {
          service: true,
          lang: 'id',
        })
        const raw = Array.isArray(res?.result)
          ? res.result
          : Array.isArray(res?.docs)
            ? res.docs
            : []
        serviceCategories.value = raw.map((c: any) => ({
          _id: String(c._id || c.id || ''),
          name_id: c.name_id || c.name || '',
          name_en: c.name_en || c.name || '',
          image: c.image,
        }))
      } catch (err) {
        console.error('Failed to load service categories for header:', err)
      } finally {
        isServiceCategoriesLoading.value = false
      }
    }
    showPostCategoryModal.value = true
  } else if (type === POST_TYPE_NEEDED) {
    headerCategoryModalTitle.value = 'Tambah Iklan (Dibutuhkan)'
    if (categories.value.length === 0) {
      await fetchCategories()
    }
    showPostCategoryModal.value = true
  } else {
    headerCategoryModalTitle.value = 'Pilih Kategori Barang'
    if (categories.value.length === 0) {
      await fetchCategories()
    }
    showPostCategoryModal.value = true
  }
}

const onSelectHeaderCategory = async (cat: CategoryItem) => {
  selectedPostCategory.value = cat
  isPostSubcategoriesLoading.value = true
  postSubcategories.value = []
  try {
    const isService = selectedPostType.value === POST_TYPE_SERVICE
    const res = await api.post<any>(API_SUBCATEGORY_LIST, {
      category_id: cat._id,
      lang: 'id',
      ...(isService ? { service: true } : {}),
    })
    const rawList = Array.isArray(res?.result)
      ? res.result
      : Array.isArray(res?.result?.docs)
        ? res.result.docs
        : Array.isArray(res?.docs)
          ? res.docs
          : []
    postSubcategories.value = rawList.map((s: any) => ({
      _id: String(s._id || s.id || ''),
      category_id: cat._id,
      name_id: s.name_id || s.name || '',
      name_en: s.name_en || s.name || '',
      charge: typeof s.charge === 'number' ? s.charge : 3,
    }))
  } catch (err) {
    console.error('Failed to load subcategories for header modal:', err)
  } finally {
    isPostSubcategoriesLoading.value = false
  }
}

const onSelectHeaderSubcategory = (sub: SubcategoryItem) => {
  showPostCategoryModal.value = false
  const query: Record<string, string> = {
    cat: selectedPostCategory.value?._id || '',
    sub: sub._id,
  }
  if (selectedPostType.value === POST_TYPE_AI) {
    query.type = 'ai'
  } else if (selectedPostType.value === POST_TYPE_NEEDED) {
    query.method = 'needed'
  } else if (selectedPostType.value === POST_TYPE_SERVICE) {
    query.method = 'service'
  }
  navigateTo({
    path: '/post/sell',
    query,
  })
}

const handleNotificationClick = () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Notifikasi',
    })
    return
  }
  notificationDrawer.open()
}

const handleChatClick = () => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Chat & Pesan',
      redirectPath: route.fullPath,
    })
    return
  }

  if (route.path.startsWith('/chat')) {
    return
  }

  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    if (chatStore.isFloatingOpen) {
      chatStore.minimizeToFloatingIcon()
    } else {
      chatStore.isFloatingOpen = true
      chatStore.isFloatingMinimized = false
    }
  } else {
    navigateTo('/chat')
  }
}

const handleAuthAction = (targetPath: string, label?: string) => {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: label,
      redirectPath: targetPath,
    })
  } else {
    navigateTo(targetPath)
  }
}

const handleBekaskuCenterClick = () => {
  helpChatStore.openHelpChat({ topic: 'general' })
}

const selectCategory = (cat: Category | null) => {
  isCategoryMenuOpen.value = false
  const nextQuery: Record<string, string> = {}

  if (route.path.startsWith('/search')) {
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string' && v && k !== 'category_id' && k !== 'category_name' && k !== 'category') {
        nextQuery[k] = v
      }
    }
  }

  if (searchQuery.value.trim()) {
    nextQuery.q = searchQuery.value.trim()
  }

  if (cat) {
    const catId = cat.id || cat._id || ''
    selectedCategoryId.value = catId
    selectedCategoryName.value = cat.name
    if (catId) nextQuery.category_id = catId
    nextQuery.category_name = cat.name
    if (!nextQuery.type) nextQuery.type = '1'
    navigateTo({ path: '/search/result', query: nextQuery })
  } else {
    selectedCategoryId.value = ''
    selectedCategoryName.value = null
    if (!nextQuery.type && nextQuery.q) nextQuery.type = '1'
    navigateTo({ path: '/search/result', query: nextQuery })
  }
}

const handleSearch = () => {
  const query: Record<string, string> = {}
  if (route.path.startsWith('/search')) {
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string' && v && k !== 'q' && k !== 'category_id' && k !== 'category_name' && k !== 'category') {
        query[k] = v
      }
    }
  }
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value.trim()
  }
  if (selectedCategoryId.value) {
    query.category_id = selectedCategoryId.value
  }
  if (selectedCategoryName.value) {
    query.category_name = selectedCategoryName.value
  }
  if (!query.type) {
    query.type = '1'
  }
  navigateTo({ path: '/search/result', query })
}

watch(
  () => [
    route.query.q,
    route.query.category_id,
    route.query.category_name,
    route.query.category,
  ],
  ([qVal, catIdVal, catNameVal, catLegacyVal]) => {
    searchQuery.value = typeof qVal === 'string' ? qVal : ''
    const cId = typeof catIdVal === 'string' ? catIdVal : ''
    const cName = typeof catNameVal === 'string'
      ? catNameVal
      : typeof catLegacyVal === 'string'
        ? catLegacyVal
        : ''

    selectedCategoryId.value = cId
    if (cName) {
      selectedCategoryName.value = cName
    } else if (cId && categories.value.length > 0) {
      const matched = categories.value.find((c) => (c.id || c._id) === cId)
      selectedCategoryName.value = matched ? matched.name : null
    } else {
      selectedCategoryName.value = null
    }
  },
  { immediate: true }
)

watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      kyc.fetchIdentityInfo()
      fetchUserAddresses()
    }
  },
)

onMounted(async () => {
  hasMounted.value = true
  if (categories.value.length === 0) {
    await fetchCategories()
  }
  if (authStore.isLoggedIn) {
    fetchUserAddresses()
    kyc.fetchIdentityInfo()
  }

  if (import.meta.client) {
    window.addEventListener('click', () => {
      isCategoryMenuOpen.value = false
    })
  }
})
</script>
