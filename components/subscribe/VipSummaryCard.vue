<script setup lang="ts">
import { Crown, ShieldCheck } from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'
import type { VipPackage } from '~/types/subscribe'

defineProps<{
  selectedPackage: VipPackage | null
  isVipActive: boolean
  mySubscribedDays: number
  discountAmount: number
  ctaLabel: string
}>()

const emit = defineEmits<{
  (e: 'proceed'): void
}>()
</script>

<template>
  <div class="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-5">
    <div class="flex items-center gap-3 pb-4 border-b border-border/70">
      <div
        class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0"
      >
        <Crown class="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
      </div>
      <div class="min-w-0">
        <h3 class="text-base font-bold text-text leading-snug">
          {{ isVipActive ? 'Ringkasan Perpanjangan' : 'Ringkasan Langganan' }}
        </h3>
        <p class="text-xs text-text-muted truncate">Keanggotaan Eksklusif BekasKu VIP</p>
      </div>
    </div>

    <div v-if="selectedPackage" class="space-y-3 text-xs sm:text-sm">
      <div class="flex items-center justify-between text-text-muted">
        <span>Paket Dipilih</span>
        <span class="font-bold text-text">VIP {{ selectedPackage.days }} Hari</span>
      </div>

      <div class="flex items-center justify-between text-text-muted">
        <span>Harga Normal</span>
        <span class="line-through tabular-nums">{{ formatRupiah(selectedPackage.price) }}</span>
      </div>

      <div v-if="discountAmount > 0" class="flex items-center justify-between text-success-text font-medium">
        <span>Hemat Diskon ({{ selectedPackage.discount }}%)</span>
        <span class="tabular-nums">-{{ formatRupiah(discountAmount) }}</span>
      </div>

      <div
        v-if="isVipActive"
        class="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed"
      >
        Masa aktif baru akan otomatis ditambahkan ke sisa
        <strong>{{ mySubscribedDays }} hari</strong> langganan aktif Anda
        (menjadi <strong>{{ mySubscribedDays + selectedPackage.days }} hari</strong>).
      </div>

      <div class="pt-3 border-t border-border flex items-baseline justify-between">
        <span class="text-sm font-bold text-text">Total Harga</span>
        <span class="text-xl font-extrabold text-primary tabular-nums">{{ formatRupiah(selectedPackage.final_price) }}</span>
      </div>
    </div>

    <button
      type="button"
      :disabled="!selectedPackage"
      class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-99"
      @click="emit('proceed')"
    >
      {{ ctaLabel }}
    </button>

    <div class="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-1">
      <ShieldCheck class="w-4 h-4 text-success-text shrink-0" aria-hidden="true" />
      <span>Aktivasi instan otomatis setelah pembayaran selesai</span>
    </div>
  </div>
</template>
