<template>
  <div
    class="group relative select-none rounded-xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col justify-between"
    :class="[
      isSpotlighted
        ? 'border-[1.5px] border-[#6366F1] bg-[#F8FAFC]'
        : isHighlighted
          ? 'border-[1.5px] border-[#F59E0B] bg-[#FFFBEB]'
          : 'border border-[#E5E7EB] bg-white',
      'shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-md'
    ]"
    @click="handleClick"
  >
    <!-- ── 1. Image Section (Square 1:1 Aspect Ratio) ─────────────────────────── -->
    <div class="relative w-full aspect-square bg-[#F3F4F6] overflow-hidden flex items-center justify-center">
      <img
        v-if="imageUrl && !imageError"
        :src="imageUrl"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
        loading="lazy"
        @error="imageError = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-[#F3F4F6] text-gray-400">
        <ImageIcon class="w-7 h-7 text-gray-400" />
      </div>

      <!-- Top-Right: Discount percentage badge (FLUSH to corner, NO margin) -->
      <div
        v-if="hasDiscount && displayDiscount > 0"
        class="absolute top-0 right-0 bg-[#E11D48] text-white px-1.5 py-0.5 rounded-bl-[8px] font-outfit text-[10.5px] font-bold shadow-xs z-10"
      >
        {{ displayDiscount }}%
      </div>

      <!-- Bottom-Left: Free Shipping badge overlay -->
      <div
        v-if="isFreeShipping"
        class="absolute bottom-0 left-0 bg-[#16A34A] text-white px-2 py-0.5 rounded-tr-[8px] font-outfit text-[10px] font-bold shadow-xs z-10"
      >
        Free Shipping
      </div>
    </div>

    <!-- ── 2. Details Section (Matching bekasku_v3 product_card.dart with bottom breathing room) ───────────────────────── -->
    <div class="px-2.5 pt-2 pb-3 sm:pb-3.5 flex-1 flex flex-col justify-between">
      <div>
        <!-- Row: Price (Royal Blue #2563EB) + Strikethrough Original Price -->
        <div class="flex items-baseline flex-wrap gap-1.5 leading-none">
          <span class="font-outfit text-[14.5px] sm:text-base font-extrabold text-[#2563EB] tracking-tight">
            {{ formattedPrice }}
          </span>
          <span
            v-if="formattedOldPrice"
            class="font-outfit text-[10.5px] text-[#9CA3AF] line-through font-normal"
          >
            {{ formattedOldPrice }}
          </span>
        </div>

        <!-- Product Title (max 2 lines, high legibility) -->
        <h4 class="font-outfit text-[12.5px] font-medium text-[#1F2937] line-clamp-2 leading-[1.25] mt-1 group-hover:text-[#2563EB] transition-colors">
          {{ title }}
        </h4>

        <!-- Capability & Status Chips (max 3 badges displayed) -->
        <div v-if="displayChips.length > 0" class="flex flex-wrap items-center gap-1 mt-1.5">
          <!-- Render Chips -->
          <template v-for="(chip, cIdx) in displayChips" :key="cIdx">
            <!-- Icon-only transport badge -->
            <span
              v-if="chip.isIcon"
              class="inline-flex items-center justify-center px-1 py-0.5 rounded-[5px] border"
              :style="{
                backgroundColor: chip.bgColor,
                borderColor: chip.borderColor,
                color: chip.iconColor
              }"
            >
              <Zap v-if="chip.iconType === 'zap'" class="w-2.5 h-2.5" />
              <Truck v-else-if="chip.iconType === 'truck'" class="w-2.5 h-2.5" />
            </span>

            <!-- Text Chip -->
            <span
              v-else
              class="inline-flex items-center font-outfit text-[9.5px] px-1.5 py-0.5 rounded-[5px] border leading-tight"
              :class="chip.isBold ? 'font-bold' : 'font-medium'"
              :style="{
                backgroundColor: chip.bgColor,
                borderColor: chip.borderColor,
                color: chip.textColor
              }"
            >
              {{ chip.label }}
            </span>
          </template>
        </div>
      </div>

      <div class="mt-2 pt-0.5">
        <!-- Row: Rating + Dot + Map Pin + City -->
        <div class="flex items-center text-[11px] text-[#6B7280] font-outfit leading-none">
          <template v-if="rate > 0">
            <Star class="w-3 h-3 fill-[#EAB308] text-[#EAB308] shrink-0" />
            <span class="text-[#374151] font-semibold ml-0.5 mr-1">{{ rate.toFixed(1) }}</span>
            <span class="text-[#9CA3AF] mr-1">•</span>
          </template>
          <MapPin class="w-2.5 h-2.5 text-[#6B7280] shrink-0 mr-1" />
          <span class="truncate font-medium text-[#6B7280]">{{ city || 'Indonesia' }}</span>
        </div>

        <!-- Category / Seller Descriptor -->
        <div
          v-if="categoryText"
          class="font-outfit text-[10.5px] text-[#6B7280] font-normal truncate mt-1 leading-tight"
        >
          {{ categoryText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Star,
  MapPin,
  Truck,
  Zap,
  Image as ImageIcon
} from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'

interface Props {
  product: Product | any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [product: any]
}>()

const imageError = ref(false)

// String & Number extractors matching Flutter _str / _int
function _str(key: string): string {
  const val = props.product?.[key]
  return val !== undefined && val !== null ? String(val) : ''
}

function _int(key: string): number {
  const val = props.product?.[key]
  const parsed = parseInt(String(val), 10)
  return isNaN(parsed) ? 0 : parsed
}

const title = computed(() => _str('title') || _str('name') || 'Produk Bekasku')
const city = computed(() => _str('city'))

const imageUrl = computed(() => {
  const img = props.product?.image || props.product?.images
  if (Array.isArray(img) && img.length > 0) return String(img[0])
  if (typeof img === 'string' && img.length > 0) return img
  return ''
})

// Sell Method matching product_card.dart _getSellMethod
const sellMethod = computed(() => {
  const sm = props.product?.sell_method ?? props.product?.sellMethod
  if (sm !== undefined && sm !== null) {
    const parsed = parseInt(String(sm), 10)
    if (!isNaN(parsed)) return parsed
  }

  const isNeeded = props.product?.is_needed === true ||
    props.product?.is_needed === 1 ||
    props.product?.is_needed === 'true' ||
    props.product?.is_need === true ||
    props.product?.needed != null ||
    props.product?.needed_expired != null
  if (isNeeded) return 2 // SELL_METHOD_NEEDED = 2

  const isDonation = props.product?.is_donation === true ||
    props.product?.is_donation === 1 ||
    props.product?.is_donation === 'true'
  if (isDonation) return 3 // SELL_METHOD_DONATION = 3

  const isService = props.product?.is_service === true ||
    props.product?.is_service === 1 ||
    props.product?.is_service === 'true'
  if (isService) return 4 // SELL_METHOD_SERVICE = 4

  return 1 // SELL_METHOD_DIRECT = 1
})

// Category / Seller descriptor matching _getCategoryOrSeller
const categoryText = computed(() => {
  const data = props.product || {}
  if (data.category_name) return String(data.category_name)
  if (data.category) {
    if (typeof data.category === 'object') return data.category.name || ''
    if (typeof data.category === 'string') return data.category
  }
  if (data.subcategory_name) return String(data.subcategory_name)
  if (data.seller_name) return String(data.seller_name)
  if (data.seller) {
    if (typeof data.seller === 'object') return data.seller.name || ''
    if (typeof data.seller === 'string') return data.seller
  }
  return ''
})

const isCategoryService = computed(() => {
  const lower = categoryText.value.toLowerCase()
  return lower.includes('jasa') || lower.includes('lowongan')
})

const isServiceItem = computed(() => {
  return sellMethod.value === 4 ||
    props.product?.is_service === true ||
    props.product?.is_service === 1 ||
    props.product?.is_service === 'true' ||
    isCategoryService.value
})

const isNeededItem = computed(() => {
  return sellMethod.value === 2 ||
    props.product?.is_needed === true ||
    props.product?.is_needed === 1 ||
    props.product?.is_needed === 'true' ||
    props.product?.is_need === true ||
    props.product?.needed != null ||
    props.product?.needed_expired != null
})

const isDonationItem = computed(() => {
  return sellMethod.value === 3 ||
    props.product?.is_donation === true ||
    props.product?.is_donation === 1
})

const isAuctionItem = computed(() => false)

// Best Deal flag
const isBestDeal = computed(() => {
  if (isNeededItem.value || isAuctionItem.value || isDonationItem.value || isServiceItem.value) {
    return false
  }
  if (sellMethod.value === 0 || sellMethod.value === 2 || sellMethod.value === 3 || sellMethod.value === 4) {
    return false
  }
  const data = props.product || {}
  return data.is_best_deal === true ||
    data.is_best_deal === 1 ||
    data.is_best_deal === 'true' ||
    (data.best_deal && typeof data.best_deal === 'object' && Object.keys(data.best_deal).length > 0) ||
    data.is_deal === true
})

// Transaction Badges Permission
const allowTransaction = computed(() => {
  const data = props.product || {}
  return data.allow_transaction !== false &&
    data.allow_transaction !== 0 &&
    data.allow_transaction !== 'false'
})

const canShowTransactionBadges = computed(() => {
  return allowTransaction.value && !isServiceItem.value && !isNeededItem.value
})

// Free shipping check
const isFreeShipping = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}
  const freeDelivery = _int('free_delivery')
  return freeDelivery > 0 || data.free_ongkir === 1 || data.free_ongkir === true || data.free_ongkir === '1'
})

