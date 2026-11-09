<template>
  <div class="min-h-screen flex flex-col bg-white md:bg-surface text-text">
    <!-- Accessible SEO H1 -->
    <h1 class="sr-only">
      {{ pageHeading }}
    </h1>

    <!-- Mobile Sticky Header: Back Arrow + 'Semua Kategori' + Search Shortcut (Mobile < md, Matches Screenshots 1 & 2) -->
    <header class="sticky top-0 z-40 bg-white border-b border-border/80 md:hidden">
      <div class="px-3 sm:px-4 h-[52px] flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            class="p-1.5 -ml-1 text-text hover:text-primary rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Kembali"
            @click="handleBack"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="font-outfit font-semibold text-base text-text truncate">
            Semua Kategori
          </span>
        </div>

        <button
          type="button"
          class="p-2 text-text hover:text-primary rounded-lg transition-colors cursor-pointer shrink-0"
          :aria-label="`Cari di ${activeCategoryName}`"
          @click="goToCategorySearch"
        >
          <Search class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Main Master-Detail Content Area -->
    <main class="flex-1 w-full max-w-[1400px] mx-auto md:px-4 lg:px-6 md:py-5">
      <div class="flex items-start min-h-[calc(100vh-53px)] md:min-h-0 md:gap-5 lg:gap-6">
        <!-- Left Column: Category Sidebar Rail (Master) -->
        <CategorySidebar
          :categories="categories"
          :selected-id="activeCategoryId"
          :loading="categoryPending"
          class="sticky top-[53px] md:top-24 max-h-[calc(100vh-53px)] md:max-h-[calc(100vh-110px)] border-r border-border/60 md:border-r"
          @select="onSelectCategory"
        />

        <!-- Right Column: Subcategory Sections / Product Grid (Detail) -->
        <div class="flex-1 min-w-0 bg-white md:rounded-2xl md:border md:border-border px-3 sm:px-4 md:p-5 lg:p-6 py-3.5">
          <!-- Desktop Active Category Header Bar (md+) -->
          <div class="hidden md:flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div>
              <p class="font-outfit text-xs text-text-muted">
                Kategori Pilihan
              </p>
              <h2 class="font-outfit font-bold text-lg text-text">
                {{ activeCategoryName }}
              </h2>
            </div>

            <div class="flex items-center gap-2.5">
              <!-- Desktop Inline Category Search Form -->
              <form
                class="flex items-center bg-surface-2 rounded-xl border border-border focus-within:border-primary focus-within:bg-white transition-all overflow-hidden p-0.5"
                @submit.prevent="onDesktopCategorySearch"
              >
                <div class="flex items-center pl-3 pr-1.5 py-1 text-text-muted">
                  <Search class="w-3.5 h-3.5" />
                </div>
                <input
                  v-model="desktopCategoryQuery"
                  type="text"
                  :placeholder="`Cari di ${activeCategoryName}...`"
                  class="bg-transparent text-xs text-text placeholder-text-subtle font-outfit font-medium w-48 lg:w-64 focus:outline-none py-1.5 pr-2"
                />
                <button
                  type="submit"
                  class="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-outfit font-semibold transition-colors cursor-pointer shrink-0 active:scale-95"
                >
                  Cari
                </button>
              </form>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-outfit font-semibold transition-colors cursor-pointer"
                @click="goToFullCategoryCatalog"
              >
                <span>Filter &amp; Katalog Lengkap</span>
              </button>
            </div>
          </div>

          <!-- Subcategory Filter Pills (Desktop md+, or Mobile when a single subcategory filter is active) -->
          <SubcategoryChips
            v-if="subcategories.length > 0"
            :subcategories="subcategories"
            :selected-id="selectedSubcategoryId"
            :loading="subcategoryLoading"
            :class="selectedSubcategoryId ? 'block mb-4' : 'hidden md:block mb-5'"
            @select="onSelectSubcategory"
          />

          <!-- Centered Transition Loading State -->
          <div
            v-if="isTransitionLoading || (subcategoryLoading && subcategories.length === 0 && categoryProducts.length === 0)"
            class="min-h-[380px] flex flex-col items-center justify-center py-16 px-4 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 class="w-9 h-9 text-primary animate-spin mb-3" />
            <p class="font-outfit font-semibold text-sm text-text">
              Memuat produk {{ activeCategoryName }}...
            </p>
            <p class="font-outfit text-xs text-text-muted mt-1">
              Mohon tunggu sebentar
            </p>
          </div>

          <!-- Error State -->
          <AppErrorState
            v-else-if="subcategoryError && subcategories.length === 0 && categoryProducts.length === 0"
            :message="subcategoryError"
            @retry="reloadCategoryContent"
          />

          <!-- MODE A: All Subcategory Sections with 2-Col Mobile / 4-Col Desktop Product Previews (Matches Screenshots 1 & 2) -->
          <div
            v-else-if="!selectedSubcategoryId && subcategoriesWithProducts.length > 0"
            class="space-y-6 pb-8"
          >
            <CategorySubcategorySection
              v-for="sub in subcategoriesWithProducts"
              :key="sub.id || sub._id || sub.name"
              :subcategory="sub"
              @view-all="onViewAllSubcategory"
              @select-product="onSelectProduct"
            />
          </div>

          <!-- MODE B: Single Subcategory Selected OR Fallback Category Product Grid -->
          <div v-else-if="categoryProducts.length > 0 || productSearchLoading" class="pb-8">
            <div v-if="selectedSubcategoryName" class="flex items-center justify-between mb-3">
              <h2 class="font-outfit font-semibold text-[15px] sm:text-base text-text">
                {{ selectedSubcategoryName }}
              </h2>
              <button
                type="button"
                class="font-outfit text-xs sm:text-[13px] text-primary hover:text-primary-dark font-medium cursor-pointer"
                @click="onSelectSubcategory('')"
              >
                Semua Subkategori
              </button>
            </div>

            <ProductGrid
              :products="categoryProducts"
              :loading="productSearchLoading"
              :has-more="hasMoreProducts"
              :columns="4"
              :skeleton-count="8"
              @load-more="loadMoreCategoryProducts"
              @select="onSelectProduct"
            />
          </div>

          <!-- Empty State -->
          <AppEmptyState
            v-else
            title="Produk tidak ditemukan"
            description="Belum ada produk aktif pada kategori ini."
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowLeft, Search, Loader2 } from 'lucide-vue-next'
import { SEARCH_MAX_ITEMS, SEARCH_TYPE_REGULAR } from '~/utils/constants'
import { useCategories, type Category, type Subcategory } from '~/composables/useCategories'
import { useProductSearch } from '~/composables/useProductSearch'
import { useSearchLanding } from '~/composables/useSearchLanding'
import { useLocationStore } from '~/stores/location'
import type { ProductCard } from '~/types/product'

