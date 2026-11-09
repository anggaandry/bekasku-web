<script setup lang="ts">
import { Check, ArrowRight } from 'lucide-vue-next'
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
</script>

<template>
  <div class="fixed md:static bottom-0 inset-x-0 z-30 bg-white border-t md:border border-border p-4 shadow-lg md:shadow-2xs md:rounded-2xl flex items-center justify-between gap-4">
    <div class="min-w-0">
      <div class="text-[11px] text-text-muted">
        Fitur: <span class="font-bold text-text capitalize">{{ props.selectedType }}</span>
      </div>
      <div v-if="props.useQuotaMode" class="text-sm font-bold text-emerald-600 font-outfit mt-0.5">
        Gunakan 1 Kuota (Sisa: {{ props.availableQuota }})
      </div>
      <div v-else-if="props.selectedPackage" class="flex items-baseline gap-2 mt-0.5">
        <span class="text-base sm:text-lg font-bold text-primary font-outfit">
          {{ formatRupiah(props.selectedPackage.price) }}
        </span>
        <span v-if="(props.selectedPackage.discount || 0) > 0" class="text-[11px] sm:text-xs text-red-600 font-semibold">
          Hemat {{ props.selectedPackage.discount }}%
        </span>
        <span v-else class="text-[11px] text-text-muted hidden sm:inline">
          Total Diskon: Rp -
        </span>
      </div>
      <div v-else class="text-xs text-text-muted mt-0.5">
        Pilih paket atau kuota
      </div>
    </div>

    <div class="shrink-0">
      <button
        v-if="props.useQuotaMode"
        type="button"
        :disabled="props.loading || props.availableQuota <= 0"
        class="inline-flex items-center justify-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
        @click="emit('apply-quota')"
      >
        <Check class="w-4 h-4" />
        <span>{{ props.loading ? 'Menerapkan...' : 'Pasang Sekarang' }}</span>
      </button>

      <button
        v-else
        type="button"
        :disabled="props.loading || !props.selectedPackage"
        class="inline-flex items-center justify-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
        @click="emit('proceed-payment')"
      >
        <span>Bayar</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