// Pay & Pick check matching _checkIsPayAndPick
const isPayAndPick = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}
  const directMeet = data.direct_meet === true || data.direct_meet === 1 || data.direct_meet === 'true'
  const allowMeet = data.allow_meet === true || data.allow_meet === 1 || data.allow_meet === 'true'
  const isDirect = data.direct === true || data.direct === 1 || data.direct === 'true'
  const takeMethod = data.take_method
  const isTakeMeet = takeMethod === 2 || takeMethod === 3 || takeMethod === '2' || takeMethod === '3'

  if (directMeet || allowMeet || isDirect || isTakeMeet) return true
  if (takeMethod !== 1 && takeMethod !== '1' && data.direct !== false && data.allow_meet !== false) return true
  return false
})

// Shipping check matching _checkHasShipping
const hasShipping = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}

  if (data.via_courrier === false || data.via_courrier === 0 || data.via_courrier === 'false') return false
  if (data.via_courier === false || data.via_courier === 0 || data.via_courier === 'false') return false
  if (data.allow_courrier === false || data.allow_courrier === 0 || data.allow_courrier === 'false') return false
  const takeMethod = data.take_method
  if (takeMethod === 2 || takeMethod === '2') return false

  const viaCourrier = data.via_courrier === true || data.via_courrier === 1 || data.via_courrier === 'true'
  const viaCourier = data.via_courier === true || data.via_courier === 1 || data.via_courier === 'true'
  const allowCourrier = data.allow_courrier === true || data.allow_courrier === 1 || data.allow_courrier === 'true'
  const isTakeShipping = takeMethod === 1 || takeMethod === 3 || takeMethod === '1' || takeMethod === '3'
  const hasWeight = (parseInt(String(data.weight || 0), 10) || 0) > 0
  const hasFreeDelivery = isFreeShipping.value
  const hasCourrierList = (Array.isArray(data.courriers) && data.courriers.length > 0) ||
    (Array.isArray(data.ships) && data.ships.length > 0)

  if (viaCourrier || viaCourier || allowCourrier || isTakeShipping || hasWeight || hasFreeDelivery || hasCourrierList) {
    return true
  }

  // Default for standard products: shippable via courier
  return sellMethod.value === 1 || sellMethod.value === 2
})