import CategorySidebar from '~/components/category/CategorySidebar.vue'
import SubcategoryChips from '~/components/category/SubcategoryChips.vue'
import CategorySubcategorySection from '~/components/category/CategorySubcategorySection.vue'
import ProductGrid from '~/components/shared/ProductGrid.vue'
import AppEmptyState from '~/components/shared/AppEmptyState.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'

const route = useRoute()
const router = useRouter()
const locationStore = useLocationStore()
const {
  categories,
  subcategories,
  subcategoryLoading,
  subcategoryError,
  fetchCategories,
  fetchSubcategories,
  resolveCategory,
} = useCategories()
const { search: searchProducts, loading: productSearchLoading } = useProductSearch()
const { addLastViewedProduct } = useSearchLanding()

const paramId = computed(() => String(route.params.id || '').trim())
const selectedSubcategoryId = computed(() =>
  typeof route.query.sub === 'string' ? route.query.sub.trim() : ''
)

const categoryProducts = ref<ProductCard[]>([])
const productPage = ref(1)
const hasMoreProducts = ref(false)
const isTransitionLoading = ref(false)
const desktopCategoryQuery = ref('')

// SSR Initial Fetch: Categories + Subcategories + Initial Products if needed
const ssrKey = computed(() => `category-${paramId.value || 'first'}-${selectedSubcategoryId.value || 'all'}`)
const { data: initialData, pending: categoryPending } = await useAsyncData(
  ssrKey.value,
  async () => {
    const catList = await fetchCategories()
    const resolved = resolveCategory(paramId.value, catList) || catList[0] || null
    if (!resolved) {
      return { activeId: '', subList: [] as Subcategory[], fallbackDocs: [] as ProductCard[], hasMore: false }
    }

    const activeId = String(resolved.id || resolved._id || '')
    const subList = await fetchSubcategories(activeId)
    const subId = typeof route.query.sub === 'string' ? route.query.sub.trim() : ''

    const hasGroupedProducts = subList.some((s) => Array.isArray(s.products) && s.products.length > 0)
    if (subId || !hasGroupedProducts) {
      const pRes = await searchProducts({
        filter: [],
        type: SEARCH_TYPE_REGULAR,
        categoryId: activeId,
        subcategoryId: subId,
        newest: 1,
        page: 1,
      })
      return {
        activeId,
        subList,
        fallbackDocs: pRes.docs || [],
        hasMore: Boolean(pRes.hasNextPage),
      }
    }

    return {
      activeId,
      subList,
      fallbackDocs: [] as ProductCard[],
      hasMore: false,
    }
  }
)

