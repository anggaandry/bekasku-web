<template>
  <div :class="layout === 'sidebar' ? 'p-0' : 'px-4 py-3 md:px-0'">
    <!-- Top Row: Avatar + Name + Rating + Badges + Buttons (in default horizontal layout) -->
    <div class="flex items-start gap-3 md:gap-4">
      <!-- 1. Avatar (56px x 56px di mobile - matching mobile V3 L210-234) -->
      <div class="relative shrink-0">
        <div
          class="rounded-full p-0.5 transition-transform"
          :class="hasLive ? 'border-2 border-primary cursor-pointer ring-2 ring-primary/20' : ''"
          @click="hasLive && $emit('live-click')"
        >
          <div class="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-surface-2 flex items-center justify-center border border-border/80">
            <img
              v-if="seller.avatar"
              :src="sanitizedAvatar"
              :alt="seller.name"
              class="w-full h-full object-cover"
              loading="eager"
            />
            <User v-else class="w-7 h-7 text-text-subtle" />
          </div>
        </div>

        <!-- Live badge indicator if live -->
        <span
          v-if="hasLive"
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs animate-pulse"
        >
          LIVE
        </span>
      </div>

      <!-- 2. Seller Identity Area (matching mobile V3 L238-286 & Image 1) -->
      <div class="flex-1 min-w-0">
        <!-- Store Name + Verified Badge -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <h1 class="text-base md:text-lg font-bold text-text truncate font-outfit">
            {{ seller.name }}
          </h1>

          <!-- Verified Blue/Primary Icon right next to name (seller_profile_view.dart L244-247) -->
          <CheckCircle2
            v-if="seller.verified"
            class="w-4 h-4 text-primary fill-primary/10 shrink-0"
            title="Terverifikasi"
          />
        </div>

        <!-- Star Rating & Follower Count Row -->
        <div class="flex items-center gap-1 mt-1 text-xs text-text-muted font-outfit">
          <Star class="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-current fill-none" />
          <span class="font-semibold text-text">
            {{ Number(seller.rating || 0).toFixed(1) }}
          </span>

          <span class="w-[3px] h-[3px] rounded-full bg-text-subtle shrink-0 mx-1.5"></span>

          <span>{{ totalFollowersFormatted }} Pengikut</span>
        </div>

        <!-- Official Seller Badges (_buildSellerBadges() L1115-1240: BekasKu+, VIP, Trusted) -->
        <div v-if="hasAnyBadge" class="flex flex-wrap items-center gap-1.5 mt-1.5">
          <!-- BekasKu+ Official Horizontal Image Badge (exact h-13px fit-contain) -->
          <div
            v-if="seller.is_bekasku_plus"
            class="inline-flex items-center px-[7px] py-[3px] rounded-[6px] bg-[#FFF1F2] border border-[#FECDD3] shrink-0"
            title="BekasKu+ Partner"
          >
            <img
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              width="80"
              height="13"
              class="bekasku-plus-badge-img"
              loading="eager"
            />
          </div>

          <!-- VIP Badge (L1180-1200 & Image 1: VIP Badge with Crown) -->
          <div
            v-else-if="seller.is_vip || seller.is_vvip"
            class="inline-flex items-center gap-1 px-[7px] py-[3px] rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[11px] font-outfit font-semibold shrink-0"
            title="VIP"
          >
            <Crown class="w-3 h-3 text-[#D97706] shrink-0" />
            <span>VIP</span>
          </div>

          <!-- Trusted Seller Badge (L1205-1225 & Image 1: bg #F0FDF4, border #BBF7D0, text #15803D, icon #16A34A) -->
          <div
            v-if="seller.trusted"
            class="inline-flex items-center gap-1 px-[7px] py-[3px] rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[11px] font-outfit font-semibold shrink-0"
            title="Trusted"
          >
            <ShieldCheck class="w-3 h-3 text-[#16A34A] shrink-0" />
            <span>Trusted</span>
          </div>
        </div>
      </div>

      <!-- 3. Action Buttons Column (Only in default horizontal layout: 90px x 30px) -->
      <div v-if="!isMine && layout !== 'sidebar'" class="flex flex-col gap-2 shrink-0 self-start">
        <button
          type="button"
          :disabled="followLoading"
          class="w-[90px] h-[30px] rounded-[6px] text-[13px] font-outfit font-bold transition-all flex items-center justify-center cursor-pointer shadow-none select-none"
          :class="
            isFollowing
              ? 'bg-white border border-border text-text hover:bg-surface-2'
              : 'bg-primary text-white hover:bg-primary-dark'
          "
          @click="$emit('follow-click')"
        >
          <span v-if="followLoading" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          <span v-else>{{ isFollowing ? 'Following' : 'Follow' }}</span>
        </button>

        <button
          type="button"
          class="w-[90px] h-[30px] rounded-[6px] text-[13px] font-outfit font-bold border border-border bg-white text-text hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer shadow-none select-none"
          @click="$emit('chat-click')"
        >
          Chat
        </button>
      </div>
    </div>

    <!-- Action Buttons for Sidebar Mode (Full width 2 columns side-by-side) -->
    <div v-if="!isMine && layout === 'sidebar'" class="grid grid-cols-2 gap-2 mt-4">
      <button
        type="button"
        :disabled="followLoading"
        class="w-full h-[36px] rounded-lg text-xs font-outfit font-bold transition-all flex items-center justify-center cursor-pointer shadow-none select-none"
        :class="
          isFollowing
            ? 'bg-white border border-border text-text hover:bg-surface-2'
            : 'bg-primary text-white hover:bg-primary-dark'
        "
        @click="$emit('follow-click')"
      >
        <span v-if="followLoading" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        <span v-else>{{ isFollowing ? 'Following' : 'Follow' }}</span>
      </button>

      <button
        type="button"
        class="w-full h-[36px] rounded-lg text-xs font-outfit font-bold border border-border bg-white text-text hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer shadow-none select-none"
        @click="$emit('chat-click')"
      >
        Chat
      </button>
    </div>

    <!-- 4. Bio / Description -->
    <div v-if="seller.bio" class="mt-2.5">
      <p class="text-xs text-text-muted leading-relaxed line-clamp-3 font-outfit">
        {{ seller.bio }}
      </p>
    </div>

    <!-- 5. Social Media Pills -->
    <div
      v-if="cleanInstagramHandle || cleanTiktokHandle"
      class="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar flex-wrap"
    >
      <!-- Instagram Button Pill -->
      <a
        v-if="cleanInstagramHandle"
        :href="`https://instagram.com/${encodeURIComponent(cleanInstagramHandle)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F77737] text-white text-xs font-semibold font-outfit shadow-2xs hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
        title="Instagram Toko"
      >
        <Instagram class="w-3.5 h-3.5 shrink-0" />
        <span>@{{ cleanInstagramHandle }}</span>
        <ArrowUpRight class="w-3 h-3 shrink-0" />
      </a>

      <!-- TikTok Button Pill -->
      <a
        v-if="cleanTiktokHandle"
        :href="`https://tiktok.com/@${encodeURIComponent(cleanTiktokHandle)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-text text-white text-xs font-semibold font-outfit shadow-2xs hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
        title="TikTok Toko"
      >
        <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .59.04.86.12V9.39a6.38 6.38 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.33V9.6a8.28 8.28 0 0 0 4.82 1.54V7.69a4.83 4.83 0 0 1-1.06-1z"/>
        </svg>
        <span>@{{ cleanTiktokHandle }}</span>
        <ArrowUpRight class="w-3 h-3 shrink-0" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  User,
  Star,
  CheckCircle2,
  Instagram,
  ArrowUpRight,
  Crown,
  ShieldCheck,
} from 'lucide-vue-next'
import type { SellerInfo } from '~/types/seller'
import { sanitizeMediaUrl } from '~/utils/media'

