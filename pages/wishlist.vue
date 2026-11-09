<script setup lang="ts">
// Redirect /wishlist to /favorite
await navigateTo('/favorite', { redirectCode: 301, replace: true })
</script>

<template>
  <div class="p-8 text-center text-text-muted text-sm">
    Mengalihkan ke Wishlist...
  </div>
</template>

