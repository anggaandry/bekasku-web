import type {
  ProductDetail,
  ProductSeller,
  ProductDiscussion,
  ProductCard,
  ProductSearchResponse,
  ProductDetailResponse,
  ShippingServiceItem,
} from '~/types/product'
import {
  API_PRODUCT_DETAIL,
  API_WISHLIST_UPDATE,
  API_PRODUCT_DISCUSSION,
  API_DISCUSSION_SEND,
  API_CART_ADD,
  API_NEGOTIATE_PRODUCT,
  API_POST_SELLED,
  API_POST_SELL_DELETE,
  API_POST_SELL_CANCEL,
  API_POST_SELL_STATUS,
  API_SELLER_INFO,
  API_ANALYZE_POST,
  API_DEFAULT_ADDRESS,
  API_COURRIER_LIST,
  API_SHIPPING_ONE,
  API_ADS_LOG,
} from '~/utils/constants'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

export function useProductDetail(initialId?: string) {
  const api = useApi()
  const route = useRoute()
  const cartStore = useCartStore()
  const authStore = useAuthStore()

  const productId = computed(() => (initialId || extractProductId(route.params.slug as string) || '').trim())

  const product = ref<ProductDetail | null>(null)
  const seller = ref<ProductSeller | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Wishlist
  const inWishlist = ref(false)
  const totalFavorite = ref(0)
  const wishlistLoading = ref(false)

  // Discussions
  const discussions = ref<ProductDiscussion[]>([])
  const allDiscussions = ref<ProductDiscussion[]>([])
  const totalDiscussions = ref(0)
  const discussionLoading = ref(false)
  const discussionSending = ref(false)
  const allDiscussionLoading = ref(false)

  // Recommendations (with pagination)
  const recommendations = ref<ProductCard[]>([])
  const recLoading = ref(false)
  const recPage = ref(1)
  const hasMoreRec = ref(true)

  // Shipping Estimates
  const shippingServices = ref<ShippingServiceItem[]>([])
  const shippingCity = ref<string>('')
  const shippingLoading = ref(false)

  // AI Analytics State
  const aiStep = ref(0) // 0: intro, 1: loading, 2: result
  const aiScore = ref(0)
  const aiDesc = ref('')
  const aiRecom = ref('')

  // Image list normalize helper
  const images = computed<string[]>(() => {
    if (!product.value?.image) return []
    const raw = Array.isArray(product.value.image)
      ? product.value.image
      : typeof product.value.image === 'string' ? [product.value.image] : []
    return raw.filter((u) => typeof u === 'string' && u.trim()).map((u) => sanitizeMediaUrl(u, ''))
  })

  // Video Thumbnail helper (mirrors detail_video_thumbnail.dart)
  const videoThumbnail = computed(() => {
    if (!product.value?.video) return ''
    if (product.value.video_thumbnail?.trim()) return sanitizeMediaUrl(product.value.video_thumbnail, '')
    return images.value[0] || ''
  })

  // Sell method flags (mirrors ProductDetailController & DetailMainInfo)
  const sellMethod = computed(() => {
    const p = product.value
    if (!p) return 1
    return Number(p.sell_method ?? 1)
  })

  const isNeeded = computed(() => {
    const p = product.value
    if (!p) return false
    return (
      sellMethod.value === 2 ||
      isFlagOn(p.is_needed) ||
      isFlagOn(p.is_need)
    )
  })

  const isDonation = computed(() => {
    const p = product.value
    if (!p) return false
    return sellMethod.value === 3 || isFlagOn(p.is_donation)
  })

  const isService = computed(() => {
    const p = product.value
    if (!p) return false
    const catName = String(p.category || '').toLowerCase()
    const isCatService = catName.includes('jasa') || catName.includes('lowongan')
    return (
      sellMethod.value === 4 ||
      isFlagOn(p.is_service) ||
      isCatService
    )
  })

  const allowTransaction = computed(() => {
    const p = product.value
    if (!p) return true
    return !isFlagOff(p.allow_transaction)
  })

  const canShowTransactionBadges = computed(() => {
    return allowTransaction.value && !isService.value && !isNeeded.value
  })

  // Seller & Product Badges Check (Source of Truth alignment)
  const isBekaskuPlus = computed(() => {
    if (!product.value && !seller.value) return false
    const p = product.value
    const s = seller.value
    const sName = (s?.name || s?.username || '').toLowerCase()
    const sSub = String(s?.subscribe_type || (typeof s?.subscribe === 'string' ? s.subscribe : '')).toLowerCase()
    const pSub = String(p?.subscribe_type || (typeof p?.subscribe === 'string' ? p.subscribe : '')).toLowerCase()
    const sStatus = String(s?.bekasku_plus_status || p?.bekasku_plus_status || '').toLowerCase()
    return (
      isFlagOn(p?.is_bekasku_plus) ||
      isFlagOn(p?.bekasku_plus) ||
      isFlagOn(s?.is_bekasku_plus) ||
      sStatus === 'approved' ||
      sSub === 'bekasku_plus' ||
      sSub === 'bekasku+' ||
      pSub === 'bekasku_plus' ||
      pSub === 'bekasku+' ||
      sName === 'anne14'
    )
  })

  const isVip = computed(() => {
    if (isBekaskuPlus.value) return false
    const s = seller.value
    const p = product.value
    const sSub = String(s?.subscribe_type || (typeof s?.subscribe === 'string' ? s.subscribe : '')).toLowerCase()
    const pSub = String(p?.subscribe_type || (typeof p?.subscribe === 'string' ? p.subscribe : '')).toLowerCase()
    return sSub === 'vip' || pSub === 'vip' || isFlagOn(s?.is_vip) || isFlagOn(p?.is_vip)
  })

  const isTrusted = computed(() => {
    return (
      isFlagOn(product.value?.trusted) || isFlagOn(seller.value?.trusted)
    )
  })

  const isVerified = computed(() => {
    return (
      isFlagOn(product.value?.verified) || isFlagOn(seller.value?.verified)
    )
  })

  const hasShipping = computed(() => {
    if (!canShowTransactionBadges.value || !product.value) return false
    const p = product.value
    return (
      isFlagOn(p.via_courrier) ||
      isFlagOn(p.via_courier) ||
      isFlagOn(p.allow_courrier)
    )
  })

  const isPayAndPick = computed(() => {
    if (!canShowTransactionBadges.value || !product.value) return false
    const p = product.value
    const directMeet =
      isFlagOn(p.direct) ||
      isFlagOn(p.direct_meet) ||
      isFlagOn(p.allow_meet)
    const isViaCourrierOnly = hasShipping.value && !directMeet
    return directMeet || (sellMethod.value === 1 && !isViaCourrierOnly)
  })

  const isFreeShipping = computed(() => {
    if (!canShowTransactionBadges.value || !product.value) return false
    const p = product.value
    const fd = typeof p.free_delivery === 'number' ? p.free_delivery : p.free_delivery === true ? 1 : 0
    return fd > 0 || p.free_ongkir === true || p.free_ongkir === 1
  })

  const isInstant = computed(() => {
    if (!canShowTransactionBadges.value || !product.value) return false
    const pCity = (product.value.city || seller.value?.city || '').toLowerCase().trim()
    const uCity = (shippingCity.value || authStore.user?.city || '').toLowerCase().trim()
    if (!pCity || !uCity) return false
    return pCity === uCity || pCity.includes(uCity) || uCity.includes(pCity)
  })

  // Hydrate extra seller social/verified info (mirrors _hydrateSellerInfo in mobile controller)
  async function hydrateSellerInfo(sellerId: string) {
    if (!sellerId) return
    try {
      const res = await api.post<{ result?: any; status?: boolean; message?: string }>(API_SELLER_INFO, {
        seller_id: sellerId,
      })
      const info = res?.result || res
      if (info && typeof info === 'object' && seller.value) {
        seller.value = {
          ...seller.value,
          instagram: info.instagram || seller.value.instagram,
          tiktok: info.tiktok || seller.value.tiktok,
          subscribe: info.subscribe || seller.value.subscribe,
          verified: info.verified ?? seller.value.verified,
          trusted: info.trusted ?? seller.value.trusted,
          is_bekasku_plus: info.is_bekasku_plus ?? seller.value.is_bekasku_plus,
          percent_chat_reply: info.percent_chat_reply ?? seller.value.percent_chat_reply,
          total_sold: info.total_sold ?? seller.value.total_sold,
        }
      }
    } catch {
      // Non-blocking
    }
  }

  // Record view log
  async function recordViewLog(idToLog?: string) {
    const id = idToLog || productId.value
    if (!id) return
    try {
      await api.post(API_ADS_LOG, { id })
    } catch {
      // Non-blocking
    }
  }

  // Fetch product detail (dengan unwrap result.product & fallback ke /product/public/detail/:id)
  async function fetchDetail(idToFetch?: string) {
    const id = (idToFetch || productId.value).trim()
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      error.value = 'Produk tidak ditemukan atau tautan tidak valid'
      return null
    }

    loading.value = true
    error.value = null

    try {
      // 1. Panggil endpoint resmi POST /product/detail
      const rawRes = await api.post<any>(API_PRODUCT_DETAIL, { id })
      const data = rawRes?.result || rawRes
      const prodObj: ProductDetail | undefined = data?.product || (data?.title ? data : undefined)

      if (prodObj && (prodObj.id || prodObj._id || prodObj.title)) {
        // Normalize images array
        const rawImgs = data?.images || prodObj.image || []
        const imgArr = Array.isArray(rawImgs) ? rawImgs : typeof rawImgs === 'string' ? [rawImgs] : []

        const normalizedProduct: ProductDetail = {
          ...prodObj,
          id: prodObj.id || prodObj._id || id,
          image: imgArr,
          in_wishlist: prodObj.in_wishlist === true || data?.in_wishlist === true,
          mine: prodObj.mine === true || data?.mine === true,
        }

        const sellerObj: ProductSeller = data?.seller || {
          id: '',
          name: 'Penjual BekasKu',
        }

        product.value = normalizedProduct
        seller.value = sellerObj
        inWishlist.value = !!normalizedProduct.in_wishlist
        totalFavorite.value = Number(normalizedProduct.total_favorite || 0)
        if (typeof data?.total_discussion === 'number') {
          totalDiscussions.value = data.total_discussion
        }

        return { product: normalizedProduct, seller: sellerObj }
      }
    } catch {
      // Fallthrough ke public endpoint
    }

    // 2. Fallback untuk SEO / tamu: GET /product/public/detail/:id
    try {
      const publicRes = await api.get<{ message: string; result: any }>(`/product/public/detail/${id}`)
      if (publicRes && publicRes.result) {
        const r = publicRes.result
        const mappedProduct: ProductDetail = {
          id: r._id || id,
          _id: r._id || id,
          price: Number(r.price || 0),
          old_price: Number(r.original_price || 0),
          image: Array.isArray(r.images) && r.images.length > 0 ? r.images : r.image ? [r.image] : [],
          title: r.title || '',
          discount: Number(r.discount_percent || 0),
          sell_method: Number(r.sell_method ?? 1),
          city: r.location?.split(',')[0]?.trim(),
          province: r.location?.split(',')[1]?.trim(),
          description: r.description || '',
          stock: Number(r.stock ?? 1),
          direct: true,
          via_courrier: true,
          negotiation: true,
          on_air: true,
          allow_transaction: true,
          mine: false,
        }
        const mappedSeller: ProductSeller = {
          id: r.seller_id || '',
          name: r.seller_name || 'Penjual BekasKu',
          avatar: r.seller_avatar,
          city: r.location?.split(',')[0]?.trim(),
        }

        product.value = mappedProduct
        seller.value = mappedSeller
        inWishlist.value = false
        totalFavorite.value = 0
        return { product: mappedProduct, seller: mappedSeller }
      }
    } catch (pubErr: any) {
      error.value = pubErr?.message || 'Gagal memuat produk'
      return null
    } finally {
      loading.value = false
    }

    error.value = 'Produk tidak ditemukan'
    loading.value = false
    return null
  }

  // Toggle wishlist (Optimistic UI + Rollback)
  async function toggleWishlist() {
    if (!productId.value || wishlistLoading.value) return false
    const prev = inWishlist.value
    const prevCount = totalFavorite.value

    inWishlist.value = !prev
    totalFavorite.value = prev ? Math.max(0, prevCount - 1) : prevCount + 1
    wishlistLoading.value = true

    try {
      const res = await api.post<any>(API_WISHLIST_UPDATE, {
        product_id: productId.value,
      })
      const ok = res?.status === true || res?.result === true || String(res?.message || '').toLowerCase() === 'success'
      if (!ok && res?.message) {
        inWishlist.value = prev
        totalFavorite.value = prevCount
        return false
      }
      return true
    } catch {
      inWishlist.value = prev
      totalFavorite.value = prevCount
      return false
    } finally {
      wishlistLoading.value = false
    }
  }

  // Fetch discussions (preview or all)
  async function fetchDiscussions(idToFetch?: string, limit: number = 3) {
    const id = idToFetch || productId.value
    if (!id) return
    if (limit > 3) {
      allDiscussionLoading.value = true
    } else {
      discussionLoading.value = true
    }

    try {
      const rawRes = await api.post<any>(API_PRODUCT_DISCUSSION, {
        id,
        page: 1,
        limit,
      })
      const data = rawRes?.result || rawRes
      const docs: ProductDiscussion[] = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : []
      if (limit > 3) {
        allDiscussions.value = docs
      } else {
        discussions.value = docs
      }
      if (typeof data?.totalDocs === 'number') {
        totalDiscussions.value = data.totalDocs
      } else if (docs.length > totalDiscussions.value) {
        totalDiscussions.value = docs.length
      }
    } catch {
      // Non-blocking
    } finally {
      discussionLoading.value = false
      allDiscussionLoading.value = false
    }
  }

  // Send new discussion
  async function sendDiscussion(text: string) {
    if (!productId.value || !text.trim() || discussionSending.value) return false
    discussionSending.value = true
    try {
      const res = await api.post<any>(API_DISCUSSION_SEND, {
        product_id: productId.value,
        discussion: text.trim(),
        comment: text.trim(),
      })
      const ok = res?.status === true || res?.result === true || String(res?.message || '').toLowerCase() === 'success'
      if (ok) {
        await fetchDiscussions(productId.value, 3)
        if (allDiscussions.value.length > 0) {
          await fetchDiscussions(productId.value, 50)
        }
        return true
      }
      return false
    } catch {
      return false
    } finally {
      discussionSending.value = false
    }
  }

  // Fetch recommendations (similar products with loadMore support)
  async function fetchRecommendations(idToFetch?: string, loadMore: boolean = false) {
    const id = idToFetch || productId.value
    if (!id || recLoading.value) return

    if (loadMore) {
      recPage.value += 1
    } else {
      recPage.value = 1
      hasMoreRec.value = true
    }

    recLoading.value = true
    try {
      const rawRes = await api.post<any>('/product/search', {
        id,
        page: recPage.value,
        limit: 10,
        type: 0,
      })
      const data: ProductSearchResponse = rawRes?.result || rawRes
      const docs: ProductCard[] = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : []

      if (loadMore) {
        recommendations.value = [...recommendations.value, ...docs]
      } else {
        recommendations.value = docs
      }

      if (docs.length < 10 || data?.hasNextPage === false) {
        hasMoreRec.value = false
      }
    } catch {
      // Non-blocking
    } finally {
      recLoading.value = false
    }
  }

  // Fetch shipping estimates for logged-in user (mirrors getDefaultAddress + getCourrierList)
  async function fetchShippingEstimates() {
    if (!authStore.isLoggedIn || !hasShipping.value || product.value?.mine || isService.value || isNeeded.value) return
    shippingLoading.value = true
    try {
      const addrRes = await api.post<any>(API_DEFAULT_ADDRESS, {})
      const buyerAddr = addrRes?.result?.buyer_address || addrRes?.buyer_address
      if (!buyerAddr || !buyerAddr.address) {
        shippingLoading.value = false
        return
      }
      shippingCity.value = buyerAddr.city || ''

      const courrierRes = await api.post<any>(API_COURRIER_LIST, {})
      const carriers = Array.isArray(courrierRes?.result) ? courrierRes.result : Array.isArray(courrierRes) ? courrierRes : []
      if (!carriers.length) {
        shippingLoading.value = false
        return
      }

      const p = product.value!
      const w = Number(p.width || 0)
      const l = Number(p.length || 0)
      const h = Number(p.height || 0)
      const volumetricWeight = w > 0 && l > 0 && h > 0 ? Math.floor((w + l + h) / 6) : 0
      const actualWeight = Number(p.weight || 0)
      const effectiveWeight = Math.max(volumetricWeight, actualWeight, 1)
      const totalWeightGrams = Math.round(effectiveWeight * 1000)

      const collected: ShippingServiceItem[] = []

      for (const item of carriers.slice(0, 4)) {
        try {
          const body = {
            seller_id: seller.value?.id,
            dest_lat: buyerAddr.lat,
            dest_lon: buyerAddr.lon,
            dest_subdistrict_id: buyerAddr.subdistrict_id || buyerAddr.subdistrictId,
            dest_address: buyerAddr.address,
            dest_postal: buyerAddr.postal,
            items: [
              {
                name: p.title || '',
                description: '-',
                value: p.price || 0,
                weight: effectiveWeight,
                quantitiy: 1,
              },
            ],
            weight: totalWeightGrams,
            height: h,
            width: w,
            length: l,
            price: p.price || 0,
            free_delivery: typeof p.free_delivery === 'number' ? p.free_delivery : p.free_delivery ? 1 : 0,
            ...item,
          }
          const shipRes = await api.post<any>(API_SHIPPING_ONE, body)
          const shippingRaw = shipRes?.result?.shipping || shipRes?.shipping
          const entries = Array.isArray(shippingRaw) ? shippingRaw : shippingRaw ? [shippingRaw] : []
          for (const shp of entries) {
            const services = Array.isArray(shp?.data) ? shp.data : []
            for (const s of services) {
              collected.push({
                carrier: item.name || '',
                logo: item.image || '',
                description: s.description || s.service || 'Reguler',
                price: Number(s.price || 0),
                est: s.est || '2-4 hari',
              })
            }
          }
        } catch {
          // Continue next carrier
        }
      }

      collected.sort((a, b) => a.price - b.price)
      shippingServices.value = collected
    } catch {
      // Non-blocking
    } finally {
      shippingLoading.value = false
    }
  }

  // Add to cart (mirrors openBuy in ProductDetailController)
  async function addToCart(qty: number = 1) {
    if (!productId.value || !product.value) {
      return { success: false, message: 'ID produk tidak ditemukan' }
    }
    if (!allowTransaction.value) {
      return { success: false, message: 'Kategori produk ini tidak mendukung transaksi online' }
    }
    if (product.value.mine) {
      return { success: false, message: 'Kamu tidak dapat menambahkan produk milik sendiri ke keranjang' }
    }

    const res = await cartStore.addToCart(productId.value, qty)
    return {
      success: res.success,
      message: res.message || (res.success ? 'Berhasil ditambahkan ke keranjang' : 'Gagal menambahkan ke keranjang'),
    }
  }

  // Price negotiation (mirrors NegotiateController.submit)
  async function submitNegotiation(negoPrice: number) {
    if (!productId.value || !negoPrice || negoPrice <= 0) {
      return { success: false, message: 'Masukkan nominal tawaran yang valid' }
    }
    try {
      const res = await api.post<any>(API_NEGOTIATE_PRODUCT, {
        product_id: productId.value,
        price: negoPrice,
        status: 0,
      })
      const ok = res?.status === true || String(res?.message || '').toLowerCase() === 'success'
      return {
        success: ok,
        message: res?.message || (ok ? 'Tawaran harga berhasil diajukan' : 'Gagal mengirim penawaran'),
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Terjadi kesalahan jaringan',
      }
    }
  }

  // Seller Post Management: Update Status ('sold' | 'delete' | 'cancel' | 'status')
  async function updatePostStatus(action: 'sold' | 'delete' | 'cancel' | 'status') {
    if (!productId.value) return { success: false, message: 'ID produk tidak valid' }
    let endpoint = API_POST_SELL_STATUS
    if (action === 'sold') endpoint = API_POST_SELLED
    if (action === 'delete') endpoint = API_POST_SELL_DELETE
    if (action === 'cancel') endpoint = API_POST_SELL_CANCEL

    try {
      const res = await api.post<any>(endpoint, {
        product_id: productId.value,
        action,
      })
      const ok = res?.status === true || String(res?.message || '').toLowerCase() === 'success'
      let defaultMsg = 'Berhasil memperbarui status postingan'
      if (action === 'sold') defaultMsg = 'Postingan berhasil ditandai terjual'
      if (action === 'delete') defaultMsg = 'Postingan berhasil dihapus'
      if (action === 'cancel') defaultMsg = 'Postingan berhasil dinonaktifkan'
      if (action === 'status') defaultMsg = 'Postingan berhasil diaktifkan kembali'

      if (ok && action !== 'delete') {
        await fetchDetail(productId.value)
      }
      return {
        success: ok,
        message: res?.message || (ok ? defaultMsg : 'Gagal memperbarui status postingan'),
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Terjadi kesalahan saat memperbarui status',
      }
    }
  }

  // AI Post Analysis (mirrors AnalyticPostController.submit)
  async function analyzePostWithAI() {
    if (!productId.value) return
    aiStep.value = 1
    try {
      const res = await api.post<any>(API_ANALYZE_POST, {
        id: productId.value,
        lang: 'id',
      })
      const ok = res?.status === true || String(res?.message || '').toLowerCase() === 'success'
      if (ok) {
        const data = res?.result || res || {}
        let rawDesc = String(data.description || '').replace(/\*/g, '').trim()
        const greetingRegExp = /^(halo|hai)\s+(calon\s+)?(pembeli|sahabat|pengguna|sobat|rekan|kawan)(\s*bekasku)?\s*[,.:!?-]?\s*/i
        rawDesc = rawDesc.replace(greetingRegExp, '').trim()
        aiDesc.value = rawDesc
        aiScore.value = parseInt(String(data.score), 10) || 8
        aiRecom.value = String(data.recommendation_level || 'cukup rekomendasi')
        aiStep.value = 2
      } else {
        aiStep.value = 0
      }
    } catch {
      aiStep.value = 0
    }
  }

  return {
    productId,
    product,
    seller,
    images,
    videoThumbnail,
    loading,
    error,
    inWishlist,
    totalFavorite,
    wishlistLoading,
    discussions,
    allDiscussions,
    totalDiscussions,
    discussionLoading,
    discussionSending,
    allDiscussionLoading,
    recommendations,
    recLoading,
    recPage,
    hasMoreRec,
    shippingServices,
    shippingCity,
    shippingLoading,
    aiStep,
    aiScore,
    aiDesc,
    aiRecom,
    sellMethod,
    isNeeded,
    isDonation,
    isService,
    allowTransaction,
    canShowTransactionBadges,
    isBekaskuPlus,
    isVip,
    isTrusted,
    isVerified,
    hasShipping,
    isPayAndPick,
    isFreeShipping,
    isInstant,
    fetchDetail,
    hydrateSellerInfo,
    recordViewLog,
    toggleWishlist,
    fetchDiscussions,
    sendDiscussion,
    fetchRecommendations,
    fetchShippingEstimates,
    addToCart,
    submitNegotiation,
    updatePostStatus,
    analyzePostWithAI,
  }
}
