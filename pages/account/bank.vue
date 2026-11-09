<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/account?tab=bank')
    },
  ],
})

useHead({
  title: 'Rekening Bank — BekasKu',
  meta: [
    { name: 'description', content: 'Kelola rekening bank untuk penarikan saldo penjualan di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-bg" />
</template>

