<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  Crown,
  Sparkles,
  Package,
  Receipt,
  Loader2,
  RotateCw,
} from 'lucide-vue-next'
import { usePaymentDetail } from '~/composables/usePaymentDetail'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'
import PaymentLogo from '~/components/payment/PaymentLogo.vue'
import PaymentHelpBanner from '~/components/payment/PaymentHelpBanner.vue'
import PaymentCancelReasonModal from '~/components/payment/PaymentCancelReasonModal.vue'
import { useHelpChatStore } from '~/stores/helpChat'

import { toSafeString } from '~/utils/inputGuard'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const paymentId = computed(() => toSafeString(route.params.id, 50))

useHead({
  title: 'Detail Pesanan — BekasKu',
  meta: [
    { name: 'description', content: 'Detail tagihan dan rincian pesanan di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { formatPrice } = useFormat()
const {
  loading,
  checkingStatus,
  error,
  data,
  isPaid,
  isUnpaid,
  isDigitalOrder,
  isActionLoading,
  fetchDetail,
  checkStatus,
  cancelPayment,
} = usePaymentDetail(paymentId)

const showCancelModal = ref(false)
const copiedInvoice = ref(false)
const helpChatStore = useHelpChatStore()

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/transaction')
  }
}

function copyInvoice() {
  if (!data.value?.invoice_no) return
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(data.value.invoice_no)
    copiedInvoice.value = true
    setTimeout(() => {
      copiedInvoice.value = false
    }, 2000)
  }
}

function goToDashboard() {
  navigateTo(`/payment/${paymentId.value}`)
}

function handleHelpCenterClick() {
  const inv = data.value?.invoice_no
  const text = inv
    ? `Halo Bekasku Center, saya butuh bantuan seputar pembayaran nomor tagihan ${inv}`
    : 'Halo Bekasku Center, saya butuh bantuan seputar pembayaran di BekasKu'
  helpChatStore.openHelpChat({
    topic: 'payment',
    referenceId: paymentId.value,
    referenceTitle: inv ? `Tagihan #${inv}` : 'Detail Tagihan Pembayaran',
    initialMessage: text,
  })
}

async function handleCancelWithReason(reason: string) {
  const success = await cancelPayment(reason)
  if (success) {
    showCancelModal.value = false
  }
}

// Background & text color status banner
const statusBgClass = computed(() => {
  if (isPaid.value) return 'bg-emerald-50 text-emerald-600'
  const name = (data.value?.status?.name || '').toLowerCase()
  if (name.includes('batal') || name.includes('kadaluarsa')) {
    return 'bg-orange-50 text-orange-600'
  }
  return 'bg-blue-50 text-blue-600'
})
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col font-outfit">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white border-b border-border shadow-2xs">
      <div class="max-w-2xl mx-auto h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 class="text-base sm:text-lg font-bold text-text truncate">
          Detail Pesanan
        </h1>

        <div class="w-9" />
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-2xl w-full mx-auto pb-28">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="py-20 flex flex-col items-center justify-center text-center space-y-3"
      >
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <p class="text-xs sm:text-sm text-text-muted">
          Memuat rincian pesanan...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error || !data"
        class="m-4 py-16 bg-white rounded-3xl border border-border p-6 text-center space-y-4"
      >
        <div
          class="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center"
        >
          <AlertTriangle class="w-7 h-7 stroke-[2]" />
        </div>
        <div>
          <h2 class="text-base font-bold text-text">Gagal Memuat Pesanan</h2>
          <p class="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
            {{ error || 'Data pesanan tidak ditemukan.' }}
          </p>
        </div>
        <button
          type="button"
          class="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          @click="fetchDetail"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Detail Pesanan Content -->
      <template v-else>
        <!-- 1. Status Banner -->
        <div
          class="w-full py-3 px-4 sm:px-6 flex items-center justify-between text-xs sm:text-sm font-semibold select-none border-b border-border/40"
          :class="statusBgClass"
        >
          <span>{{ data.status?.name || 'Status Pembayaran' }}</span>
          <span
            v-if="data.cancel_date && !isPaid"
            class="text-[11px] sm:text-xs font-medium text-danger"
          >
            {{ data.cancel_date }}
          </span>
        </div>

        <div class="bg-white border-b border-border">
          <!-- 2. Invoice Info -->
          <div class="p-4 sm:p-5 space-y-2.5">
            <div class="flex items-center justify-between text-xs sm:text-sm">
              <span class="font-mono font-bold text-text truncate">
                {{ data.invoice_no }}
              </span>
              <button
                type="button"
                class="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors"
                @click="copyInvoice"
              >
                <Check v-if="copiedInvoice" class="w-3.5 h-3.5 stroke-[2.5]" />
                <Copy v-else class="w-3.5 h-3.5 stroke-[2]" />
                <span>{{ copiedInvoice ? 'Tersalin' : 'Salin' }}</span>
              </button>
            </div>

            <div class="flex items-center justify-between text-xs text-text-muted">
              <span>Tanggal Pembelian</span>
              <span class="font-medium text-text">{{ data.buy_date }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Rincian Pesanan / Paket Digital -->
        <div class="mt-2 bg-white border-y border-border">
          <!-- A. Transaksi Barang Fisik (orders ada) -->
          <template v-if="data.orders && data.orders.length > 0">
            <div
              v-for="(order, sIdx) in data.orders"
              :key="sIdx"
              class="divide-y divide-border/60"
            >
              <div class="p-4 sm:p-5 space-y-3">
                <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  PESANAN {{ sIdx + 1 }}
                </p>

                <!-- Seller Info Bar -->
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full bg-surface-3 overflow-hidden shrink-0"
                  >
                    <img
                      v-if="order.seller_avatar"
                      :src="sanitizeMediaUrl(order.seller_avatar)"
                      :alt="order.seller_name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-xs font-bold text-text-muted"
                    >
                      {{ (order.seller_name || 'B').charAt(0).toUpperCase() }}
                    </div>
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs sm:text-sm font-bold text-primary truncate">
                      {{ order.seller_name || 'Penjual BekasKu' }}
                    </p>
                    <p v-if="order.seller_city" class="text-[11px] text-text-muted truncate">
                      {{ order.seller_city }}
                    </p>
                  </div>
                </div>

                <!-- Products in this Order -->
                <div class="space-y-3 pt-1">
                  <div
                    v-for="(prod, pIdx) in order.products || []"
                    :key="pIdx"
                    class="flex items-start gap-3"
                  >
                    <div
                      class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-2 border border-border-light overflow-hidden shrink-0"
                    >
                      <img
                        v-if="prod.product_image"
                        :src="sanitizeMediaUrl(prod.product_image)"
                        :alt="prod.product_title"
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-else
                        class="w-full h-full flex items-center justify-center text-text-subtle"
                      >
                        <Package class="w-6 h-6 stroke-[1.8]" />
                      </div>
                    </div>

                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-medium text-text line-clamp-2 leading-snug">
                        {{ prod.product_title || 'Produk' }}
                      </p>
                      <div class="mt-2 flex items-center justify-between">
                        <span class="text-xs sm:text-sm font-bold text-text tabular-nums">
                          {{ formatPrice(prod.product_price || 0) }}
                        </span>
                        <span class="text-xs font-semibold text-primary">
                          x {{ prod.total_product || 1 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Shipping Info per order -->
                <div
                  v-if="order.shipping"
                  class="mt-3 pt-3 border-t border-border-light text-xs space-y-1"
                >
                  <p class="text-[11px] font-bold text-text-muted uppercase">
                    INFORMASI PENGIRIMAN
                  </p>
                  <p class="font-semibold text-text">
                    {{ order.shipping.name }} - {{ order.shipping.description }}
                  </p>
                  <p v-if="order.shipping.price != null" class="text-text-muted">
                    {{ formatPrice(order.shipping.price) }} •
                    {{ order.shipping.est || '1-3' }} hari
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- B. Layanan Digital (Subscription VIP / Promosi Iklan) -->
          <template v-else>
            <div class="p-4 sm:p-5 space-y-3">
              <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                RINCIAN PAKET
              </p>

              <div
                class="p-4 rounded-2xl bg-white border border-border-light shadow-2xs space-y-3"
              >
                <!-- Paket Langganan VIP -->
                <div
                  v-if="data.type_subscribe"
                  class="flex items-center gap-3"
                >
                  <div
                    class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-[#EBAD25] flex items-center justify-center shrink-0"
                  >
                    <Crown class="w-6 h-6 stroke-[2]" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs sm:text-sm font-bold text-text truncate">
                      Paket Langganan {{ (data.type_subscribe || '').toUpperCase() }}
                    </p>
                    <p class="text-xs text-text-muted mt-0.5">
                      Durasi aktif: {{ data.days || data.subscribe_days || 30 }} Hari
                    </p>
                  </div>
                  <span class="text-xs sm:text-sm font-bold text-primary tabular-nums">
                    {{ formatPrice(data.total_order) }}
                  </span>
                </div>

                <!-- Paket Promosi Iklan -->
                <div v-else class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0"
                  >
                    <Sparkles class="w-6 h-6 stroke-[2]" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs sm:text-sm font-bold text-text truncate">
                      Paket Promosi {{ (data.promotion_type || 'Sundul').toUpperCase() }}
                    </p>
                    <p class="text-xs text-text-muted mt-0.5">
                      Durasi: {{ data.promotion_days || 7 }} Hari • Kuota:
                      {{ data.promotion_quota || 1 }}
                    </p>
                  </div>
                  <span class="text-xs sm:text-sm font-bold text-primary tabular-nums">
                    {{ formatPrice(data.total_order) }}
                  </span>
                </div>

                <!-- Preview Produk Promosi (jika ada) -->
                <div
                  v-if="data.is_promotion && data.product_title"
                  class="pt-3 border-t border-border-light flex items-center gap-2.5"
                >
                  <div
                    class="w-9 h-9 rounded-lg bg-surface-2 overflow-hidden shrink-0"
                  >
                    <img
                      v-if="data.product_image"
                      :src="sanitizeMediaUrl(data.product_image)"
                      :alt="data.product_title"
                      class="w-full h-full object-cover"
                    />
                    <Package v-else class="w-5 h-5 text-text-subtle m-auto" />
                  </div>
                  <div class="min-w-0 flex-1 text-xs">
                    <p class="text-[11px] text-text-muted">
                      Produk yang Dipromosikan:
                    </p>
                    <p class="font-medium text-text truncate">
                      {{ data.product_title }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 4. Informasi Alamat Pengiriman / Ketemuan (jika fisik) -->
        <div
          v-if="data.orders && data.orders.length > 0 && data.orders[0]?.address"
          class="mt-2 bg-white border-y border-border p-4 sm:p-5 space-y-2 text-xs sm:text-sm"
        >
          <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            {{ data.method === 0 ? 'KETEMUAN LANGSUNG' : 'ALAMAT PENGIRIMAN' }}
          </p>

          <template v-if="data.method === 0">
            <p class="text-text leading-relaxed">
              Pastikan kamu sudah menghubungi penjual untuk mengatur jadwal
              ketemuan.
            </p>
          </template>

          <template v-else-if="data.orders[0].address">
            <p class="font-bold text-text">
              {{ data.orders[0].address.contact_name }}
            </p>
            <p class="text-text-muted">
              {{ data.orders[0].address.contact_phone }}
            </p>
            <p class="text-text-muted leading-relaxed">
              {{ data.orders[0].address.address }},
              {{ data.orders[0].address.subdistrict }},
              {{ data.orders[0].address.city }},
              {{ data.orders[0].address.province }}
            </p>
          </template>
        </div>

        <!-- 5. Metode Pembayaran -->
        <div
          v-if="data.payment_method"
          class="mt-2 bg-white border-y border-border p-4 sm:p-5 space-y-3"
        >
          <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            METODE PEMBAYARAN
          </p>

          <div class="flex items-center gap-3">
            <PaymentLogo
              :payment-name="data.payment_method.name || ''"
              :logo-url="data.payment_method.image || ''"
              :width="44"
              :height="28"
            />
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold text-text truncate">
                {{ data.payment_method.name }}
              </p>
              <p class="text-xs text-text-muted truncate">
                {{ data.payment_method.category_name }}
              </p>
            </div>
          </div>
        </div>

        <!-- 6. Ringkasan Finansial -->
        <div class="mt-2 bg-white border-y border-border p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
          <div class="flex justify-between text-text-muted">
            <span>Total Harga</span>
            <span class="font-medium text-text tabular-nums">
              {{ formatPrice(data.total_order_only || data.total_order) }}
            </span>
          </div>

          <div
            v-if="data.discount > 0"
            class="flex justify-between text-emerald-600 font-medium"
          >
            <span>Diskon Langganan</span>
            <span class="tabular-nums">-{{ formatPrice(data.discount) }}</span>
          </div>

          <div v-if="data.total_shipping > 0" class="flex justify-between text-text-muted">
            <span>Total Ongkos Kirim</span>
            <span class="font-medium text-text tabular-nums">
              {{ formatPrice(data.total_shipping) }}
            </span>
          </div>

          <div v-if="data.total_insurance > 0" class="flex justify-between text-text-muted">
            <span>Total Asuransi Pengiriman</span>
            <span class="font-medium text-text tabular-nums">
              {{ formatPrice(data.total_insurance) }}
            </span>
          </div>

          <div v-if="data.service_fee > 0" class="flex justify-between text-text-muted">
            <span>Biaya Layanan</span>
            <span class="font-medium text-text tabular-nums">
              {{ formatPrice(data.service_fee) }}
            </span>
          </div>

          <div v-if="data.payment_fee > 0" class="flex justify-between text-text-muted">
            <span>Biaya Pembayaran</span>
            <span class="font-medium text-text tabular-nums">
              {{ formatPrice(data.payment_fee) }}
            </span>
          </div>

          <div
            v-if="data.balance_use > 0"
            class="flex justify-between text-emerald-600 font-medium"
          >
            <span>Penggunaan Saldo</span>
            <span class="tabular-nums">-{{ formatPrice(data.balance_use) }}</span>
          </div>

          <div class="h-px bg-border/70 my-3" />

          <div class="flex justify-between items-center text-sm sm:text-base font-extrabold">
            <span class="text-text">Total Pembayaran</span>
            <span class="text-primary tabular-nums">
              {{ formatPrice(data.final_charge) }}
            </span>
          </div>
        </div>

        <!-- 7. Card Bantuan Bekasku Center (jika belum lunas) -->
        <div v-if="!isPaid" class="p-4 sm:p-5">
          <PaymentHelpBanner @click="handleHelpCenterClick" />
        </div>
      </template>
    </main>

    <!-- Bottom Action Bar (Jika status Menunggu Pembayaran) -->
    <footer
      v-if="data && isUnpaid && !loading && !error"
      class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-lg font-outfit"
    >
      <div class="max-w-2xl mx-auto p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          :disabled="isActionLoading || checkingStatus"
          class="w-24 sm:w-28 py-3 px-3 rounded-xl border border-danger hover:bg-danger/5 text-danger text-xs sm:text-sm font-semibold transition-colors cursor-pointer active:scale-98 text-center disabled:opacity-50"
          @click="showCancelModal = true"
        >
          Batalkan
        </button>

        <button
          type="button"
          :disabled="checkingStatus"
          class="flex-1 py-3 px-3 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-text text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 disabled:opacity-50 shadow-xs"
          @click="checkStatus(true)"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': checkingStatus }" />
          <span>Cek Status</span>
        </button>

        <button
          type="button"
          class="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer active:scale-98 text-center"
          @click="goToDashboard"
        >
          Bayar Sekarang
        </button>
      </div>
    </footer>

    <!-- Modal Alasan Batal Pembayaran -->
    <PaymentCancelReasonModal
      v-model="showCancelModal"
      :loading="isActionLoading"
      @confirm="handleCancelWithReason"
    />
  </div>
</template>

