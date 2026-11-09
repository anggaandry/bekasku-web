<script setup lang="ts">
import { ArrowLeft, ChevronRight } from 'lucide-vue-next'
import { useCheckout } from '~/composables/useCheckout'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/composables/useFormat'
import type { ShippingServiceItem, CheckoutDraftSeller } from '~/types/checkout'
import CheckoutAddressSection from '~/components/checkout/CheckoutAddressSection.vue'
import CheckoutSellerCard from '~/components/checkout/CheckoutSellerCard.vue'
import CheckoutSummary from '~/components/checkout/CheckoutSummary.vue'
import ShippingChooseModal from '~/components/checkout/ShippingChooseModal.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'
import CheckoutWizardStep from '~/components/checkout/CheckoutWizardStep.vue'

useHead({
  title: 'Checkout - BekasKu',
  meta: [
    { name: 'description', content: 'Konfirmasi pesanan dan pengiriman barang di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const { formatPrice } = useFormat()
const router = useRouter()

const {
  draft,
  sellers,
  address,
  serviceFee,
  loading,
  error,
  totalProductPrice,
  totalShippingFee,
  totalShippingDiscount,
  totalInsuranceFee,
  totalCheckoutAmount,
  isOrderReady,
  initFromDraft,
  fetchOrderInit,
  setSellerShipping,
  toggleInsurance,
} = useCheckout()

const showShippingModal = ref(false)
const showAddressModal = ref(false)
const activeSellerForShipping = ref<CheckoutDraftSeller | null>(null)

// Total jumlah barang di seluruh seller
const totalProductCount = computed(() => {
  let count = 0
  for (const s of sellers.value) {
    for (const p of s.products) count += p.total_product || 1
  }
  return count
})

const isMeet = computed(() => draft.value?.transactionMethod === 0)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    navigateTo('/cart')
    return
  }

  const hasDraft = initFromDraft()
  if (!hasDraft) {
    navigateTo('/cart')
    return
  }

  await fetchOrderInit()
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/cart')
  }
}

function openShippingPicker(seller: CheckoutDraftSeller) {
  if (!address.value?.address && !isMeet.value) {
    showAddressModal.value = true
    return
  }
  activeSellerForShipping.value = seller
  showShippingModal.value = true
}

function handleShippingSelected(shipping: ShippingServiceItem) {
  if (activeSellerForShipping.value) {
    setSellerShipping(activeSellerForShipping.value.seller_id, shipping)
  }
}

function handleAddressSelected(newAddress: Record<string, unknown>) {
  if (newAddress) {
    address.value = {
      address_name: String(newAddress.address_name || ''),
      contact_name: String(newAddress.contact_name || newAddress.name || ''),
      contact_phone: String(newAddress.contact_phone || newAddress.phone || ''),
      address: String(newAddress.address || ''),
      address_note: newAddress.address_note ? String(newAddress.address_note) : undefined,
      city: String(newAddress.city || ''),
      province: String(newAddress.province || ''),
      postal: String(newAddress.postal || ''),
      subdistrict: String(newAddress.subdistrict || ''),
      subdistrict_id: String(newAddress.subdistrict_id || ''),
      city_id: String(newAddress.city_id || ''),
      lat: newAddress.lat as string | number | undefined,
      lon: newAddress.lon as string | number | undefined,
    }
  }
  showAddressModal.value = false
}

function proceedToPayment() {
  if (!isOrderReady.value) return
  navigateTo('/checkout/payment')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <!-- Header Mobile (<md) Sesuai Gambar 1 "Checkout" -->
    <div class="md:hidden bg-white border-b border-border sticky top-0 z-30">
      <div class="px-4 h-14 flex items-center gap-2.5">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
          aria-label="Kembali ke keranjang"
          @click="goBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-text font-outfit">
          Checkout
        </h1>
      </div>
    </div>

    <!-- Main Content Container -->
    <main class="flex-1 pb-28 md:pb-16">
      <!-- Step Wizard Minimalis untuk Alur Checkout (Desktop md+) -->
      <CheckoutWizardStep :current-step="2" />

      <!-- Container 2 Kolom di Desktop -->
      <div class="max-w-[1200px] mx-auto px-4 py-2 sm:py-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Kolom Kiri: Alamat + Daftar Penjual -->
          <div class="lg:col-span-8 space-y-4">
            <!-- 1. Alamat Pengiriman (Hanya mode kurir) -->
            <div v-if="!isMeet" class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
              <CheckoutAddressSection
                :address="address"
                @change="showAddressModal = true"
              />
            </div>

            <!-- Notice Ketemuan Langsung jika COD -->
            <div v-else class="bg-white rounded-2xl border border-border p-4 shadow-2xs">
              <h3 class="text-xs font-bold text-text-muted tracking-wider uppercase mb-1">
                Metode Transaksi
              </h3>
              <p class="text-sm font-semibold text-text">
                Pay & Pick (Temu Langsung / COD)
              </p>
              <p class="text-xs text-text-muted mt-1 leading-relaxed">
                Pembayaran dilakukan langsung saat bertemu penjual dan memeriksa kondisi barang.
              </p>
            </div>

            <!-- 2. Kartu Pesanan per Penjual -->
            <div class="space-y-4">
              <CheckoutSellerCard
                v-for="seller in sellers"
                :key="seller.seller_id"
                :seller="seller"
                :has-address="Boolean(address?.address)"
                :is-meet-transaction="isMeet"
                @select-shipping="openShippingPicker(seller)"
                @toggle-insurance="toggleInsurance(seller.seller_id)"
              />
            </div>

            <!-- Ringkasan Pemesanan versi Mobile di dalam flow (Sesuai Gambar 1 & 4) -->
            <div class="md:hidden bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3">
              <h3 class="text-sm font-bold text-text">
                Ringkasan Pemesanan
              </h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between text-text">
                  <span>Total harga ({{ totalProductCount }})</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalProductPrice) }}</span>
                </div>
                <div v-if="!isMeet && totalShippingFee > 0" class="flex justify-between text-text">
                  <span>Biaya Ongkir</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalShippingFee) }}</span>
                </div>
                <div v-if="totalShippingDiscount > 0" class="flex justify-between text-primary">
                  <span>Diskon Ongkir</span>
                  <span class="font-semibold tabular-nums">-{{ formatPrice(totalShippingDiscount) }}</span>
                </div>
                <div v-if="totalInsuranceFee > 0" class="flex justify-between text-text">
                  <span>Asuransi Pengiriman</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(totalInsuranceFee) }}</span>
                </div>
                <div class="flex justify-between text-text">
                  <span>Biaya Layanan</span>
                  <span class="font-semibold tabular-nums">{{ formatPrice(serviceFee) }}</span>
                </div>
                <div class="pt-2 border-t border-border flex justify-between text-sm font-bold text-text">
                  <span>Total Pemesanan</span>
                  <span class="tabular-nums">{{ formatPrice(totalCheckoutAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan (Desktop lg+): Sticky Summary Card -->
          <div class="hidden lg:block lg:col-span-4 sticky top-20">
            <CheckoutSummary
              :total-product-price="totalProductPrice"
              :total-product-count="totalProductCount"
              :total-shipping-fee="totalShippingFee"
              :total-shipping-discount="totalShippingDiscount"
              :total-insurance-fee="totalInsuranceFee"
              :service-fee="serviceFee"
              :total-checkout-amount="totalCheckoutAmount"
              :is-ready="isOrderReady"
              :is-meet="isMeet"
              :loading="loading"
              @proceed="proceedToPayment"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Bottom Bar Khusus Mobile (< lg) Sesuai Gambar 1 & 4 -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-md">
      <div class="px-4 py-3 flex items-center justify-between gap-3">
        <!-- Total Pembayaran Kiri -->
        <div class="flex flex-col">
          <span class="text-[11px] text-text-muted">Total Pembayaran</span>
          <span class="text-sm sm:text-base font-bold text-text tabular-nums">
            {{ formatPrice(totalCheckoutAmount) }}
          </span>
        </div>

        <!-- Tombol CTA Kanan: Pilih Pembayaran -->
        <button
          type="button"
          :disabled="!isOrderReady || loading"
          class="h-11 px-6 rounded-xl font-semibold text-xs sm:text-sm font-outfit transition-colors cursor-pointer flex items-center justify-center disabled:cursor-not-allowed shadow-xs"
          :class="
            isOrderReady
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-muted text-text-muted opacity-80'
          "
          @click="proceedToPayment"
        >
          <span>Pilih Pembayaran</span>
        </button>
      </div>
    </div>

    <!-- Modal Pilih Pengiriman (Sesuai Gambar 3) -->
    <ShippingChooseModal
      v-model="showShippingModal"
      :seller="activeSellerForShipping"
      :address="address"
      @select="handleShippingSelected"
    />

    <!-- Modal Pilih Alamat Pengiriman -->
    <AppAddressModal
      v-model="showAddressModal"
      @select="handleAddressSelected"
    />
  </div>
</template>

