<template>
  <div class="bg-white rounded-2xl border border-border-light p-4 sm:p-6 shadow-xs space-y-4">
    <div class="pb-3 border-b border-border-light">
      <h3 class="text-xs font-bold text-text-primary uppercase tracking-wider">
        Metode Transaksi
      </h3>
    </div>

    <!-- Kirim via Kurir Toggle -->
    <div class="flex items-center justify-between gap-4 py-1">
      <div class="flex items-start gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0">
          <Truck class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-text-primary">Kirim via Kurir</h4>
          <p class="text-xs text-text-muted mt-0.5">Izinkan pengiriman ekspedisi (JNE, Ninja, dll)</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        :aria-checked="deliveryCourrier"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="deliveryCourrier ? 'bg-primary' : 'bg-gray-300'"
        @click="$emit('update:deliveryCourrier', !deliveryCourrier)"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          :class="deliveryCourrier ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Ketemuan Langsung (COD) Toggle -->
    <div class="flex items-center justify-between gap-4 py-1 border-t border-border-light pt-3">
      <div class="flex items-start gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0">
          <Handshake class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-text-primary">
            Ketemuan Langsung (COD)
          </h4>
          <p class="text-xs text-text-muted mt-0.5">
            Bisa janji temu & bayar di tempat dengan aman
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        :aria-checked="directMeet"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="directMeet ? 'bg-primary' : 'bg-gray-300'"
        @click="$emit('update:directMeet', !directMeet)"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          :class="directMeet ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Bebas Ongkir Toggle -->
    <div class="flex items-center justify-between gap-4 py-1 border-t border-border-light pt-3">
      <div class="flex items-start gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0">
          <Gift class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-text-primary">Bebas Ongkir</h4>
          <p class="text-xs text-text-muted mt-0.5">
            Ongkir ditanggung penjual (dipotong dari saldo penjual saat selesai)
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        :aria-checked="freeDelivery"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="freeDelivery ? 'bg-primary' : 'bg-gray-300'"
        @click="$emit('update:freeDelivery', !freeDelivery)"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          :class="freeDelivery ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Nominal Bebas Ongkir (Input when enabled) -->
    <div v-if="freeDelivery" class="pt-2 animate-in fade-in duration-200">
      <label class="block text-xs font-semibold text-text-primary mb-1.5">
        Nominal Gratis Ongkir
      </label>
      <div class="relative flex items-center">
        <span
          class="inline-flex items-center px-4 py-2.5 rounded-l-xl border border-r-0 border-border-light bg-surface-2 text-text-muted text-sm font-semibold select-none"
        >
          Rp
        </span>
        <input
          :value="displayFreeDelivery"
          type="text"
          inputmode="numeric"
          placeholder="Contoh: 30.000"
          class="w-full bg-white border border-border-light rounded-r-xl py-2.5 px-3.5 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
          @input="onFreeDeliveryInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Truck, Handshake, Gift } from 'lucide-vue-next'
import { formatNumber } from '~/utils/format'

const props = defineProps<{
  deliveryCourrier: boolean
  directMeet: boolean
  freeDelivery: boolean
  totalFreeDelivery: number
}>()

const emit = defineEmits<{
  (e: 'update:deliveryCourrier', val: boolean): void
  (e: 'update:directMeet', val: boolean): void
  (e: 'update:freeDelivery', val: boolean): void
  (e: 'update:totalFreeDelivery', val: number): void
}>()

const displayFreeDelivery = computed(() => {
  if (!props.totalFreeDelivery || props.totalFreeDelivery === 0) return ''
  return formatNumber(props.totalFreeDelivery)
})

function onFreeDeliveryInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  emit('update:totalFreeDelivery', num)
}
</script>
