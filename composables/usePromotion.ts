import { ref, computed } from 'vue'
import {
  API_PROMOTION_QUOTA,
  API_PROMOTION_LIST,
  API_PROMOTION_STATUS,
  API_PROMOTION_ACTIVE_LIST,
  API_PROMOTION_APPLY,
  API_PROMOTION_CHECKOUT,
  API_PRODUCT_MYPOST,
  API_PRODUCT_DETAIL,
  API_CART_PAYMENT_INIT,
  API_PAYMENT_CHOOSE,
  API_PASSWORD_MATCH,
  PAYMENT_PLATFORM_WEB,
  STORAGE_KEY_PROMOTION_DRAFT,
} from '~/utils/constants'
import type {
  PromotionType,
  PromotionQuota,
  PromotionPackage,
  ProductPromotionStatus,
  ActivePromotionProduct,
  PromotionTargetProduct,
  PromotionDraft,
  PromotionApplyResponse,
} from '~/types/promotion'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import { useAuthStore } from '~/stores/auth'

const promotionDraftState = ref<PromotionDraft | null>(null)

export function usePromotion() {
  const api = useApi()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const quota = ref<PromotionQuota>({
    sundul_quota: 0,
    highlight_quota: 0,
    spotlight_quota: 0,
  })

  const packages = ref<PromotionPackage[]>([])
  const activePromotions = ref<ActivePromotionProduct[]>([])
  const myProducts = ref<PromotionTargetProduct[]>([])
  const productStatus = ref<ProductPromotionStatus | null>(null)

  const paymentLoading = ref(false)
  const paymentError = ref<string | null>(null)
  const myBalance = ref<number>(0)
  const balanceLimit = ref<number>(200000)
  const canUseBalance = ref<boolean>(false)
  const lockBalance = ref<boolean>(false)
  const useBalanceToggle = ref<boolean>(false)

  const selectedPayment = ref<PaymentMethodItem | null>(null)
  const paymentFee = ref<number>(0)
  const paymentInput = ref<string>('')

  // Draft persistence helper
  function initPromotionDraft(): PromotionDraft | null {
    if (promotionDraftState.value) return promotionDraftState.value
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PROMOTION_DRAFT)
        if (raw) {
          promotionDraftState.value = JSON.parse(raw) as PromotionDraft
          return promotionDraftState.value
        }
      } catch {
        // ignore JSON parse error
      }
    }
    return null
  }

  function setPromotionDraft(draft: PromotionDraft) {
    promotionDraftState.value = draft
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_PROMOTION_DRAFT, JSON.stringify(draft))
      } catch {
        // ignore quota error
      }
    }
  }

  function clearPromotionDraft() {
    promotionDraftState.value = null
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY_PROMOTION_DRAFT)
      } catch {
        // ignore
      }
    }
  }

  function formatPhoneSpacing(text: string, spacing = 4): string {
    const digitsOnly = text.replace(/\D/g, '')
    let result = ''
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i % spacing === 0 && i !== 0) result += ' '
      result += digitsOnly[i]
    }
    return result
  }

  function updatePaymentInput(val: string) {
    paymentInput.value = formatPhoneSpacing(val, 4)
  }

  // ── Fetch Methods ───────────────────────────────────────────────────────
  async function fetchQuota(): Promise<PromotionQuota> {
    if (!authStore.isLoggedIn) return quota.value
    try {
      const res = await api.get<{ message?: string; result?: PromotionQuota }>(API_PROMOTION_QUOTA)
      if (res?.result) {
        quota.value = {
          sundul_quota: Number(res.result.sundul_quota || 0),
          highlight_quota: Number(res.result.highlight_quota || 0),
          spotlight_quota: Number(res.result.spotlight_quota || 0),
        }
      }
    } catch (e: unknown) {
      console.error('Error fetchQuota:', e)
    }
    return quota.value
  }

  async function fetchPackages(type?: PromotionType): Promise<PromotionPackage[]> {
    try {
      const res = await api.get<{ message?: string; result?: PromotionPackage[] }>(API_PROMOTION_LIST)
      if (Array.isArray(res?.result)) {
        packages.value = res.result.filter((p) => p.is_active !== false)
        if (type) {
          return packages.value.filter((p) => p.type === type)
        }
        return packages.value
      }
    } catch (e: unknown) {
      console.error('Error fetchPackages:', e)
    }
    return []
  }

  async function fetchProductStatus(productId: string): Promise<ProductPromotionStatus | null> {
    if (!productId) return null
    try {
      const res = await api.get<{ message?: string; result?: ProductPromotionStatus }>(
        `${API_PROMOTION_STATUS}/${productId}`
      )
      if (res?.result) {
        productStatus.value = res.result
        return res.result
      }
    } catch (e: unknown) {
      console.error('Error fetchProductStatus:', e)
    }
    return null
  }

  async function fetchActivePromotions(): Promise<ActivePromotionProduct[]> {
    if (!authStore.isLoggedIn) return []
    try {
      const res = await api.get<{ message?: string; result?: ActivePromotionProduct[] }>(
        API_PROMOTION_ACTIVE_LIST
      )
      if (Array.isArray(res?.result)) {
        activePromotions.value = res.result
        return res.result
      }
    } catch (e: unknown) {
      console.error('Error fetchActivePromotions:', e)
    }
    return []
  }

  async function fetchMyProducts(filter = '', page = 1): Promise<PromotionTargetProduct[]> {
    if (!authStore.isLoggedIn) return []
    try {
      const res = await api.post<{
        message?: string
        result?: {
          docs?: Array<{ _id: string; title: string; price: number; image?: string[]; condition?: string; city?: string; step?: number }>
          data?: Array<{ _id: string; title: string; price: number; image?: string[]; condition?: string; city?: string; step?: number }>
        }
      }>(API_PRODUCT_MYPOST, {
        filter,
        type: 0,
        page,
        lang: 'id',
      })
      const rawDocs = res?.result?.docs || res?.result?.data || []
      const activeDocs = rawDocs.filter((p) => p.step === 1 || p.step === undefined)
      const mapped: PromotionTargetProduct[] = activeDocs.map((p) => ({
        _id: String(p._id),
        title: String(p.title || ''),
        price: Number(p.price || 0),
        image: p.image,
        condition: p.condition,
        city: p.city,
      }))
      myProducts.value = mapped
      return mapped
    } catch (e: unknown) {
      console.error('Error fetchMyProducts:', e)
      return []
    }
  }

  async function fetchTargetProduct(productId: string): Promise<PromotionTargetProduct | null> {
    if (!productId) return null
    try {
      const res = await api.post<{
        result?: {
          product?: { _id?: string; id?: string; title?: string; price?: number; image?: string[]; city?: string }
          seller?: { city?: string }
          _id?: string
          title?: string
          price?: number
          image?: string[]
          city?: string
        }
      }>(API_PRODUCT_DETAIL, { id: productId })
      const p = res?.result?.product || res?.result
      if (p) {
        return {
          _id: String(p._id || p.id || productId),
          title: String(p.title || ''),
          price: Number(p.price || 0),
          image: p.image,
          city: p.city || res?.result?.seller?.city,
        }
      }
    } catch (e: unknown) {
      console.error('Error fetchTargetProduct:', e)
    }
    return null
  }

  async function applyPromotion(
    productId: string,
    type: PromotionType
  ): Promise<{ success: boolean; message?: string }> {
    loading.value = true
    error.value = null
    try {
      const res = await api.post<PromotionApplyResponse>(API_PROMOTION_APPLY, {
        product_id: productId,
        promotion_type: type,
      })
      await fetchQuota()
      return {
        success: true,
        message: res?.result?.message || res?.message || 'Promosi berhasil diterapkan.',
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menerapkan promosi.'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const packagePrice = computed(() => {
    return Number(promotionDraftState.value?.package?.price || 0)
  })

  const balanceDeduction = computed(() => {
    if (!useBalanceToggle.value || !canUseBalance.value) return 0
    let maxAllowed = myBalance.value
    if (balanceLimit.value > 0 && maxAllowed > balanceLimit.value) {
      maxAllowed = balanceLimit.value
    }
    if (maxAllowed >= packagePrice.value) {
      return packagePrice.value
    }
    return maxAllowed
  })

  const isFullBalance = computed(
    () => balanceDeduction.value > 0 && balanceDeduction.value >= packagePrice.value
  )

  const effectivePaymentFee = computed(() => {
    if (isFullBalance.value) return 0
    return paymentFee.value
  })

  const finalCharge = computed(() => {
    const raw = packagePrice.value + effectivePaymentFee.value - balanceDeduction.value
    return Math.max(0, raw)
  })

  const allowSubmit = computed(() => {
    if (!promotionDraftState.value) return false
    if (isFullBalance.value) return true
    if (!selectedPayment.value || !selectedPayment.value.id) return false
    if (
      selectedPayment.value.with_input &&
      paymentInput.value.replace(/\s+/g, '').length < 8
    ) {
      return false
    }
    return true
  })

  function toggleUseBalance(val?: boolean) {
    if (lockBalance.value) return
    const next = typeof val === 'boolean' ? val : !useBalanceToggle.value
    useBalanceToggle.value = next

    if (next) {
      let maxAllowed = myBalance.value
      if (balanceLimit.value > 0 && maxAllowed > balanceLimit.value) {
        maxAllowed = balanceLimit.value
      }
      if (maxAllowed >= packagePrice.value) {
        selectedPayment.value = null
        paymentFee.value = 0
        paymentInput.value = ''
      }
    }
  }

  async function fetchPaymentInit() {
    paymentLoading.value = true
    paymentError.value = null
    try {
      const res = await api.post<{
        result?: {
          mybalance?: number
          allow?: string
          balance_limit_v3?: number
          balance_limit?: number
        }
      }>(API_CART_PAYMENT_INIT, {})

      if (res?.result) {
        myBalance.value = Number(res.result.mybalance || 0)
        const parsedLimit = Number(
          res.result.balance_limit_v3 ?? res.result.balance_limit ?? 200000
        )
        balanceLimit.value = parsedLimit
        const allowStr = String(res.result.allow ?? 'yes').toLowerCase()
        if (parsedLimit <= 0) {
          canUseBalance.value = false
        } else {
          canUseBalance.value = allowStr !== 'no'
        }
        if (myBalance.value <= 0 || !canUseBalance.value) {
          lockBalance.value = true
          useBalanceToggle.value = false
        } else {
          lockBalance.value = false
        }
      }
    } catch (e: unknown) {
      paymentError.value = e instanceof Error ? e.message : 'Gagal memuat info saldo'
    } finally {
      paymentLoading.value = false
    }
  }

  async function fetchPaymentMethods(): Promise<PaymentCategoryItem[]> {
    try {
      const remainingAmount = Math.max(0, packagePrice.value - balanceDeduction.value)
      const res = await api.post<{ result?: PaymentCategoryItem[] }>(
        API_PAYMENT_CHOOSE,
        {
          platform: PAYMENT_PLATFORM_WEB,
          charge: remainingAmount,
          lang: 'id',
        },
        { usePaymentToken: true }
      )
      return res?.result || []
    } catch {
      return []
    }
  }

  function selectPaymentMethod(item: PaymentMethodItem) {
    selectedPayment.value = item
    const chargeNum = Number(item.charge_number || 0)
    const chargePct = Number(item.charge_percent || 0)
    paymentFee.value = Math.round(chargeNum + (chargePct * packagePrice.value) / 100)

    if (item.with_input) {
      const existing = (item as unknown as { input?: string }).input || ''
      paymentInput.value = formatPhoneSpacing(existing, 4)
    } else {
      paymentInput.value = ''
    }
  }

  async function verifyPassword(password: string): Promise<boolean> {
    try {
      const res = await api.post<{ result?: boolean; message?: string }>(
        API_PASSWORD_MATCH,
        { password },
        { usePaymentToken: true }
      )
      return res?.result === true
    } catch {
      return false
    }
  }

  async function submitPromotionCheckout(
    password = ''
  ): Promise<{ success: boolean; result?: string; message?: string }> {
    const draft = promotionDraftState.value
    if (!draft) {
      return { success: false, message: 'Data paket promosi tidak ditemukan.' }
    }

    const payload = {
      promotion_type: draft.package.type,
      promotion_quota: draft.package.quota || 1,
      promotion_days: draft.package.days || 7,
      password,
      payment_method_id: isFullBalance.value ? '' : selectedPayment.value?.id || '',
      payment_fee: effectivePaymentFee.value,
      balance_use: balanceDeduction.value,
      price: draft.package.price,
      total_order: draft.package.price,
      final_charge: finalCharge.value,
      input: paymentInput.value.replace(/\s+/g, ''),
      lang: 'id',
      product_id: draft.product._id,
    }

    try {
      const res = await api.post<{ message?: string; result?: string }>(
        API_PROMOTION_CHECKOUT,
        payload,
        { usePaymentToken: true }
      )

      if (res?.result && res.result !== 'FAILED') {
        return { success: true, result: String(res.result) }
      }
      return {
        success: false,
        message: res?.message || 'Checkout paket promosi gagal.',
      }
    } catch (e: unknown) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Terjadi kesalahan sistem.',
      }
    }
  }

  return {
    // Hub state
    loading,
    error,
    quota,
    packages,
    activePromotions,
    myProducts,
    productStatus,
    promotionDraft: promotionDraftState,
    // Hub methods
    fetchQuota,
    fetchPackages,
    fetchProductStatus,
    fetchActivePromotions,
    fetchMyProducts,
    fetchTargetProduct,
    applyPromotion,
    initPromotionDraft,
    setPromotionDraft,
    clearPromotionDraft,
    // Payment state
    paymentLoading,
    paymentError,
    myBalance,
    balanceLimit,
    canUseBalance,
    lockBalance,
    useBalanceToggle,
    selectedPayment,
    paymentFee: effectivePaymentFee,
    paymentInput,
    packagePrice,
    balanceDeduction,
    isFullBalance,
    finalCharge,
    allowSubmit,
    // Payment methods
    toggleUseBalance,
    fetchPaymentInit,
    fetchPaymentMethods,
    selectPaymentMethod,
    updatePaymentInput,
    verifyPassword,
    submitPromotionCheckout,
  }
}
