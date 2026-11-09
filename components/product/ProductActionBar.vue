<script setup lang="ts">
import {
  MessageCircle,
  Phone,
  Pencil,
  PowerOff,
  Trash2,
  Headset,
  PackageX,
} from 'lucide-vue-next'
import type { ProductDetail, ProductSeller } from '~/types/product'

const props = defineProps<{
  product: ProductDetail
  seller?: ProductSeller | null
  isMine?: boolean
}>()

const emit = defineEmits<{
  (e: 'chat'): void
  (e: 'call'): void
  (e: 'whatsapp'): void
  (e: 'nego'): void
  (e: 'add-cart'): void
  (e: 'offer-needed'): void
  (e: 'edit-post'): void
  (e: 'deactivate-post'): void
  (e: 'delete-post'): void
  (e: 'mark-sold'): void
  (e: 'bekasku-center'): void
}>()

// Sell method & state checks matching product_action_bar.dart (L44-L135)
const kNeeded = 2
const kService = 4

const sellMethod = computed(() => Number(props.product.sell_method ?? 1))
const isNeeded = computed(() => sellMethod.value === kNeeded || isFlagOn(props.product.is_needed))
const isService = computed(() => {
  const cat = String(props.product.category || '').toLowerCase()
  return sellMethod.value === kService || isFlagOn(props.product.is_service) || cat.includes('jasa') || cat.includes('lowongan')
})

const allowTransaction = computed(() => {
  return !isFlagOff(props.product.allow_transaction)
})

const canNegotiate = computed(() => props.product.negotiation === true)

// Status flags
const onAir = computed(() => props.product.on_air !== false)
const onVerify = computed(() => props.product.on_verify === true)
const onDecline = computed(() => props.product.on_decline === true)
const onSale = computed(() => props.product.on_sale === true)
const onExpired = computed(() => props.product.on_expired === true)
const onCanceled = computed(() => props.product.on_canceled === true)
const step = computed(() => Number(props.product.step ?? 1))
const bdComing = computed(() => String(props.product.bd_coming || '').trim())
const discount = computed(() => Number(props.product.discount || 0))

const isSoldOrUnavailable = computed(() => {
  return (
    onSale.value ||
    step.value === 2 ||
    onExpired.value ||
    (!onAir.value && !onVerify.value)
  )
})

// Cascade evaluation matching product_action_bar.dart exact order:
// 1. If !mine && isSoldOrUnavailable -> 'sold_banner'
// 2. Buyer evaluation order (each overrides previous):
//    - default -> 'buyer_default'
//    - if negotiation && !mine -> 'buyer_negotiation'
//    - if sellMethod == 2 && !mine -> 'buyer_needed'
//    - if sellMethod == 4 && !mine -> 'buyer_service'
//    - if !allowTransaction && !mine -> 'buyer_no_transaction'
// 3. Seller evaluation order (if mine):
//    - default -> 'seller_default'
//    - if onSale || onVerify -> 'seller_on_sale'
//    - if bdComing != '' || discount > 0 -> 'seller_bd_cancel'
//    - if onCanceled -> 'seller_delete_only'
//    - if onDecline -> 'seller_declined'
const activeMode = computed(() => {
  if (!props.isMine && isSoldOrUnavailable.value) {
    return 'sold_banner'
  }

  let mode = 'buyer_default'

  if (canNegotiate.value && !props.isMine) {
    mode = 'buyer_negotiation'
  }

  if (isNeeded.value && !props.isMine) {
    mode = 'buyer_needed'
  }

  if (isService.value && !props.isMine) {
    mode = 'buyer_service'
  }

  if (!allowTransaction.value && !props.isMine && !isNeeded.value && !isService.value) {
    mode = 'buyer_no_transaction'
  }

  if (props.isMine) {
    mode = 'seller_default'

    if (onSale.value || onVerify.value) {
      mode = 'seller_on_sale'
    }

    if (bdComing.value !== '' || discount.value > 0) {
      mode = 'seller_bd_cancel'
    }

    if (onCanceled.value) {
      mode = 'seller_delete_only'
    }

    if (onDecline.value) {
      mode = 'seller_declined'
    }
  }

  return mode
})
</script>

