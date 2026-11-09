<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentStep: 1 | 2 | 3 | 4
  }>(),
  {}
)

const steps = [
  { step: 1, label: 'Pilih Produk', path: '/seller/promotion' },
  { step: 2, label: 'Pilih Paket', path: '/seller/promotion/choose' },
  { step: 3, label: 'Pembayaran', path: '/seller/promotion/payment' },
  { step: 4, label: 'Selesai', path: '' },
]
</script>

<template>
  <div class="max-w-5xl w-full mx-auto hidden md:block">
    <nav class="flex items-center justify-between py-3 px-6 bg-white rounded-2xl border border-border shadow-2xs">
      <div class="flex items-center justify-between w-full">
        <template v-for="(s, idx) in steps" :key="s.step">
          <!-- Step Item -->
          <div class="flex items-center gap-2.5">
            <div
              class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all select-none"
              :class="[
                s.step < props.currentStep
                  ? 'bg-primary text-white'
                  : s.step === props.currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/15'
                    : 'bg-surface-2 text-text-subtle border border-border'
              ]"
            >
              <Check v-if="s.step < props.currentStep" class="w-3.5 h-3.5 stroke-[3]" />
              <span v-else>{{ s.step }}</span>
            </div>

            <span
              class="text-xs sm:text-sm font-semibold transition-colors"
              :class="[
                s.step === props.currentStep
                  ? 'text-primary font-bold'
                  : s.step < props.currentStep
                    ? 'text-text'
                    : 'text-text-muted'
              ]"
            >
              {{ s.label }}
            </span>
          </div>

          <!-- Connecting Divider Line -->
          <div
            v-if="idx < steps.length - 1"
            class="flex-1 mx-4 h-0.5 rounded-full transition-colors"
            :class="s.step < props.currentStep ? 'bg-primary' : 'bg-border-light'"
          />
        </template>
      </div>
    </nav>
  </div>
</template>

