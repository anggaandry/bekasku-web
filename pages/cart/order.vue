<script setup lang="ts">
// Redirect /cart/order to /checkout
await navigateTo('/checkout', { redirectCode: 301, replace: true })
</script>

<template>
  <div class="p-8 text-center text-text-muted text-sm">
    Mengalihkan ke Checkout...
  </div>
</template>

