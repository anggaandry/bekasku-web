<script setup lang="ts">
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  isSeller: boolean
  mode?: 'start' | 'confirm'
}>(), {
  mode: 'start'
})

const isExpanded = ref(true)

const buyerTips = [
  'Klik tombol Scan QR Code dibawah ini.',
  'Scan QR Code berfungsi untuk memastikan orang yang anda temui adalah orang yang menjual barang yang akan anda beli.',
  'Anda hanya dapat melakukan scan QR Code dari penjual yang telah melakukan transaksi dengan anda. Jika QR Code gagal discan, kemungkinan anda bukan bertemu dengan penjual yang benar.',
  'Mohon untuk tidak membayar biaya apapun diluar transaksi yang sudah disepakatin di dalam aplikasi BekasKu.'
]

const sellerTips = [
  'Klik tombol Buka QR Code dibawah ini.',
  'Tunjukkan kode QR kepada pembeli untuk dipindai sebagai bukti serah terima.',
  'Pastikan pembeli berhasil memindai QR Code Anda sebelum barang dipindahtangankan.',
  'Jangan menagih biaya tambahan apa pun di luar kesepakatan nominal di aplikasi BekasKu.'
]

const confirmInstructions = [
  'Teliti sebelum membeli. Pastikan kondisi barang yang akan anda beli sudah sesuai dengan deskripsi dan keterangan iklan.',
  'Klik tombol Selesaikan Transaksi, jika anda jadi membeli barang.',
  'Klik tombol Batalkan Transaksi, jika anda batal membeli barang.'
]

const cardTitle = computed(() => {
  return props.mode === 'confirm' ? 'Perhatikan Sebelum Membeli:' : 'Tips Ketemuan'
})

const activeTips = computed(() => {
  if (props.mode === 'confirm') return confirmInstructions
  return props.isSeller ? sellerTips : buyerTips
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-border overflow-hidden transition-all duration-200">
    <button
      type="button"
      class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-2/60 transition-colors cursor-pointer"
      @click="isExpanded = !isExpanded"
    >
      <span class="font-outfit font-semibold text-base text-text">
        {{ cardTitle }}
      </span>
      <component
        :is="isExpanded ? ChevronUp : ChevronDown"
        class="w-5 h-5 text-text-muted transition-transform"
      />
    </button>

    <div
      v-show="isExpanded"
      class="px-5 pb-5 pt-1 space-y-3 border-t border-border/40"
    >
      <div
        v-for="(tip, idx) in activeTips"
        :key="idx"
        class="flex items-start gap-2 text-sm text-text-muted leading-relaxed"
      >
        <span class="font-outfit font-semibold text-text shrink-0">{{ idx + 1 }}.</span>
        <div class="text-[13.5px]">
          <template v-if="mode === 'start' && idx === 0">
            <template v-if="!isSeller">
              Klik tombol <strong class="font-bold text-primary">Scan QR Code</strong> dibawah ini.
            </template>
            <template v-else>
              Klik tombol <strong class="font-bold text-primary">Buka QR Code</strong> dibawah ini.
            </template>
          </template>
          <template v-else-if="mode === 'confirm' && idx === 1">
            Klik tombol <strong class="font-bold text-primary">Selesaikan Transaksi</strong>, jika anda jadi membeli barang.
          </template>
          <template v-else-if="mode === 'confirm' && idx === 2">
            Klik tombol <strong class="font-bold text-primary">Batalkan Transaksi</strong>, jika anda batal membeli barang.
          </template>
          <template v-else>
            {{ tip }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

