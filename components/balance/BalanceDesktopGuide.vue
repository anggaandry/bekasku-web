<script setup lang="ts">
import {
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Headset,
  MessageSquare,
  CheckCircle2,
  Check,
  Clock,
  Landmark,
} from 'lucide-vue-next'
import { useIdentityKycModal } from '~/composables/useIdentityKyc'
import { useHelpChatStore } from '~/stores/helpChat'

withDefaults(
  defineProps<{
    isVerified?: boolean
  }>(),
  {
    isVerified: false,
  }
)

const kycModal = useIdentityKycModal()
const helpChatStore = useHelpChatStore()

function openCsHelp() {
  helpChatStore.openHelpChat({
    topic: 'balance',
    referenceTitle: 'Bantuan Saldo & Dompet',
    initialMessage: 'Halo Tim CS BekasKu, saya butuh panduan/bantuan terkait saldo dan dompet akun saya.',
  })
}
</script>

<template>
  <div class="space-y-4 font-outfit select-none">
    <!-- Card 1: Panduan Penarikan Saldo (Letak Teratas) -->
    <div class="bg-white rounded-3xl border border-border/80 p-5 shadow-2xs">
      <div class="flex items-center gap-2.5 pb-3 border-b border-border/70 mb-3.5">
        <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HelpCircle class="w-4 h-4" />
        </div>
        <h3 class="text-sm font-bold text-text">
          Panduan Penarikan Saldo
        </h3>
      </div>

      <ul class="space-y-3 text-xs text-text-muted leading-relaxed">
        <li class="flex items-start gap-2.5">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong class="text-text font-semibold">Minimal Penarikan:</strong> Rp 10.000 per transaksi penarikan.
          </span>
        </li>
        <li class="flex items-start gap-2.5">
          <Clock class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong class="text-text font-semibold">Waktu Proses:</strong> Dana dikirimkan dalam 1-3 hari kerja ke rekening bank.
          </span>
        </li>
        <li class="flex items-start gap-2.5">
          <Landmark class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            <strong class="text-text font-semibold">Kesesuaian Identitas:</strong> Nama pemilik rekening harus sesuai data KTP terverifikasi.
          </span>
        </li>
      </ul>
    </div>

    <!-- Card 2: Status Verifikasi Akun / Identitas Terverifikasi (Posisi di Bawah Panduan dengan Aksen Primary Merah) -->
    <div
      class="bg-white rounded-3xl border border-border/80 p-4 shadow-2xs transition-all"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Icon dengan aksen primary merah -->
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 text-primary"
          >
            <ShieldCheck v-if="isVerified" class="w-5 h-5" />
            <ShieldAlert v-else class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h4
              class="text-xs sm:text-sm font-bold truncate"
              :class="isVerified ? 'text-primary' : 'text-text'"
            >
              {{ isVerified ? 'Identitas Terverifikasi' : 'Verifikasi Akun' }}
            </h4>
            <p class="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
              {{
                isVerified
                  ? 'Identitas sudah terverifikasi. Anda bisa melakukan penarikan dana ke rekening.'
                  : 'Lengkapi KTP untuk mengaktifkan penarikan saldo dan rekening bank.'
              }}
            </p>
          </div>
        </div>

        <!-- Trailing: Ceklis Aksen Merah Primary ATAU Tombol Verifikasi Merah -->
        <div
          v-if="isVerified"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold shrink-0"
        >
          <Check class="w-3.5 h-3.5 text-primary" />
          <span>Terverifikasi</span>
        </div>

        <button
          v-else
          type="button"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white transition-colors shrink-0 shadow-2xs cursor-pointer"
          @click="kycModal.open({ reason: 'withdraw' })"
        >
          Verifikasi
        </button>
      </div>
    </div>

    <!-- Card 3: BekasKu Center Help CTA -->
    <div class="bg-gradient-to-br from-surface-1 to-surface-2 rounded-3xl border border-border/80 p-5 shadow-2xs">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Headset class="w-5 h-5" />
        </div>
        <div class="space-y-1 min-w-0">
          <h4 class="text-sm font-bold text-text">
            Butuh Bantuan Saldo?
          </h4>
          <p class="text-xs text-text-muted leading-relaxed">
            Punya kendala mutasi, rekber, atau pencairan dana? Tim CS BekasKu siap membantu.
          </p>
          <div class="pt-2">
            <button
              type="button"
              class="w-full h-9 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              @click="openCsHelp"
            >
              <span>Hubungi CS BekasKu</span>
              <MessageSquare class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
