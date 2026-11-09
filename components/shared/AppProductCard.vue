<template>
  <div
    class="group relative select-none rounded-xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col justify-between"
    :class="[
      isSpotlighted
        ? 'border-[1.5px] border-[#6366F1] bg-[#F8FAFC]'
        : isHighlighted
          ? 'border-[1.5px] border-[#F59E0B] bg-[#FFFBEB]'
          : 'border border-border bg-white',
      'shadow-2xs hover:shadow-xs'
    ]"
    @click="handleClick"
  >
    <!-- ── 1. Image Section (Square 1:1 Aspect Ratio) ─────────────────────────── -->
    <div class="relative w-full aspect-square bg-muted overflow-hidden flex items-center justify-center">
      <img
        v-if="imageUrl && !imageError"
        :src="imageUrl"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
        loading="lazy"
        width="200"
        height="200"
        @error="imageError = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-muted text-text-subtle">
        <ImageIcon class="w-7 h-7 text-text-subtle" />
      </div>

      <!-- Top-Left: Tombol Wishlist Hati jika showWishlistButton aktif -->
      <div v-if="props.showWishlistButton && productId" class="absolute top-2 left-2 z-10" @click.stop>
        <AppWishlistButton :product-id="productId" />
      </div>

      <!-- Top-Right: Discount percentage badge (Merah BekasKu, Sesuai Screenshot) -->
      <div
        v-if="hasDiscount && displayDiscount > 0"
        class="absolute top-0 right-0 bg-primary text-white px-1.5 py-0.5 rounded-bl-[8px] font-outfit text-[10.5px] font-bold shadow-xs z-10"
      >
        {{ displayDiscount }}%
      </div>

      <!-- Bottom-Left: Free Shipping badge overlay (Merah BekasKu, Sesuai Screenshot Mobile V3) -->
      <div
        v-if="isFreeShipping"
        class="absolute bottom-0 left-0 bg-primary text-white px-2 py-0.5 rounded-tr-[8px] font-outfit text-[10px] font-bold shadow-xs z-10"
      >
        Free Shipping
      </div>
    </div>

    <!-- ── 2. Details Section (Matching bekasku_v3 product_card.dart) ───────────────────────── -->
    <div class="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
      <div>
        <!-- Row: Price (BekasKu Red #E31B23) + Strikethrough Original Price -->
        <div class="flex items-center flex-wrap gap-1.5 leading-none">
          <span class="font-outfit text-[14px] sm:text-[15.5px] font-extrabold text-primary tracking-tight tabular-nums">
            {{ formattedPrice }}
          </span>

          <span
            v-if="formattedOldPrice"
            class="font-outfit text-[10.5px] text-text-subtle line-through font-normal tabular-nums"
          >
            {{ formattedOldPrice }}
          </span>
        </div>

        <!-- Product Title (max 2 lines, comfortable legibility) -->
        <h4 class="font-outfit text-[12px] sm:text-[12.5px] font-medium text-text line-clamp-2 leading-[1.3] mt-1.5 group-hover:text-primary transition-colors">
          {{ title }}
        </h4>

        <!-- Capability & Status Chips: Pay & Pick, Instant, Jasa, Dibutuhkan, BekasKu+, VIP (Konsisten se-aplikasi) -->
        <div v-if="displayChips.length > 0" class="flex flex-wrap items-center gap-1 mt-2">
          <template v-for="(chip, cIdx) in displayChips" :key="cIdx">
            <!-- BekasKu+ Official Image Badge -->
            <img
              v-if="chip.isImage"
              :src="chip.imageUrl"
              alt="BekasKu+"
              width="60"
              height="16"
              class="h-3.5 sm:h-4 w-auto object-contain shrink-0"
            />

            <!-- Chip teks universal: style per varian dari utils/productBadge.ts -->
            <span
              v-else
              class="inline-flex items-center font-outfit text-[9.5px] px-1.5 py-0.5 rounded-[5px] border leading-tight select-none"
              :class="PRODUCT_BADGE_CLASS[chip.variant]"
            >
              {{ chip.label }}
            </span>
          </template>
        </div>
      </div>

      <div class="mt-2.5">
        <!-- Row: Star Rating + Map Pin + City Sesuai Screenshot Mobile V3 -->
        <div class="flex items-center justify-between text-[11px] text-text-muted font-outfit leading-none">
          <div class="flex items-center gap-1.5 min-w-0 flex-1">
            <div v-if="rate > 0" class="flex items-center gap-0.5 shrink-0">
              <Star class="w-3 h-3 fill-secondary-star text-secondary-star" />
              <span class="text-text font-semibold">{{ rate.toFixed(1) }}</span>
              <span class="text-text-subtle text-[9px] mx-0.5">•</span>
            </div>

            <div class="flex items-center gap-1 min-w-0 truncate">
              <MapPin class="w-3 h-3 text-text-subtle shrink-0" />
              <span class="truncate font-medium text-text-muted">{{ city || 'Indonesia' }}</span>
            </div>
          </div>
        </div>

        <!-- Category text kecil di bawah lokasi jika ada (Sesuai Screenshot Mobile V3: PerabotanRumah) -->
        <p v-if="categoryText" class="text-[10px] text-text-subtle truncate mt-1">
          {{ categoryText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Star,
  MapPin,
  Image as ImageIcon
} from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'
import { productPath } from '~/utils/slug'
import { isInstantDelivery } from '~/utils/instant'
import { PRODUCT_BADGE_CLASS, type ProductBadgeVariant } from '~/utils/productBadge'
import { useAuthStore } from '~/stores/auth'
import { useLocationStore } from '~/stores/location'
import type { Product } from '~/composables/useProducts'
import AppWishlistButton from '~/components/shared/AppWishlistButton.vue'

interface Props {
  product: Product | any
  preventNavigation?: boolean
  showWishlistButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preventNavigation: false,
  showWishlistButton: false,
})
const emit = defineEmits<{
  click: [product: any]
}>()

const imageError = ref(false)

function _str(key: string): string {
  const val = props.product?.[key]
  return val !== undefined && val !== null ? String(val) : ''
}

function _int(key: string): number {
  const val = props.product?.[key]
  const parsed = parseInt(String(val), 10)
  return isNaN(parsed) ? 0 : parsed
}

const productId = computed(() => _str('_id') || _str('id') || _str('product_id'))
const title = computed(() => _str('title') || _str('name') || 'Produk BekasKu')
const city = computed(() => _str('city'))

const imageUrl = computed(() => {
  const img = props.product?.image || props.product?.images
  let raw = ''
  if (Array.isArray(img) && img.length > 0) raw = String(img[0])
  else if (typeof img === 'string' && img.length > 0) raw = img
  return sanitizeMediaUrl(raw, '')
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
  if (isNeeded) return 2

  const isDonation = props.product?.is_donation === true ||
    props.product?.is_donation === 1 ||
    props.product?.is_donation === 'true'
  if (isDonation) return 3

  const isService = props.product?.is_service === true ||
    props.product?.is_service === 1 ||
    props.product?.is_service === 'true'
  if (isService) return 4

  return 1
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

  if (takeMethod !== 1 && takeMethod !== '1' && data.direct !== false && data.allow_meet !== false) {
    return true
  }
  return false
})

// Instant check
const authStore = useAuthStore()
const locationStore = useLocationStore()

const currentUserLocation = computed(() => {
  return authStore.user?.city || authStore.user?.default_loc || locationStore.city || 'Deli Serdang'
})

const isInstant = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}
  if (data.instant === true || data.instant === 1 || data.instant === 'true' || data.is_instant === true) {
    return true
  }
  return isInstantDelivery(currentUserLocation.value, city.value)
})

