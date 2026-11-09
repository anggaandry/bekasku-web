<script setup lang="ts">
import {
  MapPin,
  Star,
  Clock,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Instagram,
  Video,
} from 'lucide-vue-next'
import type { ProductSeller } from '~/types/product'

const props = defineProps<{
  seller: ProductSeller
  isMine?: boolean
  isBekaskuPlus?: boolean
  isVip?: boolean
  isTrusted?: boolean
  isVerified?: boolean
}>()

const emit = defineEmits<{
  (e: 'visit-live', liveId: string): void
}>()

const isOnline = computed(() => String(props.seller.time || '').toLowerCase() === 'online')
const locationText = computed(() => props.seller.city || props.seller.location || '-')
const instagram = computed(() => (props.seller.instagram || '').replace(/^@/, '').trim())
const tiktok = computed(() => (props.seller.tiktok || '').replace(/^@/, '').trim())
const hasLive = computed(() => !!(props.seller.live_id && props.seller.live_id.trim()))

function handleAvatarClick() {
  if (hasLive.value && props.seller.live_id) {
    emit('visit-live', props.seller.live_id)
  } else if (props.seller.id) {
    navigateTo(`/seller/${props.seller.id}`)
  }
}

function openExternalSocial(platform: 'instagram' | 'tiktok', username: string) {
  if (!username) return
  const url =
    platform === 'instagram'
      ? `https://www.instagram.com/${encodeURIComponent(username)}`
      : `https://www.tiktok.com/@${encodeURIComponent(username)}`
  if (import.meta.client) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div class="p-4 rounded-2xl bg-white border border-border shadow-2xs space-y-3">
    <!-- Top Row: Avatar + Name/Online + Kunjungi Button -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Avatar with optional LIVE ring -->
        <button
          type="button"
          class="relative w-11 h-11 rounded-full shrink-0 cursor-pointer focus:outline-hidden"
          :class="hasLive ? 'p-0.5 bg-gradient-to-tr from-primary to-amber-500' : 'border border-border'"
          @click="handleAvatarClick"
        >
          <div class="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
            <img
              v-if="seller.avatar"
              :src="sanitizeMediaUrl(seller.avatar, '')"
              :alt="seller.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="font-bold text-primary text-sm">
              {{ (seller.name || 'S').charAt(0).toUpperCase() }}
            </span>
          </div>
          <!-- LIVE badge -->
          <span
            v-if="hasLive"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-xs bg-primary text-white text-[8px] font-extrabold tracking-wider uppercase shadow-xs"
          >
            LIVE
          </span>
        </button>

        <!-- Name, Badges & Online Status -->
        <div class="min-w-0 flex-1 space-y-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <NuxtLink
              :to="`/seller/${seller.id}`"
              class="text-sm font-bold text-text hover:text-primary transition-colors truncate"
            >
              {{ seller.name }}
            </NuxtLink>

            <!-- Tier Badge (BekasKu+ > VIP > Trusted > Verified) -->
            <span
              v-if="isBekaskuPlus"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-amber-500 text-white"
            >
              <Crown class="w-2.5 h-2.5" />
              <span>BekasKu+</span>
            </span>
            <span
              v-else-if="isVip"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-amber-500 text-white"
            >
              <Crown class="w-2.5 h-2.5" />
              <span>VIP</span>
            </span>
            <span
              v-else-if="isTrusted"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-info text-white"
            >
              <ShieldCheck class="w-2.5 h-2.5" />
              <span>Trusted</span>
            </span>
            <span
              v-else-if="isVerified"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-success text-white"
            >
              <CheckCircle2 class="w-2.5 h-2.5" />
              <span>Verified</span>
            </span>
          </div>

          <!-- Online / Last Online -->
          <div class="flex items-center gap-1.5 text-[11px]">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="isOnline ? 'bg-success' : 'bg-text-subtle'"
            />
            <span
              class="truncate font-medium"
              :class="isOnline ? 'text-success' : 'text-text-muted'"
            >
              {{ isOnline ? 'Online' : `Terakhir online ${seller.time || '-'}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Kunjungi Button (Hidden when viewing own product) -->
      <NuxtLink
        v-if="!isMine && seller.id"
        :to="`/seller/${seller.id}`"
        class="px-3.5 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
      >
        Kunjungi
      </NuxtLink>
    </div>

    <!-- Bottom Stats Row: Rating • Location • Chat Reply -->
    <div class="flex items-center flex-wrap gap-y-1 gap-x-2 pt-2 border-t border-border/50 text-xs text-text-muted">
      <!-- Rating -->
      <div class="flex items-center gap-1">
        <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
        <span class="font-medium text-text">{{ Number(seller.review_score ?? seller.rating ?? 0).toFixed(1) }}</span>
      </div>

      <span>•</span>

      <!-- Location -->
      <div class="flex items-center gap-1 min-w-0">
        <MapPin class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span class="truncate">{{ locationText }}</span>
      </div>

      <span>•</span>

      <!-- Chat Reply Percentage -->
      <div class="flex items-center gap-1 shrink-0">
        <Clock class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span>{{ seller.percent_chat_reply ?? 0 }}% chat dibalas</span>
      </div>
    </div>

    <!-- Social Media Chips (Instagram & TikTok) -->
    <div
      v-if="instagram || tiktok"
      class="flex items-center flex-wrap gap-2 pt-1"
    >
      <button
        v-if="instagram"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-medium hover:bg-pink-100 transition-colors cursor-pointer"
        @click="openExternalSocial('instagram', instagram)"
      >
        <Instagram class="w-3 h-3 shrink-0" />
        <span class="truncate max-w-[140px]">@{{ instagram }}</span>
      </button>

      <button
        v-if="tiktok"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium hover:bg-slate-200 transition-colors cursor-pointer"
        @click="openExternalSocial('tiktok', tiktok)"
      >
        <Video class="w-3 h-3 shrink-0" />
        <span class="truncate max-w-[140px]">@{{ tiktok }}</span>
      </button>
    </div>
  </div>
</template>
