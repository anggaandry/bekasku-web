<script setup lang="ts">
import { ChevronRight, CircleCheck, CreditCard } from 'lucide-vue-next'
import PaymentLogo from '~/components/payment/PaymentLogo.vue'
import type { PaymentMethodItem } from '~/types/checkout'

defineProps<{
  selectedPayment: PaymentMethodItem | null
  categoryLabel: string
  isFullBalance: boolean
  phoneInput: string
}>()

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'update:phoneInput', value: string): void
}>()

function handleInput(event: Event) {
  emit('update:phoneInput', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="bg-white px-4 py-5 md:p-5 md:rounded-2xl md:border md:border-border md:shadow-2xs space-y-4">
    <div v-if="isFullBalance" class="flex items-center gap-3 py-1">
      <CircleCheck class="w-5 h-5 text-success-text shrink-0" aria-hidden="true" />
      <span class="text-sm font-medium text-success-text">Pembayaran penuh menggunakan saldo</span>
    </div>

    <template v-else>
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-[15px] font-semibold text-text">Metode Pembayaran</h2>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline cursor-pointer"
          @click="emit('open')"
        >
          <span>{{ selectedPayment ? 'Ubah' : 'Pilih Pembayaran' }}</span>
          <ChevronRight class="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
        </button>
      </div>

      <div v-if="selectedPayment" class="space-y-4">
        <div class="flex items-center gap-3 cursor-pointer" @click="emit('open')">
          <PaymentLogo
            :payment-name="selectedPayment.name"
            :logo-url="selectedPayment.image"
            :width="50"
            :height="30"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-text truncate">{{ selectedPayment.name }}</p>
            <p class="text-xs text-text-muted truncate">{{ categoryLabel }}</p>
          </div>
        </div>

        <div v-if="selectedPayment.with_input" class="space-y-2 pt-1">
          <label for="subscribe-payment-phone" class="block text-xs text-text-muted">
            Masukkan {{ selectedPayment.name }}
          </label>
          <input
            id="subscribe-payment-phone"
            :value="phoneInput"
            type="tel"
            inputmode="numeric"
            placeholder="08xx xxxx xxxx"
            class="w-full px-4 py-3.5 rounded-xl bg-surface-2 border border-border-light focus:border-primary focus:outline-hidden text-[15px] font-semibold text-text tracking-wide transition-colors"
            @input="handleInput"
          />
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-border-light bg-surface-2/60 p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
        @click="emit('open')"
      >
        <div
          class="w-10 h-10 rounded-xl bg-surface-2 border border-border-light flex items-center justify-center shrink-0 text-text-muted"
        >
          <CreditCard class="w-5 h-5 stroke-[1.8]" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <h3 class="text-xs sm:text-sm font-semibold text-text">Belum ada metode pembayaran</h3>
          <p class="text-[11px] sm:text-xs text-text-muted mt-0.5">Silakan pilih metode pembayaran di atas</p>
        </div>
      </div>
    </template>
  </div>
</template>

