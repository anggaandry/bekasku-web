<script setup lang="ts">
import { useAuthModal, sanitizeRedirectPath } from '~/composables/useAuthModal'
import { useAuthStore } from '~/stores/auth'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

useHead({
  title: 'Selamat Datang di BekasKu — Jual Beli Barang Bekas Aman',
  meta: [
    {
      name: 'description',
      content: 'Jelajahi ribuan barang bekas berkualitas dengan harga terbaik dan jaminan 100% Rekber Aman di BekasKu.',
    },
  ],
})

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()

onMounted(() => {
  authModal.closeModal()
  if (authStore.isLoggedIn) {
    navigateTo('/')
    return
  }
  const redirect = sanitizeRedirectPath(route.query.redirect) || '/'
  authModal.redirectPath.value = redirect
  authModal.switchToStep('login')
  authModal.refreshOtpMethods()
})
</script>

<template>
  <div class="flex-1 flex flex-col justify-between">
    <main class="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <AuthUnifiedCard />
    </main>
  </div>
</template>

