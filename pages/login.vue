<script setup lang="ts">
import { useAuthModal, sanitizeRedirectPath } from '~/composables/useAuthModal'
import { useAuthStore } from '~/stores/auth'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

useHead({
  title: 'Masuk ke Akun — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Masuk ke akun BekasKu Anda menggunakan email, nomor handphone, Google, atau Apple ID.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()

onMounted(() => {
  authModal.closeModal()
  const redirect = sanitizeRedirectPath(route.query.redirect) || '/'
  if (authStore.isLoggedIn) {
    navigateTo(redirect)
    return
  }
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

