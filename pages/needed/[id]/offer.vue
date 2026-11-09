<template>
  <div class="min-h-screen bg-surface md:bg-bg flex flex-col text-text">
    <NeededOfferHeader class="md:hidden" />

    <main class="flex-1 w-full max-w-[1000px] mx-auto px-4 md:px-6 py-4 md:py-8 space-y-5">
      <nav class="hidden md:flex items-center gap-2 text-xs font-outfit text-text-muted">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5 text-text-subtle" />
        <span class="text-text font-semibold">Tawarkan Barang</span>
      </nav>

      <NeededTargetCard
        v-if="targetInfo.needed_title || targetInfo.seller_name"
        :target="targetInfo"
      />

      <div class="flex items-center justify-between pt-2">
        <h2 class="text-base md:text-lg font-bold font-outfit text-text">
          {{ totalProducts }} Iklan tersedia
        </h2>

        <NuxtLink
          to="/post"
          class="text-xs font-semibold font-outfit text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1.5"
        >
          <CirclePlus class="w-4 h-4 shrink-0" />
          <span>Posting Barang Baru</span>
        </NuxtLink>
      </div>

      <div
        v-if="loading && products.length === 0"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="aspect-[3/4] bg-surface-2 rounded-xl border border-border animate-pulse"
        />
      </div>

      <div
        v-else-if="!loading && products.length === 0"
        class="bg-white rounded-2xl border border-border shadow-2xs"
      >
        <AppEmptyState
          title="Tidak Ada Barang"
          description="Kamu belum memposting barang untuk ditawarkan. Silakan posting barang terlebih dahulu."
        >
          <template #action>
            <NuxtLink
              to="/post"
              class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-outfit font-semibold text-xs md:text-sm hover:bg-primary-dark transition-colors shadow-none cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              <span>Posting Barang Baru</span>
            </NuxtLink>
          </template>
        </AppEmptyState>
      </div>

      <div v-else class="space-y-6">
        <ProductGrid
          :products="products"
          :columns="4"
          :prevent-navigation="true"
          @select="handleSelectProduct"
        />

        <div v-if="hasNextPage" class="py-4 text-center">
          <button
            type="button"
            :disabled="isLoadingMore"
            class="px-6 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold font-outfit text-text shadow-2xs hover:bg-surface-2 hover:border-primary/40 transition-all cursor-pointer inline-flex items-center gap-2 select-none"
            @click="fetchMyEligibleProducts(true)"
          >
            <span
              v-if="isLoadingMore"
              class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"
            />
            <span>{{ isLoadingMore ? 'Memuat produk...' : 'Muat Lebih Banyak Produk' }}</span>
          </button>
        </div>
      </div>
    </main>

    <NeededOfferConfirmModal
      v-model="isConfirmModalOpen"
      :product="selectedProduct"
      :target="targetInfo"
      :submitting="isSubmitting"
      @confirm="handleConfirmOffer"
    />

    <AppGuestAuthModal
      v-model="isAuthModalOpen"
      feature-title="Tawarkan Barang"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight, CirclePlus, Plus } from 'lucide-vue-next'
import ProductGrid from '~/components/shared/ProductGrid.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppGuestAuthModal from '~/components/shared/AppGuestAuthModal.vue'
import NeededOfferHeader from '~/components/needed/NeededOfferHeader.vue'
import NeededTargetCard from '~/components/needed/NeededTargetCard.vue'
import NeededOfferConfirmModal from '~/components/needed/NeededOfferConfirmModal.vue'
import { useNeededOffer } from '~/composables/useNeededOffer'
import type { ProductCard } from '~/types/product'

const route = useRoute()
const authStore = useAuthStore()

const neededProductId = computed(() => (route.params.id as string) || '')

const isAuthModalOpen = ref(false)

const {
  loading,
  isLoadingMore,
  hasNextPage,
  totalProducts,
  products,
  targetInfo,
  selectedProduct,
  isConfirmModalOpen,
  isSubmitting,
  fetchMyEligibleProducts,
  selectProduct,
  confirmOffer,
} = useNeededOffer(neededProductId)

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchMyEligibleProducts()
  } else {
    isAuthModalOpen.value = true
  }
})

watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn && products.value.length === 0) {
      fetchMyEligibleProducts()
    }
  }
)

function handleAuthSuccess() {
  isAuthModalOpen.value = false
  fetchMyEligibleProducts()
}

function handleSelectProduct(product: ProductCard) {
  if (!authStore.isLoggedIn) {
    isAuthModalOpen.value = true
    return
  }
  selectProduct(product)
}

function handleConfirmOffer() {
  confirmOffer()
}

useHead({
  title: computed(() =>
    targetInfo.value.needed_title
      ? `Tawarkan Barang: ${targetInfo.value.needed_title} — BekasKu`
      : 'Tawarkan Barang — BekasKu'
  ),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
    {
      name: 'description',
      content: 'Ajukan penawaran barang milikmu untuk iklan barang yang dibutuhkan di BekasKu.',
    },
  ],
})
</script>
