<template>
  <div
    v-if="!isLoggedIn"
    class="rounded-lg bg-[#F5F5F5] px-3 py-3 md:px-4 md:py-3.5 mb-3 flex items-center justify-between gap-3"
  >
    <div class="min-w-0 flex-1">
      <h3 class="text-sm font-semibold text-[#0A0A0A] leading-snug">
        Yuk masuk dulu
      </h3>
      <p class="text-xs font-normal text-[#404040] mt-1 leading-relaxed">
        Masuk atau daftar dulu biar kamu bisa nikmatin semua fitur.
      </p>
    </div>

    <button
      type="button"
      class="shrink-0 h-9 px-3.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors active:scale-95 cursor-pointer"
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
