<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F9F9F9]" />
</template>

<script setup lang="ts">
definePageMeta({
  pageTransition: false,
})

const route = useRoute()

await navigateTo(
  {
    path: '/search/result',
    query: route.query,
  },
  { redirectCode: 301, replace: true },
)
</script>
