<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Sundul Produk — BekasKu',
})

onMounted(() => {
  navigateTo('/seller/promotion', { replace: true })
})
</script>

<template>
  <div class="min-h-screen bg-surface-2 flex items-center justify-center p-4">
    <div class="text-xs text-text-muted">
      Mengalihkan ke Pusat Promosi BekasKu...
    </div>
  </div>
</template>
