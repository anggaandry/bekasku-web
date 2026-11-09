<script setup lang="ts">
import { useRoute } from 'vue-router'
import { AlertCircle, ChevronRight } from 'lucide-vue-next'
import type { ProductDetailResponse } from '~/types/product'
import { SELL_METHOD_NEEDED, SELL_METHOD_SERVICE } from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'
import BestDealRegisterModal from '~/components/post/bestdeal/BestDealRegisterModal.vue'

const route = useRoute()
const productId = computed(() => extractProductId(route.params.slug as string))

// Validate MongoDB ObjectId 24-hex upfront
const isValidId = computed(() => !!productId.value)

const {
  product,
  seller,
  images,
  loading,
  error,
  inWishlist,
  totalFavorite,
  discussions,
  totalDiscussions,
  discussionLoading,
  discussionSending,
  recommendations,
  recLoading,
  isBekaskuPlus,
  isVip,
  isTrusted,
  isVerified,
  isPayAndPick,
  isFreeShipping,
  videoThumbnail,
  shippingServices,
  shippingCity,
  aiStep,
  aiScore,
  aiDesc,
  aiRecom,
  hasMoreRec,
  fetchDetail,
  recordViewLog,
  fetchShippingEstimates,
  updatePostStatus,
  analyzePostWithAI,
  toggleWishlist,
  fetchDiscussions,
  sendDiscussion,
  fetchRecommendations,
  addToCart,
  submitNegotiation,
} = useProductDetail(productId.value)

const authStore = useAuthStore()
const cartStore = useCartStore()
const chatStore = useChatStore()

// Modal & UI state
const showGuestModal = ref(false)
const guestFeature = ref('')
const isNegoOpen = ref(false)
const isOfferNeededOpen = ref(false)
const isChatOpen = ref(false)
const isCartOpen = ref(false)
const cartStatus = ref<0 | 1>(0)
const isAnalyticOpen = ref(false)
const showBestDealModal = ref(false)
const isNegoSubmitting = ref(false)
const isCallOpen = ref(false)
const confirmOpen = ref(false)
const confirmLoading = ref(false)
type ConfirmAction = 'sold' | 'delete' | 'cancel' | 'status'
const confirmAction = ref<ConfirmAction>('sold')
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

/** Login limiter: returns true when action may proceed, else opens guest modal. */
function requireAuth(feature = ''): boolean {
  if (authStore.isLoggedIn) return true
  guestFeature.value = feature
  showGuestModal.value = true
  return false
}

const isProductRoute = computed(() => route.path.startsWith('/product/'))

// SSR Data Fetching via useAsyncData
const { data: initialData, pending: detailPending, error: ssrError } = useAsyncData<ProductDetailResponse | null>(
  `product-detail-${productId.value}`,
  async () => {
    if (!isValidId.value) return null
    return await fetchDetail(productId.value)
  },
  { lazy: true }
)

const isPageLoading = computed(() => {
  if (!isProductRoute.value) return false
  return (detailPending.value || loading.value) && !product.value
})

const isPageNotFound = computed(() => {
  if (!isProductRoute.value) return false
  if (isPageLoading.value) return false
  if (!isValidId.value) return true
  if (error.value || ssrError.value) return true
  if (!product.value) return true
  return false
})

watch(
  () => initialData.value,
  async (val) => {
    if (val?.product) {
      const canonicalPath = productPath({ ...val.product, id: productId.value })
      product.value = val.product
      seller.value = val.seller
      inWishlist.value = !!val.product.in_wishlist
      totalFavorite.value = val.product.total_favorite || 0

      // Hanya lakukan canonical redirect jika slug berbeda (dan bukan perulangan)
      if (import.meta.server && route.path.startsWith('/product/') && route.path !== canonicalPath) {
        await navigateTo(canonicalPath, { replace: true, redirectCode: 301 })
      }
    }
  },
  { immediate: true }
)

