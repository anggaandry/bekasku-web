<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Shield,
  Eye,
  EyeOff,
  Maximize2,
  CheckCircle2,
  CreditCard,
  Lock,
} from 'lucide-vue-next'
import type { IdentityInfoData } from '~/types/identity'
import { useIdentityKycModal } from '~/composables/useIdentityKyc'

const props = defineProps<{
  identityInfo: IdentityInfoData | null
  profileName?: string
}>()

const kycModal = useIdentityKycModal()

// User is verified if identity number or identity image exists
const isVerified = computed(() => {
  return Boolean(props.identityInfo?.identity_number || props.identityInfo?.identity)
})

// Privacy & Masking states (matching IdentityInfoController V3)
const isMasked = ref(true)
const isPhotoPreviewOpen = ref(false)

const rawNumber = computed(() => props.identityInfo?.identity_number || '')
const rawName = computed(() => props.identityInfo?.identity_name || props.profileName || '')
const rawType = computed(() => props.identityInfo?.identity_type || 'KTP')
const rawImage = computed(() => props.identityInfo?.identity || '')

// Format nomor identitas tersensor (contoh: 1201********0001)
const displayIdentityNumber = computed(() => {
  if (!isMasked.value) return rawNumber.value
  const num = rawNumber.value.trim()
  if (!num) return '-'
  if (num.length <= 4) return num
  if (num.length <= 8) {
    return `${num.substring(0, 2)}${'*'.repeat(num.length - 4)}${num.substring(num.length - 2)}`
  }
  return `${num.substring(0, 4)}${'*'.repeat(num.length - 8)}${num.substring(num.length - 4)}`
})

// Format nama tersensor per kata (contoh: Er****** An***)
const displayIdentityName = computed(() => {
  if (!isMasked.value) return rawName.value
  const name = rawName.value.trim()
  if (!name) return '-'
  const words = name.split(/\s+/)
  return words
    .map((w) => {
      if (w.length <= 2) return w
      return `${w.substring(0, 2)}${'*'.repeat(w.length - 2)}`
    })
    .join(' ')
})

function toggleMask() {
  isMasked.value = !isMasked.value
}
</script>

