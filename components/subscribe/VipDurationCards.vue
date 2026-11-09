<script setup lang="ts">
import type { VipPackage } from '~/types/subscribe'
import { formatRupiah } from '~/utils/format'

defineProps<{
  packages: VipPackage[]
  selectedPackage: VipPackage | null
}>()

const emit = defineEmits<{
  select: [pkg: VipPackage]
}>()

const formatPrice = formatRupiah
</script>

<template>
  <div
    class="grid grid-cols-3 gap-3 sm:gap-4 font-outfit"
    role="radiogroup"
    aria-label="Pilihan durasi paket VIP"
  >
    <button
      v-for="pkg in packages"
      :key="`${pkg.type}-${pkg.days}`"
      type="button"
      role="radio"
      :aria-checked="selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type"
      class="group relative h-[188px] sm:h-[200px] rounded-2xl px-2.5 py-6 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer select-none focus:outline-hidden"
      :class="
        selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type
          ? 'bg-primary border-2 border-primary text-white shadow-md'
          : 'bg-white border border-border-light hover:border-primary/50 text-text shadow-2xs'
      "
      @click="emit('select', pkg)"
    >
      <!-- Top: Angka Hari & Label Hari -->
      <div class="flex flex-col items-center">
        <span
          class="text-[28px] sm:text-3xl font-extrabold leading-none tracking-tight tabular-nums"
          :class="
            selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type
              ? 'text-white'
              : 'text-text'
          "
        >
          {{ pkg.days }}
        </span>
        <span
          class="text-sm sm:text-base mt-1"
          :class="
            selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type
              ? 'font-semibold text-white'
              : 'font-medium text-text'
          "
        >
          Hari
        </span>
      </div>

      <!-- Bottom: Harga Coret & Harga Final -->
      <div class="flex flex-col items-center space-y-0.5">
        <span
          v-if="pkg.price > pkg.final_price"
          class="text-[11px] sm:text-xs line-through tabular-nums"
          :class="
            selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type
              ? 'text-white/80'
              : 'text-text-subtle'
          "
        >
          {{ formatPrice(pkg.price) }}
        </span>
        <span
          class="text-sm sm:text-base font-extrabold tabular-nums tracking-tight"
          :class="
            selectedPackage?.days === pkg.days && selectedPackage?.type === pkg.type
              ? 'text-white'
              : 'text-primary'
          "
        >
          {{ formatPrice(pkg.final_price) }}
        </span>
      </div>
    </button>
  </div>
</template>
