<template>
  <div
    class="bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all cursor-pointer group"
    :class="error ? 'border-danger bg-danger/5' : 'border-border-light hover:border-primary/50'"
    @click="$emit('open-address-modal')"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <MapPin class="w-5 h-5" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <h4 class="text-sm font-bold text-text-primary">
            {{ address?.address_name || 'Alamat Asal Penjemputan' }}
          </h4>
          <span v-if="address?.contact_name" class="text-xs text-text-muted font-medium">
            • {{ address.contact_name }}
          </span>
        </div>

        <p v-if="address?.address" class="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
          {{ address.address }}<span v-if="address.city">, {{ address.city }}</span><span v-if="address.province">, {{ address.province }}</span>
        </p>
        <p v-else class="text-xs text-text-muted mt-1">
          Pilih alamat asal penjemputan barang untuk kurir ekspedisi.
        </p>
      </div>

      <div class="flex items-center gap-1 text-xs font-bold text-primary shrink-0 self-center pl-2">
        <span>{{ address ? 'Ubah' : 'Pilih' }}</span>
        <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>

    <p v-if="error" class="mt-2 text-xs text-danger font-medium">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { MapPin, ChevronRight } from 'lucide-vue-next'
import type { PostAddressData } from '~/types/post'

defineProps<{
  address: PostAddressData | null
  error?: string
}>()

defineEmits<{
  (e: 'open-address-modal'): void
}>()
</script>

