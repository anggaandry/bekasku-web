<template>
  <div class="min-h-screen bg-surface-2/60 text-text font-outfit pb-24 lg:pb-16">
    <!-- Mobile App Bar Header -->
    <header class="lg:hidden sticky top-0 z-30 bg-white border-b border-border-light px-4 py-3 flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-1 -ml-1 text-text hover:text-primary transition-colors cursor-pointer"
          title="Kembali"
          @click="handleBack"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-base font-bold text-text-primary">
          {{ pageTitle }}
        </h1>
      </div>
    </header>

    <!-- Main Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Desktop Breadcrumbs & Page Header -->
      <div class="hidden lg:block mb-6 space-y-2">
        <nav class="flex items-center gap-2 text-xs text-text-muted font-medium">
          <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5" />
          <NuxtLink to="/catalog" class="hover:text-primary transition-colors">Iklan Saya</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-text-primary font-bold">
            {{ pageTitle }}
          </span>
        </nav>

        <div>
          <h1 class="text-2xl font-extrabold text-text-primary tracking-tight">
            {{ pageTitle }}
          </h1>
          <p class="text-xs text-text-muted mt-1">
            {{ pageSubtitle }}
          </p>
        </div>
      </div>

      <!-- Loading State during Edit Init -->
      <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p class="text-sm font-semibold text-text-secondary">Memuat data produk...</p>
      </div>

      <!-- Main 2-Column Responsive Layout -->
      <div v-else class="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        <!-- Left Column: Form Cards -->
        <div class="lg:col-span-8 space-y-4 sm:space-y-6">
          <!-- 1. Top Address Card (Pickup Location) -->
          <PostAddressCard
            :address="address"
            :error="errors.address_data"
            @open-address-modal="showAddressModal = true"
          />

          <!-- 2. Informasi Barang (Category, Type, Title, Description) -->
          <PostBasicInfo
            v-model:title="title"
            v-model:description="description"
            v-model:selected-type-category="selectedTypeCategory"
            :sell-method="sellMethod"
            :selected-category="selectedCategory"
            :selected-subcategory="selectedSubcategory"
            :type-categories="typeCategories"
            :errors="errors"
            @open-category-modal="showCategoryModal = true"
          />

          <!-- 3. Foto & Video Produk -->
          <div class="bg-white rounded-2xl border border-border-light p-4 sm:p-6 shadow-xs">
            <PostMediaUpload
              :images="images"
              :video="video"
              :max-photos="maxPhotos"
              :sell-method="sellMethod"
              :error="errors.images"
              :is-uploading="isImageProcessing"
              :upload-progress="imageProcessProgress"
              @add-images="onAddImages"
              @remove-image="removeImage"
              @set-cover="setCoverImage"
              @update:video="video = $event"
            />
          </div>

          <!-- 4. Harga & Pengelolaan Stok -->
          <PostPriceSection
            v-model:price="price"
            v-model:stock="stock"
            :sell-method="sellMethod"
            :service-fee-percent="serviceFeePercent"
            :subcategory-name="selectedSubcategory?.name_id || ''"
            :estimated-service-fee="estimatedServiceFee"
            :estimated-net-earnings="estimatedNetEarnings"
            :is-ai-price-loading="isAiPriceLoading"
            :errors="errors"
            @ask-ai-price="handleAskAiPrice"
          />

          <!-- 5. Spesifikasi Produk (Dynamic Forms & Dimensions) - Direct Sell Only -->
          <PostDynamicSpecs
            v-if="sellMethod === SELL_METHOD_DIRECT"
            v-model:dynamic-answers="dynamicAnswers"
            v-model:weight="weight"
            v-model:length="length"
            v-model:width="width"
            v-model:height="height"
            :dynamic-forms="dynamicForms"
            :service-fee-percent="serviceFeePercent"
            :subcategory-name="selectedSubcategory?.name_id || ''"
            :errors="errors"
          />

          <!-- 6. Metode Transaksi (Kurir, COD, Bebas Ongkir) — Hanya untuk Jual Barang Langsung -->
          <PostDeliveryMethod
            v-if="sellMethod === SELL_METHOD_DIRECT"
            v-model:delivery-courrier="deliveryCourrier"
            v-model:direct-meet="directMeet"
            v-model:free-delivery="freeDelivery"
            v-model:total-free-delivery="totalFreeDelivery"
          />

          <!-- Terms & Condition Notice -->
          <div class="p-4 rounded-2xl bg-white border border-border-light text-xs text-text-muted leading-relaxed">
            <p>
              Dengan melanjutkan posting iklan, Anda menyetujui
              <NuxtLink to="/policy/terms" class="font-bold text-primary hover:underline">
                Syarat & Ketentuan
              </NuxtLink>
              serta Kebijakan Barang Terlarang BekasKu {{ termsDisclaimerText }} Iklan akan ditinjau oleh sistem secara otomatis.
            </p>
          </div>

          <!-- Action CTA Desktop (Placed below Terms & Conditions) -->
          <div class="hidden lg:block pt-1 pb-4">
            <button
              type="button"
              class="w-full py-4 px-6 font-bold rounded-xl text-base shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              :class="[
                isFormValid
                  ? 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg'
                  : 'bg-surface-3 text-text-muted border border-border-light hover:border-danger/40',
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              ]"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <div v-if="isSubmitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <PackageCheck v-else class="w-5 h-5" />
              <span>{{ submitButtonLabel }}</span>
            </button>
            <p
              v-if="!isFormValid"
              class="text-xs text-text-muted text-center mt-2.5 flex items-center justify-center gap-1.5"
            >
              <AlertCircle class="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Lengkapi kolom bertanda <strong class="text-danger">*</strong> untuk menayangkan iklan</span>
            </p>
          </div>
        </div>

        <!-- Right Column: Sticky Live Preview Only (Desktop Only) -->
        <aside class="hidden lg:block lg:col-span-4 sticky top-24 self-start">
          <PostLivePreviewCard
            :title="title"
            :price="price"
            :stock="stock"
            :sell-method="sellMethod"
            :description="description"
            :images="images"
            :subcategory-name="selectedSubcategory?.name_id || ''"
            :dynamic-answers="dynamicAnswers"
            :city-name="address?.city || 'Indonesia'"
            :delivery-courrier="deliveryCourrier"
            :direct-meet="directMeet"
            :free-delivery="freeDelivery"
          />
        </aside>
      </div>
    </div>

    <!-- Mobile Fixed Bottom Action Bar -->
    <div class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border-light p-3.5 z-30 shadow-lg">
      <button
        type="button"
        class="w-full py-3 px-6 font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        :class="[
          isFormValid
            ? 'bg-primary hover:bg-primary-dark text-white'
            : 'bg-surface-3 text-text-muted border border-border-light',
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        ]"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span v-else>{{ submitButtonLabel }}</span>
      </button>
      <p
        v-if="!isFormValid"
        class="text-[11px] text-text-muted text-center mt-1.5 flex items-center justify-center gap-1"
      >
        <AlertCircle class="w-3 h-3 text-amber-500 shrink-0" />
        <span>Lengkapi kolom bertanda <strong class="text-danger">*</strong> untuk menayangkan iklan</span>
      </p>
    </div>

    <!-- Modals -->
    <!-- 1. Post Type Modal (Sell, Needed, Service, AI) -->
    <PostTypeModal
      v-model="showPostTypeModal"
      @select="onSelectPostType"
      @ai-applied="onAiPostApplied"
    />

    <!-- 2. Category & Subcategory Selector Modal -->
    <PostCategoryModal
      v-model="showCategoryModal"
      :title="categoryModalTitle"
      :categories="categories"
      :subcategories="subcategories"
      :type-categories="typeCategories"
      :is-subcategories-loading="isSubcategoriesLoading"
      :selected-category="selectedCategory"
      :selected-subcategory="selectedSubcategory"
      @select-category="selectCategory"
      @select-subcategory="selectSubcategory"
    />

    <!-- 3. AI Price Gemini Suggestion Modal -->
    <PostAiPriceModal
      v-model="showAiPriceModal"
      :result="aiPriceResult"
      :product-title="title"
      :loading="isAiPriceLoading"
      @apply="onApplyAiPrice"
      @retry="handleAskAiPrice"
    />

    <!-- 4. Address Picker Modal -->
    <AppAddressModal
      v-model="showAddressModal"
      @select="onAddressSelect"
    />

    <!-- 5. Post Success Modal (Mobile V3 parity) -->
    <PostSuccessModal
      v-model="showSuccessModal"
      :is-edit="isEditMode"
      @post-another="handlePostAnother"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ChevronRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-vue-next'
