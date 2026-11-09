<script setup lang="ts">
import { Check, ArrowLeft, TrendingUp } from 'lucide-vue-next'
import type { PromotionDraft } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  draft: PromotionDraft | null
  invoiceNo?: string
}>()

function getProductImage(img?: string[] | string): string {
  if (Array.isArray(img) && img.length > 0) return img[0]
  if (typeof img === 'string' && img.length > 0) return img
  return '/images/empty-product.png'
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-border p-6 sm:p-8 max-w-lg mx-auto text-center space-y-5 shadow-sm">
    <!-- Success Circle Icon -->
    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
      <Check class="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
    </div>

    <div>
      <h2 class="text-xl sm:text-2xl font-bold font-outfit text-text">
        Promosi Berhasil Diaktifkan!
      </h2>
      <p class="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
        Paket promosi produk digital Anda telah sukses diproses dan kini aktif di platform BekasKu.
      </p>
    </div>

    <!-- Product & Invoice Summary Box -->
    <div class="bg-surface-2 rounded-2xl p-4 border border-border text-left space-y-3">
      <div v-if="props.invoiceNo" class="flex items-center justify-between text-xs pb-2 border-b border-border-light">
        <span class="text-text-muted">No. Invoice</span>
        <span class="font-mono font-bold text-text">{{ props.invoiceNo }}</span>
      </div>

      <div v-if="props.draft?.product" class="flex items-center gap-3">
        <NuxtImg
          :src="getProductImage(props.draft.product.image)"
          :alt="props.draft.product.title"
          class="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-border-light"
          width="56"
          height="56"
        />
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-text truncate font-outfit">
            {{ props.draft.product.title }}
          </div>
          <div class="text-xs font-semibold text-primary mt-0.5">
            {{ formatRupiah(props.draft.product.price) }}
          </div>
          <div class="text-[11px] text-text-muted capitalize mt-0.5">
            Fitur: <span class="font-medium text-text">{{ props.draft.type }}</span>
            <span v-if="props.draft.package?.days"> ({{ props.draft.package.days }} Hari)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-2 space-y-2">
      <NuxtLink
        to="/seller/promotion"
        class="w-full py-3 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-2xs"
      >
        <TrendingUp class="w-4 h-4" />
        Lihat Status Promosi Saya
      </NuxtLink>

      <NuxtLink
        to="/"
        class="w-full py-2.5 bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-semibold rounded-xl border border-border transition-all flex items-center justify-center gap-1.5"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        Kembali ke Beranda
      </NuxtLink>
    </div>
  </div>
</template>

