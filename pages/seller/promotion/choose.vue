<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { usePromotion } from '~/composables/usePromotion'
import type { PromotionType, PromotionPackage, PromotionTargetProduct } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'
import PromotionWizardStep from '~/components/promotion/PromotionWizardStep.vue'
import PromotionOptionCard from '~/components/promotion/PromotionOptionCard.vue'
import PromotionPackageModal from '~/components/promotion/PromotionPackageModal.vue'
import PromotionChooseFooterBar from '~/components/promotion/PromotionChooseFooterBar.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Pilih Paket Promosi — BekasKu',
  meta: [
    { name: 'description', content: 'Tingkatkan penjualan produk bekas Anda dengan fitur Sundul, Highlight, dan Spotlight di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const promotion = usePromotion()

const productId = computed(() => String(route.query.product_id || ''))
const targetProduct = ref<PromotionTargetProduct | null>(null)
const selectedType = ref<PromotionType>('highlight')
const useQuotaMode = ref(false)
const selectedPackage = ref<PromotionPackage | null>(null)
const packageModalOpen = ref(false)
const modalPackageType = ref<PromotionType | ''>('')
const actionLoading = ref(false)
const actionError = ref<string | null>(null)

onMounted(async () => {
  if (!productId.value) return navigateTo('/seller/promotion')
  promotion.loading.value = true
  const [prod] = await Promise.all([
    promotion.fetchTargetProduct(productId.value),
    promotion.fetchQuota(),
    promotion.fetchProductStatus(productId.value),
    promotion.fetchPackages(),
  ])
  targetProduct.value = prod
  onSelectType(selectedType.value)
  promotion.loading.value = false
})

function getQuotaForType(t: PromotionType): number {
  if (t === 'sundul') return promotion.quota.value.sundul_quota
  if (t === 'highlight') return promotion.quota.value.highlight_quota
  return t === 'spotlight' ? promotion.quota.value.spotlight_quota : 0
}

function onSelectType(t: PromotionType) {
  selectedType.value = t
  const hasQuota = getQuotaForType(t) > 0
  useQuotaMode.value = hasQuota
  selectedPackage.value = hasQuota ? null : promotion.packages.value.find((p) => p.type === t) || null
}

function onToggleQuota(useQuota: boolean) {
  useQuotaMode.value = useQuota
  selectedPackage.value = useQuota
    ? null
    : promotion.packages.value.find((p) => p.type === selectedType.value) || null
}

function openPackageModal(t: PromotionType) {
  modalPackageType.value = t
  packageModalOpen.value = true
}

function onSelectPackageFromModal(pkg: PromotionPackage) {
  selectedType.value = pkg.type
  useQuotaMode.value = false
  selectedPackage.value = pkg
}

async function handleApplyQuota() {
  if (!targetProduct.value) return
  actionLoading.value = true
  actionError.value = null
  const res = await promotion.applyPromotion(productId.value, selectedType.value)
  actionLoading.value = false
  if (res.success) {
    promotion.setPromotionDraft({
      product: targetProduct.value,
      package: { _id: 'quota_' + selectedType.value, type: selectedType.value, price: 0, quota: 1 },
      type: selectedType.value,
      useQuota: true,
    })
    navigateTo('/seller/promotion/success')
  } else {
    actionError.value = res.message || 'Gagal menerapkan kuota promosi.'
  }
}

function handleProceedToPayment() {
  if (!targetProduct.value || !selectedPackage.value) return
  promotion.setPromotionDraft({
    product: targetProduct.value,
    package: selectedPackage.value,
    type: selectedType.value,
    useQuota: false,
  })
  navigateTo('/seller/promotion/payment')
}
</script>

<template>
  <div class="min-h-screen bg-surface-2 py-6 px-4 sm:px-6 pb-28 md:pb-8">
    <div class="max-w-5xl mx-auto space-y-5">
      <PromotionWizardStep :current-step="2" />

      <div class="flex items-center justify-between gap-3">
        <nav class="flex items-center gap-1.5 text-xs text-text-muted font-outfit" aria-label="Breadcrumb">
          <NuxtLink to="/seller/promotion" class="hover:text-primary transition-colors">Pusat Promosi</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-text font-medium">Pilih Paket</span>
        </nav>
        <NuxtLink
          to="/seller/promotion"
          class="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          Kembali
        </NuxtLink>
      </div>

      <div
        v-if="targetProduct"
        class="bg-white rounded-2xl border border-border p-4 flex items-center gap-3.5 shadow-2xs"
      >
        <NuxtImg
          :src="targetProduct.image?.[0] || '/images/empty-product.png'"
          :alt="targetProduct.title"
          class="w-16 h-16 rounded-xl object-cover bg-surface-2 border border-border-light shrink-0"
          width="64"
          height="64"
        />
        <div class="min-w-0 flex-1">
          <div class="text-[10px] text-text-muted font-medium uppercase tracking-wider">
            Barang yang Dipromosikan
          </div>
          <h2 class="text-sm sm:text-base font-bold text-text truncate font-outfit">
            {{ targetProduct.title }}
          </h2>
          <div class="text-xs sm:text-sm font-bold text-primary mt-0.5">
            {{ formatRupiah(targetProduct.price) }}
          </div>
        </div>
      </div>

      <div
        v-if="actionError"
        class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-red-600" />
        <span>{{ actionError }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PromotionOptionCard
          type="sundul"
          :quota="promotion.quota.value.sundul_quota"
          :is-selected="selectedType === 'sundul'"
          :use-quota-mode="useQuotaMode && selectedType === 'sundul'"
          :selected-package="selectedType === 'sundul' ? selectedPackage : null"
          :cooldown-seconds="promotion.productStatus.value?.sundul_cooldown_seconds"
          @select-type="onSelectType"
          @toggle-quota="onToggleQuota"
          @open-package-modal="openPackageModal"
        />

        <PromotionOptionCard
          type="highlight"
          :quota="promotion.quota.value.highlight_quota"
          :is-selected="selectedType === 'highlight'"
          :use-quota-mode="useQuotaMode && selectedType === 'highlight'"
          :selected-package="selectedType === 'highlight' ? selectedPackage : null"
          :is-feature-active="promotion.productStatus.value?.highlight_active"
          :feature-active-until="promotion.productStatus.value?.highlight_until"
          @select-type="onSelectType"
          @toggle-quota="onToggleQuota"
          @open-package-modal="openPackageModal"
        />

        <PromotionOptionCard
          type="spotlight"
          :quota="promotion.quota.value.spotlight_quota"
          :is-selected="selectedType === 'spotlight'"
          :use-quota-mode="useQuotaMode && selectedType === 'spotlight'"
          :selected-package="selectedType === 'spotlight' ? selectedPackage : null"
          :is-feature-active="promotion.productStatus.value?.spotlight_active"
          :feature-active-until="promotion.productStatus.value?.spotlight_until"
          @select-type="onSelectType"
          @toggle-quota="onToggleQuota"
          @open-package-modal="openPackageModal"
        />
      </div>

      <PromotionChooseFooterBar
        :selected-type="selectedType"
        :use-quota-mode="useQuotaMode"
        :selected-package="selectedPackage"
        :available-quota="getQuotaForType(selectedType)"
        :loading="actionLoading"
        @apply-quota="handleApplyQuota"
        @proceed-payment="handleProceedToPayment"
      />
    </div>

    <PromotionPackageModal
      v-model="packageModalOpen"
      :type="modalPackageType"
      :packages="promotion.packages.value"
      :current-selected="selectedPackage"
      @select-package="onSelectPackageFromModal"
    />
  </div>
</template>