// Dynamic SEO Head & JSON-LD
useHead(() => {
  const currentProd = product.value || initialData.value?.product
  const title = currentProd?.title ? `${currentProd.title} — BekasKu` : 'Detail Produk — BekasKu'
  const desc = currentProd?.description?.slice(0, 160) || 'Beli dan jual barang bekas berkualitas aman di BekasKu'
  const imgList = currentProd?.image ? (Array.isArray(currentProd.image) ? currentProd.image : [currentProd.image]) : []
  const firstImage = imgList[0] || 'https://bekasku.id/og-image.jpg'
  const price = currentProd?.price || 0

  return {
    title,
    link: currentProd ? [{ rel: 'canonical', href: `https://bekasku.id${productPath({ ...currentProd, id: productId.value })}` }] : [],
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:image', content: firstImage },
      { property: 'og:type', content: 'product' },
      { property: 'product:price:amount', content: String(price) },
      { property: 'product:price:currency', content: 'IDR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: firstImage },
    ],
    script: currentProd
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: currentProd.title,
              image: imgList,
              description: desc,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'IDR',
                price: currentProd.price,
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'Person',
                  name: seller.value?.name || initialData.value?.seller?.name || 'BekasKu Seller',
                },
              },
            }),
          },
        ]
      : [],
  }
})

