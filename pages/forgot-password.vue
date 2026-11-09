<script setup lang="ts">
import { useAuthModal } from '~/composables/useAuthModal'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

useHead({
  title: 'Lupa Kata Sandi — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Pulihkan dan atur ulang kata sandi akun BekasKu Anda melalui verifikasi OTP Email, WhatsApp, atau SMS.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authModal = useAuthModal()

onMounted(() => {
  authModal.closeModal()
  authModal.switchToStep('forgot-request')
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

