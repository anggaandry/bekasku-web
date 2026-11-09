<script setup lang="ts">
import { CornerUpLeft, Image as ImageIcon, Receipt, X } from 'lucide-vue-next'
import type { ProductChatModel, TransactionChatModel } from '~/types/chat'
import { formatRupiah } from '~/utils/format'

defineProps<{
  replyQuote?: string
  attachedProduct?: ProductChatModel | null
  attachedTransaction?: TransactionChatModel | null
}>()

const emit = defineEmits<{
  (e: 'clear-reply'): void
  (e: 'clear-product'): void
  (e: 'clear-transaction'): void
}>()
</script>

<template>
  <div
    v-if="replyQuote || attachedProduct || attachedTransaction"
    class="px-3.5 py-1.5 space-y-1.5"
  >
    <!-- Reply Quote Preview -->
    <div
      v-if="replyQuote"
      class="inline-flex items-start justify-between gap-2 bg-surface-2 rounded-xl px-3 py-2 border-l-3 border-primary shadow-2xs max-w-full w-full sm:w-auto"
    >
      <div class="flex items-start gap-2 min-w-0">
        <CornerUpLeft class="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <div class="min-w-0">
          <p class="font-outfit font-semibold text-[11px] text-primary">Membalas Pesan</p>
          <p class="font-outfit text-xs text-text-muted line-clamp-1">{{ replyQuote }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="emit('clear-reply')"
        class="p-0.5 rounded-full hover:bg-muted text-text-muted cursor-pointer shrink-0"
        aria-label="Batal Balas"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Attached Product Preview Card (Tokopedia compact floating card style) -->
    <div
      v-if="attachedProduct"
      class="inline-flex items-center justify-between gap-3 bg-white rounded-xl p-2 pr-2.5 border border-border-light shadow-2xs max-w-[260px]"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
          <img
            v-if="attachedProduct.image"
            :src="attachedProduct.image"
            :alt="attachedProduct.title"
            class="w-full h-full object-cover"
          />
          <ImageIcon v-else class="w-4 h-4 text-text-subtle" />
        </div>
        <div class="min-w-0">
          <p class="font-outfit font-medium text-xs text-text truncate">
            {{ attachedProduct.title }}
          </p>
          <p class="font-outfit font-bold text-[11px] text-primary mt-0.5">
            {{ formatRupiah(attachedProduct.price) }}
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('clear-product')"
        class="p-1 -mt-4 -mr-1 rounded-full hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer shrink-0"
        aria-label="Hapus Lampiran Produk"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Attached Transaction Preview -->
    <div
      v-if="attachedTransaction"
      class="inline-flex items-center justify-between gap-3 bg-white rounded-xl p-2 pr-2.5 border border-border-light shadow-2xs max-w-[280px]"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Receipt class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <p class="font-outfit font-semibold text-xs text-text truncate">
            {{ attachedTransaction.invoice }}
          </p>
          <p class="font-outfit text-[11px] text-text-muted truncate">
            {{ attachedTransaction.title }} • {{ formatRupiah(attachedTransaction.price || 0) }}
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('clear-transaction')"
        class="p-1 -mt-4 -mr-1 rounded-full hover:bg-surface-2 text-text-muted cursor-pointer shrink-0"
        aria-label="Hapus Lampiran Transaksi"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