const props = withDefaults(
  defineProps<{
    seller: SellerInfo
    isFollowing?: boolean
    followLoading?: boolean
    isMine?: boolean
    layout?: 'default' | 'sidebar'
  }>(),
  {
    isFollowing: false,
    followLoading: false,
    isMine: false,
    layout: 'default',
  }
)

defineEmits<{
  (e: 'follow-click'): void
  (e: 'chat-click'): void
  (e: 'live-click'): void
}>()

const sanitizedAvatar = computed(() => {
  return sanitizeMediaUrl(props.seller.avatar || '')
})

const hasLive = computed(() => {
  return !!props.seller.live_id && props.seller.live_id.trim() !== ''
})

const cleanInstagramHandle = computed(() => {
  const ig = props.seller.instagram?.trim()
  if (!ig) return ''
  return ig.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, '')
})

const cleanTiktokHandle = computed(() => {
  const tt = props.seller.tiktok?.trim()
  if (!tt) return ''
  return tt.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\/@?/, '').replace(/^@/, '').replace(/\/$/, '')
})

const totalFollowersFormatted = computed(() => {
  const count = props.seller.total_followers ?? 0
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
})

const hasAnyBadge = computed(() => {
  return !!(
    props.seller.is_bekasku_plus ||
    props.seller.is_vip ||
    props.seller.is_vvip ||
    props.seller.trusted
  )
})
</script>

<style scoped>
.bekasku-plus-badge-img {
  height: 13px !important;
  max-height: 13px !important;
  width: auto !important;
  max-width: 80px !important;
  object-fit: contain;
  display: block;
}
</style>
