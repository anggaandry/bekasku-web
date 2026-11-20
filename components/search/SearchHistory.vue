<template>
  <div v-if="items.length > 0" class="py-2">
    <!-- Header Row: Pencarian terakhir + Hapus semua -->
    <div class="px-4 py-2 flex items-center justify-between">
      <h2 class="font-outfit font-bold text-base text-text">
        Pencarian terakhir
      </h2>
      <button
        type="button"
        class="font-outfit text-sm text-primary hover:text-primary-dark font-normal cursor-pointer transition-colors"
        @click.stop="emit('clearAll')"
      >
        Hapus semua
      </button>
    </div>

    <!-- History List Items -->
    <ul class="divide-y divide-transparent">
      <li
        v-for="item in displayedItems"
        :key="item.id || item._id || item.keyword"
        class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors group"
      >
        <button
          type="button"
          class="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
          @click="emit('select', item.keyword)"
        >
          <History class="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span class="font-outfit text-sm text-text truncate group-hover:text-primary transition-colors">
            {{ item.keyword }}
          </span>
        </button>

        <button
          type="button"
          class="p-1 text-text-subtle hover:text-text-muted shrink-0 cursor-pointer ml-2"
          :aria-label="`Hapus riwayat ${item.keyword}`"
          @click.stop="emit('delete', item.keyword)"
        >
          <X class="w-4 h-4" />
        </button>
      </li>
    </ul>

    <!-- Toggle: Lihat semua / Sembunyikan -->
    <div v-if="items.length > initialLimit" class="flex justify-center pt-2 pb-1">
      <button
        type="button"
        class="font-outfit text-sm font-medium text-primary hover:text-primary-dark py-1.5 px-4 cursor-pointer transition-colors"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Sembunyikan' : 'Lihat semua' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { History, X } from 'lucide-vue-next'
import type { SearchHistoryItem } from '~/types/search'

const props = withDefaults(
  defineProps<{
    items: SearchHistoryItem[]
    initialLimit?: number
  }>(),
  {
    initialLimit: 3,
  }
)

const emit = defineEmits<{
  select: [keyword: string]
  delete: [keyword: string]
  clearAll: []
}>()

const showAll = ref(false)

const displayedItems = computed(() => {
  if (showAll.value) return props.items.slice(0, 50)
  return props.items.slice(0, props.initialLimit)
})
</script>

