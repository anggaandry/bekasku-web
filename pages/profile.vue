<script setup lang="ts">
// Redirect legacy /profile to /account
await navigateTo('/account', { redirectCode: 301, replace: true })
</script>

<template>
  <div class="p-8 text-center text-text-muted text-sm">
    Mengalihkan ke Pengaturan Akun...
  </div>
</template>

