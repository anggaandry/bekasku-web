<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Clock, Package } from 'lucide-vue-next'
import type { MyCatalogItem } from '~/types/catalog'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'
import CatalogItemActions from '~/components/catalog/CatalogItemActions.vue'

const props = defineProps<{
  item: MyCatalogItem
}>()

const emit = defineEmits<{
  (e: 'delete', item: MyCatalogItem): void
  (e: 'mark-sold', item: MyCatalogItem): void
  (e: 'cancel', item: MyCatalogItem): void
}>()

const { formatPrice } = useFormat()
const imageError = ref(false)

watch(() => props.item.image, () => {
  imageError.value = false
})

const primaryImage = computed(() => {
  if (imageError.value) return ''
  return props.item.image ? sanitizeMediaUrl(props.item.image, '') : ''
})

const isDibutuhkan = computed(() => {
  return Number(props.item.sell_method) === 2 || Number(props.item.sell_method) === 4
})

const statusName = computed(() => {
  return props.item.status?.name || 'Sedang Tayang'
})

const isSold = computed(() => {
  const s = statusName.value.toLowerCase()
  return s.includes('terjual') || s.includes('ditemukan') || props.item.step === 2
})

const isCanceled = computed(() => {
  const s = statusName.value.toLowerCase()
  return s.includes('batal') || s.includes('tolak') || s.includes('kadaluarsa') || s.includes('nonaktif')
})

const isActive = computed(() => !isSold.value && !isCanceled.value)

const badgeColors = computed(() => {
  const s = statusName.value.toLowerCase()
  if (s.includes('terjual') || s.includes('ditemukan')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700' }
  }
  if (s.includes('tolak')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700' }
  }
  if (s.includes('batal') || s.includes('kadaluarsa')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700' }
  }
  if (s.includes('verifikasi')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700' }
  }
  return { bg: 'bg-emerald-50', text: 'text-emerald-700' }
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-border-light p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between font-outfit relative group">
    <!-- Top Row: Status Badge, Dibutuhkan Tag, Time -->
    <div class="flex items-center justify-between gap-2 pb-3 border-b border-border-light">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span
          class="px-2 py-0.5 rounded-md text-[11px] font-semibold"
          :class="[badgeColors.bg, badgeColors.text]"
        >
          {{ statusName }}
        </span>

        <span
          v-if="isDibutuhkan"
          class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] font-semibold"
        >
          Dibutuhkan
        </span>
      </div>

      <div class="flex items-center gap-1 text-[11px] text-text-subtle shrink-0">
        <Clock class="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
        <span>{{ item.time || 'Baru saja' }}</span>
      </div>
    </div>

    <!-- Middle Row: Image & Product Info -->
    <NuxtLink
      :to="`/product/${item.id}`"
      class="flex items-start gap-3.5 py-3 group/link cursor-pointer"
    >
      <div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
        <img
          v-if="primaryImage"
          :src="primaryImage"
          :alt="item.title"
          width="80"
          height="80"
          loading="lazy"
          class="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-200"
          @error="imageError = true"
        />
        <Package v-else class="w-8 h-8 text-text-subtle" aria-hidden="true" />
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-outfit text-sm font-medium text-text group-hover/link:text-primary transition-colors line-clamp-2 leading-snug">
          {{ item.title }}
        </h3>
        <p class="font-outfit text-base sm:text-lg font-bold text-primary mt-1.5 tracking-tight">
          {{ formatPrice(item.price) }}
        </p>
      </div>
    </NuxtLink>

    <!-- Bottom Actions Row (Layer 2 Child Component) -->
    <CatalogItemActions
      :item="item"
      :is-active="isActive"
      @mark-sold="emit('mark-sold', $event)"
      @cancel="emit('cancel', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