// Instant Delivery check (same city or flag)
const isInstant = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}
  return data.is_instant === true || data.instant === true || data.sell_method === 'instant'
})

// Ratings & Badges
const rate = computed(() => {
  const r = parseFloat(_str('rate')) || parseFloat(_str('rating')) || 0
  return isNaN(r) ? 0 : r
})

const isTrusted = computed(() => {
  const data = props.product || {}
  return data.trusted === true || data.trusted === 1 || data.trusted === 'true'
})

const isVerified = computed(() => {
  const data = props.product || {}
  return data.verified === true || data.verified === 1 || data.verified === 'true'
})

const subscribe = computed(() => _str('subscribe'))

const isBekaskuPlus = computed(() => {
  const data = props.product || {}
  const sub = subscribe.value.toLowerCase()
  return data.is_plus === true ||
    data.bekasku_plus === true ||
    sub.includes('preloved') ||
    sub.includes('bekasku+')
})

const isVip = computed(() => {
  if (isBekaskuPlus.value) return false
  const data = props.product || {}
  const sub = subscribe.value.toLowerCase()
  return data.vvip === true ||
    data.vvip === 1 ||
    data.vip === true ||
    data.is_vip === true ||
    sub.includes('vip') ||
    sub.includes('vvip')
})

const isHighlighted = computed(() => {
  const data = props.product || {}
  return data.is_highlighted === true || data.is_highlighted === 1
})

