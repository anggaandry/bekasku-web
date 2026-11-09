<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePromotion } from '~/composables/usePromotion'
import PromotionWizardStep from '~/components/promotion/PromotionWizardStep.vue'
import PromotionSuccessCard from '~/components/promotion/PromotionSuccessCard.vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Promosi Sukses — BekasKu',
  meta: [
    { name: 'description', content: 'Tingkatkan penjualan produk bekas Anda dengan fitur Sundul, Highlight, dan Spotlight di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const promotion = usePromotion()

const invoiceNo = computed(() => {
  return String(route.query.invoice || '')
})

onMounted(() => {
  promotion.initPromotionDraft()
})
</script>

<template>
  <div class="min-h-screen bg-surface-2 py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-6">
    <div class="w-full max-w-5xl">
      <PromotionWizardStep :current-step="4" />
    </div>
    <div class="w-full max-w-lg">
      <PromotionSuccessCard
        :draft="promotion.promotionDraft.value"
        :invoice-no="invoiceNo"
      />
    </div>
  </div>
</template>
