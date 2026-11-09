<script setup lang="ts">
import { computed } from 'vue'
import { Receipt, ChevronRight, Image as ImageIcon } from 'lucide-vue-next'
import type { TransactionChatModel } from '~/types/chat'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  transaction: TransactionChatModel
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-transaction', transaction: TransactionChatModel): void
}>()

const statusMeta = computed(() => {
  const code = String(props.transaction.status_code || props.transaction.status || '').toLowerCase()
  const label = props.transaction.status || 'Transaksi'
  if (code.includes('wait') || code.includes('verify')) {
    return { label, bgClass: 'bg-amber-50 border-amber-200', textClass: 'text-amber-700' }
  }
  if (code.includes('process') || code.includes('deliver') || code.includes('ship')) {
    return { label, bgClass: 'bg-blue-50 border-blue-200', textClass: 'text-blue-700' }
  }
  if (code.includes('done') || code.includes('finish') || code.includes('selesai')) {
    return { label, bgClass: 'bg-emerald-50 border-emerald-200', textClass: 'text-emerald-700' }
  }
  if (code.includes('cancel') || code.includes('batal')) {
    return { label, bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-600' }
  }
  return { label, bgClass: 'bg-muted border-border', textClass: 'text-text-muted' }
})
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-border-light shadow-2xs overflow-hidden transition-all cursor-pointer group"
    :class="compact ? 'w-full max-w-[290px]' : 'w-full max-w-[340px]'"
    @click="emit('open-transaction', transaction)"
  >
    <!-- Header Bar -->
    <div class="bg-surface-2 px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-border-light">
      <div class="flex items-center gap-1.5 min-w-0">
        <Receipt class="w-3.5 h-3.5 text-primary shrink-0" />
        <span class="font-outfit font-semibold text-xs text-text truncate">
          {{ transaction.invoice || 'Detail Transaksi' }}
        </span>
      </div>

      <span
        class="px-2 py-0.5 rounded-md border font-outfit font-medium text-[11px] leading-tight shrink-0"
        :class="[statusMeta.bgClass, statusMeta.textClass]"
      >
        {{ statusMeta.label }}
      </span>
    </div>

    <!-- Product Summary Row -->
    <div class="p-3.5 flex items-start gap-3">
      <div class="w-13 h-13 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
        <img
          v-if="transaction.image"
          :src="transaction.image"
          :alt="transaction.title"
          class="w-full h-full object-cover"
        />
        <ImageIcon v-else class="w-5 h-5 text-text-subtle" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-outfit font-medium text-sm text-text line-clamp-1 group-hover:text-primary transition-colors">
          {{ transaction.title }}
        </p>

        <p
          v-if="transaction.total_order > 1"
          class="font-outfit text-xs text-text-muted mt-0.5"
        >
          +{{ transaction.total_order - 1 }} barang lainnya
        </p>

        <div class="flex items-center justify-between gap-2 mt-1.5">
          <span class="font-outfit text-xs text-text-muted">Total Belanja</span>
          <span class="font-outfit font-bold text-sm text-text">
            {{ formatRupiah(transaction.price) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer CTA -->
    <div class="px-3.5 py-2 border-t border-border-light flex items-center justify-between text-xs font-outfit font-semibold text-primary group-hover:bg-primary/5 transition-colors">
      <span>Lihat Detail Transaksi</span>
      <ChevronRight class="w-4 h-4 text-primary" />
    </div>
  </div>
</template>