<template>
  <div class="w-full bg-white md:bg-transparent border-t md:border-t-0 border-border-light shadow-[0_-2px_8px_rgba(0,0,0,0.05)] md:shadow-none px-4 md:px-0 py-2.5 md:py-0">
    <div class="max-w-[1280px] mx-auto">

      <!-- 1. SOLD BANNER (Non-Seller) -->
      <div
        v-if="activeMode === 'sold_banner'"
        class="w-full h-12 px-4 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center gap-2 text-slate-600 font-outfit font-semibold text-sm"
      >
        <PackageX class="w-5 h-5 text-slate-500 shrink-0" />
        <span class="truncate">Produk sudah terjual / kehabisan stok</span>
      </div>

      <!-- 2A. BUYER DEFAULT: [Hubungi Outlined] | [+ Keranjang Filled White Text] -->
      <div
        v-else-if="activeMode === 'buyer_default'"
        class="w-full h-12 flex items-center gap-3"
      >
        <button
          type="button"
          @click="emit('chat')"
          class="flex-1 h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageCircle class="w-[18px] h-[18px] shrink-0" />
          <span>Hubungi</span>
        </button>

        <button
          type="button"
          @click="emit('add-cart')"
          class="flex-1 h-full px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">+ Keranjang</span>
        </button>
      </div>

      <!-- 2B. BUYER NEGOTIATION: [Chat Icon Square] | [Nego Outlined] | [+ Keranjang Filled White Text] -->
      <div
        v-else-if="activeMode === 'buyer_negotiation'"
        class="w-full h-12 flex items-center gap-2"
      >
        <ProductActionIconButton label="Chat Penjual" @click="emit('chat')">
          <MessageCircle class="w-[22px] h-[22px]" />
        </ProductActionIconButton>

        <button
          type="button"
          @click="emit('nego')"
          class="flex-1 h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          <span>Nego</span>
        </button>

        <button
          type="button"
          @click="emit('add-cart')"
          class="flex-1 h-full px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">+ Keranjang</span>
        </button>
      </div>

      <!-- 2C. BUYER NEEDED (Barang Dibutuhkan): [Chat Icon Square] | [Tawarkan Barang Filled White Text] -->
      <div
        v-else-if="activeMode === 'buyer_needed'"
        class="w-full h-12 flex items-center gap-3"
      >
        <ProductActionIconButton label="Chat Penjual" @click="emit('chat')">
          <MessageCircle class="w-[22px] h-[22px]" />
        </ProductActionIconButton>

        <button
          type="button"
          @click="emit('offer-needed')"
          class="flex-1 h-full px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">Tawarkan Barang</span>
        </button>
      </div>

      <!-- 2D. BUYER SERVICE (Jasa & Lowongan Kerja): [Hubungi Phone Outlined] | [Chat Pengiklan Filled White Text] -->
      <div
        v-else-if="activeMode === 'buyer_service'"
        class="w-full h-12 flex items-center gap-3"
      >
        <button
          type="button"
          @click="emit('call')"
          class="flex-1 h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Phone class="w-[18px] h-[18px] shrink-0" />
          <span>Hubungi</span>
        </button>

        <button
          type="button"
          @click="emit('chat')"
          class="flex-1 h-full px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">Chat Pengiklan</span>
        </button>
      </div>

      <!-- 2E. BUYER NO TRANSACTION (Properti/Otomotif): [Phone Green Icon] | [Whatsapp Outlined] | [Chat Outlined] -->
      <div
        v-else-if="activeMode === 'buyer_no_transaction'"
        class="w-full h-12 flex items-center gap-2"
      >
        <ProductActionIconButton label="Telepon Penjual" @click="emit('call')">
          <Phone class="w-[20px] h-[20px] text-white" />
        </ProductActionIconButton>

        <button
          type="button"
          @click="emit('whatsapp')"
          class="flex-1 h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageCircle class="w-[18px] h-[18px] shrink-0" />
          <span>Whatsapp</span>
        </button>

        <button
          type="button"
          @click="emit('chat')"
          class="flex-1 h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageCircle class="w-[18px] h-[18px] shrink-0" />
          <span>Chat</span>
        </button>
      </div>

      <!-- 3A. SELLER DEFAULT / ON-SALE: [Pencil Icon] | [PowerOff Icon] | [Trash2 Icon] | [Tandai Terjual / Ditemukan Filled] -->
      <div
        v-else-if="activeMode === 'seller_default' || activeMode === 'seller_on_sale'"
        class="w-full h-12 flex items-center gap-2"
      >
        <ProductActionIconButton label="Edit Iklan" title="Edit Iklan" @click="emit('edit-post')">
          <Pencil class="w-[20px] h-[20px]" />
        </ProductActionIconButton>

        <ProductActionIconButton label="Nonaktifkan Postingan" title="Nonaktifkan / Aktifkan Iklan" @click="emit('deactivate-post')">
          <PowerOff class="w-[20px] h-[20px]" />
        </ProductActionIconButton>

        <ProductActionIconButton label="Hapus Postingan" title="Hapus Iklan" @click="emit('delete-post')">
          <Trash2 class="w-[20px] h-[20px]" />
        </ProductActionIconButton>

        <button
          type="button"
          @click="emit('mark-sold')"
          class="flex-1 h-full px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">
            {{ activeMode === 'seller_default' && isNeeded ? 'Ditemukan' : 'Tandai Terjual' }}
          </span>
        </button>
      </div>

      <!-- 3B. SELLER BEST DEAL / DISCOUNT ACTIVE: [Batalkan Danger Outline Full] -->
      <div
        v-else-if="activeMode === 'seller_bd_cancel'"
        class="w-full h-12 flex items-center"
      >
        <button
          type="button"
          @click="emit('deactivate-post')"
          class="w-full h-full px-4 rounded-xl border border-danger bg-white text-danger hover:bg-danger/8 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          <span>Batalkan</span>
        </button>
      </div>

      <!-- 3C. SELLER CANCELED POST: [Hapus Danger Outline Full] -->
      <div
        v-else-if="activeMode === 'seller_delete_only'"
        class="w-full h-12 flex items-center"
      >
        <button
          type="button"
          @click="emit('delete-post')"
          class="w-full h-full px-4 rounded-xl border border-danger bg-white text-danger hover:bg-danger/8 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          <span>Hapus</span>
        </button>
      </div>

      <!-- 3D. SELLER DECLINED POST: [Bantuan CS Outlined (flex 2)] | [Edit Iklan Filled White Text (flex 3)] -->
      <div
        v-else-if="activeMode === 'seller_declined'"
        class="w-full h-12 flex items-center gap-2.5"
      >
        <button
          type="button"
          @click="emit('bekasku-center')"
          class="flex-[2] h-full px-3 rounded-xl border border-primary bg-white text-primary hover:bg-primary/8 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Headset class="w-[18px] h-[18px] shrink-0" />
          <span>Bantuan CS</span>
        </button>

        <button
          type="button"
          @click="emit('edit-post')"
          class="flex-[3] h-full px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="text-white">Edit Iklan</span>
        </button>
      </div>

    </div>
  </div>
</template>
