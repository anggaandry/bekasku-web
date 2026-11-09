<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Image as ImageIcon } from 'lucide-vue-next'
import type { NegotiationChatModel } from '~/types/chat'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  nego: NegotiationChatModel
  compact?: boolean
  isActionLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'accept', nego: NegotiationChatModel): void
  (e: 'decline', nego: NegotiationChatModel): void
  (e: 'update-offer', nego: NegotiationChatModel): void
  (e: 'add-cart', nego: NegotiationChatModel): void
  (e: 'open-product', nego: NegotiationChatModel): void
}>()

const statusCode = computed(() => String(props.nego.status?.code || 'onoffer').toLowerCase())

const statusMeta = computed(() => {
  const customName = props.nego.status?.name
  switch (statusCode.value) {
    case 'onoffer':
      return {
        label: customName || 'Ditawar',
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-700',
      }
    case 'accepted':
      return {
        label: customName || 'Penawaran diterima',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-700',
      }
    case 'rejected':
    case 'declined':
      return {
        label: customName || 'Ditolak',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-600',
      }
    case 'canceled':
      return {
        label: customName || 'Dibatalkan',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-600',
      }
    case 'expired':
    default:
      return {
        label: customName || 'Kadaluarsa',
        bgClass: 'bg-muted border-border',
        textClass: 'text-text-muted',
      }
  }
})
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-border-light shadow-2xs overflow-hidden transition-all"
    :class="compact ? 'w-full max-w-[290px]' : 'w-full max-w-[340px]'"
  >
    <!-- Header Bar -->
    <div class="bg-surface-2 px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-border-light">
      <span class="font-outfit font-semibold text-xs text-text">
        Negosiasi Harga
      </span>

      <span
        class="px-2 py-0.5 rounded-md border font-outfit font-medium text-[11px] leading-tight shrink-0"
        :class="[statusMeta.bgClass, statusMeta.textClass]"
      >
        {{ statusMeta.label }}
      </span>
    </div>

    <!-- Body: Product Row + Offer Price -->
    <div
      class="p-3.5 flex items-start gap-3 cursor-pointer group"
      @click="emit('open-product', nego)"
    >
      <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
        <img
          v-if="nego.image"
          :src="nego.image"
          :alt="nego.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <ImageIcon v-else class="w-6 h-6 text-text-subtle" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-outfit font-normal text-sm text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {{ nego.title }}
        </p>

        <p class="font-outfit font-normal text-xs text-text-muted mt-1.5">
          Harga yang Ditawar
        </p>

        <div class="flex items-baseline flex-wrap gap-1.5 mt-0.5">
          <span class="font-outfit font-semibold text-sm sm:text-base text-text">
            {{ formatRupiah(nego.nego_price) }}
          </span>
          <span
            v-if="nego.price > 0"
            class="font-outfit font-medium text-xs text-text-muted line-through"
          >
            {{ formatRupiah(nego.price) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action Footer: Seller onoffer -> Tolak / Terima -->
    <div
      v-if="statusCode === 'onoffer' && nego.seller"
      class="px-3.5 pb-3.5 pt-1 grid grid-cols-2 gap-2.5 border-t border-border-light"
    >
      <button
        type="button"
        :disabled="isActionLoading"
        @click.stop="emit('decline', nego)"
        class="h-9 rounded-xl border border-primary bg-white hover:bg-primary/8 disabled:opacity-50 text-primary font-outfit font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
      >
        Tolak
      </button>

      <button
        type="button"
        :disabled="isActionLoading"
        @click.stop="emit('accept', nego)"
        class="h-9 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-outfit font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
      >
        <span class="text-white">Terima</span>
      </button>
    </div>

    <!-- Action Footer: Buyer onoffer -> Ubah Penawaran -->
    <div
      v-else-if="statusCode === 'onoffer' && !nego.seller"
      class="border-t border-border-light"
    >
      <button
        type="button"
        :disabled="isActionLoading"
        @click.stop="emit('update-offer', nego)"
        class="w-full py-2.5 px-3.5 text-center font-outfit font-semibold text-sm text-primary hover:bg-primary/8 transition-colors cursor-pointer"
      >
        Ubah Penawaran
      </button>
    </div>

    <!-- Action Footer: Buyer accepted -> + Tambah ke Keranjang -->
    <div
      v-else-if="statusCode === 'accepted' && !nego.seller"
      class="border-t border-border-light"
    >
      <button
        type="button"
        :disabled="isActionLoading"
        @click.stop="emit('add-cart', nego)"
        class="w-full py-2.5 px-3.5 flex items-center justify-center gap-1.5 font-outfit font-semibold text-sm text-primary hover:bg-primary/8 transition-colors cursor-pointer"
      >
        <Plus class="w-4 h-4 text-primary shrink-0" />
        <span>Tambah ke Keranjang</span>
      </button>
    </div>
  </div>
</template>
