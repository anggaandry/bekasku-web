<script setup lang="ts">
import { useAuthModal, sanitizeRedirectPath } from '~/composables/useAuthModal'
import { useAuthStore } from '~/stores/auth'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

useHead({
  title: 'Daftar Akun Baru — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Daftar akun BekasKu gratis untuk mulai jual beli barang bekas berkualitas dengan jaminan Rekber Aman.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
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
  authModal.switchToStep('register-email')
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

