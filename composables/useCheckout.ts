import {
  API_CART_ORDER_INIT,
  API_CART_PAYMENT_INIT,
  API_COURRIER_LIST,
  API_SHIPPING_ONE,
  API_PAYMENT_CHOOSE,
  API_PASSWORD_MATCH,
  API_PAYMENT_CHECKOUT,
  TRANSACTION_METHOD_COURRIER,
  TRANSACTION_METHOD_MEET,
  PAYMENT_PLATFORM_WEB,
} from '~/utils/constants'
import type {
  CheckoutAddress,
  CheckoutDraft,
  CheckoutDraftSeller,
  ShippingServiceItem,
  CourierRateGroup,
  PaymentCategoryItem,
  PaymentMethodItem,
} from '~/types/checkout'
import type { CartSeller, CartProduct } from '~/types/cart'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

export function useCheckout() {
  const api = useApi()
  const authStore = useAuthStore()
  const cartStore = useCartStore()

  // Draft checkout state
  const draft = useState<CheckoutDraft | null>('checkout-draft', () => null)

  // Orders per seller
  const sellers = ref<CheckoutDraftSeller[]>([])
  const address = ref<CheckoutAddress | null>(null)
  const serviceFee = ref<number>(1000)
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  // Balance & Payment State
  const myBalance = ref<number>(0)
  const balanceLimit = ref<number>(200000)
  const canUseBalance = ref<boolean>(false)
  const useBalance = ref<boolean>(false)
  const selectedPayment = ref<PaymentMethodItem | null>(null)
  const paymentPhone = ref<string>('')
  const paymentFee = ref<number>(0)

  // Inisialisasi Sellers dari Draft
  function initFromDraft() {
    if (!draft.value || !draft.value.items || draft.value.items.length === 0) {
      // Fallback: jika draft kosong tapi cartStore punya checked products
      if (cartStore.checkedProducts.length > 0) {
        draft.value = {
          items: cartStore.checkedProducts,
          totalPrice: cartStore.totalPrice,
          transactionMethod: cartStore.transactionMethod,
        }
      } else {
        return false
      }
    }

    // Kelompokkan item per seller
    const sellerMap = new Map<string, CheckoutDraftSeller>()
    for (const item of draft.value.items) {
      const sId = item.seller.seller_id
      if (!sellerMap.has(sId)) {
        sellerMap.set(sId, {
          ...item.seller,
          products: [],
          shipping: null,
          use_insurance: false,
          insurance_price: 0,
          discount_shipping: 0,
        })
      }
      const existing = sellerMap.get(sId)!
      existing.products.push(item.product)
    }

    sellers.value = Array.from(sellerMap.values())
    return true
  }

  // Ambil data inisialisasi order (Service Fee & Alamat Default)
  async function fetchOrderInit() {
    loading.value = true
    error.value = ''
    try {
      // 1. Service fee
      const feeRes = await api.post<{ result?: { service_fee?: number } }>(API_CART_ORDER_INIT, {})
      if (feeRes?.result?.service_fee !== undefined) {
        serviceFee.value = Number(feeRes.result.service_fee) || 1000
      }

      // 2. Default address jika ada di cartStore / user
      if (cartStore.buyerAddress) {
        address.value = cartStore.buyerAddress as CheckoutAddress
      } else {
        // Ambil alamat default dari user profile
        const myAddr = authStore.user?.address_default as CheckoutAddress | undefined
        if (myAddr) {
          address.value = myAddr
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat data pesanan'
    } finally {
      loading.value = false
    }
  }

  // Hitung total harga barang
  const totalProductPrice = computed(() => {
    let sum = 0
    for (const s of sellers.value) {
      for (const p of s.products) {
        sum += p.total_price || (p.product_price * (p.total_product || 1))
      }
    }
    return sum
  })

  // Hitung total ongkir riil
  const totalShippingFee = computed(() => {
    if (draft.value?.transactionMethod === TRANSACTION_METHOD_MEET) return 0
    let sum = 0
    for (const s of sellers.value) {
      sum += Number(s.shipping?.price || 0)
    }
    return sum
  })

  // Hitung total diskon ongkir (Gratis Ongkir)
  const totalShippingDiscount = computed(() => {
    if (draft.value?.transactionMethod === TRANSACTION_METHOD_MEET) return 0
    let sum = 0
    for (const s of sellers.value) {
      const shipPrice = Number(s.shipping?.price || 0)
      if (shipPrice > 0) {
        let fd = Number(s.free_delivery || 0)
        if (s.free_delivery === true || fd === 1) fd = 20000
        if (fd > 0) {
          sum += Math.min(fd, shipPrice)
        }
      }
    }
    return sum
  })

  // Hitung total asuransi
  const totalInsuranceFee = computed(() => {
    if (draft.value?.transactionMethod === TRANSACTION_METHOD_MEET) return 0
    let sum = 0
    for (const s of sellers.value) {
      if (s.use_insurance) {
        sum += Number(s.insurance_price || 0)
      }
    }
    return sum
  })

  // Total order kotor (Barang + Ongkir + Asuransi)
  const totalOrderAmount = computed(() => {
    return totalProductPrice.value + totalShippingFee.value + totalInsuranceFee.value
  })

  // Total tagihan pesanan (termasuk biaya layanan & diskon ongkir)
  const totalCheckoutAmount = computed(() => {
    return totalOrderAmount.value + serviceFee.value - totalShippingDiscount.value
  })

  // Jumlah potongan saldo wallet
  const balanceDeduction = computed(() => {
    if (!useBalance.value || !canUseBalance.value || myBalance.value <= 0) return 0
    const maxUse = balanceLimit.value > 0 ? Math.min(myBalance.value, balanceLimit.value) : myBalance.value
    return Math.min(maxUse, totalCheckoutAmount.value + paymentFee.value)
  })

  // Total tagihan bersih akhir yang harus dibayar melalui gateway
  const finalPaymentAmount = computed(() => {
    const raw = totalCheckoutAmount.value + paymentFee.value - balanceDeduction.value
    return Math.max(0, raw)
  })

  // Validasi apakah siap lanjut ke pembayaran
  const isOrderReady = computed(() => {
    if (sellers.value.length === 0) return false
    if (draft.value?.transactionMethod === TRANSACTION_METHOD_MEET) return true

    // Mode kurir wajib punya alamat dan setiap seller sudah memilih kurir
    if (!address.value || !address.value.address) return false
    return sellers.value.every((s) => s.shipping && s.shipping.shipping_code)
  })

  // Pilih kurir untuk seller tertentu
  function setSellerShipping(sellerId: string, shipping: ShippingServiceItem) {
    const seller = sellers.value.find((s) => s.seller_id === sellerId)
    if (!seller) return
    seller.shipping = shipping

    // Hitung premi asuransi persis logika Flutter V3:
    // int calculated = ((percent / 100) * value).round();
    // if (calculated < min) return min;
    // return calculated + number;
    let sellerProdTotal = 0
    for (const p of seller.products) {
      sellerProdTotal += p.total_price || (p.product_price * (p.total_product || 1))
    }

    const min = Number(shipping.insurance_min || 0)
    const number = Number(shipping.insurance_number || 0)
    const percent = Number(shipping.insurance_percent || 0.5)
    const max = Number(shipping.insurance_max || 500000)

    let calculated = Math.round((percent / 100) * sellerProdTotal)
    if (calculated < min) {
      calculated = min
    }
    const finalInsurancePrice = calculated + number

    seller.insurance_price = finalInsurancePrice

    // Lock insurance jika harga barang > insurance_max
    if (max > 0 && sellerProdTotal > max) {
      seller.lock_insurance = true
      seller.use_insurance = true
    } else {
      seller.lock_insurance = false
      // Default unchecked jika tidak terkunci
      if (seller.use_insurance === undefined) {
        seller.use_insurance = false
      }
    }
  }

  // Ambil daftar kurir dan tarif layanan per kurir secara streaming
  async function fetchCourierRatesStreaming(
    seller: CheckoutDraftSeller,
    addr: CheckoutAddress,
    onGroupAdded: (groups: CourierRateGroup[]) => void
  ): Promise<{ groups: CourierRateGroup[]; errorMessage: string }> {
    const items = seller.products.map((p) => ({
      name: p.product_title,
      description: p.product_title,
      value: p.product_price,
      quantity: p.total_product || 1,
      weight: Number(p.total_weight || 500),
    }))

    const totalWeight = items.reduce((acc, curr) => acc + curr.weight * curr.quantity, 0)
    let totalPrice = 0
    for (const p of seller.products) totalPrice += p.total_price || p.product_price * (p.total_product || 1)

    const params: Record<string, unknown> = {
      lang: 'id',
      seller_id: seller.seller_id,
      dest_lat: addr.lat,
      dest_lon: addr.lon,
      dest_subdistrict_id: addr.subdistrict_id,
      dest_address: addr.address,
      dest_postal: addr.postal,
      items,
      weight: totalWeight,
      price: totalPrice,
      free_delivery: seller.free_delivery || 0,
    }

    const res = await api.post<{ result?: Record<string, unknown>[] }>(API_COURRIER_LIST, params)
    const courriers = res?.result || []

    if (courriers.length === 0) {
      return { groups: [], errorMessage: 'Tidak ada kurir yang tersedia untuk rute pengiriman ini.' }
    }

    // Prioritaskan Grab di urutan pertama seperti mobile V3
    courriers.sort((a, b) => {
      const isGrabA = String(a.code || a.name || '').toLowerCase().includes('grab')
      const isGrabB = String(b.code || b.name || '').toLowerCase().includes('grab')
      if (isGrabA && !isGrabB) return -1
      if (!isGrabA && isGrabB) return 1
      return 0
    })

    let accumulated: CourierRateGroup[] = []

    for (const c of courriers) {
      try {
        const body = { ...params, ...c }
        const rateRes = await api.post<{ result?: { shipping?: { data?: Record<string, unknown>[] } } }>(API_SHIPPING_ONE, body)
        const rateList = rateRes?.result?.shipping?.data || []

        if (rateList.length > 0) {
          const cCode = String(c.code || c.code_biteship || '')
          const cName = String(c.name || '')
          const cLogo = String(c.image || c.logo || '')

          const services: ShippingServiceItem[] = rateList.map((item) => {
            const serviceName = String(item.description || item.service_name || item.name || item.shipping_code || 'Layanan reguler')
            return {
              name: cName,
              logo: cLogo,
              courier_code: cCode,
              shipping_code: String(item.shipping_code || item.service_type || `${cCode}_${item.service_name}`),
              service_name: serviceName,
              description: String(item.description || serviceName),
              price: Number(item.price || 0),
              pickup: item.pickup !== false,
              partner: String(item.partner || 'biteship'),
              est: String(item.est || item.duration || item.etd || '2 - 3 hari'),
              insurance_min: Number(item.insurance_min || 0),
              insurance_max: Number(item.insurance_max || 500000),
              insurance_number: Number(item.insurance_number || 0),
              insurance_percent: Number(item.insurance_percent || 0.5),
            }
          })

          services.sort((a, b) => (a.price || 0) - (b.price || 0))
          const lowestPrice = services[0]?.price || 0

          const newGroup: CourierRateGroup = {
            courier_code: cCode,
            name: cName,
            logo: cLogo,
            lowest_price: lowestPrice,
            services,
          }

          accumulated = [...accumulated, newGroup].sort((a, b) => {
            const isGrabA = a.courier_code.toLowerCase().includes('grab') || a.name.toLowerCase().includes('grab')
            const isGrabB = b.courier_code.toLowerCase().includes('grab') || b.name.toLowerCase().includes('grab')
            if (isGrabA && !isGrabB) return -1
            if (!isGrabA && isGrabB) return 1
            return a.lowest_price - b.lowest_price
          })

          onGroupAdded(accumulated)
        }
      } catch {
        // Lewati kurir yang gagal menghitung rate
      }
    }

    if (accumulated.length === 0) {
      return { groups: [], errorMessage: 'Gagal menghitung tarif layanan pengiriman. Silakan coba kurir lain.' }
    }

    return { groups: accumulated, errorMessage: '' }
  }

  // Toggle asuransi pengiriman
  function toggleInsurance(sellerId: string) {
    const seller = sellers.value.find((s) => s.seller_id === sellerId)
    if (!seller || seller.lock_insurance) return
    seller.use_insurance = !seller.use_insurance
  }

  // Fetch Payment Init (Saldo Wallet)
  async function fetchPaymentInit() {
    loading.value = true
    error.value = ''
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
        balanceLimit.value = Number(res.result.balance_limit_v3 ?? res.result.balance_limit ?? 200000)
        const allow = String(res.result.allow || '').toLowerCase()
        canUseBalance.value = allow !== 'no' && balanceLimit.value > 0 && myBalance.value > 0
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat info saldo'
    } finally {
      loading.value = false
    }
  }

  // Fetch Payment Methods
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

  // Pilih Metode Pembayaran
  function selectPaymentMethod(method: PaymentMethodItem) {
    selectedPayment.value = method
    // Hitung biaya payment admin
    let fee = 0
    if (method.charge_number > 0) {
      fee += method.charge_number
    }
    if (method.charge_percent > 0) {
      fee += Math.round((totalCheckoutAmount.value * method.charge_percent) / 100)
    }
    paymentFee.value = fee
  }

  // Verifikasi Password Wallet
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

  // Submit Final Checkout
  async function submitCheckout(password?: string): Promise<{ success: boolean; result?: string; message?: string }> {
    const isMeet = draft.value?.transactionMethod === TRANSACTION_METHOD_MEET

    // Susun array orders
    const ordersPayload = sellers.value.map((s) => {
      const base: Record<string, unknown> = {
        seller_id: s.seller_id,
        seller_name: s.seller_name,
        seller_city: s.seller_city,
        meet: isMeet,
        free_delivery: s.free_delivery,
        use_insurance: s.use_insurance || false,
        insurance_price: s.use_insurance ? (s.insurance_price || 0) : 0,
        products: s.products.map((p) => ({
          id: p.product_id, // WAJIB untuk Zod validator backend: checkoutProductSchema id
          product_id: p.product_id,
          product_title: p.product_title,
          product_image: p.product_image,
          product_price: p.product_price,
          total_product: p.total_product || 1,
          total: p.total_product || 1,
          total_price: p.total_price || (p.product_price * (p.total_product || 1)),
        })),
      }

      if (!isMeet && s.shipping) {
        base.shipping = {
          name: s.shipping.name,
          logo: s.shipping.logo,
          code: s.shipping.courier_code || s.shipping.code,
          shipping_code: s.shipping.shipping_code,
          service_name: s.shipping.service_name || s.shipping.name,
          price: s.shipping.price || 0,
          est: s.shipping.est || s.shipping.duration,
        }
      }

      return base
    })

    const payload: Record<string, unknown> = {
      meet: isMeet,
      transaction_method: isMeet ? TRANSACTION_METHOD_MEET : TRANSACTION_METHOD_COURRIER,
      service_fee: serviceFee.value,
      payment_fee: paymentFee.value,
      balance_use: balanceDeduction.value,
      total_order_only: totalProductPrice.value,
      total_shipping: totalShippingFee.value,
      total_insurance: totalInsuranceFee.value,
      discount: totalShippingDiscount.value,
      total_order: totalOrderAmount.value,
      final_charge: finalPaymentAmount.value,
      orders: ordersPayload,
      input: paymentPhone.value,
      payment_method_id: selectedPayment.value?.id || '',
    }

    if (password) {
      payload.password = password
    }

    if (!isMeet && address.value) {
      payload.address = address.value
    }

    try {
      const res = await api.post<{ result?: string; status?: boolean; message?: string }>(
        API_PAYMENT_CHECKOUT,
        payload,
        { usePaymentToken: true }
      )

      if (res?.result) {
        return { success: true, result: res.result }
      }
      return { success: false, message: res?.message || 'Gagal memproses pesanan' }
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Terjadi kesalahan sistem' }
    }
  }

  return {
    draft,
    sellers,
    address,
    serviceFee,
    loading,
    error,
    myBalance,
    balanceLimit,
    canUseBalance,
    useBalance,
    selectedPayment,
    paymentPhone,
    paymentFee,
    totalProductPrice,
    totalShippingFee,
    totalShippingDiscount,
    totalInsuranceFee,
    totalOrderAmount,
    totalCheckoutAmount,
    balanceDeduction,
    finalPaymentAmount,
    isOrderReady,
    initFromDraft,
    fetchOrderInit,
    setSellerShipping,
    fetchCourierRatesStreaming,
    toggleInsurance,
    fetchPaymentInit,
    fetchPaymentMethods,
    selectPaymentMethod,
    verifyWalletPassword,
    submitCheckout,
  }
}

