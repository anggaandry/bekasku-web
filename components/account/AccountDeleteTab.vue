<script setup lang="ts">
import { AlertTriangle, Trash2, Loader2 } from 'lucide-vue-next'

defineProps<{
  isDeleting: boolean
  deletedDate?: string
  deleteDays: number
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  'cancel-delete': []
  'request-delete': []
}>()
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border/60 shadow-xs p-5 sm:p-6 space-y-5">
    <div>
      <h2 class="text-lg font-extrabold text-red-600">Ajukan Penghapusan Akun</h2>
      <p class="text-xs text-text-muted mt-0.5">Kelola pengajuan penutupan permanen akun BekasKu Anda.</p>
    </div>

    <div v-if="isDeleting" class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
      <div class="flex items-start gap-3">
        <AlertTriangle :size="20" class="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-extrabold text-amber-900">Akun Dalam Masa Tunggu Penghapusan</p>
          <p class="text-xs text-amber-800 mt-1 leading-relaxed">
            Pengajuan penghapusan akun Anda sedang diproses{{ deletedDate ? ` (Jadwal: ${deletedDate})` : '' }}.
            Anda dapat membatalkan pengajuan ini kapan saja sebelum masa tunggu {{ deleteDays }} hari berakhir.
          </p>
        </div>
      </div>
      <button
        type="button"
        :disabled="isSubmitting"
        class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-extrabold hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
        @click="emit('cancel-delete')"
      >
        Batalkan Penghapusan Akun
      </button>
    </div>

    <div v-else class="space-y-4">
      <div class="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-2.5 text-xs text-red-900 leading-relaxed">
        <p class="font-extrabold flex items-center gap-1.5 text-red-700">
          <AlertTriangle :size="15" />
          Perhatian Sebelum Menghapus Akun:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-red-800">
          <li>Pastikan tidak ada transaksi jual/beli atau komplain yang masih berjalan.</li>
          <li>Sisa saldo BekasKu dan kuota sundul yang belum terpakai akan hangus setelah akun terhapus.</li>
          <li>Akun akan melewati masa tunggu <strong>{{ deleteDays }} hari</strong> sebelum dihapus permanen dari sistem.</li>
          <li>Riwayat iklan, ulasan, dan pesan obrolan tidak dapat dipulihkan kembali.</li>
        </ul>
      </div>

      <button
        type="button"
        :disabled="isSubmitting"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-extrabold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
        @click="emit('request-delete')"
      >
        <Loader2 v-if="isSubmitting" :size="15" class="animate-spin" />
        <Trash2 v-else :size="15" />
        Ajukan Penghapusan Akun
      </button>
    </div>
  </div>
</template>

