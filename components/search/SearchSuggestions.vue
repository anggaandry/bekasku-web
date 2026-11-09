<template>
  <div class="py-2">
    <!-- Produk Section Header (Matches Screenshot 2: 'Produk' left, 'Cari "xiaomi" di produk' red right) -->
    <div class="px-4 pt-2 pb-1.5 flex items-center justify-between">
      <h2 class="font-outfit font-bold text-[15px] text-text">
        Produk
      </h2>
      <button
        type="button"
        class="font-outfit font-medium text-[13px] text-primary hover:text-primary-dark cursor-pointer transition-colors text-right"
        @click="emit('submitQuery', query)"
      >
        {{ searchInProductText }}
      </button>
    </div>

    <!-- Matching History Items (with History clock icon on left & X delete on right, per Screenshot 2) -->
    <ul v-if="matchingHistory.length > 0">
      <li
        v-for="hItem in matchingHistory"
        :key="`hist-${hItem.keyword}`"
        class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors"
      >
        <button
          type="button"
          class="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
          @click="emit('selectKeyword', hItem.keyword)"
        >
          <History class="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span class="font-outfit text-sm text-text truncate">
            {{ hItem.keyword }}
          </span>
        </button>
        <button
          type="button"
          class="p-1 text-text-subtle hover:text-text-muted shrink-0 cursor-pointer ml-2"
          :aria-label="`Hapus ${hItem.keyword}`"
          @click.stop="promptDeleteHistory(hItem.keyword)"
        >
          <X class="w-4 h-4" />
        </button>
      </li>
    </ul>

    <!-- Keyword Suggestions List (Magnifying glass left + keyword + ArrowUpLeft right, per Screenshot 2) -->
    <ul v-if="filteredSuggestions.length > 0">
      <li
        v-for="(kw, idx) in filteredSuggestions"
        :key="`sug-${idx}-${kw}`"
        class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors"
      >
        <button
          type="button"
          class="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
          @click="emit('selectKeyword', kw)"
        >
          <Search class="w-[18px] h-[18px] text-text-subtle shrink-0" />
          <span class="font-outfit text-sm text-text truncate">
            {{ kw }}
          </span>
        </button>
        <button
          type="button"
          class="p-1 text-text-subtle hover:text-text shrink-0 cursor-pointer ml-2"
          :title="`Isi kata kunci ${kw}`"
          :aria-label="`Isi kata kunci ${kw}`"
          @click.stop="emit('fillKeyword', kw)"
        >
          <ArrowUpLeft class="w-[18px] h-[18px]" />
        </button>
      </li>
    </ul>

    <!-- Fallback direct keyword item when API returns empty suggestions -->
    <div
      v-else-if="!loading && matchingHistory.length === 0 && query.trim()"
      class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors"
    >
      <button
        type="button"
        class="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
        @click="emit('selectKeyword', query.trim())"
      >
        <Search class="w-[18px] h-[18px] text-text-subtle shrink-0" />
        <span class="font-outfit text-sm text-text truncate">
          {{ query.trim() }}
        </span>
      </button>
      <ArrowUpLeft class="w-[18px] h-[18px] text-text-subtle shrink-0 ml-2" />
    </div>

    <!-- Seller Suggestions Section (Matches search_view.dart L429-468) -->
    <div v-if="sellers.length > 0" class="mt-4 pt-2 border-t border-border">
      <div class="px-4 py-1.5 flex items-center justify-between">
        <h2 class="font-outfit font-bold text-[15px] text-text">
          Toko
        </h2>
        <button
          type="button"
          class="font-outfit font-medium text-[13px] text-primary hover:text-primary-dark cursor-pointer transition-colors"
          @click="emit('searchInSeller', query)"
        >
          Cari "{{ query.toLowerCase() }}" di penjual
        </button>
      </div>
      <div>
        <SellerResultItem
          v-for="seller in sellers.slice(0, 5)"
          :key="seller.id || seller._id"
          :seller="seller"
        />
      </div>
    </div>

    <!-- Confirmation Modal for Single History Delete -->
    <AppModal
      v-model="showDeleteConfirm"
      title="Hapus Riwayat Pencarian"
    >
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Apakah Anda yakin ingin menghapus kata kunci
        <span class="font-semibold text-text">"{{ pendingKeyword }}"</span> dari riwayat pencarian?
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
            @click="showDeleteConfirm = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer"
            @click="confirmDeleteHistory"
          >
            Hapus
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { Search, History, X, ArrowUpLeft } from 'lucide-vue-next'
import type { SearchHistoryItem, SellerResult } from '~/types/search'
import SellerResultItem from './SellerResultItem.vue'
import AppModal from '~/components/shared/AppModal.vue'

const props = withDefaults(
  defineProps<{
    query: string
    suggestions: string[]
    history?: SearchHistoryItem[]
    sellers?: SellerResult[]
    categoryName?: string
    type?: number
    loading?: boolean
  }>(),
  {
    history: () => [],
    sellers: () => [],
    categoryName: '',
    type: 0,
    loading: false,
  }
)

const emit = defineEmits<{
  selectKeyword: [keyword: string]
  fillKeyword: [keyword: string]
  submitQuery: [keyword: string]
  deleteHistory: [keyword: string]
  searchInSeller: [keyword: string]
}>()

const searchInProductText = computed(() => {
  const qLower = props.query.trim().toLowerCase()
  if (props.categoryName) {
    return `Cari "${qLower}" di ${props.categoryName}`
  }
  if (props.type === 2) {
    return `Cari "${qLower}" di Best Deal`
  }
  return `Cari "${qLower}" di produk`
})

const matchingHistory = computed(() => {
  const qLower = props.query.trim().toLowerCase()
  if (!qLower) return []
  return props.history
    .filter((item) => item.keyword.toLowerCase().includes(qLower))
    .slice(0, 2)
})

const filteredSuggestions = computed(() => {
  const histSet = new Set(matchingHistory.value.map((h) => h.keyword.toLowerCase()))
  return props.suggestions
    .filter((kw) => !histSet.has(kw.trim().toLowerCase()))
    .slice(0, 10)
})

const showDeleteConfirm = ref(false)
const pendingKeyword = ref('')

function promptDeleteHistory(kw: string) {
  pendingKeyword.value = kw
  showDeleteConfirm.value = true
}

function confirmDeleteHistory() {
  if (pendingKeyword.value) {
    emit('deleteHistory', pendingKeyword.value)
  }
  showDeleteConfirm.value = false
  pendingKeyword.value = ''
}
</script>

