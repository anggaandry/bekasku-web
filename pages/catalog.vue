<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useMyCatalog } from '~/composables/useMyCatalog'
import type { MyCatalogItem } from '~/types/catalog'
import CatalogSidebar from '~/components/catalog/CatalogSidebar.vue'
import CatalogMobileHeader from '~/components/catalog/CatalogMobileHeader.vue'
import CatalogFilterBar from '~/components/catalog/CatalogFilterBar.vue'
import CatalogProductCard from '~/components/catalog/CatalogProductCard.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import AppBottomNav from '~/components/layout/AppBottomNav.vue'

useHead({
  title: 'Katalog Saya — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Kelola seluruh barang jualan, pantau status postingan, dan sundul iklan Anda di BekasKu.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const {
  items,
  loading,
  loadingMore,
  error,
  hasMore,
  selectedStatus,
  selectedType,
  searchQuery,
  counts,
  statusList,
  fetchMyPosts,
  loadMore,
  onSearch,
  setStatus,
  setType,
  deleteProduct,
  markAsSold,
  cancelProduct,
} = useMyCatalog()

const deleteItemTarget = ref<MyCatalogItem | null>(null)
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)

const soldItemTarget = ref<MyCatalogItem | null>(null)
const showSoldConfirm = ref(false)
const soldLoading = ref(false)

const cancelItemTarget = ref<MyCatalogItem | null>(null)
const showCancelConfirm = ref(false)
const cancelLoading = ref(false)

onMounted(() => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login?redirect=/catalog')
    return
  }
  fetchMyPosts(true)
})

function handleDeleteClick(item: MyCatalogItem) {
  deleteItemTarget.value = item
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteItemTarget.value) return
  deleteLoading.value = true
  try {
    await deleteProduct(deleteItemTarget.value.id)
    showDeleteConfirm.value = false
  } finally {
    deleteLoading.value = false
    deleteItemTarget.value = null
  }
}

function handleMarkSoldClick(item: MyCatalogItem) {
  soldItemTarget.value = item
  showSoldConfirm.value = true
}

async function confirmMarkSold() {
  if (!soldItemTarget.value) return
  soldLoading.value = true
  try {
    await markAsSold(soldItemTarget.value.id)
    showSoldConfirm.value = false
  } finally {
    soldLoading.value = false
    soldItemTarget.value = null
  }
}

function handleCancelClick(item: MyCatalogItem) {
  cancelItemTarget.value = item
  showCancelConfirm.value = true
}

