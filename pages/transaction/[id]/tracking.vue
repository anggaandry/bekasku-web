<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTransactionTracking } from '~/composables/useTransactionTracking'
import TransactionHeader from '~/components/transaction/TransactionHeader.vue'
import TrackingTimeline from '~/components/transaction/TrackingTimeline.vue'

const route = useRoute()
const authStore = useAuthStore()

const transactionId = computed(() => String(route.params.id || ''))
const isReturn = computed(() => route.path.includes('return'))

useHead({
  title: 'Status Pengiriman — BekasKu',
  meta: [
    { name: 'description', content: 'Lacak riwayat pengiriman pesanan Anda.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const {
  tracking,
  isLoading,
  errorMessage,
  fetchTracking,
} = useTransactionTracking(transactionId, isReturn.value)

onMounted(async () => {
  if (authStore.isLoggedIn && transactionId.value) {
    await fetchTracking()
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <TransactionHeader title="Status Pengiriman" :show-actions="false" />

    <main class="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div v-if="isLoading" class="py-12 text-center">
        <div class="inline-block animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-2"></div>
        <p class="font-outfit text-xs text-text-muted">Memuat informasi pelacakan...</p>
      </div>

      <div
        v-else-if="errorMessage || !tracking"
        class="bg-white rounded-xl border border-border p-8 text-center"
      >
        <p class="font-outfit text-sm text-text-muted mb-4">
          {{ errorMessage || 'Informasi pelacakan tidak tersedia' }}
        </p>
        <NuxtLink
          :to="`/transaction/${transactionId}`"
          class="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-outfit font-semibold hover:bg-primary-dark transition-colors"
        >
          Kembali ke Rincian Pesanan
        </NuxtLink>
      </div>

      <TrackingTimeline
        v-else
        :tracking="tracking"
        :is-return="isReturn"
      />
    </main>
  </div>
</template>

