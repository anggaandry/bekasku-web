<script setup lang="ts">
import {
  Heart,
  Star,
  MapPin,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Award,
  Handshake,
  Zap,
  Truck,
  PackageCheck,
  Briefcase,
  CircleAlert,
  HeartHandshake,
} from 'lucide-vue-next'
import type { ProductDetail } from '~/types/product'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  product: ProductDetail
  isWishlist: boolean
  totalFavorite?: number
  isBekaskuPlus?: boolean
  isVip?: boolean
  isTrusted?: boolean
  isVerified?: boolean
  isPayAndPick?: boolean
  isFreeShipping?: boolean
  isInstant?: boolean
  hasShipping?: boolean
  isNeeded?: boolean
  isService?: boolean
  isDonation?: boolean
  isDesktop?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-wishlist'): void
}>()

const rate = computed(() => {
  const r = Number(props.product.rate ?? props.product.rating ?? 0)
  return isNaN(r) ? 0 : r
})

const totalView = computed(() => Number(props.product.total_view || 0))
</script>

<template>
  <div class="space-y-3">
    <!-- MODE DESKTOP: Judul -> Rating/View/City -> Harga (seperti Shopee / Tokped) -->
    <template v-if="isDesktop">
      <!-- Row 1: Product Title + Wishlist Button -->
      <div class="flex items-start justify-between gap-3">
        <h1 class="font-outfit font-bold text-lg sm:text-xl text-text leading-snug">
          {{ product.title }}
        </h1>
        <button
          type="button"
          @click="emit('toggle-wishlist')"
          class="p-2 rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border border-border-light shadow-2xs"
          :aria-label="isWishlist ? 'Hapus dari Favorit' : 'Simpan ke Favorit'"
        >
          <Heart
            class="w-5 h-5 transition-colors"
            :class="isWishlist ? 'fill-primary text-primary' : 'text-text-muted hover:text-primary'"
          />
          <span v-if="totalFavorite && totalFavorite > 0" class="font-outfit text-xs font-semibold text-text">
            {{ totalFavorite }}
          </span>
        </button>
      </div>

      <!-- Row 2: Rating, Views & Location Meta -->
      <div class="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <template v-if="rate > 0">
          <div class="flex items-center gap-1 font-outfit font-semibold text-text">
            <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{{ rate.toFixed(1) }}</span>
          </div>
          <span class="text-text-subtle">•</span>
        </template>

        <template v-if="totalView > 0">
          <div class="flex items-center gap-1 font-outfit font-medium text-text-muted">
            <Eye class="w-3.5 h-3.5" />
            <span>{{ totalView }}x dilihat</span>
          </div>
          <span class="text-text-subtle">•</span>
        </template>

        <div class="flex items-center gap-1 font-outfit font-medium text-text-muted">
          <MapPin class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ product.city || 'Indonesia' }}</span>
        </div>
      </div>

      <!-- Row 3: Badges -->
      <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
        <!-- Khusus Jasa -->
        <template v-if="isService">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Briefcase class="w-3 h-3 shrink-0" />
            <span>Jasa & Lowongan Kerja</span>
          </span>
        </template>

        <!-- Khusus Dibutuhkan -->
        <template v-else-if="isNeeded">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-600 border border-rose-200">
            <CircleAlert class="w-3 h-3 shrink-0" />
            <span>Dibutuhkan</span>
          </span>
        </template>

        <!-- Produk Normal -->
        <template v-else>
          <span
            v-if="isDonation"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200"
          >
            <HeartHandshake class="w-3 h-3 shrink-0" />
            <span>Donasi</span>
          </span>
          <span
            v-if="isPayAndPick"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/8 text-primary border border-primary/22"
          >
            <Handshake class="w-3 h-3 shrink-0" />
            <span>Pay & Pick</span>
          </span>
          <span
            v-if="isInstant"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/8 text-primary border border-primary/22"
          >
            <Zap class="w-3 h-3 shrink-0" />
            <span>Instan</span>
          </span>
          <span
            v-if="hasShipping"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-primary border border-sky-200"
          >
            <Truck class="w-3 h-3 shrink-0" />
            <span>Via Kurir</span>
          </span>
          <span
            v-if="isFreeShipping"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200"
          >
            <PackageCheck class="w-3 h-3 shrink-0" />
            <span>Gratis Ongkir</span>
          </span>
          <span
            v-if="isBekaskuPlus"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-primary border border-primary/35 shadow-2xs"
          >
            <Award class="w-3 h-3 shrink-0" />
            <span>BekasKu+</span>
          </span>
          <span
            v-else-if="isVip"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"
          >
            <Award class="w-3 h-3 shrink-0" />
            <span>VIP</span>
          </span>
          <span
            v-if="isTrusted"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200"
          >
            <ShieldCheck class="w-3 h-3 shrink-0" />
            <span>Trusted</span>
          </span>
          <span
            v-if="isVerified"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-200"
          >
            <CheckCircle2 class="w-3 h-3 shrink-0" />
            <span>Verified</span>
          </span>
        </template>
      </div>

      <!-- Row 4: Harga Utama di Bawah Judul -->
      <div class="pt-2">
        <div class="flex flex-wrap items-baseline gap-2.5">
          <span class="font-outfit font-extrabold text-2xl sm:text-3xl text-text tracking-tight">
            {{ formatRupiah(product.price) }}
          </span>
          <span
            v-if="product.old_price && product.old_price > product.price"
            class="font-outfit font-normal text-sm sm:text-base text-text-subtle line-through"
          >
            {{ formatRupiah(product.old_price) }}
          </span>
          <span
            v-if="product.discount && product.discount > 0"
            class="font-outfit font-bold text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-600 border border-rose-200"
          >
            {{ product.discount }}%
          </span>
        </div>
      </div>
    </template>

    <!-- MODE MOBILE: Sesuai V3 Mobile Asli (Harga paling atas -> Badge -> Judul -> Info) -->
    <template v-else>
      <!-- Row 1: Price Row + Wishlist Toggle -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-outfit font-extrabold text-[22px] sm:text-2xl text-text tracking-tight">
            {{ formatRupiah(product.price) }}
          </span>
          <span
            v-if="product.old_price && product.old_price > product.price"
            class="font-outfit font-normal text-[13.5px] text-text-subtle line-through"
          >
            {{ formatRupiah(product.old_price) }}
          </span>
          <span
            v-if="product.discount && product.discount > 0"
            class="font-outfit font-bold text-[11px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 border border-rose-200"
          >
            {{ product.discount }}%
          </span>
        </div>

        <button
          type="button"
          @click="emit('toggle-wishlist')"
          class="p-1.5 rounded-full hover:bg-surface-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
          :aria-label="isWishlist ? 'Hapus dari Favorit' : 'Simpan ke Favorit'"
        >
          <Heart
            class="w-5 h-5 transition-colors"
            :class="isWishlist ? 'fill-text text-text' : 'text-text'"
          />
          <span v-if="totalFavorite && totalFavorite > 0" class="font-outfit text-xs font-medium text-text-muted">
            {{ totalFavorite }}
          </span>
        </button>
      </div>

      <!-- Row 2: Badges -->
      <div class="flex flex-wrap items-center gap-1.5">
        <template v-if="isService">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Briefcase class="w-3 h-3 shrink-0" />
            <span>Jasa & Lowongan Kerja</span>
          </span>
        </template>
        <template v-else-if="isNeeded">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-600 border border-rose-200">
            <CircleAlert class="w-3 h-3 shrink-0" />
            <span>Dibutuhkan</span>
          </span>
        </template>
        <template v-else>
          <span
            v-if="isDonation"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200"
          >
            <HeartHandshake class="w-3 h-3 shrink-0" />
            <span>Donasi</span>
          </span>
          <span
            v-if="isPayAndPick"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/8 text-primary border border-primary/22"
          >
            <Handshake class="w-3 h-3 shrink-0" />
            <span>Pay & Pick</span>
          </span>
          <span
            v-if="isInstant"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/8 text-primary border border-primary/22"
          >
            <Zap class="w-3 h-3 shrink-0" />
            <span>Instan</span>
          </span>
          <span
            v-if="hasShipping"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-primary border border-sky-200"
          >
            <Truck class="w-3 h-3 shrink-0" />
            <span>Via Kurir</span>
          </span>
          <span
            v-if="isFreeShipping"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200"
          >
            <PackageCheck class="w-3 h-3 shrink-0" />
            <span>Gratis Ongkir</span>
          </span>
          <span
            v-if="isBekaskuPlus"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-primary border border-primary/35 shadow-2xs"
          >
            <Award class="w-3 h-3 shrink-0" />
            <span>BekasKu+</span>
          </span>
          <span
            v-else-if="isVip"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"
          >
            <Award class="w-3 h-3 shrink-0" />
            <span>VIP</span>
          </span>
          <span
            v-if="isTrusted"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200"
          >
            <ShieldCheck class="w-3 h-3 shrink-0" />
            <span>Trusted</span>
          </span>
          <span
            v-if="isVerified"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-200"
          >
            <CheckCircle2 class="w-3 h-3 shrink-0" />
            <span>Verified</span>
          </span>
        </template>
      </div>

      <!-- Row 3: Product Title -->
      <h1 class="font-outfit font-semibold text-base sm:text-lg text-text leading-snug">
        {{ product.title }}
      </h1>

      <!-- Row 4: Rating, Views & Location -->
      <div class="flex flex-wrap items-center gap-2 text-xs text-text-muted pt-0.5">
        <template v-if="rate > 0">
          <div class="flex items-center gap-1 font-outfit font-semibold text-text">
            <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{{ rate.toFixed(1) }}</span>
          </div>
          <span class="text-text-subtle">•</span>
        </template>

        <template v-if="totalView > 0">
          <div class="flex items-center gap-1 font-outfit font-medium text-text-muted">
            <Eye class="w-3.5 h-3.5" />
            <span>{{ totalView }}x dilihat</span>
          </div>
          <span class="text-text-subtle">•</span>
        </template>

        <div class="flex items-center gap-1 font-outfit font-medium text-text-muted">
          <MapPin class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ product.city || 'Indonesia' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
