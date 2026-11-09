<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/bekasku-plus', { redirectCode: 301 })
    },
  ],
})

await navigateTo('/bekasku-plus', { redirectCode: 301 })
</script>

<template>
  <div class="min-h-screen bg-surface-2 flex items-center justify-center p-6">
    <div class="text-center text-xs text-text-muted">
      Mengalihkan ke halaman resmi BekasKu+...
    </div>
  </div>
</template>