import { usePostSell } from '~/composables/usePostSell'
import {
  POST_TYPE_SELL,
  POST_TYPE_NEEDED,
  POST_TYPE_SERVICE,
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import type { CategoryItem, SubcategoryItem, TypeCategoryItem, PostAddressData } from '~/types/post'
import type { UserAddress } from '~/types/address'
import PostAddressCard from '~/components/post/PostAddressCard.vue'
import PostBasicInfo from '~/components/post/PostBasicInfo.vue'
import PostMediaUpload from '~/components/post/PostMediaUpload.vue'
import PostPriceSection from '~/components/post/PostPriceSection.vue'
import PostDynamicSpecs from '~/components/post/PostDynamicSpecs.vue'
import PostDeliveryMethod from '~/components/post/PostDeliveryMethod.vue'
import PostLivePreviewCard from '~/components/post/PostLivePreviewCard.vue'
import PostTypeModal from '~/components/post/PostTypeModal.vue'
import PostCategoryModal from '~/components/post/PostCategoryModal.vue'
import PostAiPriceModal from '~/components/post/PostAiPriceModal.vue'
import PostSuccessModal from '~/components/post/PostSuccessModal.vue'
import AppAddressModal from '~/components/shared/AppAddressModal.vue'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotification()

const showPostTypeModal = ref(false)
const showCategoryModal = ref(false)
const showAiPriceModal = ref(false)
const showAddressModal = ref(false)
const showSuccessModal = ref(false)

const editProductId = computed(() => {
  const id = route.query.edit
  return typeof id === 'string' ? id : undefined
})

const initialSellMethod = computed(() => {
  const m = route.query.method
  if (m === 'needed') return SELL_METHOD_NEEDED
  if (m === 'service') return SELL_METHOD_SERVICE
  return SELL_METHOD_DIRECT
})

const {
  loading,
  isSubmitting,
  isAiPriceLoading,
  aiPriceResult,
  categories,
  subcategories,
  typeCategories,
  isCategoriesLoading,
  isSubcategoriesLoading,
  productId,
  sellMethod,
  isEditMode,
  maxPhotos,
  selectedCategory,
  selectedSubcategory,
  selectedTypeCategory,
  serviceFeePercent,
  estimatedServiceFee,
  estimatedNetEarnings,
  title,
  description,
  price,
  stock,
  weight,
  length,
  width,
  height,
  directMeet,
  deliveryCourrier,
  freeDelivery,
  totalFreeDelivery,
  address,
  images,
  video,
  isImageProcessing,
  imageProcessProgress,
  dynamicForms,
  dynamicAnswers,
  errors,
  fetchCategories,
  selectCategory,
  selectSubcategory,
  askAiPrice,
  applyAiPrice,
  addImageFiles,
  removeImage,
  setCoverImage,
  saveDraft,
  clearDraft,
  submitProduct,
  applyAiAutoPost,
  isFormValid,
  validateForm,
  scrollToFirstError,
} = usePostSell(editProductId.value, initialSellMethod.value)

function applyMethodFromQuery() {
  const m = route.query.method
  if (m === 'needed') {
    sellMethod.value = SELL_METHOD_NEEDED
  } else if (m === 'service') {
    sellMethod.value = SELL_METHOD_SERVICE
  } else {
    sellMethod.value = SELL_METHOD_DIRECT
  }
}

// Ensure sellMethod aligns immediately in setup for SSR & hydration
applyMethodFromQuery()

const pageTitle = computed(() => {
  if (isEditMode.value) return 'Edit Iklan Produk'
  if (sellMethod.value === SELL_METHOD_NEEDED) return 'Tambah Iklan (Dibutuhkan)'
  if (sellMethod.value === SELL_METHOD_SERVICE) return 'Tambah Iklan (Jasa)'
  return 'Pasang Iklan Baru'
})

const pageSubtitle = computed(() => {
  if (sellMethod.value === SELL_METHOD_NEEDED) {
    return 'Lengkapi informasi barang yang kamu butuhkan agar calon penjual dapat memberikan penawaran terbaik.'
  }
  if (sellMethod.value === SELL_METHOD_SERVICE) {
    return 'Tawarkan keahlian atau lowongan pekerjaan Anda untuk menjangkau klien terpercaya di BekasKu.'
  }
  return 'Lengkapi informasi produk secara detail dan akurat untuk menarik calon pembeli terpercaya di BekasKu.'
})

const categoryModalTitle = computed(() => {
  if (sellMethod.value === SELL_METHOD_NEEDED) return 'Tambah Iklan (Dibutuhkan)'
  if (sellMethod.value === SELL_METHOD_SERVICE) return 'Tambah Iklan (Jasa)'
  return 'Pilih Kategori Barang'
})

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) return 'Menerbitkan...'
  if (isEditMode.value) return 'Simpan Perubahan'
  if (sellMethod.value === SELL_METHOD_NEEDED) return 'Posting Kebutuhan'
  if (sellMethod.value === SELL_METHOD_SERVICE) return 'Posting Jasa'
  return 'Posting Iklan Sekarang'
})

