<template>
  <div
    v-if="!isLoggedIn"
    class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-red-200/60 p-3 sm:p-4 mb-4 flex items-center justify-between shadow-2xs"
  >
    <div class="flex items-center gap-3.5">
      <!-- Mascot Image Brand Official -->
      <div class="w-11 h-11 sm:w-12 sm:h-12 shrink-0 drop-shadow-sm flex items-center justify-center">
        <img
          src="/images/auth/intro_mascot.png"
          alt="BekasKu Mascot"
          width="48"
          height="48"
          class="w-full h-full object-contain pointer-events-none"
        />
      </div>

      <div>
        <h3 class="text-xs sm:text-sm font-bold text-text tracking-tight">
          Yuk, Masuk ke Akunmu!
        </h3>
        <p class="text-[11px] sm:text-xs text-text-muted line-clamp-1 sm:line-clamp-none">
          Dapatkan kemudahan chat penjual, tawar barang, dan simpan produk impianmu.
        </p>
      </div>
    </div>

    <button
      type="button"
      class="shrink-0 px-4 py-1.5 sm:py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
      @click="authModal.openLogin()"
    >
      Masuk
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'

const authStore = useAuthStore()
const authModal = useAuthModal()
const isLoggedIn = computed(() => authStore.isLoggedIn)
</script>
