<script setup lang="ts">
import { Handshake, MapPin, ChevronRight, AlertCircle } from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  detail: TransactionDetail
  isSeller: boolean
}>()

const avatarError = ref(false)

const isMeet = computed(() => {
  return props.detail.meet === true || props.detail.type === 2
})

const partyName = computed(() => {
  if (props.isSeller) {
    return props.detail.buyer_name || 'Pembeli BekasKu'
  }
  return props.detail.seller_name || props.detail.order?.seller_city || 'rodin j'
})

const rawAvatar = computed(() => {
  return props.isSeller ? props.detail.buyer_avatar : props.detail.seller_avatar
})

const sanitizedAvatar = computed(() => {
  return rawAvatar.value ? sanitizeMediaUrl(rawAvatar.value, '') : ''
})

watch(rawAvatar, () => {
  avatarError.value = false
})

const partyCity = computed(() => {
  if (props.isSeller) {
    return props.detail.buyer_city || ''
  }
  return props.detail.seller_city || props.detail.order?.seller_city || 'Medan, Sumatera Utara'
})

function handleCardClick() {
  const targetId = props.isSeller ? props.detail.buyer_id : props.detail.seller_id
  if (targetId && !props.isSeller) {
    navigateTo(`/seller/${targetId}`)
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Section Title & Header -->
    <div class="flex items-center justify-between">
      <h3 class="font-outfit font-bold text-sm text-text">
        {{ isSeller ? 'Informasi Pembeli' : 'Informasi Penjual' }}
      </h3>

      <!-- Pay & Pick Badge on right of header -->
      <div
        v-if="isMeet"
        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-chip-soft-bg text-primary text-xs font-semibold"
      >
        <Handshake class="w-3.5 h-3.5 text-primary" />
        <span>Pay & Pick</span>
      </div>
    </div>

    <!-- Seller / Buyer Card -->
    <div
      class="bg-white rounded-2xl border border-border/80 p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer hover:border-primary/50 shadow-2xs"
      @click="handleCardClick"
    >
      <div class="flex items-center gap-3 min-w-0">
        <!-- Rounded Avatar with Fallback -->
        <div class="w-11 h-11 rounded-full border border-border/80 overflow-hidden shrink-0 bg-surface-2 flex items-center justify-center">
          <img
            v-if="sanitizedAvatar && !avatarError"
            :src="sanitizedAvatar"
            :alt="partyName"
            class="w-full h-full object-cover"
            @error="avatarError = true"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center font-bold text-base text-primary bg-primary/10 select-none"
          >
            {{ partyName.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Name & City -->
        <div class="min-w-0">
          <h4 class="font-outfit font-bold text-sm text-text truncate">
            {{ partyName }}
          </h4>
          <div v-if="partyCity" class="flex items-center gap-1 text-xs font-outfit text-text-muted mt-0.5 truncate">
            <MapPin class="w-3 h-3 text-text-muted shrink-0" />
            <span class="truncate">{{ partyCity }}</span>
          </div>
        </div>
      </div>

      <!-- Arrow > -->
      <ChevronRight class="w-4 h-4 text-text-muted shrink-0" />
    </div>

    <!-- Informative Blue Alert Box for Pay & Pick / Meetup -->
    <div
      v-if="isMeet"
      class="bg-info-soft border border-info-border rounded-xl p-3 flex items-start gap-2.5 text-xs text-info-text font-outfit leading-relaxed"
    >
      <AlertCircle class="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <p>
        Periksa kondisi barang secara langsung saat bertemu. Setelah sesuai, pindai QR Code penjual untuk menyelesaikan pesanan.
      </p>
    </div>
  </div>
</template>
