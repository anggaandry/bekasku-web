<script setup lang="ts">
const route = useRoute()
const transactionId = computed(() => route.params.id as string)

onMounted(() => {
  if (transactionId.value) {
    const queryParams = new URLSearchParams()
    queryParams.set('id', transactionId.value)
    for (const [k, v] of Object.entries(route.query)) {
      if (v) queryParams.set(k, String(v))
    }
    navigateTo(`/transaction?${queryParams.toString()}`, { replace: true })
  } else {
    navigateTo('/transaction', { replace: true })
  }
})
</script>

<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-4">
    <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
</template>
