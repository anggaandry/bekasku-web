<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute()

await navigateTo(
  {
    path: '/search/result',
    query: route.query,
  },
  { redirectCode: 301, replace: true }
)
</script>

