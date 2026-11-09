<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useCartStore } from '~/stores/cart'
import { useProducts } from '~/composables/useProducts'
import { useFormat } from '~/composables/useFormat'
import type { CartSeller, CartProduct } from '~/types/cart'
import { ChevronRight } from 'lucide-vue-next'
import CartHeader from '~/components/cart/CartHeader.vue'
import CartMethodTabs from '~/components/cart/CartMethodTabs.vue'
import CartSellerHeader from '~/components/cart/CartSellerHeader.vue'
import CartItemCard from '~/components/cart/CartItemCard.vue'
import CartSummaryBar from '~/components/cart/CartSummaryBar.vue'
import CartPriceDetailModal from '~/components/cart/CartPriceDetailModal.vue'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppGuestPromptCard from '~/components/shared/AppGuestPromptCard.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import HomeProductGrid from '~/components/home/HomeProductGrid.vue'
import CheckoutWizardStep from '~/components/checkout/CheckoutWizardStep.vue'

useHead({
  title: 'Keranjang Saya - BekasKu',
  meta: [
    { name: 'description', content: 'Keranjang belanja dan daftar barang siap beli di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const authModal = useAuthModal()
const cartStore = useCartStore()
const { fetchRecommendations } = useProducts()
const { formatPrice } = useFormat()

const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const itemToDelete = ref<{ seller: CartSeller; product: CartProduct } | null>(null)

function promptDeleteProduct(seller: CartSeller, product: CartProduct) {
  itemToDelete.value = { seller, product }
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (itemToDelete.value) {
    await cartStore.removeProduct(itemToDelete.value.seller, itemToDelete.value.product)
    itemToDelete.value = null
  }
  showDeleteConfirm.value = false
}

// Rekomendasi di bawah keranjang (Lazy)
const { data: recommendations, pending: recPending } = useAsyncData(
  'cart-recommendations',
  () => fetchRecommendations({ page: 1, limit: 10 }),
  { default: () => ({ docs: [] }), lazy: true }
)

const showMethodTabs = computed(
  () => authStore.isLoggedIn && !cartStore.errorMessage && cartStore.listCart.length > 0
)

const recommendationList = computed(() => recommendations.value?.docs || [])

watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn && import.meta.client) cartStore.fetchCart(false)
  },
  { immediate: true }
)

function handleCheckout() {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({ redirectPath: '/cart' })
    return
  }
  if (cartStore.checkedCount === 0) return

  // Bawa draft checkout ke langkah order berikutnya
  const checkoutDraft = useState('checkout-draft', () => ({
    items: cartStore.checkedProducts,
    totalPrice: cartStore.totalPrice,
    transactionMethod: cartStore.transactionMethod,
  }))
  checkoutDraft.value = {
    items: cartStore.checkedProducts,
    totalPrice: cartStore.totalPrice,
    transactionMethod: cartStore.transactionMethod,
  }

  navigateTo('/checkout')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <!-- Header Keranjang Khusus Mobile (<md) -->
    <CartHeader />

    <!-- Main Container -->
    <main class="flex-1 pb-24 md:pb-12">
      <!-- Step Wizard Minimalis untuk Alur Checkout (Desktop md+) -->
      <CheckoutWizardStep :current-step="1" />

      <!-- Tabs Transaksi hanya saat keranjang berisi -->
      <CartMethodTabs
        v-if="showMethodTabs"
        :model-value="cartStore.transactionMethod"
        @update:model-value="cartStore.setTransactionMethod"
      />

      <!-- 1. GUEST STATE (Belum Login) -->
      <div v-if="!authStore.isLoggedIn" class="max-w-[1200px] mx-auto px-4 py-8 sm:py-12 flex justify-center">
        <AppGuestPromptCard
          feature-title="Keranjang"
          message="Silakan masuk atau daftar akun BekasKu untuk melihat dan mengelola daftar barang belanjaan Anda."
          action-label="Masuk / Daftar Sekarang"
          @action="authModal.openLogin({ redirectPath: '/cart', featureTitle: 'Keranjang' })"
        />
      </div>

      <!-- 2. LOADING STATE -->
      <div v-else-if="cartStore.loading" class="max-w-[1200px] mx-auto px-4 py-6 space-y-4">
        <div class="h-12 bg-white rounded-2xl border border-border p-3 animate-pulse" />
        <div class="bg-white rounded-2xl border border-border p-4 space-y-4 animate-pulse">
          <div class="h-6 w-48 bg-surface-2 rounded-lg" />
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-surface-2 rounded-xl shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-surface-2 rounded w-3/4" />
              <div class="h-4 bg-surface-2 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. ERROR STATE -->
      <div v-else-if="cartStore.errorMessage" class="max-w-md mx-auto px-4 py-16">
        <AppErrorState
          :message="cartStore.errorMessage"
          @retry="cartStore.fetchCart(false)"
        />
      </div>

      <!-- 4. EMPTY CART STATE -->
      <div v-else-if="cartStore.listCart.length === 0" class="max-w-md mx-auto px-4 py-16 text-center">
        <h2 class="text-lg sm:text-xl font-bold text-text font-outfit">
          Keranjang kamu masih kosong
        </h2>
        <p class="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
          Yuk, jelajahi ribuan barang bekas berkualitas dan penuhi keranjang belanjaanmu!
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/"
            class="inline-flex items-center justify-center h-11 px-7 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold font-outfit shadow-xs transition-colors"
          >
            Mulai Belanja
          </NuxtLink>
        </div>
      </div>

      <!-- 5. SUCCESS CART CONTENT (2-Kolom Responsive di Desktop) -->
      <div v-else class="w-full">
        <div class="max-w-[1200px] mx-auto px-4 py-4 sm:py-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Kolom Kiri: Daftar Keranjang per Toko -->
            <div class="lg:col-span-8 space-y-4">
              <div
                v-for="seller in cartStore.listCart"
                :key="seller.seller_id"
                class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs"
              >
                <!-- Header Toko -->
                <CartSellerHeader
                  :seller="seller"
                  @toggle="cartStore.toggleSeller(seller)"
                />

                <!-- List Produk di Toko ini -->
                <div class="divide-y divide-border/60">
                  <CartItemCard
                    v-for="product in seller.products"
                    :key="product.product_id"
                    :product="product"
                    :disabled="cartStore.isProductDisabled(product)"
                    @toggle="cartStore.toggleProduct(seller, product)"
                    @update-qty="(val) => cartStore.updateQuantity(seller, product, val)"
                    @delete="promptDeleteProduct(seller, product)"
                    @toggle-wishlist="cartStore.toggleWishlist(product)"
                  />
                </div>
              </div>
            </div>

            <!-- Kolom Kanan (Desktop lg+): Sticky Summary Card -->
            <div class="hidden lg:block lg:col-span-4 sticky top-20">
              <div class="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-4">
                <h3 class="text-base font-bold text-text font-outfit pb-3 border-b border-border">
                  Ringkasan Belanja
                </h3>

                <div class="space-y-2.5 text-xs sm:text-sm">
                  <div class="flex justify-between text-text">
                    <span>Total Harga ({{ cartStore.checkedCount }} Barang)</span>
                    <span class="font-semibold tabular-nums">
                      {{ formatPrice(cartStore.totalPrice + cartStore.totalDiscount) }}
                    </span>
                  </div>

                  <div v-if="cartStore.totalDiscount > 0" class="flex justify-between text-primary">
                    <span>Total Diskon</span>
                    <span class="font-semibold tabular-nums">
                      -{{ formatPrice(cartStore.totalDiscount) }}
                    </span>
                  </div>

                  <div class="pt-3 border-t border-border flex justify-between text-base font-bold text-text">
                    <span>Total Tagihan</span>
                    <span class="text-primary tabular-nums">
                      {{ formatPrice(cartStore.totalPrice) }}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  :disabled="cartStore.checkedCount === 0 || cartStore.syncing"
                  class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  @click="handleCheckout"
                >
                  <span>Checkout ({{ cartStore.checkedCount }})</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Rekomendasi Produk Bawah -->
          <section class="mt-12 pt-6 border-t border-border">
            <HomeProductGrid
              :products="recommendationList"
              :loading="recPending"
              title="REKOMENDASI UNTUKMU"
            />
          </section>
        </div>
      </div>
    </main>

    <!-- Floating Summary Bar (Mobile < lg) -->
    <div v-if="authStore.isLoggedIn && cartStore.listCart.length > 0" class="lg:hidden fixed bottom-0 left-0 right-0 z-30">
      <CartSummaryBar
        :checked-all="cartStore.isAllChecked"
        :total-price="cartStore.totalPrice"
        :total-discount="cartStore.totalDiscount"
        :checked-count="cartStore.checkedCount"
        :syncing="cartStore.syncing"
        @toggle-all="cartStore.toggleAll"
        @show-detail="showDetailModal = true"
        @checkout="handleCheckout"
      />
    </div>

    <!-- Modal Rincian Harga Pembayaran Mobile -->
    <CartPriceDetailModal
      v-model="showDetailModal"
      :total-price="cartStore.totalPrice"
      :total-discount="cartStore.totalDiscount"
      :checked-count="cartStore.checkedCount"
    />

    <!-- Modal Konfirmasi Hapus Produk (Sesuai Mobile V3 ConfirmModal) -->
    <AppConfirmModal
      v-model="showDeleteConfirm"
      title="Hapus Barang"
      description="Apakah anda yakin ingin menghapus barang ini dari keranjang?"
      confirm-label="Hapus"
      :is-danger="true"
      @confirm="confirmDelete"
      @cancel="itemToDelete = null"
    />
  </div>
</template>