const activeCategory = computed<Category | null>(() => {
  return resolveCategory(paramId.value, categories.value) || categories.value[0] || null
})

const activeCategoryId = computed(() => {
  if (activeCategory.value) {
    return String(activeCategory.value.id || activeCategory.value._id || '')
  }
  return initialData.value?.activeId || ''
})

const activeCategoryName = computed(() => {
  return activeCategory.value?.name || 'Semua Kategori'
})

if (initialData.value) {
  if (Array.isArray(initialData.value.subList) && subcategories.value.length === 0) {
    subcategories.value = initialData.value.subList
  }
  if (Array.isArray(initialData.value.fallbackDocs) && initialData.value.fallbackDocs.length > 0) {
    categoryProducts.value = [...initialData.value.fallbackDocs]
    hasMoreProducts.value = Boolean(initialData.value.hasMore)
  }
}

const subcategoriesWithProducts = computed(() => {
  return subcategories.value.filter((s) => Array.isArray(s.products) && s.products.length > 0)
})

const selectedSubcategoryName = computed(() => {
  if (!selectedSubcategoryId.value) return ''
  const found = subcategories.value.find(
    (s) => String(s.id || s._id) === selectedSubcategoryId.value
  )
  return found?.name || ''
})

const pageHeading = computed(() => {
  if (selectedSubcategoryName.value) {
    return `${selectedSubcategoryName.value} - ${activeCategoryName.value} — BekasKu`
  }
  return `${activeCategoryName.value} — BekasKu`
})

// SEO Metadata & BreadcrumbList JSON-LD (Flow 02 Section 10)
useHead(() => ({
  title: `${pageHeading.value}`,
  meta: [
    {
      name: 'description',
      content: `Jual beli produk ${activeCategoryName.value} bekas dan preloved berkualitas dengan harga terbaik dan aman di BekasKu.`,
    },
    { property: 'og:title', content: `${pageHeading.value}` },
    {
      property: 'og:description',
      content: `Temukan berbagai pilihan ${activeCategoryName.value} preloved berkualitas di BekasKu.`,
    },
    { property: 'og:url', content: `https://bekasku.id/kategori/${activeCategoryId.value}` },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [
    {
      rel: 'canonical',
      href: `https://bekasku.id/kategori/${activeCategoryId.value}`,
    },
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: 'https://bekasku.id',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: activeCategoryName.value,
            item: `https://bekasku.id/kategori/${activeCategoryId.value}`,
          },
        ],
      }),
    },
  ],
}))

