<template>
  <div class="min-h-screen bg-surface-2" />
</template>

<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  const hasQuery = Boolean(route.query.q || route.query.category_id || route.query.type)
  if (hasQuery) {
    navigateTo({ path: '/search/result', query: route.query }, { replace: true })
  } else {
    navigateTo('/', { replace: true })
  }
})
</script>
