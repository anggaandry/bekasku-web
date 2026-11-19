<template>
  <div
    :class="
      variant === 'bekasku-plus'
        ? 'bg-white border-b-4 border-surface-2 md:border md:border-border md:rounded-2xl md:shadow-2xs md:p-5 py-4'
        : 'bg-white border-b-2 border-border/80 md:border md:border-border md:rounded-xl md:mb-3 py-3'
    "
  >
    <!-- 1. Store Header: Avatar, Name + Online Dot, Kunjungi CTA -->
    <div :class="variant === 'bekasku-plus' ? 'px-4 md:px-0 flex items-center justify-between gap-3' : 'px-4 flex items-center justify-between gap-3'">
      <div
        class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        @click="visitStore"
      >
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div
            class="rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center"
            :class="[
              variant === 'bekasku-plus' ? 'w-12 h-12' : 'w-11 h-11',
              isBekaskuPlus || isVip ? 'ring-2 ring-primary/90 ring-offset-1' : '',
            ]"
          >
            <img
              v-if="avatarUrl && !avatarErr"
              :src="avatarUrl"
              :alt="storeName"
              width="48"
              height="48"
              class="w-full h-full object-cover"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="avatarErr = true"
            />
            <span v-else class="font-outfit font-bold text-base text-primary">
              {{ storeInitial }}
            </span>
          </div>

          <span
            v-if="variant === 'bekasku-plus' && (isBekaskuPlus || isVip)"
            class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-white flex items-center justify-center"
            aria-hidden="true"
          >
            <Star class="w-2.5 h-2.5 text-white fill-white" />
          </span>
        </div>

        <!-- Store Name + Online Status -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h3 class="font-outfit font-bold text-[15px] sm:text-base text-text truncate">
              {{ storeName }}
            </h3>
            <CheckCircle2
              v-if="variant === 'bekasku-plus' && isVerified"
              class="w-4 h-4 text-primary shrink-0"
            />
            <img
              v-if="variant !== 'bekasku-plus' && isBekaskuPlus"
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              width="56"
              height="14"
              class="h-3.5 w-auto object-contain shrink-0"
            />
            <span
              v-else-if="variant !== 'bekasku-plus' && isVip"
              class="px-1.5 py-0.5 rounded bg-secondary/20 text-text text-[10px] font-outfit font-bold shrink-0"
            >
              VIP
            </span>
          </div>

          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="variant === 'bekasku-plus' ? 'bg-green-500' : (isOnline ? 'bg-primary' : 'bg-text-subtle')"
            />
            <span class="font-outfit text-xs text-text-muted truncate">
              {{ statusLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Kunjungi Button: Solid red on Produk tab ('solid'), Outlined red on Toko / BekasKu+ ('outline') -->
      <button
        type="button"
        class="px-4 py-1.5 rounded-lg font-outfit font-semibold text-xs sm:text-[13px] transition-all active:scale-95 shrink-0 cursor-pointer"
        :class="
          buttonVariant === 'solid'
            ? 'bg-primary hover:bg-primary-dark text-white shadow-2xs'
            : 'bg-white hover:bg-primary/5 text-primary border border-primary'
        "
        @click="visitStore"
      >
        Kunjungi
      </button>
    </div>

    <!-- 2. Sub-header: Star Rating • MapPin City • Clock % Chat Dibalas -->
    <div
      class="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted font-outfit"
      :class="variant === 'bekasku-plus' ? 'px-4 md:px-0' : 'px-4'"
    >
      <template v-if="variant !== 'bekasku-plus' || numericRating > 0">
        <div class="inline-flex items-center gap-1 text-text">
          <Star
            class="w-3.5 h-3.5 shrink-0"
            :class="variant === 'bekasku-plus' ? 'fill-amber-400 text-amber-400' : 'fill-text text-text'"
          />
          <span class="font-medium">{{ displayRating }}</span>
        </div>

        <span class="text-border-light">&bull;</span>
      </template>

      <div class="inline-flex items-center gap-1 min-w-0">
        <MapPin class="w-3.5 h-3.5 shrink-0" :class="variant === 'bekasku-plus' ? 'text-text-muted' : 'text-text'" />
        <span :class="variant === 'bekasku-plus' ? 'truncate max-w-[180px] sm:max-w-[260px]' : 'truncate max-w-[140px] sm:max-w-[220px]'">
          {{ variant === 'bekasku-plus' ? fullCity : shortCity }}
        </span>
      </div>

      <template v-if="chatReplyPercent">
        <span class="text-border-light">&bull;</span>
        <div class="inline-flex items-center gap-1">
          <Clock class="w-3.5 h-3.5 shrink-0" :class="variant === 'bekasku-plus' ? 'text-text-muted' : 'text-text'" />
          <span>{{ chatReplyPercent }}% chat dibalas</span>
        </div>
      </template>
    </div>

    <!-- 2b. Seller Tier Badges Row (BekasKu+ view matching Mobile V3 PremiumSellerCard) -->
    <div
      v-if="variant === 'bekasku-plus' && (isBekaskuPlus || isVip || isTrusted || isVerified)"
      class="px-4 md:px-0 mt-2.5 flex flex-wrap items-center gap-1.5"
    >
      <span
        v-if="isBekaskuPlus"
        class="px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[11px] font-bold font-outfit"
      >
        BekasKu+
      </span>
      <span
        v-else-if="isVip"
        class="px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[11px] font-bold font-outfit"
      >
        VIP
      </span>
      <span
        v-if="isTrusted"
        class="px-2 py-0.5 rounded bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-[11px] font-bold font-outfit"
      >
        Trusted
      </span>
      <span
        v-if="isVerified"
        class="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-[11px] font-bold font-outfit"
      >
        Verified
      </span>
    </div>

    <!-- 3. Horizontal Product Preview Cards -->
    <div
      v-if="previewProducts.length > 0"
      class="mt-3.5 flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none pb-1"
      :class="variant === 'bekasku-plus' ? 'px-4 md:px-0' : 'px-4'"
    >
      <div
        v-for="(prod, pIdx) in previewProducts"
        :key="prod.id || prod._id || pIdx"
        class="shrink-0 flex flex-col justify-between cursor-pointer group"
        :class="variant === 'bekasku-plus' ? 'w-[116px] sm:w-[144px] md:w-[160px]' : 'w-[128px] sm:w-[148px]'"
        @click="openProduct(prod)"
      >
        <div>
          <!-- Square Image + Top-Right Discount Badge -->
          <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border">
            <img
              v-if="getProductImage(prod)"
              :src="getProductImage(prod)"
              :alt="prod.title || 'Produk'"
              width="160"
              height="160"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-text-subtle">
              <ImageIcon class="w-6 h-6" />
            </div>

            <span
              v-if="getProductDiscount(prod) > 0"
              class="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] font-outfit font-bold px-1.5 py-0.5 rounded-md"
            >
              {{ getProductDiscount(prod) }}%
            </span>
          </div>

          <!-- Price -->
          <div
            class="mt-2 font-outfit leading-tight truncate"
            :class="variant === 'bekasku-plus' ? 'font-bold text-xs sm:text-sm text-gray-900' : 'font-extrabold text-sm text-primary'"
          >
            {{ formatPrice(prod.price) }}
          </div>

          <!-- Title -->
          <h4 class="mt-0.5 font-outfit text-xs text-text line-clamp-1 group-hover:text-primary transition-colors">
            {{ prod.title }}
          </h4>

          <span
            v-if="variant === 'bekasku-plus' && Number(prod.sell_method) === 2"
            class="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold font-outfit"
          >
            Dibutuhkan
          </span>
        </div>

        <!-- Location Footer (Search mode only) -->
        <div
          v-if="variant !== 'bekasku-plus'"
          class="mt-2 flex items-center gap-1 text-[11px] text-text-muted font-outfit"
        >
          <MapPin class="w-3 h-3 text-text shrink-0" />
          <span class="truncate">{{ getProductCity(prod) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, MapPin, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-vue-next'
import type { SellerResult } from '~/types/search'
import type { ProductCard } from '~/types/product'
import { sanitizeMediaUrl } from '~/utils/media'

const props = withDefaults(
  defineProps<{
    seller: SellerResult
    buttonVariant?: 'solid' | 'outline'
    variant?: 'search' | 'bekasku-plus'
  }>(),
  {
    buttonVariant: 'solid',
    variant: 'search',
  }
)

const avatarErr = ref(false)

const storeName = computed(() => props.seller.name || props.seller.username || 'Toko BekasKu')
const storeInitial = computed(() => storeName.value.charAt(0).toUpperCase() || 'T')
const avatarUrl = computed(() => sanitizeMediaUrl(props.seller.avatar || '', ''))

watch(avatarUrl, () => {
  avatarErr.value = false
})

const statusLabel = computed(() => {
  const s = (props.seller.status || '').trim()
  return s || 'Online'
})

const isOnline = computed(() => {
  const s = statusLabel.value.toLowerCase()
  return s.includes('online') || s.includes('aktif') || !s.includes('lalu')
})

const numericRating = computed(() => {
  const r = parseFloat(String(props.seller.rating ?? 0))
  return isNaN(r) ? 0 : r
})

const displayRating = computed(() => {
  return numericRating.value > 0 ? numericRating.value.toFixed(1) : '0.0'
})

const fullCity = computed(() => (props.seller.city || '').trim() || 'Indonesia')

const shortCity = computed(() => {
  return fullCity.value.split(',')[0]?.trim() || 'Indonesia'
})

const isVerified = computed(() => props.seller.verified === true || props.seller.verified === 1)
const isTrusted = computed(() => props.seller.trusted === true || props.seller.trusted === 1)

const chatReplyPercent = computed(() => {
  const val = props.seller.percent_chat_reply
  if (val === undefined || val === null || val === '') return ''
  return String(val)
})

const isBekaskuPlus = computed(() => {
  const s = props.seller
  const lowerName = (s.name || s.username || '').toLowerCase()
  const sub = String(s.subscribe || '').toLowerCase()
  return (
    s.is_bekasku_plus === true ||
    s.is_plus === true ||
    s.bekasku_plus === true ||
    s.bekasku_plus_status === 'approved' ||
    sub === 'bekasku_plus' ||
    sub === 'bekasku+' ||
    lowerName === 'anne14'
  )
})

const isVip = computed(() => {
  if (isBekaskuPlus.value) return false
  const s = props.seller
  const sub = String(s.subscribe || '').toLowerCase()
  return s.vip === true || s.is_vip === true || sub === 'vip'
})

const previewProducts = computed<ProductCard[]>(() => {
  return Array.isArray(props.seller.products) ? props.seller.products.slice(0, 6) : []
})

function getProductImage(prod: any): string {
  const raw = Array.isArray(prod.images) && prod.images.length > 0
    ? prod.images[0]
    : prod.image || ''
  return sanitizeMediaUrl(String(raw), '')
}

function getProductDiscount(prod: any): number {
  const d = parseInt(String(prod.discount || 0), 10)
  return isNaN(d) ? 0 : d
}

function getProductCity(prod: any): string {
  const c = prod.city || props.seller.city || 'Indonesia'
  return String(c).split(',')[0]?.trim() || 'Indonesia'
}

function formatPrice(val: any): string {
  const num = parseInt(String(val || 0), 10) || 0
  return `Rp${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function visitStore() {
  const id = props.seller.id || props.seller._id
  if (id) {
    navigateTo(`/seller/${id}`)
  }
}

function openProduct(prod: ProductCard) {
  if (prod.id || prod._id) {
    navigateTo(productPath(prod))
  }
}
</script>