async function fetchCategoryProductsPage(page = 1) {
  if (!activeCategoryId.value) return
  const res = await searchProducts({
    filter: [],
    type: SEARCH_TYPE_REGULAR,
    categoryId: activeCategoryId.value,
    subcategoryId: selectedSubcategoryId.value,
    newest: 1,
    location: locationStore.location,
    lat: locationStore.lat,
    lon: locationStore.lon,
    page,
  })

  if (page === 1) {
    categoryProducts.value = res.docs
  } else {
    const remaining = SEARCH_MAX_ITEMS - categoryProducts.value.length
    categoryProducts.value.push(...res.docs.slice(0, remaining))
  }
  hasMoreProducts.value = Boolean(res.hasNextPage && categoryProducts.value.length < SEARCH_MAX_ITEMS)
}

async function reloadCategoryContent() {
  if (!activeCategoryId.value) return
  isTransitionLoading.value = true
  const minDelay = new Promise((resolve) => setTimeout(resolve, 240))
  try {
    const [subList] = await Promise.all([
      fetchSubcategories(activeCategoryId.value),
      minDelay,
    ])
    const hasGrouped = subList.some((s) => Array.isArray(s.products) && s.products.length > 0)
    if (selectedSubcategoryId.value || !hasGrouped) {
      productPage.value = 1
      await fetchCategoryProductsPage(1)
    } else {
      categoryProducts.value = []
      hasMoreProducts.value = false
    }
  } finally {
    isTransitionLoading.value = false
  }
}

async function loadMoreCategoryProducts() {
  if (productSearchLoading.value || !hasMoreProducts.value) return
  productPage.value++
  await fetchCategoryProductsPage(productPage.value)
}

function onSelectCategory(cat: Category) {
  const nextId = String(cat.id || cat._id || '')
  if (!nextId || nextId === activeCategoryId.value) return
  isTransitionLoading.value = true
  navigateTo(`/kategori/${nextId}`)
}

async function onSelectSubcategory(subId: string) {
  isTransitionLoading.value = true
  const query: Record<string, string> = {}
  if (subId) query.sub = subId
  await router.replace({ path: `/kategori/${activeCategoryId.value}`, query })
  productPage.value = 1
  if (subId || subcategoriesWithProducts.value.length === 0) {
    await fetchCategoryProductsPage(1)
  }
  isTransitionLoading.value = false
}

function onViewAllSubcategory(sub: Subcategory) {
  const subId = String(sub.id || sub._id || '')
  navigateTo({
    path: '/search/result',
    query: {
      category_id: activeCategoryId.value,
      category_name: sub.name || activeCategoryName.value,
      ...(subId && subId !== 'NEEDED' ? { subcategory_id: subId } : {}),
      type: String(SEARCH_TYPE_REGULAR),
    },
  })
}

function onDesktopCategorySearch() {
  const q = desktopCategoryQuery.value.trim()
  navigateTo({
    path: '/search/result',
    query: {
      ...(q ? { q } : {}),
      category_id: activeCategoryId.value,
      category_name: activeCategoryName.value,
      ...(selectedSubcategoryId.value ? { subcategory_id: selectedSubcategoryId.value } : {}),
      type: String(SEARCH_TYPE_REGULAR),
    },
  })
}

function goToCategorySearch() {
  navigateTo({
    path: '/search',
    query: {
      category_id: activeCategoryId.value,
      category_name: activeCategoryName.value,
      ...(selectedSubcategoryId.value ? { subcategory_id: selectedSubcategoryId.value } : {}),
    },
  })
}

function goToFullCategoryCatalog() {
  navigateTo({
    path: '/search/result',
    query: {
      category_id: activeCategoryId.value,
      category_name: activeCategoryName.value,
      ...(selectedSubcategoryId.value ? { subcategory_id: selectedSubcategoryId.value } : {}),
      type: String(SEARCH_TYPE_REGULAR),
    },
  })
}

function onSelectProduct(product: ProductCard) {
  addLastViewedProduct(product)
}

function handleBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

watch(
  () => activeCategoryId.value,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      reloadCategoryContent()
    }
  }
)

onMounted(() => {
  locationStore.initFromStorage()
})
</script>