const termsDisclaimerText = computed(() => {
  if (sellMethod.value === SELL_METHOD_NEEDED) return 'untuk posting kebutuhan.'
  if (sellMethod.value === SELL_METHOD_SERVICE) return 'untuk posting jasa.'
  return 'untuk posting iklan produk.'
})

useHead({
  title: computed(() =>
    isEditMode.value
      ? 'Edit Iklan Produk — BekasKu'
      : sellMethod.value === SELL_METHOD_NEEDED
        ? 'Tambah Iklan Dibutuhkan — BekasKu'
        : sellMethod.value === SELL_METHOD_SERVICE
          ? 'Tambah Iklan Jasa — BekasKu'
          : 'Pasang Iklan Baru — BekasKu'
  ),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

async function applyCategoryFromQuery(): Promise<boolean> {
  const catId = typeof route.query.cat === 'string' ? route.query.cat : ''
  const subId = typeof route.query.sub === 'string' ? route.query.sub : ''

  if (!catId) return false

  if (categories.value.length === 0) {
    await fetchCategories()
  }

  const foundCat = categories.value.find(
    (c) => String(c._id || c.id || '') === catId || c.slug === catId
  )

  if (foundCat) {
    await selectCategory(foundCat)
    if (subId) {
      const foundSub = subcategories.value.find(
        (s) => String(s._id || s.id || '') === subId
      )
      if (foundSub) {
        await selectSubcategory(foundSub)
        return true
      }
    } else {
      showCategoryModal.value = true
      return true
    }
  }
  return false
}

onMounted(async () => {
  applyMethodFromQuery()
  await fetchCategories()

  if (route.query.cat) {
    const applied = await applyCategoryFromQuery()
    if (applied && selectedSubcategory.value) {
      return
    }
  }

  // If opening new post with explicit category query
  if (!isEditMode.value && !selectedSubcategory.value) {
    if (route.query.open_category) {
      showCategoryModal.value = true
    }
  }
})

watch(
  () => [route.query.cat, route.query.sub, route.query.method],
  async ([catId, subId, method]) => {
    applyMethodFromQuery()
    if (catId && !isEditMode.value) {
      await applyCategoryFromQuery()
    }
  }
)

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/catalog')
  }
}

