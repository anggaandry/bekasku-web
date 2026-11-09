<template>
  <div class="min-h-screen bg-surface md:bg-bg flex flex-col text-text">
    <!-- Mobile Sticky Header Bar -->
    <SellerHeaderBar
      :seller-name="seller?.name"
      :cart-count="cartStore.totalItems"
      v-model="searchQuery"
      @search="handleSearch"
      @cart-click="handleCartClick"
      @more-click="handleMoreClick"
    />

    <!-- Main Content Container (Mobile: full-width seamless; Desktop: 1280px 2-Column Grid) -->
    <main class="flex-1 w-full max-w-[1280px] mx-auto md:px-4 lg:px-6 md:py-6">
      <!-- Loading Skeleton State -->
      <div v-if="loading && !seller" class="p-4 bg-white md:rounded-2xl md:border md:border-border space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-border animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="w-48 h-5 bg-border rounded animate-pulse"></div>
            <div class="w-24 h-4 bg-border rounded animate-pulse"></div>
          </div>
        </div>
        <div class="w-full h-8 bg-surface-2 rounded animate-pulse"></div>
      </div>

      <!-- Seller Profile Content -->
      <div v-else-if="seller">
        <!-- Mobile Layout (< md: 1:1 Mobile V3 Stack) -->
        <div class="md:hidden space-y-0">
          <!-- Profile Card -->
          <div class="bg-white border-b border-border/60">
            <SellerProfileHeader
              :seller="seller"
              :is-following="isFollowing"
              :follow-loading="followLoading"
              :is-mine="isMine"
              layout="default"
              @follow-click="handleFollowClick"
              @chat-click="handleChatClick"
              @live-click="handleLiveClick"
            />
            <SellerStatsRow :seller="seller" layout="default" />
          </div>

          <!-- Sticky Tab Bar (Produk | Penilaian) -->
          <div class="sticky top-[54px] z-20 bg-white">
            <SellerTabBar v-model:active-tab="activeTab" />
          </div>

          <!-- Mobile Tab 1: Produk -->
          <div v-show="activeTab === 'products'" class="p-3">
            <!-- Loading products -->
            <div
              v-if="productLoading && displayedProducts.length === 0"
              class="grid grid-cols-2 gap-2.5"
            >
              <div
                v-for="i in 8"
                :key="i"
                class="aspect-[3/4] bg-surface-2 rounded-xl border border-border animate-pulse"
              ></div>
            </div>

            <!-- Empty products -->
            <div
              v-else-if="displayedProducts.length === 0"
              class="py-16 text-center bg-white rounded-xl"
            >
              <AppEmptyState
                :title="searchQuery ? 'Tidak ada produk cocok' : 'Belum ada produk'"
                :description="searchQuery ? 'Coba gunakan kata kunci pencarian yang lain' : 'Penjual belum mengunggah produk di toko ini'"
              />
            </div>

            <!-- Products Grid -->
            <div v-else>
              <ProductGrid
                :products="displayedProducts"
                :columns="2"
                @select="handleProductSelect"
              />

              <!-- Load more products trigger -->
              <div
                v-if="hasNextProduct"
                class="py-6 text-center"
              >
                <button
                  type="button"
                  :disabled="isLoadingMoreProducts"
                  class="px-5 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold text-text shadow-2xs hover:bg-surface-2 transition-all cursor-pointer inline-flex items-center gap-2"
                  @click="fetchSellerProducts(true)"
                >
                  <span v-if="isLoadingMoreProducts" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ isLoadingMoreProducts ? 'Memuat produk...' : 'Muat Lebih Banyak' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Tab 2: Penilaian (Reviews) -->
          <div v-show="activeTab === 'reviews'" class="p-4 bg-white min-h-[400px]">
            <!-- Loading reviews -->
            <div v-if="reviewLoading && reviews.length === 0" class="space-y-4">
              <div
                v-for="i in 4"
                :key="i"
                class="p-4 bg-surface-2 rounded-xl border border-border/60 animate-pulse space-y-3"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-border"></div>
                  <div class="space-y-1.5 flex-1">
                    <div class="w-32 h-4 bg-border rounded"></div>
                    <div class="w-20 h-3 bg-border rounded"></div>
                  </div>
                </div>
                <div class="w-full h-10 bg-border/60 rounded"></div>
              </div>
            </div>

            <!-- Empty reviews -->
            <div
              v-else-if="reviews.length === 0"
              class="py-16 text-center"
            >
              <AppEmptyState
                title="Belum ada penilaian"
                description="Toko ini belum memiliki ulasan dari pembeli."
              />
            </div>

            <!-- Reviews List -->
            <div v-else class="divide-y divide-border/60">
              <SellerReviewCard
                v-for="(item, idx) in reviews"
                :key="item.transaction_id || item.id || idx"
                :review="item"
                @photo-click="openPhotoViewer"
              />

              <!-- Load more reviews trigger -->
              <div
                v-if="hasNextReview"
                class="py-6 text-center"
              >
                <button
                  type="button"
                  :disabled="isLoadingMoreReviews"
                  class="px-5 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold text-text shadow-2xs hover:bg-surface-2 transition-all cursor-pointer inline-flex items-center gap-2"
                  @click="fetchSellerReviews(true)"
                >
                  <span v-if="isLoadingMoreReviews" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ isLoadingMoreReviews ? 'Memuat ulasan...' : 'Muat Ulasan Lainnya' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout (md+: 2-Column Sidebar + Content) -->
        <div class="hidden md:grid md:grid-cols-12 md:gap-6 items-start">
          <!-- Left Column: Seller Profile Sidebar Card (col-span-4 lg:col-span-3.5) -->
          <div class="md:col-span-4 lg:col-span-3.5 sticky top-[121px] bg-white rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <!-- Profile Identity & Badges & Action Buttons (Sidebar Layout) -->
            <SellerProfileHeader
              :seller="seller"
              :is-following="isFollowing"
              :follow-loading="followLoading"
              :is-mine="isMine"
              layout="sidebar"
              @follow-click="handleFollowClick"
              @chat-click="handleChatClick"
              @live-click="handleLiveClick"
            />

            <!-- Divider Halus -->
            <div class="h-px bg-border/60 my-3" />

            <!-- Stats (Lokasi, Chat, Terjual, Bergabung / Aktif) -->
            <SellerStatsRow :seller="seller" layout="sidebar" />
          </div>

          <!-- Right Column: Unified Card (Sticky Tab Bar on top + Seamless Content Card) -->
          <div class="md:col-span-8 lg:col-span-8.5">
            <!-- Desktop Sticky Tab Bar (Aligned at 121px with rounded top-left and top-right) -->
            <div class="sticky top-[105px] z-30 pt-4 bg-bg -mt-4">
              <div class="bg-white rounded-t-2xl border-t border-x border-b border-border shadow-2xs overflow-hidden">
                <SellerTabBar v-model:active-tab="activeTab" class="border-b-0" />
              </div>
            </div>

            <!-- Content Card (Seamless continuation with rounded bottom-left and bottom-right) -->
            <div class="bg-white border-x border-b border-border rounded-b-2xl shadow-xs overflow-hidden">
              <!-- Desktop Internal Search Filter (Only inside Products Tab) -->
              <div
                v-if="activeTab === 'products'"
                class="flex items-center justify-between px-6 py-3.5 border-b border-border/60"
              >
                <div class="relative w-80">
                  <input
                    v-model="searchQuery"
                    type="search"
                    :placeholder="`Cari produk di ${seller.name}...`"
                    class="w-full h-10 pl-10 pr-4 bg-surface-2 border border-border rounded-lg text-sm font-outfit text-text placeholder:text-text-subtle focus:bg-white focus:border-primary outline-none transition-all"
                    @input="handleSearch(searchQuery)"
                  />
                  <Search class="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <span class="text-xs font-outfit text-text-muted">
                  Menampilkan {{ displayedProducts.length }} produk
                </span>
              </div>

              <!-- Desktop TAB 1: PRODUK (CATALOG) -->
              <div v-show="activeTab === 'products'" class="p-6">
                <!-- Loading initial products -->
                <div
                  v-if="productLoading && displayedProducts.length === 0"
                  class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  <div
                    v-for="i in 8"
                    :key="i"
                    class="aspect-[3/4] bg-surface-2 rounded-xl border border-border animate-pulse"
                  ></div>
                </div>

                <!-- Empty products state -->
                <div
                  v-else-if="displayedProducts.length === 0"
                  class="py-16 text-center"
                >
                  <AppEmptyState
                    :title="searchQuery ? 'Tidak ada produk cocok' : 'Belum ada produk'"
                    :description="searchQuery ? 'Coba gunakan kata kunci pencarian yang lain' : 'Penjual belum mengunggah produk di toko ini'"
                  />
                </div>

                <!-- Products Grid -->
                <div v-else>
                  <ProductGrid
                    :products="displayedProducts"
                    :columns="4"
                    @select="handleProductSelect"
                  />

                  <!-- Infinite Scroll Load More CTA -->
                  <div
                    v-if="hasNextProduct"
                    class="mt-8 text-center"
                  >
                    <button
                      type="button"
                      :disabled="isLoadingMoreProducts"
                      class="px-6 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold font-outfit text-text shadow-2xs hover:bg-surface-2 hover:border-primary/40 transition-all cursor-pointer inline-flex items-center gap-2"
                      @click="fetchSellerProducts(true)"
                    >
                      <span v-if="isLoadingMoreProducts" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>{{ isLoadingMoreProducts ? 'Memuat produk...' : 'Muat Lebih Banyak Produk' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Desktop TAB 2: PENILAIAN (REVIEWS) -->
              <div v-show="activeTab === 'reviews'" class="p-6">
                <!-- Loading reviews -->
                <div v-if="reviewLoading && reviews.length === 0" class="space-y-4">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="p-4 bg-surface-2 rounded-xl border border-border/60 animate-pulse space-y-3"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-border"></div>
                      <div class="space-y-1.5 flex-1">
                        <div class="w-36 h-4 bg-border rounded"></div>
                        <div class="w-24 h-3 bg-border rounded"></div>
                      </div>
                    </div>
                    <div class="w-full h-12 bg-border/60 rounded"></div>
                  </div>
                </div>

                <!-- Empty reviews -->
                <div
                  v-else-if="reviews.length === 0"
                  class="py-16 text-center"
                >
                  <AppEmptyState
                    title="Belum ada penilaian"
                    description="Toko ini belum memiliki ulasan dari pembeli."
                  />
                </div>

                <!-- Reviews List -->
                <div v-else class="divide-y divide-border/60">
                  <SellerReviewCard
                    v-for="(item, idx) in reviews"
                    :key="item.transaction_id || item.id || idx"
                    :review="item"
                    @photo-click="openPhotoViewer"
                  />

                  <!-- Infinite Scroll Load More CTA -->
                  <div
                    v-if="hasNextReview"
                    class="mt-8 text-center"
                  >
                    <button
                      type="button"
                      :disabled="isLoadingMoreReviews"
                      class="px-6 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold font-outfit text-text shadow-2xs hover:bg-surface-2 transition-all cursor-pointer inline-flex items-center gap-2"
                      @click="fetchSellerReviews(true)"
                    >
                      <span v-if="isLoadingMoreReviews" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>{{ isLoadingMoreReviews ? 'Memuat ulasan...' : 'Muat Lebih Banyak Ulasan' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="py-20 text-center">
        <AppEmptyState
          title="Toko Tidak Ditemukan"
          description="Profil penjual tidak dapat ditemukan atau telah dihapus."
        />
        <div class="mt-6">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <span>Kembali ke Beranda</span>
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Guest Auth Modal -->
    <AppGuestAuthModal
      v-model="isAuthModalOpen"
      :feature-title="authModalFeatureTitle"
    />

    <!-- Fullscreen Photo Viewer for Review Photos -->
    <div
      v-if="activePhotoUrl"
      class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
      @click.self="activePhotoUrl = null"
    >
      <button
        type="button"
        class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 cursor-pointer"
        aria-label="Tutup foto"
        @click="activePhotoUrl = null"
      >
        <X class="w-6 h-6" />
      </button>
      <img
        :src="activePhotoUrl"
        alt="Pratinjau Foto"
        class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Search,
  X,
} from 'lucide-vue-next'
import ProductGrid from '~/components/shared/ProductGrid.vue'
import AppGuestAuthModal from '~/components/shared/AppGuestAuthModal.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import SellerHeaderBar from '~/components/seller/SellerHeaderBar.vue'
import SellerProfileHeader from '~/components/seller/SellerProfileHeader.vue'
import SellerStatsRow from '~/components/seller/SellerStatsRow.vue'
import SellerTabBar from '~/components/seller/SellerTabBar.vue'
import SellerReviewCard from '~/components/seller/SellerReviewCard.vue'
import { useSellerProfile } from '~/composables/useSellerProfile'
import { sanitizeMediaUrl } from '~/utils/media'
import { productPath } from '~/utils/slug'

import { toSafeString } from '~/utils/inputGuard'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const chatStore = useChatStore()

const sellerId = toSafeString(route.params.id, 50)

// Domain Composable
const {
  seller,
  loading,
  followLoading,
  isFollowing,
  products,
  displayedProducts,
  productLoading,
  hasNextProduct,
  isLoadingMoreProducts,
  searchQuery,
  reviews,
  reviewLoading,
  hasNextReview,
  isLoadingMoreReviews,
  fetchSellerInfo,
  fetchSellerProducts,
  fetchSellerReviews,
  toggleFollow,
} = useSellerProfile(sellerId)

// Check if viewing own store
const isMine = computed(() => {
  return !!(authStore.isLoggedIn && authStore.user && (authStore.user._id === sellerId || authStore.user.id === sellerId))
})

// Active Tab
const activeTab = ref<'products' | 'reviews'>('products')

// Modals
const isAuthModalOpen = ref(false)
const authModalFeatureTitle = ref('Fitur Toko')
const activePhotoUrl = ref<string | null>(null)

// Lazy load reviews on tab switch
watch(activeTab, (tab) => {
  if (tab === 'reviews' && reviews.value.length === 0) {
    fetchSellerReviews()
  }
})

// SSR Data Fetching
const { data: initialSeller } = await useAsyncData(
  `seller-info-${sellerId}`,
  async () => {
    return await fetchSellerInfo()
  }
)

if (initialSeller.value && !seller.value) {
  seller.value = initialSeller.value
}

// Initial products fetch on mount / SSR
onMounted(async () => {
  if (products.value.length === 0) {
    await fetchSellerProducts()
  }
})

// SEO Head Meta
useHead({
  title: computed(() => (seller.value?.name ? `Toko ${seller.value.name} — BekasKu` : 'Profil Toko — BekasKu')),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        seller.value?.bio ||
        `Beli barang preloved dan bekas berkualitas dari toko ${seller.value?.name || 'penjual'} di BekasKu.`
      ),
    },
    {
      property: 'og:title',
      content: computed(() => (seller.value?.name ? `Toko ${seller.value.name} — BekasKu` : 'Profil Toko')),
    },
    {
      property: 'og:image',
      content: computed(() => sanitizeMediaUrl(seller.value?.avatar || '')),
    },
  ],
})

