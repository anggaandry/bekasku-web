<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  ArrowLeft,
  Copy,
  Check,
  Ban,
  CreditCard,
  AlertCircle,
  Package,
  Crown,
  Sparkles,
  MapPin,
  RotateCw,
} from 'lucide-vue-next'
import { usePaymentDetail } from '~/composables/usePaymentDetail'
import PaymentLogo from '~/components/payment/PaymentLogo.vue'
import PaymentHelpBanner from '~/components/payment/PaymentHelpBanner.vue'
import PaymentCancelReasonModal from '~/components/payment/PaymentCancelReasonModal.vue'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'
import { formatRupiah } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'
import { useHelpChatStore } from '~/stores/helpChat'

const props = withDefaults(
  defineProps<{
    paymentId: string
    isMobileOverlay?: boolean
  }>(),
  {
    isMobileOverlay: false,
  }
)

const emit = defineEmits<{
  pay: []
  paid: []
  cancelled: []
  close: []
}>()

const copied = ref(false)
const showCancelModal = ref(false)
const helpChatStore = useHelpChatStore()

const {
  loading,
  checkingStatus,
  error,
  data,
  isPaid,
  isUnpaid,
  isActionLoading,
  fetchDetail,
  checkStatus,
  cancelPayment,
  stopPolling,
} = usePaymentDetail(computed(() => props.paymentId), {
  onPaid: () => emit('paid'),
  onCancelled: () => emit('cancelled'),
})

