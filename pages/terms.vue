<script setup lang="ts">
import TermsPageView from '~/components/static/TermsPageView.vue'

const route = useRoute()

if (String(route.query.tab || '').toLowerCase() === 'about') {
  await navigateTo('/about', { replace: true })
}
</script>

<template>
  <TermsPageView canonical-path="/policy/terms" />
</template>
