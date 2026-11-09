<script setup lang="ts">
import { Heart, ArrowRight } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  isGuest?: boolean
}>()

const authStore = useAuthStore()
</script>

<template>
  <div class="py-12 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto select-none">
    <!-- Image Ilustrasi Sesuai Gambar Mobile V3 -->
    <div class="w-56 sm:w-64 aspect-4/3 max-h-48 flex items-center justify-center mb-4">
      <img
        src="/images/nowishlist.png"
        alt="Kamu belum ada Wishlist"
        width="256"
        height="192"
        class="max-w-full max-h-full object-contain pointer-events-none"
      />
    </div>

    <!-- Title Sesuai Screenshot Mobile V3 -->
    <h3 class="text-base sm:text-lg font-bold text-text font-outfit">
      {{ props.isGuest ? 'Masuk untuk Melihat Wishlist' : 'Kamu belum ada Wishlist' }}
    </h3>

    <!-- Subtitle Sesuai Screenshot Mobile V3 -->
    <p class="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
      {{
        props.isGuest
          ? 'Masuk ke akun BekasKu Anda untuk menyimpan dan melihat produk favorit kapan saja.'
          : 'Simpan produk favorit kamu biar gampang dicari nanti.'
      }}
    </p>

    <!-- Tombol Khusus Mode Guest -->
    <div v-if="props.isGuest" class="mt-6 w-full">
      <NuxtLink
        to="/login?redirect=/favorite"
        class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors shadow-xs"
      >
        <span>Masuk Sekarang</span>
        <ArrowRight class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>

