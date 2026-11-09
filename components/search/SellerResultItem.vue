<template>
  <div
    class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors cursor-pointer"
    @click="handleSelect"
  >
    <!-- Avatar -->
    <div class="w-10 h-10 rounded-full bg-surface-2 border border-border overflow-hidden flex items-center justify-center shrink-0">
      <img
        v-if="avatarUrl && !imgError"
        :src="avatarUrl"
        :alt="sellerName"
        width="40"
        height="40"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="imgError = true"
      />
      <span v-else class="font-outfit font-bold text-sm text-primary">
        {{ sellerInitial }}
      </span>
    </div>

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-outfit font-semibold text-sm text-text truncate">
          {{ sellerName }}
        </span>
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

      <div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-muted font-outfit">
        <MapPin class="w-3.5 h-3.5 text-text-subtle shrink-0" />
        <span class="truncate">{{ sellerCity }}</span>

        <template v-if="ratingValue > 0">
          <span class="text-border-light">&bull;</span>
          <Star class="w-3.5 h-3.5 fill-secondary-star text-secondary-star shrink-0" />
          <span class="font-medium text-text">{{ ratingValue.toFixed(1) }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPin, Star } from 'lucide-vue-next'
import type { SellerResult } from '~/types/search'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  seller: SellerResult
}>()

const emit = defineEmits<{
  select: [seller: SellerResult]
}>()

const imgError = ref(false)

const sellerName = computed(() => props.seller.name || props.seller.username || 'Penjual BekasKu')
const sellerInitial = computed(() => sellerName.value.charAt(0).toUpperCase() || '?')
const sellerCity = computed(() => props.seller.city || 'Indonesia')

const avatarUrl = computed(() => sanitizeMediaUrl(props.seller.avatar || '', ''))

const ratingValue = computed(() => {
  const num = parseFloat(String(props.seller.rating ?? 0))
  return isNaN(num) ? 0 : num
})

// Source of Truth Rule #11: BekasKu+ vs VIP
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

function handleSelect() {
  emit('select', props.seller)
  const id = props.seller.id || props.seller._id
  if (id) {
    navigateTo(`/seller/${id}`)
  }
}
</script>

