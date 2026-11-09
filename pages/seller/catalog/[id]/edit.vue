<script setup lang="ts">
const route = useRoute()
const productId = String(route.params.id || '')

if (import.meta.client) {
  navigateTo(`/post/sell?edit=${encodeURIComponent(productId)}`, { replace: true })
}
</script>

<template>
  <div />
</template>

