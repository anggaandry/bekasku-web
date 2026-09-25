<template>
  <header class="w-full sticky top-0 z-50 shadow-xs">
    <!-- Top Row: BekasKu Brand Red Header (#E31B23 matching Bekasku V3 Mobile Theme) -->
    <div class="bg-[#E31B23] text-white py-2.5">
      <div class="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
        <!-- Brand Logo Image (White Vector from Bekasku Mobile V3) -->
        <NuxtLink to="/" class="shrink-0 flex items-center hover:opacity-95 transition-opacity" title="BekasKu">
          <img
            src="/images/logo_white.png"
            alt="Bekasku Logo"
            class="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-xs"
          />
        </NuxtLink>

        <!-- Center: Modern Squircle Search Bar with Integrated Kategori Dropdown -->
        <div class="flex-1 max-w-2xl">
          <form class="relative w-full" @submit.prevent="handleSearch">
            <div
              class="relative flex items-center bg-white rounded-xl shadow-md p-1 border border-white/20 transition-all focus-within:ring-2 focus-within:ring-white/40 focus-within:shadow-lg"
            >
              <!-- Integrated Kategori Dropdown Trigger inside Search Bar (No icon, no gray background) -->
              <div class="relative shrink-0">
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-gray-700 hover:text-[#E31B23] transition-colors cursor-pointer text-xs font-semibold select-none group"
                  @click.stop="isCategoryMenuOpen = !isCategoryMenuOpen"
                >
                  <span class="max-w-[90px] sm:max-w-[120px] truncate">
                    {{ selectedCategoryName || 'Semua Kategori' }}
                  </span>
                  <ChevronDown
                    class="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E31B23] transition-transform duration-200 shrink-0"
                    :class="{ 'rotate-180': isCategoryMenuOpen }"
                  />
                </button>

                <!-- Category Popover Menu (Modern Redesign, Sorted A-Z, No icons) -->
                <div
                  v-if="isCategoryMenuOpen"
                  class="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-gray-800 max-h-80 overflow-y-auto"
                >
                  <div class="px-2.5 pb-1 pt-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Pilih Kategori (A-Z)
                  </div>

                  <!-- Option: Semua Kategori (Tanpa Icon) -->
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 hover:text-[#E31B23] transition-all text-left cursor-pointer group"
                    :class="{ 'text-[#E31B23] bg-red-50/80 font-bold': !selectedCategoryName }"
                    @click="selectCategory(null)"
                  >
                    <span>Semua Kategori</span>
                    <Check v-if="!selectedCategoryName" class="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                  </button>

                  <div class="h-px bg-gray-100 my-1 mx-2" />

                  <!-- Dynamic Categories List (Sorted A - Z, No icons) -->
                  <button
                    v-for="cat in sortedCategories"
                    :key="cat.id || cat._id"
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 hover:text-[#E31B23] transition-all text-left cursor-pointer group"
                    :class="{ 'text-[#E31B23] font-bold bg-red-50/80': selectedCategoryName === cat.name }"
                    @click="selectCategory(cat)"
                  >
                    <span class="truncate transition-transform group-hover:translate-x-0.5">{{ cat.name }}</span>
                    <Check v-if="selectedCategoryName === cat.name" class="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                  </button>
                </div>
              </div>

              <!-- Subtle Divider -->
              <div class="h-6 w-px bg-gray-200 mx-1 shrink-0" />

              <!-- Search Input Field (Clean without magnifying glass prefix) -->
              <div class="relative flex-1 flex items-center min-w-0">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari di Bekasku..."
                  class="w-full bg-transparent text-gray-900 text-xs sm:text-sm pl-2.5 pr-2 py-1.5 placeholder-gray-400 focus:outline-none font-medium"
                />
                <!-- Clear Button -->
                <button
                  v-if="searchQuery"
                  type="button"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer mr-1"
                  @click="searchQuery = ''"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Search Action Button (Red Capsule Button inside Search Container) -->
              <button
                type="submit"
                class="bg-[#E31B23] hover:bg-[#B91219] text-white px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Search class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Cari</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Action Icons & User / Login State -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <!-- Chat Button (Requires Auth -> Redirects to /login if not logged in) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Pesan"
            @click="handleAuthAction('/chat')"
          >
            <MessageSquareMore class="w-5 h-5" />
          </button>

          <!-- Notification Bell (Requires Auth -> Redirects to /login if not logged in) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Notifikasi"
            @click="handleAuthAction('/notifications')"
          >
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-[#FFD600] rounded-full ring-2 ring-[#E31B23]" />
          </button>

          <!-- Cart Button (Requires Auth -> Redirects to /login if not logged in) -->
          <button
            type="button"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
            title="Keranjang"
            @click="handleAuthAction('/cart')"
          >
            <ShoppingCart class="w-5 h-5" />
            <span
              class="absolute top-1 right-1 bg-[#FFD600] text-[#111827] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#E31B23]"
            >
              {{ cartStore.totalItems || 0 }}
            </span>
          </button>

          <!-- + Jual Button (Requires Auth -> Redirects to /login if not logged in) -->
          <button
            type="button"
            class="bg-white hover:bg-gray-100 text-[#E31B23] px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ml-1 cursor-pointer"
            @click="handleAuthAction('/post/sell')"
          >
            <Plus class="w-3.5 h-3.5 stroke-[3]" />
            <span>Jual</span>
          </button>

          <!-- Divider -->
          <div class="h-6 w-px bg-white/30 hidden sm:block mx-1" />

          <!-- Logged In User Profile OR Masuk Button -->
          <div v-if="authStore.isLoggedIn" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-white/15 text-white transition-colors cursor-pointer"
              @click.stop="isUserMenuOpen = !isUserMenuOpen"
            >
              <div class="w-7 h-7 rounded-full overflow-hidden border border-white/50 bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                <img
                  v-if="authStore.userAvatar"
                  :src="authStore.userAvatar"
                  :alt="authStore.displayName"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ authStore.displayName.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="text-xs font-semibold max-w-[90px] truncate hidden md:inline">
                {{ authStore.displayName }}
              </span>
              <ChevronDown class="w-3 h-3 text-white/80" />
            </button>

            <!-- User Menu Popup -->
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 text-gray-800"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs font-bold text-gray-900 truncate">{{ authStore.displayName }}</p>
                <p class="text-[10px] text-gray-500 truncate">{{ authStore.user?.email || authStore.user?.phone || 'Member BekasKu' }}</p>
              </div>
              <NuxtLink to="/profile" class="block px-4 py-2 text-xs hover:bg-gray-50 text-gray-700" @click="isUserMenuOpen = false">
                Profil Saya
              </NuxtLink>
              <NuxtLink to="/transactions" class="block px-4 py-2 text-xs hover:bg-gray-50 text-gray-700" @click="isUserMenuOpen = false">
                Pesanan &amp; Transaksi
              </NuxtLink>
              <NuxtLink to="/terms" class="block px-4 py-2 text-xs hover:bg-gray-50 text-gray-700" @click="isUserMenuOpen = false">
                Pusat Bantuan
              </NuxtLink>
              <button
                type="button"
                class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-gray-100 cursor-pointer"
                @click="handleLogout"
              >
                Keluar
              </button>
            </div>
          </div>

          <!-- If Not Logged In: Masuk Button (Clean Frosted Glass Pill) -->
          <div v-else class="flex items-center gap-1.5">
            <NuxtLink
              to="/login"
              class="flex items-center gap-1.5 text-white bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-bold py-2 px-3.5 rounded-xl transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <User class="w-3.5 h-3.5" />
              <span>Masuk</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Sub-navbar: White Row with Location Pill (Opens Address Modal) & Nav Links -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between py-1.5 text-xs">
        <!-- Left Side: Location Pill Connected to AppAddressModal -->
        <div class="flex items-center gap-2.5">
          <div
            class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-full text-gray-700 hover:text-[#E31B23] cursor-pointer group transition-colors shadow-2xs"
            title="Klik untuk memilih atau menambah alamat"
            @click="isAddressModalOpen = true"
          >
            <MapPin class="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
            <span class="text-gray-500 font-medium">Kirim ke:</span>
            <span class="font-bold text-gray-900 group-hover:text-[#E31B23] transition-colors truncate max-w-[160px] lg:max-w-[260px]">
              {{ currentAddressText }}
            </span>
            <ChevronDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600 shrink-0" />
          </div>
        </div>

        <!-- Right Side: Navigation Tabs aligned with Mobile V3 Profile menus (Saldo, Transaksi, Sundul, Iklan Saya, VIP, BekasKu+, Bantuan) -->
        <nav class="flex items-center gap-2 lg:gap-3 font-medium text-gray-700">
          <!-- 1. Saldo / Dompet -->
          <NuxtLink
            to="/balance"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-[#2563EB] hover:bg-blue-50/70 transition-all font-semibold"
            title="Saldo & Dompet BekasKu"
          >
            Saldo
          </NuxtLink>

          <!-- 2. Transaksi (Pesanan Saya) -->
          <NuxtLink
            to="/transactions"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-[#2563EB] hover:bg-blue-50/70 transition-all font-semibold"
            title="Riwayat Pesanan & Transaksi"
          >
            Transaksi
          </NuxtLink>

          <!-- 3. Sundul (Promosi Produk) -->
          <NuxtLink
            to="/sundul"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-[#E31B23] hover:bg-red-50/70 transition-all font-semibold"
            title="Sundul Produk ke Posisi Teratas"
          >
            Sundul
          </NuxtLink>

          <!-- 4. Iklan Saya -->
          <NuxtLink
            to="/catalog"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
            title="Katalog Iklan Aktif Saya"
          >
            Iklan Saya
          </NuxtLink>

          <!-- 5. Subscribe (Teks biasa tanpa badge) -->
          <NuxtLink
            to="/vip"
            class="px-2 py-1 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all font-semibold"
            title="Subscribe"
          >
            Subscribe
          </NuxtLink>

          <!-- 6. BekasKu+ Creator (Warna Merah BekasKu) -->
          <NuxtLink
            to="/seller"
            class="px-2 py-1 rounded-lg text-[#E31B23] hover:text-[#B91219] hover:bg-red-50/70 transition-all font-bold"
            title="BekasKu+ Influencer & Creator"
          >
            BekasKu+
          </NuxtLink>

          <!-- 7. Bantuan -->
          <NuxtLink
            to="/terms"
            class="px-2 py-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            title="Pusat Bantuan & FAQ"
          >
            Bantuan
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Address Selection & Addition Modal (Bekasku Mobile V3 Flow) -->
    <AppAddressModal v-model="isAddressModalOpen" />
  </header>
</template>

<script setup lang="ts">
import {
  Search,
  MessageSquareMore,
  Bell,
  ShoppingCart,
  Plus,
  ChevronDown,
  MapPin,
  User,
  X,
  Check,
} from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useCategories, type Category } from '~/composables/useCategories'
import { useAddress } from '~/composables/useAddress'

const cartStore = useCartStore()
const authStore = useAuthStore()
const { categories, fetchCategories } = useCategories()
const { currentAddressText, fetchAddresses: fetchUserAddresses } = useAddress()
const route = useRoute()

const searchQuery = ref('')
const selectedCategoryName = ref<string | null>(null)
const isCategoryMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isAddressModalOpen = ref(false)
const activeTab = ref('beranda')

// Categories sorted alphabetically from A to Z
const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

// Watch route category
watch(
  () => route.query.category,
  (val) => {
    if (val) {
      selectedCategoryName.value = val as string
    } else {
      selectedCategoryName.value = null
    }
  },
  { immediate: true }
)

function selectCategory(cat: Category | null) {
  isCategoryMenuOpen.value = false
  if (cat) {
    selectedCategoryName.value = cat.name
    navigateTo({
      path: '/',
      query: { ...route.query, category: cat.name },
    })
  } else {
    selectedCategoryName.value = null
    const query = { ...route.query }
    delete query.category
    navigateTo({ path: '/', query })
  }
}

function handleSearch() {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value.trim()
  }
  if (selectedCategoryName.value) {
    query.category = selectedCategoryName.value
  }
  navigateTo({ path: '/', query })
}

/**
 * Handles actions requiring authentication (Chat, Notifikasi, Cart, Jual)
 * Redirects to /login if not logged in.
 */
function handleAuthAction(targetPath: string) {
  if (!authStore.isLoggedIn) {
    navigateTo('/login')
  } else {
    navigateTo(targetPath)
  }
}

function handleLogout() {
  isUserMenuOpen.value = false
  authStore.clearSession()
  navigateTo('/login')
}

// Close menus when clicking outside & load categories & addresses
onMounted(async () => {
  if (categories.value.length === 0) {
    await fetchCategories()
  }
  fetchUserAddresses()

  if (import.meta.client) {
    window.addEventListener('click', () => {
      isCategoryMenuOpen.value = false
      isUserMenuOpen.value = false
    })
  }
})
</script>


