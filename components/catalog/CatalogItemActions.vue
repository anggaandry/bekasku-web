<script setup lang="ts">
import {
  TrendingUp,
  CheckCircle2,
  Ban,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import type { MyCatalogItem } from '~/types/catalog'

defineProps<{
  item: MyCatalogItem
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'mark-sold', item: MyCatalogItem): void
  (e: 'cancel', item: MyCatalogItem): void
  (e: 'delete', item: MyCatalogItem): void
}>()
</script>

<template>
  <div class="pt-3 border-t border-border-light flex items-center justify-between gap-2">
    <!-- Quick Promo / Sundul Button -->
    <NuxtLink
      :to="`/sundul?product_id=${item.id}`"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold transition-colors cursor-pointer"
      title="Promosikan & Sundul Iklan"
    >
      <TrendingUp class="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
      <span>Sundul</span>
    </NuxtLink>

    <!-- Right Action Buttons -->
    <div class="flex items-center gap-1">
      <!-- Mark as Sold Button (if active) -->
      <button
        v-if="isActive"
        type="button"
        @click="emit('mark-sold', item)"
        class="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-emerald-50 text-text-muted hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        title="Tandai Terjual"
      >
        <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" />
        <span class="hidden sm:inline">Terjual</span>
      </button>

      <!-- Cancel Active Post Button (if active) -->
      <button
        v-if="isActive"
        type="button"
        @click="emit('cancel', item)"
        class="p-1.5 rounded-xl text-text-muted hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
        title="Nonaktifkan / Batalkan Tayang"
        aria-label="Nonaktifkan / Batalkan Tayang"
      >
        <Ban class="w-4 h-4" aria-hidden="true" />
      </button>

      <!-- Edit Button -->
      <NuxtLink
        :to="`/post/sell?edit=${item.id}`"
        class="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
        title="Edit Iklan"
        aria-label="Edit Iklan"
      >
        <Pencil class="w-4 h-4" aria-hidden="true" />
      </NuxtLink>

      <!-- Delete Button -->
      <button
        type="button"
        @click="emit('delete', item)"
        class="p-1.5 rounded-xl text-text-muted hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
        title="Hapus Iklan"
        aria-label="Hapus Iklan"
      >
        <Trash2 class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

