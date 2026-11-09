<script setup lang="ts">
import { Headset, Store, PlusCircle, RefreshCw } from 'lucide-vue-next'
import { useHelpChatStore } from '~/stores/helpChat'
import type { BekaskuPlusStatus, BekaskuPlusApplication } from '~/types/bekasku-plus'

interface Props {
  status: BekaskuPlusStatus
  adminNote?: string
  application?: BekaskuPlusApplication | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending',
  adminNote: '',
  application: null,
  loading: false,
})

const emit = defineEmits<{
  (e: 'reapply'): void
  (e: 'back-home'): void
}>()

const helpChatStore = useHelpChatStore()
const fallbackRejectedNote = 'Foto KTP atau dokumen toko kurang jelas. Mohon unggah ulang dengan informasi yang lebih lengkap dan valid.'

function openBekaskuCenterCs() {
  helpChatStore.openHelpChat({
    topic: 'bekaskuPlus',
    referenceTitle: 'Status Verifikasi BekasKu+',
    initialMessage: 'Halo Admin BekasKu, saya ingin konsultasi mengenai status verifikasi BekasKu+.',
  })
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-xs text-center space-y-6">
    <!-- State 1: Approved -->
    <template v-if="props.status === 'approved'">
      <div class="flex justify-center">
        <img
          src="/images/bekasku-plus/bekasku_plus_approved.png"
          alt="BekasKu+ Disetujui"
          width="240"
          height="208"
          class="h-44 sm:h-52 w-auto object-contain"
        />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl sm:text-2xl font-extrabold text-text font-outfit">
          Selamat! Anda Bagian dari Bekasku+
        </h2>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
          Akun Anda telah terverifikasi sebagai Seller Resmi Bekasku+. Nikmati seluruh fitur eksklusif dan prioritas katalog.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3 pt-2">
        <NuxtLink
          to="/seller/catalog"
          class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Store class="w-4 h-4" />
          <span>Kelola Toko</span>
        </NuxtLink>

        <NuxtLink
          to="/post/sell"
          class="w-full h-12 rounded-xl border border-primary text-primary hover:bg-blue-50/50 font-outfit font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle class="w-4 h-4" />
          <span>Pasang Iklan Prioritas</span>
        </NuxtLink>
      </div>
    </template>

    <!-- State 2: Rejected -->
    <template v-else-if="props.status === 'rejected'">
      <div class="flex justify-center">
        <img
          src="/images/bekasku-plus/bekasku_plus_rejected.png"
          alt="Pengajuan Belum Disetujui"
          width="240"
          height="208"
          class="h-44 sm:h-52 w-auto object-contain"
        />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl sm:text-2xl font-extrabold text-text font-outfit">
          Pengajuan Belum Disetujui
        </h2>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
          Mohon tinjau catatan kurator admin di bawah ini untuk memperbaiki data toko Anda.
        </p>
      </div>

      <!-- Admin Note Box -->
      <div class="text-left bg-red-50/70 border border-red-200 rounded-2xl p-4 sm:p-5 space-y-1.5">
        <span class="text-[11px] font-extrabold text-red-600 uppercase tracking-wider font-outfit">
          CATATAN DARI ADMIN
        </span>
        <p class="text-xs sm:text-sm text-red-900 leading-relaxed">
          {{ props.adminNote || fallbackRejectedNote }}
        </p>
      </div>

      <!-- CS Help Banner -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-primary text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
        @click="openBekaskuCenterCs"
      >
        <Headset class="w-4 h-4 text-primary shrink-0" />
        <span>Butuh Bantuan Verifikasi? Hubungi CS Bekasku</span>
      </button>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          type="button"
          class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          @click="emit('reapply')"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Daftar Ulang / Ajukan Kembali</span>
        </button>
      </div>
    </template>

    <!-- State 3: Pending (Default) -->
    <template v-else>
      <div class="flex justify-center">
        <img
          src="/images/bekasku-plus/bekasku_plus_pending.png"
          alt="Pendaftaran Berhasil Dikirim"
          width="240"
          height="208"
          class="h-44 sm:h-52 w-auto object-contain"
        />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl sm:text-2xl font-extrabold text-text font-outfit">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
          Silakan tunggu 3x24 jam. Tim Bekasku akan menghubungi Anda via WhatsApp atau Email untuk tahap konfirmasi kurasi.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2">
        <NuxtLink
          to="/"
          class="w-full h-12 rounded-xl border border-border text-text hover:bg-surface-2 font-outfit font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Kembali ke Beranda</span>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

