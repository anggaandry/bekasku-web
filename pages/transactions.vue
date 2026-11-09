<script setup lang="ts">
// Redirect legacy /transactions to /transaction
const route = useRoute()
await navigateTo({ path: '/transaction', query: route.query }, { redirectCode: 301, replace: true })
</script>

<template>
  <div class="p-8 text-center text-text-muted text-sm">
    Mengalihkan ke Transaksi Saya...
  </div>
</template>

