<script setup lang="ts">
import { Store, BadgeCheck, TrendingUp, Star, Zap, Gem, Crown, Image as ImageIcon } from 'lucide-vue-next'
import type { TransactionListItem } from '~/types/transaction'
import { formatRupiah } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'
import { resolveStatusBadgeStyle } from '~/utils/transactionStatus'

const props = defineProps<{
  item: TransactionListItem
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', item: TransactionListItem): void
  (e: 'pay', item: TransactionListItem): void
}>()

const imageError = ref(false)

const cardImage = computed(() => {
  return props.item.image ? sanitizeMediaUrl(props.item.image, '') : ''
})

watch(
  () => props.item.image,
  () => {
    imageError.value = false
  }
)

const statusLabel = computed(() => {
  if (typeof props.item.status === 'object' && props.item.status?.name) {
    return props.item.status.name
  }
  return props.item.statusLabel || String(props.item.status || 'Menunggu')
})

const badgeStyle = computed(() => {
  const status = typeof props.item.status === 'object' ? props.item.status : null
  return resolveStatusBadgeStyle(
    statusLabel.value,
    props.item.textColor || status?.text_color,
    props.item.backgroundColor || status?.back_color,
  )
})

const isPromoOrSub = computed(() => {
  const t = (props.item.title || '').toLowerCase()
  return (
    t.includes('subscription') ||
    t.includes('langganan') ||
    t.includes('sundul') ||
    t.includes('highlight') ||
    t.includes('spotlight') ||
    t.includes('promosi')
  )
})

const promoSubLabel = computed(() => {
  const t = (props.item.title || '').toLowerCase()
  if (t.includes('subscription') || t.includes('langganan')) return 'Langganan'
  return 'Promosi Iklan'
})

const isOfficialShop = computed(() => {
  const name = props.item.shopName || ''
  return name === 'BekasKu Official' || name === 'Promosi BekasKu'
})

const formattedTitle = computed(() => {
  const raw = props.item.title || ''
  const lower = raw.toLowerCase().trim()
  if (lower.startsWith('subscription') || props.item.paymentType === 'subscription') {
    const subType = lower.replace(/^subscription\s*/i, '').trim()
    if (!subType || subType === 'vip' || subType === 'vvip') return 'Paket Langganan VIP'
    return `Paket Langganan ${subType.charAt(0).toUpperCase() + subType.slice(1)}`
  }
  return raw
})

function handleClick() {
  emit('click', props.item)
}

function handlePayClick(event: MouseEvent) {
  event.stopPropagation()
  emit('pay', props.item)
}
</script>

<template>
  <div
    class="bg-white rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none"
    :class="[
      isSelected ? 'border-primary ring-2 ring-primary/10 shadow-xs' : 'border-border hover:border-primary/40',
    ]"
    @click="handleClick"
  >
    <!-- Header: Shop & Status -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-1.5 min-w-0">
        <component
          :is="isOfficialShop ? BadgeCheck : Store"
          class="w-4 h-4 text-primary shrink-0"
        />
        <span class="font-outfit font-semibold text-sm text-text truncate">
          {{ item.shopName }}
        </span>
      </div>

      <span
        class="shrink-0 px-2.5 py-0.5 text-xs font-outfit font-medium rounded-sm whitespace-nowrap"
        :style="badgeStyle"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Body: Product Info Row -->
    <div class="flex items-start gap-3">
      <!-- Thumbnail -->
      <div class="w-16 h-16 rounded-lg border border-border/60 overflow-hidden shrink-0 bg-surface-2 flex items-center justify-center">
        <!-- Special promo icons -->
        <div v-if="(item.title || '').toLowerCase().includes('sundul')" class="w-full h-full bg-primary/10 flex items-center justify-center">
          <TrendingUp class="w-7 h-7 text-primary" />
        </div>
        <div v-else-if="(item.title || '').toLowerCase().includes('highlight')" class="w-full h-full bg-amber-50 flex items-center justify-center">
          <Star class="w-7 h-7 text-amber-500" />
        </div>
        <div v-else-if="(item.title || '').toLowerCase().includes('spotlight')" class="w-full h-full bg-indigo-50 flex items-center justify-center">
          <Zap class="w-7 h-7 text-indigo-500" />
        </div>
        <div v-else-if="(item.title || '').toLowerCase().includes('subscription') || item.paymentType === 'subscription'" class="w-full h-full bg-amber-50 flex items-center justify-center">
          <Crown class="w-7 h-7 text-amber-500" />
        </div>
        <div v-else-if="(item.title || '').toLowerCase().includes('promosi')" class="w-full h-full bg-surface-2 flex items-center justify-center">
          <Gem class="w-7 h-7 text-primary" />
        </div>
        <!-- Standard Image -->
        <img
          v-else-if="cardImage && !imageError"
          :src="cardImage"
          :alt="item.title"
          loading="lazy"
          class="w-full h-full object-cover"
          @error="imageError = true"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
          <ImageIcon class="w-6 h-6" />
        </div>
      </div>

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <!-- Promo / Subscription Badge -->
        <div v-if="isPromoOrSub" class="mb-1">
          <span class="inline-block px-1.5 py-0.5 text-[10px] font-outfit font-semibold text-text-muted bg-surface-2 border border-border rounded">
            {{ promoSubLabel }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="font-outfit font-medium text-sm text-text line-clamp-2 leading-snug">
          {{ formattedTitle }}
        </h3>

        <!-- Price -->
        <div class="flex items-baseline justify-end gap-1.5 mt-2">
          <span
            v-if="item.originalPrice && item.originalPrice > (item.price || 0)"
            class="font-outfit text-xs text-text-muted line-through"
          >
            {{ formatRupiah(item.originalPrice) }}
          </span>
          <span class="font-outfit font-semibold text-sm text-text">
            {{ formatRupiah(item.price) }}
          </span>
        </div>

        <!-- Total Item & Amount -->
        <div class="flex items-center justify-end text-xs font-outfit mt-1">
          <span class="text-text-muted">
            Total {{ (item.otherCount || 0) + 1 }} item:&nbsp;
          </span>
          <span class="font-semibold text-text">
            {{ formatRupiah(item.totalAmount ?? item.price) }}
          </span>
        </div>

        <!-- Payment CTA Button -->
        <div v-if="item.isPayment && item.canPay" class="flex justify-end mt-3 pt-2 border-t border-border/50">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs transition-colors cursor-pointer"
            @click="handlePayClick"
          >
            Lihat Cara Bayar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

