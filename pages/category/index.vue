<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <Loader2 class="w-8 h-8 text-primary animate-spin" />
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useCategories } from '~/composables/useCategories'

useHead({
  title: 'Semua Kategori — BekasKu',
  meta: [
    { name: 'description', content: 'Jelajahi semua kategori produk bekas dan preloved berkualitas di BekasKu.' },
    { name: 'robots', content: 'noindex, follow' },
  ],
})

const route = useRoute()
const { fetchCategories } = useCategories()

const list = await fetchCategories()
const firstId = list[0]?.id || list[0]?._id || 'all'
await navigateTo({ path: `/kategori/${firstId}`, query: route.query }, { replace: true })
</script>

