<template>
  <div class="min-h-screen flex flex-col bg-white text-text">
    <!-- Hidden H1 for SEO Hierarchy -->
    <h1 class="sr-only">
      Pencarian Produk &amp; Toko — BekasKu
    </h1>

    <!-- Top Search Bar Header (Mobile & Desktop Context) -->
    <div class="sticky top-0 md:top-[92px] z-40 bg-white border-b border-border/80">
      <div class="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2">
        <button
          type="button"
          class="p-1.5 -ml-1 text-text hover:text-primary rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Kembali"
          @click="handleBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <div class="flex-1 min-w-0">
          <SearchBar
            v-model="queryText"
            :placeholder="inputPlaceholder"
            :loading="suggestLoading"
            :category-id="categoryId"
            :category-name="categoryName"
            variant="page"
            autofocus
            @update:model-value="onInputChanged"
            @submit="onSubmitSearch"
            @clear="onClearInput"
          />
        </div>
      </div>

      <!-- Active Category / Best Deal Banner (Matches SearchView _buildActiveFilterBanner) -->
      <div
        v-if="categoryName || searchType === SEARCH_TYPE_BEST_DEAL"
        class="bg-surface-2 border-t border-border px-4 py-2"
      >
        <div class="max-w-3xl mx-auto flex items-center justify-between text-xs font-outfit">
          <div class="flex items-center gap-2">
            <Tag v-if="categoryName" class="w-3.5 h-3.5 text-primary shrink-0" />
            <BadgePercent v-else class="w-3.5 h-3.5 text-primary shrink-0" />
            <span class="text-text-muted">{{ categoryName ? 'Kategori:' : 'Program:' }}</span>
            <span class="px-2 py-0.5 rounded-md bg-primary/12 text-primary font-semibold">
              {{ categoryName || 'Best Deal' }}
            </span>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium cursor-pointer"
            @click="clearActiveContext"
          >
            <span>Semua Produk</span>
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Body -->
    <main class="flex-1 max-w-3xl w-full mx-auto pb-10">
      <!-- STATE A: Typing / Autocomplete Suggestions (Matches Screenshot 2) -->
      <SearchSuggestions
        v-if="queryText.trim().length > 0"
        :query="queryText"
        :suggestions="suggestions"
        :history="lastSearch"
        :sellers="sellerSuggestions"
        :category-name="categoryName"
        :type="searchType"
        :loading="suggestLoading"
        @select-keyword="onSubmitSearch"
        @fill-keyword="onFillKeyword"
        @submit-query="onSubmitSearch"
        @delete-history="deleteKeyword"
        @search-in-seller="onSearchInSeller"
      />

      <!-- STATE B: Initial Empty Input State (Matches Screenshot 1) -->
      <div v-else class="py-2">
        <!-- Shimmer while loading empty landing -->
        <div v-if="landingLoading && lastView.length === 0 && lastSearch.length === 0" class="px-4 py-3 space-y-3">
          <div v-for="n in 5" :key="`land-skel-${n}`" class="h-11 rounded-lg bg-surface-2 animate-shimmer" />
        </div>

        <template v-else>
          <!-- Section 1: Produk terakhir dilihat (Horizontal Ribbon of 80x80 Rounded Thumbnails, per Screenshot 1 & search_view.dart L268) -->
          <section v-if="lastView.length > 0" class="py-2">
            <h2 class="px-4 font-outfit font-bold text-base text-text mb-3">
              Produk terakhir dilihat
            </h2>
            <div class="px-4 flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
              <NuxtLink
                v-for="(item, idx) in lastView"
                :key="item.id || item._id || idx"
                :to="productPath(item)"
                class="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-xl border border-border bg-surface-2 overflow-hidden shrink-0 hover:border-primary transition-colors flex items-center justify-center"
              >
                <img
                  v-if="getThumbUrl(item)"
                  :src="getThumbUrl(item)"
                  :alt="item.title || 'Produk terakhir dilihat'"
                  width="76"
                  height="76"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <ImageIcon v-else class="w-6 h-6 text-text-subtle" />
              </NuxtLink>
            </div>
          </section>

          <!-- Section 2: Pencarian terakhir (Vertical List with History icon, X delete, Hapus semua, Lihat semua, per Screenshot 1) -->
          <SearchHistory
            :items="lastSearch"
            :initial-limit="3"
            @select="onSubmitSearch"
            @delete="deleteKeyword"
            @clear-all="deleteAllKeywords"
          />

          <!-- Section 3: Kategori Pilihan (From /product/search/empty category_data) -->
          <SearchCategoryChips
            v-if="categoryData.length > 0"
            :categories="categoryData"
            @select="onSelectCategoryChip"
          />

          <!-- Guest Prompt when no local history or viewed items exist and not logged in -->
          <div
            v-if="!authStore.isLoggedIn && lastView.length === 0 && lastSearch.length === 0"
            class="px-6 py-12 text-center max-w-sm mx-auto"
          >
            <div class="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-5 text-text-subtle">
              <History class="w-9 h-9" />
            </div>
            <h2 class="font-outfit font-bold text-lg text-text mb-2">
              Masuk yuk!
            </h2>
            <p class="font-outfit text-sm text-text-muted leading-relaxed mb-6">
              Masuk ke akunmu untuk melihat riwayat pencarian dan produk yang terakhir dilihat.
            </p>
            <NuxtLink
              to="/login"
              class="block w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-base transition-colors"
            >
              Masuk Sekarang
            </NuxtLink>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Tag, BadgePercent, X, History, Image as ImageIcon } from 'lucide-vue-next'
