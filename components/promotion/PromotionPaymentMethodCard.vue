<script setup lang="ts">
import { CreditCard, ChevronRight } from 'lucide-vue-next'
import type { PaymentMethodItem } from '~/types/checkout'

const props = defineProps<{
  selectedPayment: PaymentMethodItem | null
  isFullBalance: boolean
  paymentInput: string
}>()

const emit = defineEmits<{
  (e: 'open-choose'): void
  (e: 'update-input', val: string): void
}>()

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update-input', target.value)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold font-outfit text-text">
        Metode Pembayaran
      </h3>
      <button
        v-if="!props.isFullBalance"
        type="button"
        class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
        @click="emit('open-choose')"
      >
        <span>{{ props.selectedPayment ? 'Ubah' : 'Pilih Pembayaran' }}</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- State 1: Covered Fully by Wallet -->
    <div
      v-if="props.isFullBalance"
      class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5"
    >
      <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      <span>Total tagihan tertutupi penuh oleh saldo BekasKu Wallet.</span>
    </div>

    <!-- State 2: Selected Payment Method -->
    <div
      v-else-if="props.selectedPayment"
      class="p-3.5 rounded-xl bg-surface-2 border border-border space-y-3"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <NuxtImg
            v-if="props.selectedPayment.image"
            :src="props.selectedPayment.image"
            :alt="props.selectedPayment.name"
            class="w-10 h-6 object-contain shrink-0"
            width="40"
            height="24"
          />
          <CreditCard v-else class="w-5 h-5 text-text-muted shrink-0" />
          <div>
            <div class="text-xs font-bold text-text">
              {{ props.selectedPayment.name }}
            </div>
            <div class="text-[11px] text-text-muted">
              {{ props.selectedPayment.description || props.selectedPayment.type }}
            </div>
          </div>
        </div>
      </div>

      <!-- Phone / Input field for E-wallet -->
      <div v-if="props.selectedPayment.with_input" class="pt-2 border-t border-border-light space-y-1">
        <label class="block text-[11px] font-medium text-text-muted">
          {{ props.selectedPayment.input_name || 'Nomor Ponsel Akun E-Wallet' }}
        </label>
        <input
          :value="props.paymentInput"
          type="tel"
          maxlength="16"
          placeholder="0812 3456 7890"
          class="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text font-medium tracking-wide focus:outline-hidden focus:border-primary transition-colors"
          @input="onInputChange"
        >
      </div>
    </div>

    <!-- State 3: Empty Placeholder -->
    <div
      v-else
      class="p-4 rounded-xl border border-dashed border-border text-center cursor-pointer hover:bg-surface-2 transition-colors"
      @click="emit('open-choose')"
    >
      <CreditCard class="w-6 h-6 text-text-muted mx-auto mb-1.5" />
      <p class="text-xs font-semibold text-text">
        Belum ada metode pembayaran dipilih
      </p>
      <p class="text-[11px] text-text-muted mt-0.5">
        Klik untuk memilih Virtual Account, Transfer Bank, atau E-Wallet
      </p>
    </div>
  </div>
</template>

