<script setup lang="ts">
import { Timer, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  qrContent: string
  countdown: number
  isSeller: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const formattedMinutes = computed(() => {
  return Math.floor(props.countdown / 60).toString().padStart(2, '0')
})

const formattedSeconds = computed(() => {
  return (props.countdown % 60).toString().padStart(2, '0')
})

const isUrgent = computed(() => props.countdown < 60)
const isExpired = computed(() => props.countdown <= 0)

const qrImageUrl = computed(() => {
  if (!props.qrContent) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(props.qrContent)}`
})
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-border flex flex-col items-center text-center shadow-2xs">
    <h3 class="font-outfit font-bold text-lg text-text">
      Tunjukkan QR Code
    </h3>
    <p class="font-outfit text-xs sm:text-sm text-text-muted mt-1 max-w-xs">
      {{
        isSeller
          ? 'Minta pembeli memindai kode ini saat serah terima barang'
          : 'Minta penjual memindai kode ini untuk konfirmasi pesanan'
      }}
    </p>

    <div class="my-5 p-3 rounded-2xl bg-white border border-primary/20 shadow-xs relative">
      <div v-if="loading" class="w-52 h-52 flex flex-col items-center justify-center bg-surface-2 rounded-xl">
        <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
        <span class="text-xs text-text-muted font-outfit">Membuat QR Code...</span>
      </div>

      <div v-else-if="isExpired" class="w-52 h-52 flex flex-col items-center justify-center bg-surface-2 rounded-xl p-4">
        <span class="text-xs font-semibold text-danger mb-2 font-outfit">QR Code Kedaluwarsa</span>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-outfit font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          @click="emit('refresh')"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Buat Ulang</span>
        </button>
      </div>

      <div v-else class="w-52 h-52 bg-white rounded-xl flex items-center justify-center overflow-hidden">
        <img
          :src="qrImageUrl"
          alt="QR Code Pay & Pick"
          width="208"
          height="208"
          loading="eager"
          class="w-full h-full object-contain"
        />
      </div>
    </div>

    <div
      v-if="!isExpired"
      :class="[
        'px-4 py-1.5 rounded-full border flex items-center gap-2 text-xs sm:text-sm font-outfit transition-colors',
        isUrgent
          ? 'bg-danger/10 border-danger/30 text-danger'
          : 'bg-primary/10 border-primary/20 text-primary'
      ]"
    >
      <Timer class="w-4 h-4 shrink-0" />
      <span class="text-text-muted font-medium">Berlaku dalam:</span>
      <span class="font-bold font-mono tracking-wider">
        {{ formattedMinutes }}:{{ formattedSeconds }}
      </span>
    </div>

    <button
      v-else
      type="button"
      class="flex items-center gap-2 text-xs text-primary font-semibold hover:underline cursor-pointer"
      @click="emit('refresh')"
    >
      <RotateCcw class="w-3.5 h-3.5" />
      <span>Klik untuk perbarui QR Code</span>
    </button>
  </div>
</template>

