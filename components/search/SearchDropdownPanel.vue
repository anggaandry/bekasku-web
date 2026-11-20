<template>
  <div
    v-if="open"
    class="w-full bg-white text-text rounded-2xl shadow-2xl border border-border/80 overflow-hidden"
    @mousedown.stop
  >
    <div class="max-h-[75vh] sm:max-h-[480px] overflow-y-auto overscroll-contain py-1.5">
      <!-- State A: Live Autocomplete Suggestions when typing -->
      <SearchSuggestions
        v-if="query.trim().length > 0"
        :query="query"
        :suggestions="suggestions"
        :history="authStore.isLoggedIn ? lastSearch : []"
        :sellers="sellerSuggestions"
        :category-name="categoryName"
        :type="searchType"
        :loading="suggestLoading"
        @select-keyword="handleSelectKeyword"
        @fill-keyword="emit('fillQuery', $event)"
        @submit-query="handleSelectKeyword"
        @delete-history="deleteKeyword"
        @search-in-seller="handleSearchInSeller"
      />

      <!-- State B: Empty Input (Last Viewed, Search History, Category Chips, or Guest Prompt) -->
      <div v-else>
        <!-- Shimmer while loading empty landing -->
        <div
          v-if="landingLoading && lastView.length === 0 && lastSearch.length === 0 && categoryData.length === 0"
          class="px-4 py-3 space-y-2.5"
        >
          <div v-for="n in 4" :key="`drop-skel-${n}`" class="h-10 rounded-lg bg-surface-2 animate-shimmer" />
        </div>

        <template v-else>
          <!-- Authenticated: Produk terakhir dilihat & Pencarian terakhir -->
          <template v-if="authStore.isLoggedIn">
            <section v-if="lastView.length > 0" class="py-2">
              <h2 class="px-4 font-outfit font-bold text-sm sm:text-base text-text mb-2.5">
                Produk terakhir dilihat
              </h2>
              <div class="px-4 flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
                <NuxtLink
                  v-for="(item, idx) in lastView"
                  :key="item.id || item._id || idx"
                  :to="productPath(item)"
                  class="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-xl border border-border bg-surface-2 overflow-hidden shrink-0 hover:border-primary transition-colors flex items-center justify-center"
                  @click="emit('close')"
                >
                  <img
                    v-if="getThumbUrl(item)"
                    :src="getThumbUrl(item)"
                    :alt="item.title || 'Produk terakhir dilihat'"
                    width="72"
                    height="72"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <ImageIcon v-else class="w-5 h-5 text-text-subtle" />
                </NuxtLink>
              </div>
            </section>

            <SearchHistory
              :items="lastSearch"
              :initial-limit="3"
              @select="handleSelectKeyword"
              @delete="deleteKeyword"
              @clear-all="deleteAllKeywords"
            />
          </template>

          <!-- Guest Prompt -->
          <div
            v-else
            class="px-5 py-6 text-center max-w-sm mx-auto"
          >
            <div class="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3 text-text-subtle">
              <History class="w-6 h-6" />
            </div>
            <h2 class="font-outfit font-bold text-base text-text mb-1">
              Masuk yuk!
            </h2>
            <p class="font-outfit text-xs text-text-muted leading-relaxed mb-4">
              Masuk ke akunmu untuk melihat riwayat pencarian dan produk yang terakhir dilihat.
            </p>
            <button
              type="button"
              class="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-colors cursor-pointer"
              @click="handleGuestLogin"
            >
              Masuk Sekarang
            </button>
          </div>

          <!-- Kategori Pilihan -->
          <SearchCategoryChips
            v-if="categoryData.length > 0"
            :categories="categoryData"
            @select="handleSelectCategory"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { History, Image as ImageIcon } from 'lucide-vue-next'
import { SEARCH_TYPE_REGULAR } from '~/utils/constants'
import { sanitizeMediaUrl } from '~/utils/media'
import { productPath } from '~/utils/slug'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useSearchLanding } from '~/composables/useSearchLanding'
import { useSearchSuggest } from '~/composables/useSearchSuggest'
import type { SearchCategoryItem } from '~/types/search'
import SearchHistory from '~/components/search/SearchHistory.vue'
import SearchCategoryChips from '~/components/search/SearchCategoryChips.vue'
import SearchSuggestions from '~/components/search/SearchSuggestions.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    query: string
    categoryId?: string
    categoryName?: string
    searchType?: number
  }>(),
  {
    categoryId: '',
    categoryName: '',
    searchType: 0,
  }
)

const emit = defineEmits<{
  close: []
  fillQuery: [keyword: string]
  'update:loading': [loading: boolean]
}>()

const authStore = useAuthStore()
const authModal = useAuthModal()

const {
  categoryData,
  lastSearch,
  lastView,
  loading: landingLoading,
  fetchEmptyLanding,
  addRecentKeyword,
  deleteKeyword,
  deleteAllKeywords,
} = useSearchLanding()

const {
  suggestions,
  sellerSuggestions,
  loading: suggestLoading,
  debouncedSuggest,
  clearSuggestions,
} = useSearchSuggest()

function getThumbUrl(item: any): string {
  const raw = Array.isArray(item.images) && item.images.length > 0
    ? item.images[0]
    : item.image || ''
  return sanitizeMediaUrl(String(raw), '')
}

function handleSelectKeyword(kw: string) {
  const target = kw.trim()
  if (!target) return
  addRecentKeyword(target)
  emit('close')

  const query: Record<string, string> = { q: target }
  if (props.categoryId) query.category_id = props.categoryId
  if (props.categoryName) query.category_name = props.categoryName
  query.type = String(props.searchType && props.searchType !== 0 ? props.searchType : SEARCH_TYPE_REGULAR)

  navigateTo({ path: '/search/result', query })
}

function handleSearchInSeller(kw: string) {
  const target = kw.trim()
  if (!target) return
  addRecentKeyword(target)
  emit('close')
  navigateTo({
    path: '/search/result',
    query: {
      q: target,
      tab: 'store',
    },
  })
}

function handleSelectCategory(cat: SearchCategoryItem) {
  emit('close')
  navigateTo({
    path: '/search/result',
    query: {
      category_id: cat.id || cat._id || '',
      category_name: cat.name,
      type: String(SEARCH_TYPE_REGULAR),
    },
  })
}

function handleGuestLogin() {
  emit('close')
  authModal.openLogin({ featureTitle: 'Riwayat Pencarian' })
}

watch(
  suggestLoading,
  (val) => {
    emit('update:loading', val)
  },
  { immediate: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      emit('update:loading', false)
      return
    }
    fetchEmptyLanding()
    if (props.query.trim()) {
      debouncedSuggest({
        query: props.query,
        categoryId: props.categoryId,
        type: props.searchType,
      })
    }
  }
)

watch(
  () => props.query,
  (val) => {
    if (!props.open) return
    if (!val.trim()) {
      clearSuggestions()
      return
    }
    debouncedSuggest({
      query: val,
      categoryId: props.categoryId,
      type: props.searchType,
    })
  }
)
</script>
