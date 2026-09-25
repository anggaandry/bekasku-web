<template>
  <div class="min-h-screen flex flex-col bg-[#f4f4f4] text-[#1a1a1a]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()

onMounted(() => {
  cartStore.initFromStorage()
  authStore.initFromStorage()
})
</script>

<style scoped>
/* Base layout styles */
</style>
