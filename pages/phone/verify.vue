<script setup lang="ts">
import { useAuthModal, sanitizeRedirectPath } from '~/composables/useAuthModal'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

useHead({
  title: 'Verifikasi Nomor Handphone — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Verifikasi nomor handphone akun BekasKu Anda menggunakan kode OTP WhatsApp atau SMS.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const authModal = useAuthModal()

onMounted(() => {
  authModal.closeModal()
  const redirect = sanitizeRedirectPath(route.query.redirect) || '/'
  authModal.redirectPath.value = redirect
  authModal.switchToStep('phone-verify')
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