// Best Deal countdown (mirrors mobile bdcd_second ticker)
const bdSeconds = ref(0)
let bdTimer: ReturnType<typeof setInterval> | null = null
const bdCountdown = computed(() => {
  const t = Math.max(bdSeconds.value, 0)
  const h = String(Math.floor(t / 3600)).padStart(2, '0')
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0')
  const sec = String(t % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
})
const showBdBar = computed(() => !!product.value && Number(product.value.bdcd_second || 0) > 0 && bdSeconds.value > 0)

function startBdTimer() {
  if (bdTimer) clearInterval(bdTimer)
  bdSeconds.value = Number(product.value?.bdcd_second || 0)
  if (bdSeconds.value <= 0) return
  bdTimer = setInterval(() => {
    bdSeconds.value -= 1
    if (bdSeconds.value <= 0 && bdTimer) clearInterval(bdTimer)
  }, 1000)
}

const isNeededOrService = computed(() => {
  const p = product.value
  if (!p) return false
  const cat = (p.category || '').toLowerCase()
  return p.sell_method === SELL_METHOD_NEEDED || p.sell_method === SELL_METHOD_SERVICE || cat.includes('jasa') || cat.includes('lowongan')
})
const showDelivery = computed(() => !!product.value && !product.value.mine && !isNeededOrService.value && shippingServices.value.length > 0)

const confirmCopy = computed(() => {
  const map: Record<ConfirmAction, { title: string; description: string; confirmLabel: string; danger: boolean }> = {
    sold: {
      title: product.value?.sell_method === SELL_METHOD_NEEDED ? 'Tandai Ditemukan' : 'Tandai Terjual',
      description: 'Postingan akan ditandai selesai dan tidak tampil lagi di pencarian. Lanjutkan?',
      confirmLabel: 'Ya, Tandai',
      danger: false,
    },
    cancel: {
      title: 'Nonaktifkan Postingan',
      description: 'Postingan akan disembunyikan dari pembeli. Kamu bisa mengaktifkannya kembali nanti.',
      confirmLabel: 'Nonaktifkan',
      danger: true,
    },
    status: {
      title: 'Aktifkan Postingan',
      description: 'Postingan akan tampil kembali untuk pembeli.',
      confirmLabel: 'Aktifkan',
      danger: false,
    },
    delete: {
      title: 'Hapus Postingan',
      description: 'Postingan yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?',
      confirmLabel: 'Hapus',
      danger: true,
    },
  }
  return map[confirmAction.value]
})

onMounted(() => {
  if (!isValidId.value) return
  fetchDiscussions(productId.value)
  fetchRecommendations(productId.value)
  recordViewLog(productId.value)
  startBdTimer()
  if (authStore.isLoggedIn && !product.value?.mine) fetchShippingEstimates()
})

onBeforeUnmount(() => {
  if (bdTimer) clearInterval(bdTimer)
})

// Buyer handlers (all guarded by login limiter)
async function handleAddToCart() {
  if (!requireAuth('Keranjang')) return
  cartStatus.value = 0
  isCartOpen.value = true
  const res = await addToCart(1)
  if (res.success) {
    cartStatus.value = 1
  } else {
    isCartOpen.value = false
    showToast(res.message, 'error')
  }
}

function handleNego() {
  if (!requireAuth('Negosiasi Harga')) return
  isNegoOpen.value = true
}

async function handleNegoSubmit(negoPrice: number) {
  isNegoSubmitting.value = true
  const res = await submitNegotiation(negoPrice)
  isNegoSubmitting.value = false
  if (res.success) {
    isNegoOpen.value = false
    if (seller.value?.id) {
      await chatStore.openChatWith({
        partnerId: String(seller.value.id),
        partnerName: seller.value.name || 'Penjual',
        partnerAvatar: seller.value.avatar || '',
        isBekaskuPlus: isBekaskuPlus.value,
      })
    }
  }
  showToast(res.message, res.success ? 'success' : 'error')
}

function handleToggleWishlist() {
  if (!requireAuth('Wishlist')) return
  toggleWishlist()
}

async function handleSendDiscussion(text: string) {
  if (!requireAuth('Diskusi Produk')) return
  const ok = await sendDiscussion(text)
  showToast(ok ? 'Pertanyaan Anda berhasil dikirim!' : 'Gagal mengirim pertanyaan.', ok ? 'success' : 'error')
}

function handleChat() {
  if (!requireAuth('Chat Penjual')) return
  if (product.value?.sell_method === SELL_METHOD_NEEDED || isNeededOrService.value) {
    goChat(0)
    return
  }
  // On desktop (>= 768px), directly open the floating interactive chat popup (Tokopedia style)
  if (import.meta.client && window.innerWidth >= 768) {
    goChat(0)
    return
  }
  isChatOpen.value = true
}

async function goChat(option: 0 | 1 | 2) {
  if (!seller.value?.id) {
    showToast('Info penjual belum tersedia', 'error')
    return
  }
  const prod = product.value
  const firstImg = images.value[0] || ''
  const prodContext = prod
    ? {
        id: productId.value,
        title: prod.title || 'Produk BekasKu',
        price: Number(prod.price || 0),
        image: firstImg,
        location: prod.location || '',
        rating: Number(prod.rating || 0),
        is_seller: Boolean(prod.mine),
      }
    : null

  await chatStore.openChatWith({
    partnerId: String(seller.value.id),
    partnerName: seller.value.name || 'Penjual',
    partnerAvatar: seller.value.avatar || '',
    isBekaskuPlus: isBekaskuPlus.value,
    product: option === 0 ? prodContext : null,
    request:
      option === 1 && prod
        ? {
            id: productId.value,
            title: prod.title || 'Produk BekasKu',
            image: firstImg,
            type: 'photo',
            price: Number(prod.price || 0),
          }
        : option === 2 && prod
          ? {
              id: productId.value,
              title: prod.title || 'Produk BekasKu',
              image: firstImg,
              type: 'video',
              price: Number(prod.price || 0),
            }
          : null,
  })
}

function handleCall() {
  if (!requireAuth('Hubungi Penjual')) return
  if (!seller.value?.phone) {
    showToast('Nomor telepon penjual tidak tersedia', 'error')
    return
  }
  isCallOpen.value = true
}

function handleWhatsApp() {
  if (!requireAuth('Hubungi Penjual')) return
  const phone = (seller.value?.phone || '').replace(/\D/g, '').replace(/^0/, '62')
  if (!phone) {
    showToast('Nomor WhatsApp penjual tidak tersedia', 'error')
    return
  }
  const text = encodeURIComponent(`Halo, saya tertarik dengan "${product.value?.title}" di BekasKu`)
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
}

function handleOfferNeeded() {
  if (!requireAuth('Tawarkan Barang')) return
  isOfferNeededOpen.value = true
}

function handleCartClick() {
  if (!requireAuth('Keranjang')) return
  navigateTo('/cart')
}

function handleOpenAnalytics() {
  if (!requireAuth('Analisa Produk')) return
  aiStep.value = 0
  isAnalyticOpen.value = true
}

function handleVisitLive(liveId: string) {
  if (!requireAuth('Live Penjual')) return
  navigateTo(`/live/${liveId}`)
}

// Seller handlers
function openConfirm(action: ConfirmAction) {
  confirmAction.value = action
  confirmOpen.value = true
}

async function handleConfirm() {
  confirmLoading.value = true
  const res = await updatePostStatus(confirmAction.value)
  confirmLoading.value = false
  confirmOpen.value = false
  showToast(res.message, res.success ? 'success' : 'error')
  if (res.success && confirmAction.value === 'delete') navigateTo('/')
  if (res.success) startBdTimer()
}

function handleDeactivate() {
  openConfirm(product.value?.on_sale === false && !product.value?.on_verify ? 'status' : 'cancel')
}

function handleEditPost() {
  navigateTo(`/post/edit/${productId.value}`)
}

function handleBekaskuCenter() {
  const helpChatStore = useHelpChatStore()
  const title = product.value?.title || 'Iklan Saya'
  helpChatStore.openHelpChat({
    topic: 'post',
    referenceId: productId.value,
    referenceTitle: title,
    initialMessage: `Halo BekasKu Center, saya butuh bantuan terkait iklan produk saya "${title}".`,
  })
}

function handleRegisterBestDeal() {
  showBestDealModal.value = true
}

async function onBestDealSuccess() {
  await fetchDetail()
  startBdTimer()
}

</script>

<template>
  <div class="min-h-screen bg-surface text-text flex flex-col selection:bg-primary selection:text-white pb-24 md:pb-8">
    <!-- Mobile Header -->
    <ProductDetailHeader
      class="md:hidden"
      :title="product?.title"
      :cart-count="cartStore.totalItems"
      :is-logged-in="authStore.isLoggedIn"
      @cart-click="handleCartClick"
    />

    <!-- Toast -->
    <Teleport to="body">
      <div
        v-if="toastMessage"
        class="fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold text-white"
        :class="toastType === 'success' ? 'bg-primary' : 'bg-danger'"
      >
        {{ toastMessage }}
      </div>
    </Teleport>

    <!-- 1. Skeleton Loading State -->
    <main
      v-if="isPageLoading"
      class="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-8 animate-pulse"
    >
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-4" />
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 space-y-4">
          <div class="aspect-square bg-gray-200 rounded-2xl w-full" />
          <div class="grid grid-cols-5 gap-2">
            <div v-for="i in 5" :key="i" class="aspect-square bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
            <div class="h-6 bg-gray-200 rounded w-3/4" />
            <div class="h-8 bg-gray-200 rounded w-1/2" />
            <div class="h-10 bg-gray-200 rounded w-full" />
            <div class="h-10 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </main>

    <!-- 2. Not Found -->
    <main
      v-else-if="isPageNotFound"
      class="max-w-4xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-4"
    >
      <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center text-text-muted">
        <AlertCircle class="w-8 h-8" />
      </div>
      <div class="space-y-1">
        <h2 class="text-lg font-bold text-text">Produk Tidak Ditemukan</h2>
        <p class="text-xs text-text-muted max-w-sm">
          Produk yang Anda cari tidak tersedia, sudah dihapus, atau tautan tidak valid.
        </p>
      </div>
      <NuxtLink
        to="/"
        class="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        Kembali ke Beranda
      </NuxtLink>
    </main>

    <!-- 3. Main Content -->
    <main v-else class="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-8">
      <!-- Breadcrumb (Desktop) -->
      <nav class="hidden md:flex items-center gap-2 text-xs text-text-muted">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" />
        <NuxtLink
          v-if="product?.category_id"
          :to="`/kategori/${product.category_id}`"
          class="hover:text-primary transition-colors"
        >
          {{ product?.category || 'Kategori' }}
        </NuxtLink>
        <ChevronRight v-if="product?.category" class="w-3.5 h-3.5" />
        <span class="text-text font-semibold truncate max-w-xs">{{ product?.title }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Column -->
        <div class="lg:col-span-7 space-y-5 bg-white rounded-2xl p-4 sm:p-5">
          <ProductImagesCarousel
            :images="images"
            :title="product?.title"
            :allow-analytics="!!product?.allow_analytics && !product?.mine"
            @open-analytics="handleOpenAnalytics"
          />

          <!-- Mobile: price & title -->
          <div v-if="product" class="lg:hidden">
            <ProductMainInfo
              :product="product"
              :is-wishlist="inWishlist"
              :total-favorite="totalFavorite"
              :is-bekasku-plus="isBekaskuPlus"
              :is-vip="isVip"
              :is-trusted="isTrusted"
              :is-verified="isVerified"
              :is-pay-and-pick="isPayAndPick"
              :is-free-shipping="isFreeShipping"
              @toggle-wishlist="handleToggleWishlist"
            />
          </div>

          <!-- Seller status banners / best deal / help (seller only) -->
          <ProductSellerStatusPanel
            v-if="product?.mine"
            :product="product"
            :countdown-str="bdCountdown"
            @register-bestdeal="handleRegisterBestDeal"
            @bekasku-center="handleBekaskuCenter"
          />

          <div class="h-px bg-border/60" />

          <!-- Mobile: specs -->
          <div v-if="product" class="lg:hidden space-y-5">
            <ProductSpecsTable :product="product" />
            <div class="h-px bg-border/60" />
          </div>

          <ProductDescription :description="product?.description" />

          <ProductVideoThumbnail
            v-if="videoThumbnail && product?.video"
            :video-url="sanitizeMediaUrl(product.video, '')"
            :thumbnail-url="videoThumbnail"
            :title="product.title"
          />

          <ProductDeliveryDisplay
            v-if="showDelivery"
            :services="shippingServices"
            :city="shippingCity"
          />

          <div class="h-px bg-border/60" />

          <ProductDiscussionPreview
            :discussions="discussions"
            :total-discussion="totalDiscussions"
            :is-loading="discussionLoading"
            :is-sending="discussionSending"
            :is-mine="product?.mine"
            :is-logged-in="authStore.isLoggedIn"
            @send-discussion="handleSendDiscussion"
            @require-auth="requireAuth('Diskusi Produk')"
          />

          <!-- Mobile: seller card -->
          <div v-if="seller" class="lg:hidden space-y-4">
            <div class="h-px bg-border/60" />
            <ProductSellerCard
              :seller="seller"
              :is-mine="product?.mine"
              :is-bekasku-plus="isBekaskuPlus"
              :is-vip="isVip"
              :is-trusted="isTrusted"
              :is-verified="isVerified"
              @visit-live="handleVisitLive"
            />
          </div>
        </div>

        <!-- Right Column (desktop) -->
        <div class="hidden lg:block lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          <div v-if="product" class="space-y-4">
            <div class="bg-white p-5 rounded-2xl">
              <ProductMainInfo
                :product="product"
                :is-wishlist="inWishlist"
                :total-favorite="totalFavorite"
                :is-bekasku-plus="isBekaskuPlus"
                :is-vip="isVip"
                :is-trusted="isTrusted"
                :is-verified="isVerified"
                :is-pay-and-pick="isPayAndPick"
                :is-free-shipping="isFreeShipping"
                :is-desktop="true"
                @toggle-wishlist="handleToggleWishlist"
              />
            </div>
            <!-- Desktop Action Bar: transparan tanpa card container atau border atas -->
            <div class="pt-1">
              <ProductActionBar
                :product="product"
                :seller="seller"
                :is-mine="product.mine"
                @chat="handleChat"
                @call="handleCall"
                @whatsapp="handleWhatsApp"
                @nego="handleNego"
                @add-cart="handleAddToCart"
                @offer-needed="handleOfferNeeded"
                @edit-post="handleEditPost"
                @deactivate-post="handleDeactivate"
                @delete-post="openConfirm('delete')"
                @mark-sold="openConfirm('sold')"
                @bekasku-center="handleBekaskuCenter"
              />
            </div>
          </div>

          <div v-if="product" class="p-5 rounded-2xl bg-white">
            <ProductSpecsTable :product="product" />
          </div>

          <ProductSellerCard
            v-if="seller"
            :seller="seller"
            :is-mine="product?.mine"
            :is-bekasku-plus="isBekaskuPlus"
            :is-vip="isVip"
            :is-trusted="isTrusted"
            :is-verified="isVerified"
            @visit-live="handleVisitLive"
          />
        </div>
      </div>

      <!-- Recommendations -->
      <section v-if="recommendations.length > 0" class="pt-6 space-y-4">
        <h2 class="text-base sm:text-lg font-bold text-text">Sesuai kesukaan kamu</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <AppProductCard
            v-for="item in recommendations"
            :key="item.id || item._id"
            :product="item"
          />
        </div>
        <div v-if="hasMoreRec" class="flex justify-center pt-2">
          <button
            type="button"
            :disabled="recLoading"
            class="px-6 py-2 rounded-xl border border-text text-text text-xs font-semibold hover:bg-text hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            @click="fetchRecommendations(productId, true)"
          >
            {{ recLoading ? 'Memuat...' : 'Muat Lebih Banyak' }}
          </button>
        </div>
      </section>
    </main>

    <!-- Mobile sticky: best deal bar + action bar -->
    <div v-if="product" class="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div
        v-if="showBdBar"
        class="bg-primary text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between"
      >
        <span>BEST DEAL akan berakhir dalam:</span>
        <span class="font-mono">{{ bdCountdown }}</span>
      </div>
      <ProductActionBar
        :product="product"
        :seller="seller"
        :is-mine="product.mine"
        @chat="handleChat"
        @call="handleCall"
        @whatsapp="handleWhatsApp"
        @nego="handleNego"
        @add-cart="handleAddToCart"
        @offer-needed="handleOfferNeeded"
        @edit-post="handleEditPost"
        @deactivate-post="handleDeactivate"
        @delete-post="openConfirm('delete')"
        @mark-sold="openConfirm('sold')"
        @bekasku-center="handleBekaskuCenter"
      />
    </div>

    <!-- Modals -->
    <AppGuestAuthModal v-model="showGuestModal" :feature-title="guestFeature" />

    <ProductOfferNeededModal
      v-model="isOfferNeededOpen"
      :product-id="productId"
      :needed-title="product?.title || ''"
      :seller="seller"
    />

    <ProductChatModal v-model="isChatOpen" @select="goChat" />

    <ProductAddCartModal
      v-model="isCartOpen"
      :status="cartStatus"
      @view-cart="navigateTo('/cart')"
      @continue="isCartOpen = false"
    />

    <ProductNegotiateModal
      v-if="product"
      v-model="isNegoOpen"
      :current-price="product.price"
      :title="product.title"
      :image="images[0]"
      :is-submitting="isNegoSubmitting"
      @submit="handleNegoSubmit"
    />

    <ProductConfirmModal
      v-model="confirmOpen"
      :title="confirmCopy.title"
      :description="confirmCopy.description"
      :confirm-label="confirmCopy.confirmLabel"
      :is-danger="confirmCopy.danger"
      :loading="confirmLoading"
      @confirm="handleConfirm"
    />

    <ProductAnalyticModal
      v-model="isAnalyticOpen"
      :step="aiStep"
      :score="aiScore"
      :recom="aiRecom"
      :description="aiDesc"
      @start="analyzePostWithAI"
    />

    <!-- Phone call fallback modal -->
    <AppModal v-model="isCallOpen">
      <div class="text-center space-y-4 py-2">
        <h3 class="text-base font-bold text-text">Hubungi Penjual</h3>
        <p class="text-sm text-text-muted">{{ seller?.phone }}</p>
        <a
          :href="`tel:${seller?.phone}`"
          class="block w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
          @click="isCallOpen = false"
        >
          Telepon Sekarang
        </a>
      </div>
    </AppModal>

    <!-- Best Deal Registration Modal -->
    <BestDealRegisterModal
      v-if="product"
      v-model="showBestDealModal"
      :product-id="productId"
      :price="product.price"
      :title="product.title"
      :image="images[0]"
      @success="onBestDealSuccess"
    />
  </div>
</template>