async function onSelectPostType(type: number) {
  showPostTypeModal.value = false
  if (type === POST_TYPE_SELL) {
    sellMethod.value = SELL_METHOD_DIRECT
    await router.replace({ query: { ...route.query, method: undefined } })
    await fetchCategories()
    showCategoryModal.value = true
  } else if (type === POST_TYPE_NEEDED) {
    sellMethod.value = SELL_METHOD_NEEDED
    await router.replace({ query: { ...route.query, method: 'needed' } })
    await fetchCategories()
    showCategoryModal.value = true
  } else if (type === POST_TYPE_SERVICE) {
    sellMethod.value = SELL_METHOD_SERVICE
    await router.replace({ query: { ...route.query, method: 'service' } })
    await fetchCategories()
    showCategoryModal.value = true
  }
}

async function onAiPostApplied(data: any) {
  showPostTypeModal.value = false
  await applyAiAutoPost(data)
  showNotification({
    type: 'success',
    message: 'Data produk berhasil diisi otomatis oleh AI. Silakan periksa kembali sebelum menayangkan.',
  })
}

async function onAddImages(files: FileList | File[]) {
  await addImageFiles(files)
}

async function handleAskAiPrice() {
  const res = await askAiPrice()
  if (res) {
    showAiPriceModal.value = true
  }
}

function onApplyAiPrice() {
  applyAiPrice()
  showAiPriceModal.value = false
}

function onAddressSelect(addr: UserAddress | null) {
  if (!addr) return
  address.value = {
    id: addr.id || addr._id,
    _id: addr._id || addr.id,
    address_name: addr.address_name || 'Alamat Asal',
    address: addr.address || '',
    city: addr.city || '',
    province: addr.province || '',
    postal: addr.postal || addr.postal_code || '',
    subdistrict: addr.subdistrict || '',
    subdistrict_id: addr.subdistrict_id || '',
    city_id: addr.city_id || '',
    lon: Number(addr.lon ?? addr.lng ?? 0),
    lat: Number(addr.lat ?? 0),
    contact_name: addr.contact_name || addr.name || '',
    contact_phone: addr.contact_phone || addr.phone || '',
  }
  showAddressModal.value = false
  showNotification({
    type: 'success',
    message: 'Alamat pengiriman berhasil dipilih',
  })
}

async function handleSubmit() {
  if (!isFormValid.value) {
    validateForm()
    const firstError = Object.values(errors.value)[0]
    showNotification({
      type: 'warning',
      message: firstError || 'Mohon lengkapi seluruh formulir yang bertanda * wajib diisi.',
    })
    scrollToFirstError()
    return
  }

  const success = await submitProduct()
  if (success) {
    clearDraft()
    showSuccessModal.value = true
  }
}

function handlePostAnother() {
  clearDraft()
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  showPostTypeModal.value = true
}
</script>