watch(
  () => props.paymentId,
  (id) => {
    if (id) {
      fetchDetail()
    } else {
      stopPolling()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopPolling()
})

async function copyInvoice() {
  if (!data.value?.invoice_no) return
  try {
    await navigator.clipboard.writeText(data.value.invoice_no)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // ignore
  }
}

async function handleConfirmCancel(reason: string) {
  const ok = await cancelPayment(reason)
  if (ok) {
    showCancelModal.value = false
    emit('cancelled')
  }
}

function openBekaskuCenter() {
  const inv = data.value?.invoice_no
  const text = inv
    ? `Halo Bekasku Center, saya butuh bantuan seputar pembayaran nomor tagihan ${inv}`
    : 'Halo Bekasku Center, saya butuh bantuan seputar pembayaran di BekasKu'
  emit('close')
  helpChatStore.openHelpChat({
    topic: 'payment',
    referenceId: props.paymentId,
    referenceTitle: inv ? `Tagihan #${inv}` : 'Pembayaran BekasKu',
    initialMessage: text,
  })
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full bg-surface-2 font-outfit">
    <!-- Mobile Header if inside mobile overlay -->
    <div
      v-if="isMobileOverlay"
      class="sticky top-0 z-20 bg-white border-b border-border px-4 py-3 flex items-center justify-between shadow-2xs shrink-0"
    >
      <button
        type="button"
        class="flex items-center gap-2 text-text font-outfit font-semibold text-sm cursor-pointer"
        @click="emit('close')"
      >
        <ArrowLeft class="w-5 h-5 text-text" />
        <span>Detail Pembayaran</span>
      </button>
      <span v-if="data?.invoice_no" class="text-xs text-text-muted font-mono font-medium">
        {{ data.invoice_no }}
      </span>
    </div>

    <!-- Scrollable Body Content -->
    <div class="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 space-y-3 custom-scrollbar">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-3">
        <AppSkeleton class="w-full h-12 rounded-xl" />
        <AppSkeleton class="w-full h-24 rounded-2xl" />
        <AppSkeleton class="w-full h-36 rounded-2xl" />
        <AppSkeleton class="w-full h-24 rounded-2xl" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white border border-danger/20 rounded-2xl p-6 text-center space-y-3"
      >
        <AlertCircle class="w-8 h-8 text-danger mx-auto" />
        <p class="text-xs text-text-muted">
          {{ error }}
        </p>
        <button
          type="button"
          class="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
          @click="fetchDetail"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Content -->
      <template v-else-if="data">
        <!-- Status Header Banner -->
        <div
          v-if="data.status"
          class="rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-2xs"
          :style="{
            backgroundColor: data.status.back_color || '#DBEAFE',
            color: data.status.text_color || '#2563EB',
          }"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs sm:text-sm font-bold font-outfit truncate">
              {{ data.status.name }}
            </span>
            <button
              v-if="isUnpaid"
              type="button"
              :disabled="checkingStatus"
              class="p-1 rounded-md hover:bg-black/10 transition-colors cursor-pointer text-current disabled:opacity-50"
              title="Cek Status Pembayaran"
              aria-label="Cek Status Pembayaran"
              @click="checkStatus(true)"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': checkingStatus }" />
            </button>
          </div>
          <span v-if="data.cancel_date && !isPaid" class="text-xs font-medium text-danger shrink-0">
            {{ data.cancel_date }}
          </span>
        </div>

        <!-- Invoice Card -->
        <div class="bg-white border border-border-light rounded-2xl p-4 shadow-2xs space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-xs sm:text-sm font-bold text-text truncate font-mono">
                {{ data.invoice_no }}
              </span>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer shrink-0"
              @click="copyInvoice"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-success" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Tersalin' : 'Salin' }}</span>
            </button>
          </div>
          <div v-if="data.buy_date" class="flex items-center justify-between text-xs pt-2 border-t border-border-light">
            <span class="text-text-muted">Tanggal Pembelian</span>
            <span class="font-medium text-text">{{ data.buy_date }}</span>
          </div>
        </div>

        <!-- Item Orders per Seller (Physical Orders) -->
        <template v-if="data.orders && data.orders.length > 0">
          <div
            v-for="(order, idx) in data.orders"
            :key="idx"
            class="bg-white border border-border-light rounded-2xl p-4 shadow-2xs space-y-3"
          >
            <div class="text-[11px] font-bold tracking-wider text-text-muted uppercase">
              PESANAN {{ idx + 1 }}
            </div>

            <!-- Seller Info -->
            <div class="flex items-center gap-2.5 pb-2 border-b border-border-light">
              <div class="w-7 h-7 rounded-full bg-surface-2 border border-border-light overflow-hidden flex items-center justify-center shrink-0">
                <img
                  v-if="order.seller_avatar"
                  :src="sanitizeMediaUrl(order.seller_avatar)"
                  :alt="order.seller_name || 'Penjual BekasKu'"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-[11px] font-bold text-text-muted">
                  {{ (order.seller_name || 'B').charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-primary truncate">
                  {{ order.seller_name || 'Penjual BekasKu' }}
                </div>
                <div v-if="order.seller_city" class="text-[11px] text-text-muted truncate">
                  {{ order.seller_city }}
                </div>
              </div>
            </div>

            <!-- Product Items -->
            <div
              v-for="prod in order.products || []"
              :key="prod.id || prod.product_id || prod.product_title"
              class="flex items-start gap-3 pt-1"
            >
              <div class="w-14 h-14 rounded-xl bg-surface-2 border border-border-light overflow-hidden flex items-center justify-center shrink-0">
                <img
                  v-if="prod.product_image || (prod as any).image"
                  :src="sanitizeMediaUrl(prod.product_image || (prod as any).image)"
                  :alt="prod.product_title || (prod as any).title || 'Produk'"
                  class="w-full h-full object-cover"
                />
                <Package v-else class="w-5 h-5 text-text-subtle stroke-[1.8]" />
              </div>
              <div class="flex-1 min-w-0 space-y-1">
                <h4 class="text-xs font-semibold text-text line-clamp-2 leading-snug">
                  {{ prod.product_title || (prod as any).title || 'Produk' }}
                </h4>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-text font-outfit">
                    {{ formatRupiah(prod.product_price ?? (prod as any).price ?? 0) }}
                  </span>
                  <span class="text-xs font-bold text-primary">
                    x{{ prod.total_product ?? (prod as any).total ?? (prod as any).qty ?? 1 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Shipping Info -->
            <div v-if="order.shipping" class="pt-2 border-t border-border-light space-y-1">
              <div class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                INFORMASI PENGIRIMAN
              </div>
              <div class="text-xs font-semibold text-text">
                {{ order.shipping.name }}<span v-if="order.shipping.description"> - {{ order.shipping.description }}</span>
              </div>
              <div class="text-[11px] text-text-muted">
                {{ formatRupiah(order.shipping.price ?? 0) }}
                <span v-if="order.shipping.est || (order.shipping as any).etd"> • {{ order.shipping.est || (order.shipping as any).etd }}</span>
              </div>
            </div>

            <!-- Delivery Address / Ketemuan -->
            <div class="pt-2 border-t border-border-light space-y-1">
              <div class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                {{ data.method === 0 ? 'KETEMUAN LANGSUNG' : 'ALAMAT PENGIRIMAN' }}
              </div>
              <template v-if="data.method === 0">
                <p class="text-xs text-text leading-relaxed">
                  Pastikan kamu sudah menghubungi penjual untuk mengatur jadwal ketemuan.
                </p>
              </template>
              <template v-else-if="order.address">
                <div class="text-xs font-semibold text-text">
                  {{ order.address.contact_name || (order.address as any).name }}
                  <span v-if="order.address.contact_phone || (order.address as any).phone" class="font-normal text-text-muted ml-1">
                    ({{ order.address.contact_phone || (order.address as any).phone }})
                  </span>
                </div>
                <div class="text-[11px] text-text-muted leading-relaxed">
                  {{ [order.address.address, order.address.subdistrict, order.address.city, order.address.province].filter(Boolean).join(', ') }}
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Digital Order (Promotion / VIP Subscription) -->
        <div
          v-else-if="data.is_promotion || data.type_subscribe"
          class="bg-white border border-border-light rounded-2xl p-4 shadow-2xs space-y-3"
        >
          <div class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            RINCIAN PAKET
          </div>

          <!-- VIP Subscription -->
          <div v-if="data.type_subscribe" class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Crown class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-bold text-text truncate">
                Paket Langganan {{ (data.type_subscribe || '').toLowerCase() === 'vvip' ? 'VIP' : (data.type_subscribe || 'VIP').toUpperCase() }}
              </p>
              <p class="text-xs text-text-muted mt-0.5">
                Durasi aktif: {{ data.days || data.subscribe_days || 30 }} Hari
              </p>
            </div>
            <span class="text-xs sm:text-sm font-bold text-primary tabular-nums">
              {{ formatRupiah(data.total_order || data.final_charge || 0) }}
            </span>
          </div>

          <!-- Promotion -->
          <div v-else class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles class="w-6 h-6 stroke-[2]" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs sm:text-sm font-bold text-text truncate">
                  Paket Promosi {{ (data.promotion_type || 'Sundul').toUpperCase() }}
                </p>
                <p class="text-xs text-text-muted mt-0.5">
                  Durasi: {{ data.promotion_days || 7 }} Hari • Kuota: {{ data.promotion_quota || 1 }} Slot
                </p>
              </div>
              <span class="text-xs sm:text-sm font-bold text-primary tabular-nums">
                {{ formatRupiah(data.total_order || data.final_charge || 0) }}
              </span>
            </div>

            <!-- Promoted Product Info (if linked to a specific product) -->
            <div
              v-if="data.product_title"
              class="pt-2.5 border-t border-border-light flex items-center gap-2.5"
            >
              <div class="w-9 h-9 rounded-lg bg-surface-2 border border-border-light overflow-hidden flex items-center justify-center shrink-0">
                <img
                  v-if="data.product_image"
                  :src="sanitizeMediaUrl(data.product_image)"
                  :alt="data.product_title"
                  class="w-full h-full object-cover"
                />
                <Package v-else class="w-4 h-4 text-text-subtle" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-medium text-text-muted">
                  Produk yang Dipromosikan:
                </p>
                <p class="text-xs font-semibold text-text truncate">
                  {{ data.product_title }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Section -->
        <div v-if="data.payment_method" class="bg-white border border-border-light rounded-2xl p-4 shadow-2xs space-y-2">
          <div class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            METODE PEMBAYARAN
          </div>
          <div class="flex items-center gap-3">
            <PaymentLogo
              :logo-url="data.payment_method.image || (data.payment_method as any).logo || ''"
              :payment-name="data.payment_method.name || 'Metode Pembayaran'"
              :width="44"
              :height="28"
            />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-text truncate">
                {{ data.payment_method.name }}
              </div>
              <div v-if="data.payment_method.category_name || (data.payment_method as any).category" class="text-[11px] text-text-muted">
                {{ data.payment_method.category_name || (data.payment_method as any).category }}
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div class="bg-white border border-border-light rounded-2xl p-4 shadow-2xs space-y-2 text-xs">
          <div class="flex items-center justify-between text-text-muted">
            <span>Total Harga</span>
            <span class="font-semibold text-text">
              {{ formatRupiah(data.total_order_only ?? data.total_order ?? (data as any).total_price ?? data.final_charge ?? 0) }}
            </span>
          </div>
          <div v-if="data.discount && data.discount > 0" class="flex items-center justify-between text-emerald-600 font-medium">
            <span>Diskon Langganan</span>
            <span class="tabular-nums">-{{ formatRupiah(data.discount) }}</span>
          </div>
          <div v-if="data.total_shipping && data.total_shipping > 0" class="flex items-center justify-between text-text-muted">
            <span>Total Ongkos Kirim</span>
            <span class="font-semibold text-text">{{ formatRupiah(data.total_shipping) }}</span>
          </div>
          <div v-if="data.total_insurance && data.total_insurance > 0" class="flex items-center justify-between text-text-muted">
            <span>Total Asuransi Pengiriman</span>
            <span class="font-semibold text-text">{{ formatRupiah(data.total_insurance) }}</span>
          </div>
          <div v-if="data.service_fee && data.service_fee > 0" class="flex items-center justify-between text-text-muted">
            <span>Biaya Layanan</span>
            <span class="font-semibold text-text">{{ formatRupiah(data.service_fee) }}</span>
          </div>
          <div v-if="data.payment_fee && data.payment_fee > 0" class="flex items-center justify-between text-text-muted">
            <span>Biaya Pembayaran</span>
            <span class="font-semibold text-text">{{ formatRupiah(data.payment_fee) }}</span>
          </div>
          <div v-if="data.balance_use && data.balance_use > 0" class="flex items-center justify-between text-emerald-600 font-medium">
            <span>Penggunaan Saldo</span>
            <span class="tabular-nums">-{{ formatRupiah(data.balance_use) }}</span>
          </div>
          <div class="pt-2 border-t border-border-light flex items-center justify-between">
            <span class="font-bold text-text text-xs sm:text-sm">Total Pembayaran</span>
            <span class="font-bold text-primary text-sm sm:text-base font-outfit">
              {{ formatRupiah(data.final_charge ?? (data as any).total_payment ?? 0) }}
            </span>
          </div>
        </div>

        <!-- Support Banner -->
        <PaymentHelpBanner @click="openBekaskuCenter" />
      </template>
    </div>

    <!-- Sticky Bottom Actions -->
    <div
      v-if="!loading && data"
      class="sticky bottom-0 z-10 bg-white border-t border-border p-3 flex items-center gap-2 shadow-lg shrink-0"
    >
      <!-- Tombol Batalkan (Jika Unpaid) -->
      <button
        v-if="isUnpaid"
        type="button"
        :disabled="isActionLoading || checkingStatus"
        class="w-24 sm:w-28 h-11 px-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs sm:text-sm font-outfit font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        @click="showCancelModal = true"
      >
        <Ban class="w-4 h-4 shrink-0" />
        <span>Batalkan</span>
      </button>

      <!-- Tombol Cek Status (Jika Unpaid) -->
      <button
        v-if="isUnpaid"
        type="button"
        :disabled="checkingStatus"
        class="flex-1 h-11 px-2.5 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-text text-xs sm:text-sm font-outfit font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        @click="checkStatus(true)"
      >
        <RotateCw class="w-4 h-4 shrink-0" :class="{ 'animate-spin': checkingStatus }" />
        <span>Cek Status</span>
      </button>

      <!-- Tombol Bayar Sekarang (Jika Unpaid) -> Buka PaymentDashboardModal -->
      <button
        v-if="isUnpaid"
        type="button"
        class="flex-1 h-11 px-3 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs sm:text-sm font-outfit font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        @click="emit('pay')"
      >
        <CreditCard class="w-4 h-4 shrink-0" />
        <span>Bayar Sekarang</span>
      </button>
    </div>

    <!-- Modal Konfirmasi Batalkan -->
    <PaymentCancelReasonModal
      v-model="showCancelModal"
      :loading="isActionLoading"
      @confirm="handleConfirmCancel"
    />
  </div>
</template>

