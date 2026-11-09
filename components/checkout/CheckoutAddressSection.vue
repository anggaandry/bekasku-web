<script setup lang="ts">
import { MapPin, ChevronRight, AlertCircle } from 'lucide-vue-next'
import type { CheckoutAddress } from '~/types/checkout'

const props = defineProps<{
  address: CheckoutAddress | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: []
}>()

const formattedContact = computed(() => {
  if (!props.address) return ''
  const name = props.address.contact_name || props.address.name || 'Penerima'
  const phone = props.address.contact_phone || props.address.phone || ''
  return phone ? `${name} • ${phone}` : name
})

const fullAddressText = computed(() => {
  if (!props.address) return ''
  const parts = [
    props.address.address,
    props.address.address_note ? `(${props.address.address_note})` : null,
    props.address.subdistrict,
    props.address.city,
    props.address.province,
    props.address.postal,
  ].filter(Boolean)
  return parts.join(', ')
})
</script>

<template>
  <div
    class="bg-white border-b border-border p-4 transition-colors cursor-pointer group hover:bg-surface-2/60"
    @click="emit('change')"
  >
    <div class="flex items-start gap-3">
      <!-- Pin Icon (Merah BekasKu) -->
      <div class="text-primary shrink-0 mt-0.5">
        <MapPin class="w-5 h-5 fill-primary/15" />
      </div>

      <!-- Address Content -->
      <div class="flex-1 min-w-0">
        <div v-if="props.address && props.address.address">
          <!-- Name & Phone -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-bold text-text truncate">
              {{ formattedContact }}
            </span>
            <ChevronRight class="w-4 h-4 text-text-subtle shrink-0 group-hover:text-primary transition-colors" />
          </div>

          <!-- Street & Location -->
          <p class="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {{ fullAddressText }}
          </p>
        </div>

        <!-- Belum ada alamat -->
        <div v-else class="flex items-center justify-between">
          <div>
            <span class="text-sm font-bold text-primary flex items-center gap-1.5">
              <AlertCircle class="w-4 h-4" />
              <span>Pilih atau Tambah Alamat Pengiriman</span>
            </span>
            <p class="text-xs text-text-muted mt-0.5">
              Wajib memilih alamat tujuan untuk menghitung opsi kurir pengiriman.
            </p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-subtle shrink-0 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  </div>
</template>