const isSpotlighted = computed(() => {
  const data = props.product || {}
  return data.is_spotlighted === true || data.is_spotlighted === 1
})

// Price & Discount calculation matching product_card.dart
const priceCalculations = computed(() => {
  const data = props.product || {}
  const rawPrice = _int('price')
  let rawOldPrice = _int('old_price')
  if (rawOldPrice === 0) rawOldPrice = _int('price_before')
  if (rawOldPrice === 0) rawOldPrice = _int('original_price')
  if (rawOldPrice === 0) rawOldPrice = _int('price_normal')

  let discount = _int('discount')
  if (!isNeededItem.value && !isAuctionItem.value && !isServiceItem.value && discount === 0 && data.best_deal && typeof data.best_deal === 'object') {
    discount = parseInt(String(data.best_deal.discount || 0), 10) || 0
  }

  let finalPrice = rawPrice
  let originalPrice = rawOldPrice

  if (isBestDeal.value && data.best_deal && typeof data.best_deal === 'object') {
    const dealPrice = parseInt(String(data.best_deal.price || 0), 10) || 0
    if (dealPrice > 0) {
      finalPrice = dealPrice
      if (originalPrice === 0) originalPrice = rawPrice
    }
  }

  if (originalPrice === 0 && discount > 0 && finalPrice > 0) {
    originalPrice = Math.round(finalPrice / (1.0 - (discount / 100.0)))
  }

  if (originalPrice > 0 && finalPrice > 0 && originalPrice < finalPrice) {
    const temp = originalPrice
    originalPrice = finalPrice
    finalPrice = temp
  }

  const hasDiscount = (discount > 0 || originalPrice > finalPrice) && finalPrice > 0
  const displayDiscount = discount > 0
    ? discount
    : (originalPrice > finalPrice && originalPrice > 0
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0)

  return {
    finalPrice: finalPrice > 0 ? finalPrice : rawPrice,
    originalPrice,
    hasDiscount,
    displayDiscount
  }
})

