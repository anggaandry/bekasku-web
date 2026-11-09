<script setup lang="ts">
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import type { BalanceMutation } from '~/types/balance'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  item: BalanceMutation
}>()

const isCredit = computed(() => props.item.total > 0)

const statusClass = computed(() => {
  if (props.item.status === 'selesai' || props.item.verify === 1) return 'bg-emerald-50 text-emerald-700'
  if (props.item.status === 'waiting' || props.item.verify === 0) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
})
</script>

<template>
  <div class="p-3.5 rounded-xl border border-border/80 bg-white hover:bg-surface-2 transition-colors flex items-start justify-between gap-3">
    <div class="flex items-start gap-3 min-w-0">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border"
        :class="isCredit ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'"
      >
        <ArrowDownLeft v-if="isCredit" class="w-4 h-4" />
        <ArrowUpRight v-else class="w-4 h-4" />
      </div>

      <div class="min-w-0">
        <h5 class="font-outfit font-bold text-xs sm:text-sm text-text leading-snug truncate">
          {{ item.title || (isCredit ? 'Pemasukan Saldo' : 'Pengeluaran Saldo') }}
        </h5>
        <p v-if="item.description" class="font-outfit text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
          {{ item.description }}
        </p>
        <div class="flex items-center gap-2 mt-1">
          <span class="font-outfit text-[11px] text-text-muted">{{ item.time || '-' }}</span>
          <span
            v-if="item.status"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
            :class="statusClass"
          >
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>

    <span
      class="font-outfit font-bold text-xs sm:text-sm shrink-0"
      :class="isCredit ? 'text-emerald-600' : 'text-rose-600'"
    >
      {{ isCredit ? '+' : '-' }}{{ formatRupiah(Math.abs(item.total)) }}
    </span>
  </div>
</template>