<template>
  <div class="font-outfit select-none">
    <!-- ============================================================== -->
    <!-- STATE 1: BELUM MENDAFTAR / BELUM VERIFIKASI (IdentityAskView) -->
    <!-- Sesuai persis dengan desain mobile V3 Screenshot 2             -->
    <!-- ============================================================== -->
    <div
      v-if="!isVerified"
      class="bg-white rounded-2xl border border-border/80 shadow-2xs p-6 sm:p-12 flex flex-col items-center text-center animate-fade-in"
    >
      <!-- Mobile / Web Section Header on small screens -->
      <div class="w-full flex items-center justify-between pb-4 mb-4 border-b border-border/60 sm:hidden">
        <h2 class="text-base font-bold text-text">Verifikasi Identitas</h2>
      </div>

      <!-- Ilustrasi Identity Verification -->
      <div class="w-52 sm:w-64 max-h-60 flex items-center justify-center my-4 sm:my-6">
        <img
          src="/images/identity/illust_identity_verification.png"
          alt="Verifikasi Identitas"
          class="w-full h-auto object-contain max-h-56"
          loading="eager"
        />
      </div>

      <!-- Heading & Deskripsi (Persis Mobile V3) -->
      <div class="space-y-3 max-w-md mx-auto">
        <h3 class="text-lg sm:text-2xl font-bold text-text tracking-tight">
          Silahkan verifikasi identitas anda
        </h3>
        <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
          Sebelum kamu bisa pakai aplikasi, kita perlu verifikasi identitas dulu ya. Tenang, datamu dienkripsi dan disimpan dengan aman.
        </p>
      </div>

      <!-- Tombol CTA Verifikasi Sekarang -->
      <div class="mt-8 sm:mt-10 w-full sm:w-auto">
        <button
          type="button"
          class="w-full sm:w-auto min-w-[240px] h-12 px-8 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          @click="kycModal.open({ reason: 'account' })"
        >
          <span>Verifikasi Sekarang</span>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- STATE 2: SUDAH TERVERIFIKASI (IdentityInfoView V3)            -->
    <!-- Sesuai lib/features/account/views/identity_info_view.dart      -->
    <!-- ============================================================== -->
    <div
      v-else
      class="bg-white rounded-2xl border border-border/80 shadow-2xs overflow-hidden divide-y divide-border/60 animate-fade-in"
    >
      <!-- Header -->
      <div class="p-5 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-text">Kartu Identitas Pengguna</h2>
          <p class="text-xs text-text-muted mt-0.5">Identitas resmi yang terdaftar dan terverifikasi untuk akun BekasKu Anda.</p>
        </div>

        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success-text border border-success-border shrink-0">
          <CheckCircle2 class="w-3.5 h-3.5 text-success-text" />
          <span>Terverifikasi</span>
        </span>
      </div>

      <!-- KTP Photo Card Section (matching IdentityInfoView V3) -->
      <div class="p-5 sm:p-6 bg-surface-2/40 flex flex-col items-center">
        <div
          class="relative w-full max-w-md aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-xs bg-surface-2 group cursor-pointer"
          @click="isPhotoPreviewOpen = true"
        >
          <!-- KTP Image (blurred if masked) -->
          <img
            v-if="rawImage"
            :src="rawImage"
            alt="Kartu Identitas"
            class="w-full h-full object-cover transition duration-300"
            :class="isMasked ? 'blur-md scale-105' : 'blur-none scale-100'"
          />
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2 bg-gradient-to-br from-surface-2 to-surface-3"
          >
            <CreditCard class="w-10 h-10 text-primary/60" />
            <span class="text-xs font-medium">Foto Kartu Identitas Tersimpan</span>
          </div>

          <!-- Overlay Action -->
          <div class="absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity">
            <div
              v-if="!isMasked"
              class="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Maximize2 class="w-3 h-3" />
              <span>Perbesar</span>
            </div>
            <div
              v-else
              class="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold flex items-center gap-2 shadow-md"
            >
              <Eye class="w-4 h-4" />
              <span>Preview</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Details (Jenis, Nomor, Nama Sesuai KTP) -->
      <div class="divide-y divide-border/60">
        <!-- Jenis Identitas -->
        <div class="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-text-muted font-medium">Jenis Identitas</p>
            <p class="text-sm font-semibold text-text mt-0.5 uppercase">{{ rawType }}</p>
          </div>
        </div>

        <!-- Nomor Identitas (NIK) -->
        <div class="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-text-muted font-medium">
              {{ rawType === 'SIM' ? 'Nomor SIM' : 'Nomor Identitas (NIK)' }}
            </p>
            <p class="text-sm sm:text-base font-mono font-bold text-text mt-0.5 tracking-wider">
              {{ displayIdentityNumber }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
            :title="isMasked ? 'Tampilkan Nomor' : 'Sembunyikan Nomor'"
            @click="toggleMask"
          >
            <EyeOff v-if="!isMasked" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Nama Identitas -->
        <div class="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-text-muted font-medium">Nama Sesuai Identitas</p>
            <p class="text-sm font-semibold text-text mt-0.5">
              {{ displayIdentityName }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
            :title="isMasked ? 'Tampilkan Nama' : 'Sembunyikan Nama'"
            @click="toggleMask"
          >
            <EyeOff v-if="!isMasked" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Security Info Footer -->
      <div class="p-5 sm:p-6 bg-surface-2/30 flex items-start gap-3">
        <Shield class="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p class="text-xs text-text-muted leading-relaxed">
          Data identitas Anda terenkripsi dengan aman dan hanya digunakan untuk validasi penarikan saldo, transaksi rekening bersama, serta perlindungan akun resmi BekasKu.
        </p>
      </div>
    </div>

    <!-- Full Photo Viewer Modal (if clicked) -->
    <Teleport to="body">
      <div
        v-if="isPhotoPreviewOpen && rawImage"
        class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="isPhotoPreviewOpen = false"
      >
        <div class="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm sm:text-base text-text">Pratinjau Kartu Identitas</h3>
            <button
              type="button"
              class="text-xs font-bold text-primary hover:underline cursor-pointer"
              @click="isPhotoPreviewOpen = false"
            >
              Tutup
            </button>
          </div>
          <div class="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center">
            <img :src="rawImage" alt="Kartu Identitas Penuh" class="max-w-full max-h-[65vh] object-contain" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