const finalPrice = computed(() => priceCalculations.value.finalPrice)
const originalPrice = computed(() => priceCalculations.value.originalPrice)
const hasDiscount = computed(() => priceCalculations.value.hasDiscount)
const displayDiscount = computed(() => priceCalculations.value.displayDiscount)

function formatCurrency(val: number): string {
  return `Rp${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

const formattedPrice = computed(() => formatCurrency(finalPrice.value))
const formattedOldPrice = computed(() => {
  if (hasDiscount.value && originalPrice.value > finalPrice.value) {
    return formatCurrency(originalPrice.value)
  }
  return ''
})

// Build Capability Chips matching _buildCapabilityChips in product_card.dart
const displayChips = computed(() => {
  // 1. Service item: single chip
  if (isServiceItem.value || sellMethod.value === 4) {
    return [{
      isIcon: false,
      label: 'Jasa & Lowongan Kerja',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      textColor: '#15803D',
      isBold: true
    }]
  }

  // 2. Needed item: single chip
  if (isNeededItem.value || sellMethod.value === 2) {
    return [{
      isIcon: false,
      label: 'Dibutuhkan',
      bgColor: '#FEE2E2',
      borderColor: '#FECDD3',
      textColor: '#DC2626',
      isBold: true
    }]
  }

  const list: any[] = []

  // Transport icon chip (Instant: zap, Shipping: truck)
  if (isInstant.value) {
    list.push({
      isIcon: true,
      iconType: 'zap',
      bgColor: 'rgba(37, 99, 235, 0.08)',
      borderColor: 'rgba(37, 99, 235, 0.22)',
      iconColor: '#2563EB'
    })
  } else if (hasShipping.value) {
    list.push({
      isIcon: true,
      iconType: 'truck',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      iconColor: '#2563EB'
    })
  }

  // Pay & Pick chip
  if (isPayAndPick.value) {
    list.push({
      isIcon: false,
      label: 'Pay & Pick',
      bgColor: 'rgba(37, 99, 235, 0.08)',
      borderColor: 'rgba(37, 99, 235, 0.22)',
      textColor: '#2563EB',
      isBold: true
    })
  }

  // Best Deal chip
  if (isBestDeal.value) {
    list.push({
      isIcon: false,
      label: 'Best Deal',
      bgColor: 'rgba(37, 99, 235, 0.06)',
      borderColor: 'rgba(37, 99, 235, 0.2)',
      textColor: '#1D4ED8',
      isBold: true
    })
  }

  // Bekasku+ / VIP
  if (isBekaskuPlus.value) {
    list.push({
      isIcon: false,
      label: 'Bekasku+',
      bgColor: 'rgba(37, 99, 235, 0.06)',
      borderColor: 'rgba(37, 99, 235, 0.2)',
      textColor: '#1D4ED8',
      isBold: true
    })
  } else if (isVip.value) {
    list.push({
      isIcon: false,
      label: 'VIP',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      textColor: '#B45309',
      isBold: true
    })
  } else if (subscribe.value && !subscribe.value.toLowerCase().includes('preloved')) {
    list.push({
      isIcon: false,
      label: subscribe.value.toUpperCase(),
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      textColor: '#B45309',
      isBold: true
    })
  }

  // Trusted chip
  if (isTrusted.value) {
    list.push({
      isIcon: false,
      label: 'Trusted',
      bgColor: '#E0F2FE',
      borderColor: '#BAE6FD',
      textColor: '#1D4ED8',
      isBold: true
    })
  }

  // Verified chip
  if (isVerified.value) {
    list.push({
      isIcon: false,
      label: 'Verified',
      bgColor: '#F0FDF4',
      borderColor: '#DCFCE7',
      textColor: '#15803D',
      isBold: true
    })
  }

  // Max 3 chips displayed matching Flutter
  return list.slice(0, 3)
})

function handleClick() {
  emit('click', props.product)
  const id = _str('_id') || _str('id')
  if (id) {
    navigateTo(`/product/${id}`)
  }
}
</script>
