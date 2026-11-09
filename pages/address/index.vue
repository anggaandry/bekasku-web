<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/account?tab=address')
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-bg" />
</template>