// Interactions
function handleSearch(val: string) {
  searchQuery.value = val
}

function handleCartClick() {
  if (authStore.isLoggedIn) {
    router.push('/cart')
  } else {
    authModalFeatureTitle.value = 'Keranjang Belanja'
    isAuthModalOpen.value = true
  }
}

function handleMoreClick() {
  if (process.client && navigator.share) {
    navigator.share({
      title: seller.value?.name || 'Toko BekasKu',
      url: window.location.href,
    }).catch(() => {})
  } else if (process.client) {
    navigator.clipboard?.writeText(window.location.href)
  }
}

async function handleFollowClick() {
  if (authStore.isLoggedIn) {
    await toggleFollow()
  } else {
    authModalFeatureTitle.value = 'Ikuti Toko'
    isAuthModalOpen.value = true
  }
}

function handleChatClick() {
  if (authStore.isLoggedIn) {
    chatStore.openChatWith({
      partnerId: sellerId,
      partnerName: seller.value?.name || 'Penjual',
      partnerAvatar: seller.value?.avatar || '',
      isBekaskuPlus: Boolean(seller.value?.is_bekasku_plus),
    })
  } else {
    authModalFeatureTitle.value = 'Chat Penjual'
    isAuthModalOpen.value = true
  }
}

function handleLiveClick() {
  if (seller.value?.live_id) {
    router.push(`/live/${seller.value.live_id}`)
  }
}

function handleProductSelect(product: any) {
  router.push(productPath(product))
}

function openPhotoViewer(url: string) {
  activePhotoUrl.value = sanitizeMediaUrl(url)
}
</script>
