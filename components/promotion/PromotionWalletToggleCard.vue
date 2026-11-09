<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  myBalance: number
  balanceLimit: number
  canUseBalance: boolean
  lockBalance: boolean
  useBalanceToggle: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Wallet class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold font-outfit text-text">
            BekasKu Wallet
          </h3>
          <p class="text-xs text-text-muted">
            {{ formatRupiah(props.myBalance) }}
            <span v-if="props.balanceLimit > 0" class="text-[11px] text-text-muted">
              (Maks. {{ formatRupiah(props.balanceLimit) }})
            </span>
          </p>
        </div>
      </div>

      <!-- Switch Toggle Button -->
      <button
        type="button"
        role="switch"
        :aria-checked="props.useBalanceToggle"
        :disabled="props.lockBalance || !props.canUseBalance || props.myBalance <= 0"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-40 disabled:cursor-not-allowed"
        :class="[props.useBalanceToggle ? 'bg-primary' : 'bg-gray-300']"
        @click="emit('toggle')"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
          :class="[props.useBalanceToggle ? 'translate-x-5' : 'translate-x-0']"
        />
      </button>
    </div>

    <!-- Balance info / warnings -->
    <p v-if="props.myBalance <= 0" class="text-[11px] text-text-muted mt-2">
      Saldo akun Anda saat ini Rp 0. Silakan pilih metode pembayaran lain.
    </p>
    <p v-else-if="!props.canUseBalance" class="text-[11px] text-amber-600 mt-2">
      Penggunaan saldo sementara dinonaktifkan sistem.
    </p>
  </div>
</template>

