import { ref, computed } from 'vue'
import {
  API_SUBSCRIBE_LIST,
  API_DASHBOARD_INFO,
  API_CART_PAYMENT_INIT,
  API_PAYMENT_CHOOSE,
  API_PASSWORD_MATCH,
  API_SUBSCRIBE_CHECKOUT,
  PAYMENT_PLATFORM_WEB,
  STORAGE_KEY_SUBSCRIBE_DRAFT,
} from '~/utils/constants'
import type { VipPackage, SubscribeDraft, SubscribeDashboardInfo } from '~/types/subscribe'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import { useAuthStore } from '~/stores/auth'

const subscribeDraftState = ref<SubscribeDraft | null>(null)

export function useSubscribeVip() {
  const api = useApi()
  const authStore = useAuthStore()

  // ── State: Choose Package (/subscribe/vip) ─────────────────────────────
  const loading = ref(false)
  const error = ref<string | null>(null)
  const packages = ref<VipPackage[]>([])
  const selectedPackage = ref<VipPackage | null>(null)

  const mySubscribedDays = ref<number>(0)
  const myTypeSubscribed = ref<string>('')

  const isVipActive = computed(() => mySubscribedDays.value > 0)

  const activeDisplayName = computed(() => {
    const raw = (myTypeSubscribed.value || 'vip').toLowerCase()
    if (raw.includes('preloved')) return 'BekasKu+'
    return 'VIP'
  })

  // ── State: Subscribe Payment (/subscribe/vip/payment) ──────────────────
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

  // Formatted phone spacing 4 digits like Flutter V3 stringSpacing(text, 4)
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

  // Ambil daftar paket VIP & info langganan aktif
  async function fetchInitialSubscribeData() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchDashboardInfo(), fetchSubscribePackages()])
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat data langganan.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardInfo() {
    if (!authStore.isLoggedIn) {
      mySubscribedDays.value = 0
      myTypeSubscribed.value = ''
      return
    }
    try {
      const res = await api.post<{ message?: string; result?: Partial<SubscribeDashboardInfo> }>(
        API_DASHBOARD_INFO,
        {}
      )
      if (res?.result) {
        const days = Number(res.result.subscribe_days || 0)
        const type = String(res.result.subscribe_type || '')
        mySubscribedDays.value = days
        myTypeSubscribed.value = type
        if (authStore.user) {
          authStore.user.subscribe = days > 0 ? 'yes' : 'no'
          if (type) authStore.user.subscribe_type = type
        }
      }
    } catch {
      // Fallback ke data profil lokal bila tersedia
      if (authStore.user?.subscribe === 'yes') {
        myTypeSubscribed.value = authStore.user?.subscribe_type || 'vip'
      }
    }
  }

  async function fetchSubscribePackages() {
    try {
      const res = await api.post<{ message?: string; result?: VipPackage[] }>(
        API_SUBSCRIBE_LIST,
        { lang: 'id' }
      )
      const rawList = Array.isArray(res?.result) ? res.result : []

      // Sama persis dengan choose_subscribe_controller.dart baris 89:
      // Hanya tampilkan paket bertipe 'vip' dan urutkan berdasarkan days ascending (30, 60, 90)
      const vipList = rawList
        .filter((item) => String(item.type || '').toLowerCase() === 'vip')
        .map((item) => {
          const price = Number(item.price || 0)
          const discount = Number(item.discount || 0)
          const finalPrice = Number(
            item.final_price ?? price - Math.round((price * discount) / 100)
          )
          return {
            _id: item._id ? String(item._id) : undefined,
            days: Number(item.days || 30),
            price,
            discount,
            final_price: finalPrice,
            type: 'vip',
          }
        })
        .sort((a, b) => a.days - b.days)

      packages.value = vipList
      if (vipList.length > 0 && !selectedPackage.value) {
        selectedPackage.value = vipList[0] ?? null
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat daftar paket VIP.'
    }
  }

  function selectPackage(pkg: VipPackage) {
    selectedPackage.value = pkg
  }

  // Simpan draft pilihan paket sebelum menuju /subscribe/vip/payment
  function saveSubscribeDraft(pkg: VipPackage): SubscribeDraft {
    const draft: SubscribeDraft = {
      type: 'vip',
      packageName: `VIP ${pkg.days} Hari`,
      days: pkg.days,
      subtotalPrice: pkg.price,
      discount: Math.max(0, pkg.price - pkg.final_price),
      totalPrice: pkg.final_price,
      serviceFee: 0,
    }
    subscribeDraftState.value = draft
    if (import.meta.client) {
      try {
        sessionStorage.setItem(STORAGE_KEY_SUBSCRIBE_DRAFT, JSON.stringify(draft))
      } catch {
        // ignore storage error
      }
    }
    return draft
  }

  function loadSubscribeDraft(queryDays?: number): SubscribeDraft | null {
    if (subscribeDraftState.value) {
      if (!queryDays || subscribeDraftState.value.days === queryDays) {
        return subscribeDraftState.value
      }
    }
    if (import.meta.client) {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY_SUBSCRIBE_DRAFT)
        if (raw) {
          const parsed = JSON.parse(raw) as SubscribeDraft
          if (parsed && parsed.days && parsed.totalPrice) {
            subscribeDraftState.value = parsed
            return parsed
          }
        }
      } catch {
        // ignore
      }
    }
    return null
  }

  // ── Perhitungan Harga di /subscribe/vip/payment ─────────────────────────
  const packagePrice = computed(() => subscribeDraftState.value?.totalPrice || 0)

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
    if (!subscribeDraftState.value) return false
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

    // Sama dengan subscribe_payment_controller.dart baris 133:
    // Jika saldo menutupi seluruh harga paket, reset metode pembayaran & biaya transaksi
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
        useBalanceToggle.value = false
        lockBalance.value = myBalance.value <= 0 || !canUseBalance.value
      }
    } catch (e: unknown) {
      paymentError.value = e instanceof Error ? e.message : 'Gagal memuat info saldo'
    } finally {
      paymentLoading.value = false
    }
  }

  async function fetchPaymentMethods(chargeAmount: number): Promise<PaymentCategoryItem[]> {
    try {
      const res = await api.post<{ result?: PaymentCategoryItem[] }>(
        API_PAYMENT_CHOOSE,
        {
          platform: PAYMENT_PLATFORM_WEB,
          charge: chargeAmount,
          lang: 'id',
        },
        { usePaymentToken: true }
      )
      return res?.result || []
    } catch {
      return []
    }
  }

  function selectPaymentMethod(method: PaymentMethodItem) {
    selectedPayment.value = method
    const chargeNumber = Number(method.charge_number || 0)
    const chargePercent = Number(method.charge_percent || 0)
    paymentFee.value =
      chargeNumber + Math.round((chargePercent * packagePrice.value) / 100)

    if (method.with_input) {
      const rawPhone = String(
        (method as unknown as Record<string, unknown>).input ||
          authStore.user?.phone ||
          ''
      )
      paymentInput.value = formatPhoneSpacing(rawPhone, 4)
    } else {
      paymentInput.value = ''
    }
  }

  async function verifyWalletPassword(password: string): Promise<boolean> {
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

  async function submitSubscribeCheckout(
    password = ''
  ): Promise<{ success: boolean; result?: string; message?: string }> {
    const draft = subscribeDraftState.value
    if (!draft) {
      return { success: false, message: 'Data paket langganan tidak ditemukan.' }
    }

    const payload = {
      type: draft.type,
      days: draft.days,
      password,
      payment_method_id: isFullBalance.value ? '' : selectedPayment.value?.id || '',
      service_fee: draft.serviceFee || 0,
      payment_fee: effectivePaymentFee.value,
      balance_use: balanceDeduction.value,
      total_order_only: draft.totalPrice - (draft.serviceFee || 0) + (draft.discount || 0),
      discount: draft.discount || 0,
      total_order: draft.totalPrice,
      final_charge: finalCharge.value,
      orders: [],
      input: paymentInput.value.replace(/\s+/g, ''),
      lang: 'id',
    }

    try {
      const res = await api.post<{ message?: string; result?: string }>(
        API_SUBSCRIBE_CHECKOUT,
        payload,
        { usePaymentToken: true }
      )

      if (res?.result && res.result !== 'FAILED') {
        return { success: true, result: String(res.result) }
      }
      return {
        success: false,
        message: res?.message || 'Checkout langganan VIP gagal.',
      }
    } catch (e: unknown) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Terjadi kesalahan sistem.',
      }
    }
  }

  return {
    // Choose package state
    loading,
    error,
    packages,
    selectedPackage,
    mySubscribedDays,
    myTypeSubscribed,
    isVipActive,
    activeDisplayName,
    subscribeDraft: subscribeDraftState,
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
    // Actions
    fetchInitialSubscribeData,
    fetchDashboardInfo,
    fetchSubscribePackages,
    selectPackage,
    saveSubscribeDraft,
    loadSubscribeDraft,
    toggleUseBalance,
    updatePaymentInput,
    fetchPaymentInit,
    fetchPaymentMethods,
    selectPaymentMethod,
    verifyWalletPassword,
    submitSubscribeCheckout,
  }
}

