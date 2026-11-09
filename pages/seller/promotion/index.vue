<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronRight, TrendingUp, Package } from 'lucide-vue-next'
import { usePromotion } from '~/composables/usePromotion'
import type { PromotionTargetProduct } from '~/types/promotion'
import PromotionQuotaBanner from '~/components/promotion/PromotionQuotaBanner.vue'
import ActivePromotionList from '~/components/promotion/ActivePromotionList.vue'
import PromotionProductSelector from '~/components/promotion/PromotionProductSelector.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Pusat Promosi Iklan Penjual — BekasKu',
  meta: [
    { name: 'description', content: 'Tingkatkan penjualan produk bekas Anda dengan fitur Sundul, Highlight, dan Spotlight di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const promotion = usePromotion()
const activeTab = ref<'active' | 'products'>('active')
const selectedProductId = ref<string>('')

onMounted(async () => {
  promotion.loading.value = true
  await Promise.all([
    promotion.fetchQuota(),
    promotion.fetchActivePromotions(),
    promotion.fetchMyProducts(),
  ])
  promotion.loading.value = false
})

function onSelectProduct(p: PromotionTargetProduct) {
  selectedProductId.value = p._id
}

function onSearchProduct(keyword: string) {
  promotion.fetchMyProducts(keyword)
}

function proceedToPromotion() {
  if (selectedProductId.value) {
    navigateTo(`/seller/promotion/choose?product_id=${selectedProductId.value}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-2 py-6 px-4 sm:px-6">
    <div class="max-w-5xl mx-auto space-y-5">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <NuxtLink to="/account" class="hover:text-primary transition-colors">Akun Saya</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <span class="text-text font-medium">Pusat Promosi</span>
      </nav>

      <!-- Quota Summary Banner -->
      <PromotionQuotaBanner
        :quota="promotion.quota.value"
        :loading="promotion.loading.value"
        @select-tab="activeTab = $event"
      />

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-border bg-white px-4 rounded-2xl shadow-2xs">
        <button
          type="button"
          class="relative py-3.5 px-4 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
          :class="[
            activeTab === 'active'
              ? 'text-primary font-bold'
              : 'text-text-muted hover:text-text'
          ]"
          @click="activeTab = 'active'"
        >
          <TrendingUp class="w-4 h-4" />
          <span>Promosi Aktif</span>
          <span
            v-if="promotion.activePromotions.value.length > 0"
            class="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
          >
            {{ promotion.activePromotions.value.length }}
          </span>
          <div
            v-if="activeTab === 'active'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
          />
        </button>

        <button
          type="button"
          class="relative py-3.5 px-4 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
          :class="[
            activeTab === 'products'
              ? 'text-primary font-bold'
              : 'text-text-muted hover:text-text'
          ]"
          @click="activeTab = 'products'"
        >
          <Package class="w-4 h-4" />
          <span>Pilih Barang untuk Dipromosikan</span>
          <div
            v-if="activeTab === 'products'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
          />
        </button>
      </div>

      <!-- Tab Content 1: Active Promotions -->
      <div v-show="activeTab === 'active'">
        <ActivePromotionList
          :promotions="promotion.activePromotions.value"
          :loading="promotion.loading.value"
          @add-promotion="activeTab = 'products'"
        />
      </div>

      <!-- Tab Content 2: Choose Product -->
      <div v-show="activeTab === 'products'">
        <PromotionProductSelector
          :products="promotion.myProducts.value"
          :loading="promotion.loading.value"
          :selected-id="selectedProductId"
          @select="onSelectProduct"
          @search="onSearchProduct"
          @proceed="proceedToPromotion"
        />
      </div>
    </div>
  </div>
</template>
