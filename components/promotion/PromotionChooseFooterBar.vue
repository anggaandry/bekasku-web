<script setup lang="ts">
import { Check, ChevronUp } from 'lucide-vue-next'
import type { PromotionType, PromotionPackage } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  selectedType: PromotionType
  useQuotaMode: boolean
  selectedPackage: PromotionPackage | null
  availableQuota: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'apply-quota'): void
  (e: 'proceed-payment'): void
}>()

const discountAmount = computed(() => {
  const pkg = props.selectedPackage
  if (!pkg || !pkg.final_price || pkg.final_price <= pkg.price) return 0
  return pkg.final_price - pkg.price
})
</script>

<template>
  <div class="fixed md:static bottom-0 inset-x-0 z-30 bg-white border-t md:border border-gray-200 px-4 py-3 md:p-4 shadow-lg md:shadow-2xs md:rounded-xl flex items-center justify-end md:justify-between gap-4">
    <div class="hidden md:block text-xs text-gray-500">
      Paket terpilih: <span class="font-bold text-gray-900 capitalize">{{ props.selectedType }}</span>
    </div>

    <div class="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end">
      <div v-if="props.useQuotaMode" class="text-right">
        <div class="text-sm font-bold text-emerald-600 font-outfit">
          Gratis (1 Kuota)
        </div>
        <div class="text-[11px] text-gray-500">
          Sisa kuota: {{ props.availableQuota }}
        </div>
      </div>

      <div v-else class="text-right">
        <div class="flex items-center justify-end gap-1 text-sm sm:text-base font-bold text-gray-900 font-outfit">
          <span>{{ props.selectedPackage ? formatRupiah(props.selectedPackage.price) : 'Rp-' }}</span>
          <ChevronUp class="w-3.5 h-3.5 text-gray-600" />
        </div>
        <div class="text-[11px] text-gray-500">
          Total Diskon {{ discountAmount > 0 ? formatRupiah(discountAmount) : 'Rp-' }}
        </div>
      </div>

      <button
        v-if="props.useQuotaMode"
        type="button"
        :disabled="props.loading || props.availableQuota <= 0"
        class="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
        @click="emit('apply-quota')"
      >
        <Check class="w-4 h-4" />
        <span>{{ props.loading ? 'Menerapkan...' : 'Pasang' }}</span>
      </button>

      <button
        v-else
        type="button"
        :disabled="props.loading || !props.selectedPackage"
        class="inline-flex items-center justify-center px-7 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
        @click="emit('proceed-payment')"
      >
        <span>Bayar</span>
      </button>
    </div>
  </div>
</template>
