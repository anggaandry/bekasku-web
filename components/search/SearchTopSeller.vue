<template>
  <div class="bg-white border-b-2 border-border/80 md:border md:border-border md:rounded-xl md:mb-3 py-3">
    <!-- 1. Store Header: Avatar, Name + Online Dot, Kunjungi CTA -->
    <div class="px-4 flex items-center justify-between gap-3">
      <div
        class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        @click="visitStore"
      >
        <!-- Avatar -->
        <div
          class="w-11 h-11 rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center shrink-0"
          :class="isBekaskuPlus || isVip ? 'ring-2 ring-primary/80 ring-offset-1' : ''"
        >
          <img
            v-if="avatarUrl && !avatarErr"
            :src="avatarUrl"
            :alt="storeName"
            width="44"
            height="44"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="avatarErr = true"
          />
          <span v-else class="font-outfit font-bold text-base text-primary">
            {{ storeInitial }}
          </span>
        </div>

        <!-- Store Name + Online Status -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h3 class="font-outfit font-bold text-[15px] sm:text-base text-text truncate">
              {{ storeName }}
            </h3>
            <img
              v-if="isBekaskuPlus"
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              width="56"
              height="14"
              class="h-3.5 w-auto object-contain shrink-0"
            />
            <span
              v-else-if="isVip"
              class="px-1.5 py-0.5 rounded bg-secondary/20 text-text text-[10px] font-outfit font-bold shrink-0"
            >
              VIP
            </span>
          </div>

          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="isOnline ? 'bg-primary' : 'bg-text-subtle'"
            />
            <span class="font-outfit text-xs text-text-muted truncate">
              {{ statusLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Kunjungi Button: Solid red on Produk tab ('solid'), Outlined red on Toko tab ('outline') -->
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
    <div class="px-4 mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted font-outfit">
      <div class="inline-flex items-center gap-1 text-text">
        <Star class="w-3.5 h-3.5 fill-text text-text shrink-0" />
        <span class="font-medium">{{ displayRating }}</span>
      </div>

      <span class="text-border-light">&bull;</span>

      <div class="inline-flex items-center gap-1 min-w-0">
        <MapPin class="w-3.5 h-3.5 text-text shrink-0" />
        <span class="truncate max-w-[140px] sm:max-w-[220px]">{{ shortCity }}</span>
      </div>

      <template v-if="chatReplyPercent">
        <span class="text-border-light">&bull;</span>
        <div class="inline-flex items-center gap-1">
          <Clock class="w-3.5 h-3.5 text-text shrink-0" />
          <span>{{ chatReplyPercent }}% Chat Dibalas</span>
        </div>
      </template>
    </div>

    <!-- 3. Horizontal 3-Product Preview Cards (Matches Screenshots 3 & 4) -->
    <div
      v-if="previewProducts.length > 0"
      class="mt-3 px-4 flex items-stretch gap-2.5 overflow-x-auto scrollbar-none pb-1"
    >
      <div
        v-for="(prod, pIdx) in previewProducts"
        :key="prod.id || prod._id || pIdx"
        class="w-[128px] sm:w-[148px] shrink-0 flex flex-col justify-between cursor-pointer group"
        @click="openProduct(prod)"
      >
        <div>
          <!-- Square Image + Top-Right Discount Badge -->
          <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border">
            <img
              v-if="getProductImage(prod)"
              :src="getProductImage(prod)"
              :alt="prod.title || 'Produk'"
              width="148"
              height="148"
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
          <div class="mt-2 font-outfit font-extrabold text-sm text-primary leading-tight truncate">
            {{ formatPrice(prod.price) }}
          </div>

          <!-- Title -->
          <h4 class="mt-0.5 font-outfit text-xs text-text line-clamp-1 group-hover:text-primary transition-colors">
            {{ prod.title }}
          </h4>
        </div>

        <!-- Location Footer -->
        <div class="mt-2 flex items-center gap-1 text-[11px] text-text-muted font-outfit">
          <MapPin class="w-3 h-3 text-text shrink-0" />
          <span class="truncate">{{ getProductCity(prod) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, MapPin, Clock, Image as ImageIcon } from 'lucide-vue-next'
import type { SellerResult } from '~/types/search'
import type { ProductCard } from '~/types/product'
import { sanitizeMediaUrl } from '~/utils/media'

const props = withDefaults(
  defineProps<{
    seller: SellerResult
    buttonVariant?: 'solid' | 'outline'
  }>(),
  {
    buttonVariant: 'solid',
  }
)

const avatarErr = ref(false)

const storeName = computed(() => props.seller.name || props.seller.username || 'Toko BekasKu')
const storeInitial = computed(() => storeName.value.charAt(0).toUpperCase() || 'T')
const avatarUrl = computed(() => sanitizeMediaUrl(props.seller.avatar || '', ''))

const statusLabel = computed(() => {
  const s = (props.seller.status || '').trim()
  return s || 'Online'
})

const isOnline = computed(() => {
  const s = statusLabel.value.toLowerCase()
  return s.includes('online') || s.includes('aktif') || !s.includes('lalu')
})

const displayRating = computed(() => {
  const r = parseFloat(String(props.seller.rating ?? 0))
  return r > 0 ? r.toFixed(1) : '0.0'
})

const shortCity = computed(() => {
  const raw = props.seller.city || 'Indonesia'
  return raw.split(',')[0]?.trim() || 'Indonesia'
})

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

