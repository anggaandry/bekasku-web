<script setup lang="ts">
import { Check, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentStep: 1 | 2 | 3 | 4
    canNavigateBack?: boolean
  }>(),
  {
    canNavigateBack: true,
  }
)

const steps = [
  { step: 1, label: 'Keranjang', path: '/cart' },
  { step: 2, label: 'Pengiriman', path: '/checkout' },
  { step: 3, label: 'Pembayaran', path: '/checkout/payment' },
  { step: 4, label: 'Selesai', path: '' },
]
</script>

<template>
  <div class="max-w-[1200px] w-full mx-auto px-4 pt-4 pb-2 hidden md:block">
    <!-- Clean Minimalist E-Commerce Checkout Step Wizard -->
    <nav class="flex items-center justify-between py-3 px-5 bg-white rounded-2xl border border-border shadow-2xs">
      <div class="flex items-center gap-3 sm:gap-6 w-full">
        <template v-for="(s, idx) in steps" :key="s.step">
          <!-- Step Item -->
          <div class="flex items-center gap-2.5">
            <!-- Number / Check Icon Indicator -->
            <component
              :is="s.step < props.currentStep && props.canNavigateBack && s.path ? 'NuxtLink' : 'div'"
              :to="s.step < props.currentStep && props.canNavigateBack && s.path ? s.path : undefined"
              class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all select-none"
              :class="[
                s.step < props.currentStep
                  ? 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                  : s.step === props.currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/15'
                    : 'bg-surface-2 text-text-subtle border border-border'
              ]"
            >
              <Check v-if="s.step < props.currentStep" class="w-3.5 h-3.5 stroke-[3]" />
              <span v-else>{{ s.step }}</span>
            </component>

            <!-- Step Label -->
            <component
              :is="s.step < props.currentStep && props.canNavigateBack && s.path ? 'NuxtLink' : 'span'"
              :to="s.step < props.currentStep && props.canNavigateBack && s.path ? s.path : undefined"
              class="text-xs sm:text-sm font-semibold transition-colors"
              :class="[
                s.step === props.currentStep
                  ? 'text-primary font-bold'
                  : s.step < props.currentStep
                    ? 'text-text hover:text-primary cursor-pointer'
                    : 'text-text-muted'
              ]"
            >
              {{ s.label }}
            </component>
          </div>

          <!-- Divider Chevron between steps -->
          <div
            v-if="idx < steps.length - 1"
            class="flex-1 max-w-[80px] h-[2px] rounded-full mx-1 transition-colors"
            :class="s.step < props.currentStep ? 'bg-primary' : 'bg-border'"
          />
        </template>
      </div>

      <!-- Quick back / Home link on right side -->
      <NuxtLink
        to="/"
        class="text-xs text-text-muted hover:text-primary transition-colors shrink-0 font-medium pl-4 border-l border-border/80"
      >
        Lanjut Belanja
      </NuxtLink>
    </nav>
  </div>
</template>