import { SEARCH_TYPE_BEST_DEAL, SEARCH_TYPE_REGULAR } from '~/utils/constants'
import { sanitizeMediaUrl } from '~/utils/media'
import { useAuthStore } from '~/stores/auth'
import { useSearchLanding } from '~/composables/useSearchLanding'
import { useSearchSuggest } from '~/composables/useSearchSuggest'
import type { SearchCategoryItem } from '~/types/search'
import SearchBar from '~/components/search/SearchBar.vue'
import SearchHistory from '~/components/search/SearchHistory.vue'
import SearchCategoryChips from '~/components/search/SearchCategoryChips.vue'
import SearchSuggestions from '~/components/search/SearchSuggestions.vue'

// SEO Meta (Flow 01 Section 10: /search is noindex)
useHead({
  title: 'Pencarian — BekasKu',
  meta: [
    { name: 'description', content: 'Cari barang bekas dan preloved berkualitas di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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

const queryText = ref(typeof route.query.q === 'string' ? route.query.q : '')
const categoryId = ref(typeof route.query.category_id === 'string' ? route.query.category_id : '')
const categoryName = ref(typeof route.query.category_name === 'string' ? route.query.category_name : '')
const searchType = ref(route.query.type ? parseInt(String(route.query.type), 10) || 0 : 0)

const inputPlaceholder = computed(() => {
  if (categoryName.value) return `Cari di ${categoryName.value}`
  if (searchType.value === SEARCH_TYPE_BEST_DEAL) return 'Cari di Best Deal'
  return 'Cari di BekasKu'
})

function getThumbUrl(item: any): string {
  const raw = Array.isArray(item.images) && item.images.length > 0
    ? item.images[0]
    : item.image || ''
  return sanitizeMediaUrl(String(raw), '')
}

function onInputChanged(val: string) {
  queryText.value = val
  if (!val.trim()) {
    clearSuggestions()
    return
  }
  debouncedSuggest({
    query: val,
    categoryId: categoryId.value,
    type: searchType.value,
  })
}

function onClearInput() {
  queryText.value = ''
  clearSuggestions()
}

function onFillKeyword(kw: string) {
  queryText.value = kw
  debouncedSuggest({
    query: kw,
    categoryId: categoryId.value,
    type: searchType.value,
  })
}

function onSubmitSearch(kw?: string) {
  const target = (kw !== undefined ? kw : queryText.value).trim()
  if (!target) return

  addRecentKeyword(target)

  const query: Record<string, string> = { q: target }
  if (categoryId.value) query.category_id = categoryId.value
  if (categoryName.value) query.category_name = categoryName.value
  if (searchType.value && searchType.value !== 0) {
    query.type = String(searchType.value)
  } else {
    query.type = String(SEARCH_TYPE_REGULAR)
  }

  navigateTo({ path: '/search/result', query })
}

function onSearchInSeller(kw: string) {
  const target = kw.trim()
  if (!target) return
  addRecentKeyword(target)
  navigateTo({
    path: '/search/result',
    query: {
      q: target,
      tab: 'store',
    },
  })
}

function onSelectCategoryChip(cat: SearchCategoryItem) {
  navigateTo({
    path: '/search/result',
    query: {
      category_id: cat.id || cat._id || '',
      category_name: cat.name,
      type: String(SEARCH_TYPE_REGULAR),
    },
  })
}

function clearActiveContext() {
  categoryId.value = ''
  categoryName.value = ''
  searchType.value = 0
}

function handleBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

onMounted(() => {
  fetchEmptyLanding()
  if (queryText.value.trim()) {
    debouncedSuggest({
      query: queryText.value,
      categoryId: categoryId.value,
      type: searchType.value,
    })
  }
})
</script>

