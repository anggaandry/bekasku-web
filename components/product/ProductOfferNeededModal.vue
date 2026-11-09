<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-xl md:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] pb-[env(safe-area-inset-bottom)] overflow-hidden"
        @click.stop
      >
        <div class="px-4 py-3.5 sm:px-6 border-b border-border/60 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <h3 class="font-outfit font-bold text-base sm:text-lg text-text truncate">
              Tawarkan Barang
            </h3>
            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold font-outfit shrink-0">
              Dibutuhkan
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <NuxtLink
              to="/post"
              class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold font-outfit text-primary hover:text-primary-dark transition-colors px-2.5 py-1 rounded-lg hover:bg-primary/5"
              @click="close"
            >
              <CirclePlus class="w-4 h-4" />
              <span>Posting Barang Baru</span>
            </NuxtLink>

            <button
              type="button"
              class="p-1.5 rounded-full text-text-subtle hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="px-4 py-2.5 sm:px-6 bg-surface-2 border-b border-border/50 flex items-center justify-between gap-3 text-xs font-outfit shrink-0">
          <div class="flex items-center gap-2 truncate text-text-muted">
            <Info class="w-4 h-4 text-primary shrink-0" />
            <span class="truncate">
              Iklan: <strong class="text-text font-semibold">{{ displayNeededTitle }}</strong>
              <template v-if="displaySellerName">
                &bull; oleh <span class="text-text">{{ displaySellerName }}</span>
              </template>
            </span>
          </div>

          <NuxtLink
            to="/post"
            class="sm:hidden text-primary font-semibold shrink-0"
            @click="close"
          >
            + Posting Baru
          </NuxtLink>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          <div class="flex items-center justify-between">
            <h4 class="font-outfit font-bold text-sm text-text">
              {{ totalProducts }} Iklan tersedia
            </h4>
            <span class="text-xs text-text-muted font-outfit">
              Ketuk produk untuk menawarkan
            </span>
          </div>

          <div
            v-if="loading && products.length === 0"
            class="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="i in 6"
              :key="i"
              class="aspect-[3/4] bg-surface-2 rounded-xl border border-border animate-pulse"
            />
          </div>

          <div
            v-else-if="!loading && products.length === 0"
            class="bg-surface-2 rounded-2xl border border-border"
          >
            <AppEmptyState
              title="Tidak Ada Barang"
              description="Kamu belum memposting barang untuk ditawarkan. Silakan posting barang terlebih dahulu."
            >
              <template #action>
                <NuxtLink
                  to="/post"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-outfit font-semibold text-xs hover:bg-primary-dark transition-colors shadow-none cursor-pointer"
                  @click="close"
                >
                  <Plus class="w-4 h-4" />
                  <span>Posting Barang Baru</span>
                </NuxtLink>
              </template>
            </AppEmptyState>
          </div>

          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AppProductCard
                v-for="(prod, idx) in products"
                :key="prod.id || prod._id || idx"
                :product="prod"
                :prevent-navigation="true"
                @click="handleSelect(prod)"
              />
            </div>

            <div v-if="hasNextPage" class="py-2 text-center">
              <button
                type="button"
                :disabled="isLoadingMore"
                class="px-5 py-2 bg-white border border-border rounded-xl text-xs font-semibold font-outfit text-text shadow-2xs hover:bg-surface-2 transition-all cursor-pointer inline-flex items-center gap-2 select-none"
                @click="fetchMyEligibleProducts(true)"
              >
                <span
                  v-if="isLoadingMore"
                  class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"
                />
                <span>{{ isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <NeededOfferConfirmModal
      v-model="isConfirmModalOpen"
      :product="selectedProduct"
      :target="resolvedTarget"
      :submitting="isSubmitting"
      @confirm="handleConfirm"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { X, Info, Plus, CirclePlus } from 'lucide-vue-next'
import { useNeededOffer } from '~/composables/useNeededOffer'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppProductCard from '~/components/shared/AppProductCard.vue'
import NeededOfferConfirmModal from '~/components/needed/NeededOfferConfirmModal.vue'
import type { ProductCard, ProductSeller } from '~/types/product'
import type { NeededOfferTargetInfo } from '~/types/needed'

const props = defineProps<{
  modelValue: boolean
  productId: string
  neededTitle?: string
  seller?: ProductSeller | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

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
} = useNeededOffer(() => props.productId)

watch(
  () => [props.modelValue, props.productId] as const,
  ([isOpen, id], [, prevId]) => {
    if (isOpen && (products.value.length === 0 || id !== prevId)) {
      fetchMyEligibleProducts()
    }
  }
)

const displayNeededTitle = computed(() => {
  return targetInfo.value.needed_title || props.neededTitle || 'Barang Dibutuhkan'
})

const displaySellerName = computed(() => {
  return targetInfo.value.seller_name || props.seller?.name || ''
})

const resolvedTarget = computed<NeededOfferTargetInfo>(() => {
  return {
    needed_title: displayNeededTitle.value,
    seller_name: displaySellerName.value,
    seller_id: targetInfo.value.seller_id || props.seller?.id || '',
    seller_avatar: targetInfo.value.seller_avatar || props.seller?.avatar || '',
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleSelect(product: ProductCard) {
  selectProduct(product)
}

function handleConfirm() {
  const success = confirmOffer(resolvedTarget.value)
  if (success) {
    close()
  }
}
</script>
