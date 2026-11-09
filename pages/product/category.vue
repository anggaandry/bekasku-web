<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <Loader2 class="w-8 h-8 text-primary animate-spin" />
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useCategories } from '~/composables/useCategories'

useHead({
  title: 'Kategori Produk — BekasKu',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

const route = useRoute()
const { fetchCategories } = useCategories()

const catIdFromQuery = typeof route.query.category_id === 'string'
  ? route.query.category_id
  : typeof route.query.categoryId === 'string'
    ? route.query.categoryId
    : ''

if (catIdFromQuery) {
  await navigateTo({ path: `/kategori/${catIdFromQuery}`, query: route.query }, { replace: true })
} else {
  const list = await fetchCategories()
  const firstId = list[0]?.id || list[0]?._id || 'all'
  await navigateTo({ path: `/kategori/${firstId}`, query: route.query }, { replace: true })
}
</script>

