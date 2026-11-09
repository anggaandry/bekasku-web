<script setup lang="ts">
import AppSplashLoader from '~/components/shared/AppSplashLoader.vue'
import { useLocale } from '~/composables/useLocale'

const { locale } = useLocale()

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
})
</script>

<template>
  <div id="__nuxt_root">
    <!-- First Load Splash Screen with Red BekasKu Icon -->
    <AppSplashLoader />

    <NuxtLoadingIndicator color="#E31B23" :height="3" :duration="2000" :throttle="100" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
