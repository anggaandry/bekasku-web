<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import type { StatusFilterItem, MyCatalogCounts } from '~/types/catalog'

const props = defineProps<{
  statusList: StatusFilterItem[]
  selectedStatus: number
  selectedType: number
  counts: MyCatalogCounts
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'update:status', status: number): void
  (e: 'update:type', typeNum: number): void
  (e: 'search', query: string): void
}>()

const localSearch = ref(props.searchQuery)

watch(
  () => props.searchQuery,
  (val) => {
    localSearch.value = val
  },
)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  localSearch.value = target.value
  emit('search', target.value)
}

function clearSearch() {
  localSearch.value = ''
  emit('search', '')
}

function getStatusCount(status: number): number {
  switch (status) {
    case 1:
      return props.counts.active
    case 2:
      return props.counts.canceled
    case 3:
      return props.counts.sold
    case 0:
    default:
      return props.counts.all
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-border-light shadow-2xs p-3.5 sm:p-4 space-y-3 font-outfit">
    <!-- Top Row: Search Input + Type Filter (Desktop: inline, Mobile: stack) -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Field -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          id="catalog-search-input"
          name="catalog_search"
          type="text"
          :value="localSearch"
          @input="handleInput"
          placeholder="Cari nama barang..."
          aria-label="Cari nama barang"
          class="w-full pl-9 pr-9 py-2.5 rounded-xl bg-surface-2 border border-border-light text-xs sm:text-sm text-text placeholder:text-text-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          v-if="localSearch"
          type="button"
          @click="clearSearch"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text rounded-full hover:bg-border-light transition-colors cursor-pointer"
          aria-label="Hapus pencarian"
        >
          <X class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- Type Switcher (Semua, Jual, Dibutuhkan) (Desktop only) -->
      <div class="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-border-light shrink-0">
        <button
          type="button"
          @click="emit('update:type', 0)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="selectedType === 0 ? 'bg-white text-text shadow-2xs font-bold' : 'text-text-muted hover:text-text'"
        >
          Semua Tipe
        </button>
        <button
          type="button"
          @click="emit('update:type', 1)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="selectedType === 1 ? 'bg-white text-primary shadow-2xs font-bold' : 'text-text-muted hover:text-text'"
        >
          Jual
        </button>
        <button
          type="button"
          @click="emit('update:type', 2)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="selectedType === 2 ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-text-muted hover:text-text'"
        >
          Dibutuhkan
        </button>
      </div>
    </div>

    <!-- Bottom Row: Status Filter Pills (Horizontal scroll on mobile, wrap on desktop) -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 -mx-1 px-1">
      <button
        v-for="item in statusList"
        :key="item.status"
        type="button"
        @click="emit('update:status', item.status)"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer"
        :class="
          selectedStatus === item.status
            ? 'bg-primary text-white shadow-xs'
            : 'bg-surface-2 hover:bg-border-light text-text border border-border-light'
        "
      >
        <span>{{ item.label }}</span>
        <span
          class="px-1.5 py-0.2 text-[10px] rounded-full font-bold"
          :class="
            selectedStatus === item.status
              ? 'bg-white/25 text-white'
              : 'bg-white text-text-muted border border-border-light'
          "
        >
          {{ getStatusCount(item.status) }}
        </span>
      </button>
    </div>
  </div>
</template>

