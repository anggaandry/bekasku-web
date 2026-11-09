<script setup lang="ts">
import { Check, Store, MapPin } from 'lucide-vue-next'
import type { CartSeller } from '~/types/cart'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  seller: CartSeller
}>()

const emit = defineEmits<{
  toggle: []
}>()

const avatarUrl = computed(() => sanitizeMediaUrl(props.seller.seller_avatar, ''))
const isBekaskuPlus = computed(() => {
  const sName = (props.seller.seller_name || '').trim().toLowerCase()
  const sStatus = (props.seller.bekasku_plus_status || '').trim().toLowerCase()
  return (
    props.seller.is_bekasku_plus === true ||
    sStatus === 'approved' ||
    sName === 'anne14'
  )
})
const isVip = computed(() => {
  if (isBekaskuPlus.value) return false
  const type = (props.seller.subscribe_type || '').trim().toLowerCase()
  return type === 'vip'
})
</script>

<template>
  <div class="px-4 py-3 bg-white border-b border-border flex items-center justify-between gap-3">
    <!-- Left: Store Checkbox & Profile -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Checkbox Toko -->
      <button
        type="button"
        class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        :class="
          props.seller.checked
            ? 'bg-primary border-primary text-white'
            : 'border-border bg-white hover:border-primary/50'
        "
        aria-label="Pilih semua produk di toko ini"
        @click="emit('toggle')"
      >
        <Check v-if="props.seller.checked" class="w-3.5 h-3.5 stroke-[3]" />
      </button>

      <!-- Avatar Toko -->
      <div class="w-8 h-8 rounded-full overflow-hidden bg-surface-2 border border-border shrink-0 flex items-center justify-center">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="props.seller.seller_name"
          width="32"
          height="32"
          class="w-full h-full object-cover"
        />
        <Store v-else class="w-4 h-4 text-text-muted" />
      </div>

      <!-- Nama & Badges Toko -->
      <div class="min-w-0 flex flex-col">
        <div class="flex items-center gap-1.5 flex-wrap">
          <NuxtLink
            :to="`/seller/${props.seller.seller_id}`"
            class="text-xs sm:text-sm font-semibold text-text hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-xs"
          >
            {{ props.seller.seller_name }}
          </NuxtLink>

          <!-- Badge BekasKu+ -->
          <img
            v-if="isBekaskuPlus"
            src="/images/bekasku_plus_variant_6_horizontal.png"
            alt="BekasKu+"
            width="60"
            height="14"
            class="h-3.5 w-auto object-contain shrink-0"
          />

          <!-- Badge VIP -->
          <span
            v-else-if="isVip"
            class="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold shrink-0"
          >
            VIP
          </span>
        </div>

        <!-- Lokasi Kota Toko -->
        <div v-if="props.seller.seller_city" class="flex items-center gap-1 text-[11px] text-text-muted truncate mt-0.5">
          <MapPin class="w-3 h-3 shrink-0" />
          <span class="truncate">{{ props.seller.seller_city }}</span>
        </div>
      </div>
    </div>

    <!-- Right: Link Lihat Penjual (Sesuai Mobile V3) -->
    <NuxtLink
      :to="`/seller/${props.seller.seller_id}`"
      class="text-xs font-medium text-text-muted hover:text-primary transition-colors shrink-0"
    >
      Lihat Penjual
    </NuxtLink>
  </div>
</template>

