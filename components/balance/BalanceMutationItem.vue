<script setup lang="ts">
import {
  ShoppingBag,
  Store,
  ArrowUpRight,
  Landmark,
  Banknote,
  Wallet,
  ChevronRight,
} from 'lucide-vue-next'
import type { BalanceMutation } from '~/types/balance'
import { formatRupiah } from '~/utils/format'
import { getMutationStatusBadge } from '~/composables/useBalance'

const props = defineProps<{
  item: BalanceMutation
}>()

defineEmits<{
  click: [item: BalanceMutation]
}>()

const isIncome = computed(() => (props.item.total || 0) > 0)

const statusBadge = computed(() => getMutationStatusBadge(props.item))

const iconConfig = computed(() => {
  const type = props.item.type ?? 0
  const total = props.item.total ?? 0
  const isPos = total > 0

  let icon = Wallet
  switch (type) {
    case 0:
    case 1:
      icon = ShoppingBag
      break
    case 2:
      icon = Store
      break
    case 3:
      icon = ArrowUpRight
      break
    case 4:
    case 5:
      icon = Landmark
      break
    case 6:
      icon = Banknote
      break
    default:
      icon = Wallet
  }

  return {
    icon,
    bg: isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary',
  }
})
</script>

<template>
  <div
    class="bg-white rounded-2xl p-3.5 sm:p-4 border border-border/80 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 font-outfit"
    @click="$emit('click', item)"
  >
    <div class="flex items-center gap-3 min-w-0">
      <!-- Icon with circular/rounded container -->
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        :class="iconConfig.bg"
      >
        <component :is="iconConfig.icon" class="w-5 h-5" />
      </div>

      <!-- Title, Description, Date -->
      <div class="min-w-0">
        <h4 class="font-bold text-sm text-text truncate">
          {{ item.title || (isIncome ? 'Pemasukan Saldo' : 'Pengeluaran Saldo') }}
        </h4>
        <p
          v-if="item.description"
          class="text-xs text-text-muted truncate mt-0.5"
        >
          {{ item.description }}
        </p>
        <span class="text-[11px] text-text-muted block mt-0.5">
          {{ item.time || '-' }}
        </span>
      </div>
    </div>

    <!-- Amount, Status & Chevron -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="text-right">
        <span
          class="font-bold text-sm block"
          :class="isIncome ? 'text-emerald-600' : 'text-text'"
        >
          {{ isIncome ? '+' : '-' }}{{ formatRupiah(Math.abs(item.total || 0)) }}
        </span>
        <span
          class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border"
          :class="statusBadge.bg"
        >
          {{ statusBadge.text }}
        </span>
      </div>
      <ChevronRight class="w-4 h-4 text-text-muted shrink-0" />
    </div>
  </div>
</template>