async function confirmCancel() {
  if (!cancelItemTarget.value) return
  cancelLoading.value = true
  try {
    await cancelProduct(cancelItemTarget.value.id)
    showCancelConfirm.value = false
  } finally {
    cancelLoading.value = false
    cancelItemTarget.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-2/60 text-text font-outfit pb-24 lg:pb-12">
    <!-- 1. Mobile Top Navigation Bar (Edge-to-edge, only on mobile < md) -->
    <CatalogMobileHeader />

    <!-- 2. Main Content Container -->
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <div class="lg:flex lg:items-start lg:gap-6">
        <!-- Left Column: Desktop Stats & Action Sidebar (hidden on mobile) -->
        <div class="hidden lg:block lg:w-80 shrink-0 sticky top-6">
          <CatalogSidebar
            :counts="counts"
            :selected-status="selectedStatus"
            @select-status="setStatus"
          />
        </div>

        <!-- Right Column: Search, Tabs & Product Grid -->
        <main class="flex-1 min-w-0 space-y-4">
          <CatalogFilterBar
            :status-list="statusList"
            :selected-status="selectedStatus"
            :selected-type="selectedType"
            :counts="counts"
            :search-query="searchQuery"
            @update:status="setStatus"
            @update:type="setType"
            @search="onSearch"
          />

          <!-- Error Banner -->
          <div
            v-if="error && items.length === 0"
            class="bg-white rounded-2xl border border-border-light shadow-2xs"
          >
            <AppErrorState
              title="Gagal Memuat Katalog Iklan"
              :message="error"
              @retry="fetchMyPosts(true)"
            />
          </div>

          <!-- Loading Skeletons -->
          <div
            v-else-if="loading && items.length === 0"
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3.5 sm:gap-4"
          >
            <div
              v-for="n in 6"
              :key="n"
              class="bg-white rounded-2xl border border-border-light p-4 space-y-3 shadow-2xs animate-pulse"
            >
              <div class="flex items-center justify-between">
                <div class="h-4 bg-surface-2 rounded w-1/4" />
                <div class="h-3 bg-surface-2 rounded w-1/5" />
              </div>
              <div class="flex items-center gap-3">
                <div class="w-20 h-20 rounded-xl bg-surface-2 shrink-0" />
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-surface-2 rounded w-4/5" />
                  <div class="h-5 bg-surface-2 rounded w-1/2" />
                </div>
              </div>
              <div class="pt-2 border-t border-border-light flex justify-between">
                <div class="h-7 bg-surface-2 rounded-xl w-20" />
                <div class="h-7 bg-surface-2 rounded-xl w-24" />
              </div>
            </div>
          </div>

          <!-- Empty State (No items at all) -->
          <div
            v-else-if="items.length === 0 && !searchQuery"
            class="bg-white rounded-2xl border border-border-light shadow-2xs"
          >
            <AppEmptyState
              title="Belum Ada Iklan di Kategori Ini"
              description="Pasang iklan barang bekas, preloved, atau kebutuhan Anda sekarang dan jangkau ribuan pembeli terpercaya di BekasKu."
            >
              <template #action>
                <NuxtLink
                  to="/post/sell"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus class="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Pasang Iklan Sekarang</span>
                </NuxtLink>
              </template>
            </AppEmptyState>
          </div>

          <!-- Filter Empty State (Search / Filter has no match) -->
          <div
            v-else-if="items.length === 0 && searchQuery"
            class="bg-white rounded-2xl border border-border-light shadow-2xs"
          >
            <AppEmptyState
              title="Tidak Ada Iklan Ditemukan"
              :description="`Tidak ditemukan postingan iklan dengan kata kunci '${searchQuery}'. Coba gunakan kata kunci lain.`"
            >
              <template #action>
                <button
                  type="button"
                  @click="onSearch('')"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-border-light text-xs font-semibold text-text transition-colors cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </template>
            </AppEmptyState>
          </div>

          <!-- Product Grid List -->
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3.5 sm:gap-4"
          >
            <CatalogProductCard
              v-for="item in items"
              :key="item.id"
              :item="item"
              @delete="handleDeleteClick"
              @mark-sold="handleMarkSoldClick"
              @cancel="handleCancelClick"
            />
          </div>

          <!-- Infinite Scroll / Load More Trigger -->
          <div v-if="hasMore" class="text-center pt-4">
            <button
              type="button"
              :disabled="loadingMore"
              @click="loadMore"
              class="px-5 py-2.5 rounded-xl bg-white hover:bg-surface-2 border border-border-light text-xs font-semibold text-primary transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {{ loadingMore ? 'Memuat iklan...' : 'Muat Lebih Banyak' }}
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile Floating Action Button: + Iklan -->
    <NuxtLink
      to="/post/sell"
      class="md:hidden fixed bottom-20 right-4 z-40 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 font-bold text-sm transition-all active:scale-95 cursor-pointer"
    >
      <Plus class="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
      <span>Iklan</span>
    </NuxtLink>

    <!-- Mobile Bottom Navigation (Tab 4: Post) -->
    <AppBottomNav class="md:hidden" />

    <!-- Confirm Delete Modal -->
    <AppConfirmModal
      v-model="showDeleteConfirm"
      title="Hapus Iklan Ini?"
      :description="`Apakah Anda yakin ingin menghapus iklan '${deleteItemTarget?.title || ''}'? Iklan yang sudah dihapus tidak dapat dipulihkan kembali.`"
      confirm-label="Ya, Hapus"
      cancel-label="Batal"
      :is-danger="true"
      :loading="deleteLoading"
      @confirm="confirmDelete"
    />

    <!-- Confirm Mark as Sold Modal -->
    <AppConfirmModal
      v-model="showSoldConfirm"
      title="Tandai Sebagai Terjual?"
      :description="`Apakah barang '${soldItemTarget?.title || ''}' sudah laku terjual? Iklan akan diubah statusnya menjadi Terjual.`"
      confirm-label="Ya, Tandai Terjual"
      cancel-label="Batal"
      :is-danger="false"
      :loading="soldLoading"
      @confirm="confirmMarkSold"
    />

    <!-- Confirm Cancel Post Modal -->
    <AppConfirmModal
      v-model="showCancelConfirm"
      title="Nonaktifkan Iklan Ini?"
      :description="`Apakah Anda yakin ingin menonaktifkan / membatalkan penayangan iklan '${cancelItemTarget?.title || ''}'?`"
      confirm-label="Ya, Nonaktifkan"
      cancel-label="Batal"
      :is-danger="true"
      :loading="cancelLoading"
      @confirm="confirmCancel"
    />
  </div>
</template>
