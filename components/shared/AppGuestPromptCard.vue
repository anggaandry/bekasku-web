<script setup lang="ts">
import { LockKeyhole, MessageCircle, ShieldCheck, ShoppingBag, LogIn } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    featureTitle?: string
    message?: string
    actionLabel?: string
  }>(),
  {
    featureTitle: 'Keranjang',
    message: 'Silakan masuk atau daftar akun BekasKu untuk menikmati kemudahan fitur keranjang belanja, negosiasi harga, dan transaksi aman.',
    actionLabel: 'Masuk / Daftar Sekarang',
  }
)

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="max-w-md w-full mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-border shadow-xs text-center flex flex-col items-center">
    <!-- Center Mascot with Glowing Halo & Lock Badge (Identik dengan GuestAuthBottomSheet Mobile V3) -->
    <div class="relative w-24 h-24 mb-5 flex items-center justify-center">
      <!-- Soft glowing background halo -->
      <div class="absolute inset-0 rounded-full bg-primary/10" />

      <!-- Inner white card with mascot -->
      <div class="relative w-20 h-20 rounded-full bg-white shadow-md p-3 flex items-center justify-center border border-primary/15">
        <img
          src="/images/mascot.png"
          alt="Maskot BekasKu"
          width="64"
          height="64"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- Lock Indicator Badge (Amber) -->
      <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-xs flex items-center justify-center text-white">
        <LockKeyhole class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Title -->
    <h2 class="text-lg sm:text-xl font-bold text-text font-outfit">
      {{ props.featureTitle ? `Login untuk Akses ${props.featureTitle}` : 'Kamu Harus Login' }}
    </h2>

    <!-- Subtitle / Message -->
    <p class="text-xs sm:text-[13px] text-text-muted mt-2 max-w-sm leading-relaxed">
      {{ props.message }}
    </p>

    <!-- Value Propositions List (Card abu-abu bersih sesuai Mobile V3) -->
    <div class="w-full mt-5 p-3.5 bg-surface-2 rounded-2xl border border-border text-left space-y-2.5">
      <div class="flex items-center gap-2.5 text-xs text-text">
        <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <MessageCircle class="w-3.5 h-3.5" />
        </div>
        <span>Kirim pesan & negosiasi harga barang langsung</span>
      </div>

      <div class="flex items-center gap-2.5 text-xs text-text">
        <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck class="w-3.5 h-3.5" />
        </div>
        <span>Jual beli terlindungi dengan rekening bersama 100% aman</span>
      </div>

      <div class="flex items-center gap-2.5 text-xs text-text">
        <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <ShoppingBag class="w-3.5 h-3.5" />
        </div>
        <span>Simpan wishlist & kelola keranjang belanja kapan saja</span>
      </div>
    </div>

    <!-- CTA Button: Masuk / Daftar -->
    <button
      type="button"
      class="w-full h-12 mt-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
      @click="emit('action')"
    >
      <LogIn class="w-4 h-4" />
      <span>{{ props.actionLabel }}</span>
    </button>
  </div>
</template>

