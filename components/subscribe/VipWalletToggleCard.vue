<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'

defineProps<{
  balance: number
  balanceLimit: number
  active: boolean
  locked: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div
    class="bg-white px-4 py-5 md:p-5 md:rounded-2xl md:border md:border-border md:shadow-2xs flex items-center justify-between gap-4"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0">
        <Wallet class="w-5 h-5 stroke-[2]" aria-hidden="true" />
      </div>
      <div class="min-w-0">
        <h2 class="text-sm font-semibold text-text">BekasKu Wallet</h2>
        <p class="text-xs text-text-muted mt-0.5 truncate">
          {{ formatRupiah(balance) }}
          <span v-if="balanceLimit > 0" class="text-[11px]">(Maks. {{ formatRupiah(balanceLimit) }})</span>
        </p>
      </div>
    </div>

    <button
      type="button"
      role="switch"
      :aria-checked="active"
      :disabled="locked"
      aria-label="Gunakan Saldo BekasKu Wallet"
      class="w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-hidden shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="active ? 'bg-primary' : 'bg-border-light'"
      @click="emit('toggle')"
    >
      <div
        class="w-6 h-6 rounded-full bg-white shadow-xs transition-transform duration-200"
        :class="active ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </div>
</template>

