<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <Loader2 class="w-8 h-8 text-primary animate-spin" />
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

useHead({
  title: 'Kategori — BekasKu',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

const route = useRoute()
const targetId = String(route.params.id || 'all')
await navigateTo({ path: `/kategori/${targetId}`, query: route.query }, { replace: true })
</script>

