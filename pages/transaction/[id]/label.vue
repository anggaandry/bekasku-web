<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTransactionDetail } from '~/composables/useTransactionDetail'
import TransactionHeader from '~/components/transaction/TransactionHeader.vue'
import { Printer, Download } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const transactionId = computed(() => String(route.params.id || ''))

useHead({
  title: 'Label Pengiriman — BekasKu',
  meta: [
    { name: 'description', content: 'Cetak dan unduh label pengiriman pesanan.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const {
  detail,
  labelUrl,
  isLoading,
  errorMessage,
  fetchDetail,
  fetchShippingLabel,
} = useTransactionDetail(transactionId)

onMounted(async () => {
  if (authStore.isLoggedIn && transactionId.value) {
    await fetchDetail()
    await fetchShippingLabel()
  }
})

function handlePrint() {
  const iframe = document.getElementById('full-label-frame') as HTMLIFrameElement | null
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.print()
  } else if (labelUrl.value) {
    window.open(labelUrl.value, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <TransactionHeader title="Label Pengiriman" :show-actions="false" />

    <main class="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6">
      <!-- Top Action Bar -->
      <div class="bg-white rounded-xl border border-border p-4 mb-4 flex items-center justify-between">
        <div>
          <h2 class="font-outfit font-bold text-base text-text">
            Label Pengiriman
          </h2>
          <p class="font-outfit text-xs text-text-muted">
            {{ detail?.invoice_no }} <span v-if="detail?.waybill">&bull; Resi: {{ detail?.waybill }}</span>
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="!labelUrl"
            class="px-4 py-2 rounded-xl border border-border hover:border-primary text-xs font-outfit font-semibold text-text hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            @click="handlePrint"
          >
            <Printer class="w-4 h-4" />
            <span>Cetak Resi</span>
          </button>

          <a
            v-if="labelUrl"
            :href="labelUrl"
            target="_blank"
            rel="noopener noreferrer"
            download
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-xs font-outfit font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download class="w-4 h-4" />
            <span>Unduh PDF</span>
          </a>
        </div>
      </div>

      <!-- Iframe or Loading/Error -->
      <div class="flex-1 bg-white rounded-xl border border-border min-h-[600px] overflow-hidden flex flex-col items-center justify-center">
        <div v-if="isLoading" class="text-center p-8">
          <div class="inline-block animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-2"></div>
          <p class="font-outfit text-xs text-text-muted">Memuat label pengiriman...</p>
        </div>

        <div v-else-if="errorMessage || !labelUrl" class="text-center p-8">
          <p class="font-outfit text-sm text-text-muted mb-4">
            {{ errorMessage || 'Tautan label pengiriman tidak tersedia' }}
          </p>
          <NuxtLink
            :to="`/transaction/${transactionId}`"
            class="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-outfit font-semibold hover:bg-primary-dark transition-colors"
          >
            Kembali ke Pesanan
          </NuxtLink>
        </div>

        <iframe
          v-else
          id="full-label-frame"
          :src="labelUrl"
          class="w-full flex-1 border-none min-h-[600px]"
          title="Pratinjau Label Pengiriman"
        />
      </div>
    </main>
  </div>
</template>

