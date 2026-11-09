<script setup lang="ts">
const route = useRoute()
const transactionId = computed(() => route.params.id as string)

onMounted(() => {
  if (transactionId.value) {
    if (window.innerWidth >= 1024) {
      navigateTo(`/transaction?id=${transactionId.value}&open_meet=true`, { replace: true })
    } else {
      navigateTo(`/transaction/${transactionId.value}?open_meet=true`, { replace: true })
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-4">
    <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
</template>