// Shipping check
const hasShipping = computed(() => {
  if (!canShowTransactionBadges.value) return false
  const data = props.product || {}
  if (data.via_courrier === false || data.via_courrier === 0 || data.via_courrier === 'false') return false
  if (data.via_courier === false || data.via_courier === 0 || data.via_courier === 'false') return false
  if (data.allow_courrier === false || data.allow_courrier === 0 || data.allow_courrier === 'false') return false
  if (data.take_method === 2 || data.take_method === '2') return false

  return true
})

const rate = computed(() => {
  const r = props.product?.rate
  const parsed = parseFloat(String(r))
  return isNaN(parsed) ? 0 : parsed
})

const isTrusted = computed(() => {
  const data = props.product || {}
  return data.trusted === true || data.trusted === 1 || data.trusted === 'true' || data.is_trusted === true
})

const isVerified = computed(() => {
  const data = props.product || {}
  return data.verified === true || data.verified === 1 || data.verified === 'true'
})

const subscribe = computed(() => _str('subscribe'))

const isBekaskuPlus = computed(() => {
  const data = props.product || {}
  const sub = subscribe.value.toLowerCase()
  const sName = (data.seller_name || data.user_name || data.user?.name || '').toString().trim().toLowerCase()
  return data.is_plus === true ||
    data.is_bekasku_plus === true ||
    data.bekasku_plus === true ||
    data.bekasku_plus_status === 'approved' ||
    sName === 'anne14' ||
    sub.includes('bekasku+') ||
    sub.includes('bekasku_plus') ||
    sub === 'plus'
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

interface ProductChip {
  label?: string
  variant?: ProductBadgeVariant
  isImage?: boolean
  imageUrl?: string
}

// Build Capability Chips matching _buildCapabilityChips in product_card.dart (BekasKu Mobile V3)
const displayChips = computed<ProductChip[]>(() => {
  if (isServiceItem.value || sellMethod.value === 4) {
    return [{ label: 'Jasa & Lowongan Kerja', variant: 'soft' }]
  }
  if (isNeededItem.value || sellMethod.value === 2) {
    return [{ label: 'Dibutuhkan', variant: 'soft' }]
  }

  const list: ProductChip[] = []
  if (isPayAndPick.value) list.push({ label: 'Pay & Pick', variant: 'soft' })
  if (isInstant.value) list.push({ label: 'Instant', variant: 'outline' })

  if (isBekaskuPlus.value) {
    list.push({ isImage: true, imageUrl: '/images/bekasku_plus_variant_6_horizontal.png' })
  } else if (isVip.value) {
    list.push({ label: 'VIP', variant: 'vip' })
  }

  if (isBestDeal.value) list.push({ label: 'Best Deal', variant: 'bestDeal' })
  if (isTrusted.value) list.push({ label: 'Trusted', variant: 'trusted' })
  if (isVerified.value) list.push({ label: 'Verified', variant: 'verified' })

  // Max 3 chips displayed matching Flutter
  return list.slice(0, 3)
})

function handleClick() {
  emit('click', props.product)
  if (!props.preventNavigation && (_str('_id') || _str('id'))) {
    navigateTo(productPath(props.product))
  }
}
</script>
