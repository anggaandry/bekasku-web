import type { TransactionListItem, TransactionTabCount } from '~/types/transaction'
import type { Product } from '~/types/product'
import {
  API_TRANSACTION_LIST,
  API_TRANSACTION_COUNT,
  API_MYPAYMENT_LIST,
  API_DASHBOARD_NEWEST,
  TRANSACTION_TAB_ALL,
  TRANSACTION_TAB_UNPAID,
  TRANSACTION_TAB_PACKING,
  TRANSACTION_TAB_SHIPPED,
  TRANSACTION_TAB_DONE,
  TRANSACTION_TAB_RETURN,
  TRANSACTION_TAB_CANCELED,
  TRANSACTION_TAB_PAID,
} from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'
import { useTransactionStore } from '~/stores/transaction'

export interface TransactionStepItem {
  value: number
  label: string
}

export const TRANSACTION_STEPS: TransactionStepItem[] = [
  { value: TRANSACTION_TAB_ALL, label: 'Semua' },
  { value: TRANSACTION_TAB_UNPAID, label: 'Belum Bayar' },
  { value: TRANSACTION_TAB_PACKING, label: 'Dikemas' },
  { value: TRANSACTION_TAB_SHIPPED, label: 'Dikirim' },
  { value: TRANSACTION_TAB_DONE, label: 'Selesai' },
  { value: TRANSACTION_TAB_RETURN, label: 'Pengembalian' },
  { value: TRANSACTION_TAB_CANCELED, label: 'Dibatalkan' },
  { value: TRANSACTION_TAB_PAID, label: 'Sudah Bayar' },
]

export function useTransactionList() {
  const api = useApi()
  const authStore = useAuthStore()
  const transStore = useTransactionStore()

  const selectedStep = ref<number>(transStore.activeStep || 0)
  const transactions = ref<TransactionListItem[]>([])
  const isLoading = ref<boolean>(false)
  const isRefreshing = ref<boolean>(false)
  const isLoadingMore = ref<boolean>(false)
  const hasMore = ref<boolean>(true)
  const page = ref<number>(1)
  const totalDocs = ref<number>(0)

  // Recommendations ("Sesuai kesukaan kamu" - 15 item per reload)
  const recommendations = ref<Product[]>([])
  const recomLoading = ref<boolean>(false)
  const recomPage = ref<number>(1)
  const recomHasMore = ref<boolean>(true)

  let _requestId = 0

  function normalizeTransaction(doc: any): TransactionListItem {
    let statusLabel = ''
    let textColor = ''
    let backgroundColor = ''

    if (doc.status && typeof doc.status === 'object') {
      statusLabel = doc.status.name || ''
      textColor = doc.status.text_color || ''
      backgroundColor = doc.status.back_color || ''
    } else if (typeof doc.status === 'string') {
      statusLabel = doc.status
    }

    // Default fallback color logic if missing
    if (!textColor || !backgroundColor) {
      const s = (statusLabel || '').toLowerCase()
      if (s.includes('selesai') || s.includes('sampai')) {
        textColor = '#16A34A'
        backgroundColor = '#DCFCE7'
      } else if (s.includes('kirim')) {
        textColor = '#2563EB'
        backgroundColor = '#DBEAFE'
      } else if (s.includes('batal')) {
        textColor = '#DC2626'
        backgroundColor = '#FEE2E2'
      } else {
        textColor = '#EA580C'
        backgroundColor = '#FFEDD5'
      }
    }

    return {
      id: String(doc._id || doc.id || ''),
      title: String(doc.title || ''),
      shopName: String(doc.seller_name || doc.shop_name || doc.username || 'Penjual BekasKu'),
      image: String(doc.image || ''),
      price: Number(doc.price) || 0,
      originalPrice: doc.original_price ? Number(doc.original_price) : undefined,
      totalAmount: Number(doc.total_amount ?? doc.price) || 0,
      status: doc.status || statusLabel,
      statusLabel,
      textColor,
      backgroundColor,
      time: doc.time ? String(doc.time) : undefined,
      isPayment: false,
      otherCount: Number(doc.other) || 0,
      canPay: false,
    }
  }

  function normalizePayment(doc: any): TransactionListItem {
    const statusMap = (doc.status && typeof doc.status === 'object') ? doc.status : {}
    const statusLabel = statusMap.name || (typeof doc.status === 'string' ? doc.status : 'Menunggu')
    const textColor = statusMap.text_color || '#EA580C'
    const backgroundColor = statusMap.back_color || '#FFEDD5'

    return {
      id: String(doc._id || doc.id || ''),
      title: String(doc.title || 'Tagihan Pembayaran'),
      shopName: String(doc.shop_name || doc.seller_name || doc.username || 'BekasKu Official'),
      image: String(doc.image || ''),
      price: Number(doc.price) || 0,
      originalPrice: doc.original_price ? Number(doc.original_price) : undefined,
      totalAmount: Number(doc.total_amount ?? doc.price) || 0,
      status: doc.status || statusLabel,
      statusLabel,
      textColor,
      backgroundColor,
      time: doc.time ? String(doc.time) : undefined,
      isPayment: true,
      paymentType: doc.payment_type
        ? String(doc.payment_type)
        : doc.is_promotion
          ? 'promotion'
          : doc.type_subscribe
            ? 'subscription'
            : 'transaction',
      otherCount: Number(doc.other) || 0,
      canPay: doc.available === true,
    }
  }

  async function fetchTabCounts() {
    if (!authStore.isLoggedIn) return
    try {
      const res = await api.post<{ message?: string; result?: Partial<TransactionTabCount> }>(
        API_TRANSACTION_COUNT,
        { lang: 'id' }
      )
      if (res?.result) {
        transStore.setCounts(res.result)
      }
    } catch (err) {
      // ignore count fetch error
    }
  }

  async function fetchPayments(currentRequestId: number, status: number, isLoadMore = false) {
    try {
      const res = await api.post<{
        message?: string
        result?: { docs?: any[]; totalDocs?: number; hasNextPage?: boolean } | any[]
      }>(
        API_MYPAYMENT_LIST,
        { page: page.value, status, lang: 'id' },
        { usePaymentToken: true }
      )

      if (currentRequestId !== _requestId) return

      let rawData: any[] = []
      if (Array.isArray(res?.result)) {
        rawData = res.result
        hasMore.value = rawData.length > 0
      } else if (res?.result && Array.isArray(res.result.docs)) {
        rawData = res.result.docs
        totalDocs.value = res.result.totalDocs || rawData.length
        hasMore.value = res.result.hasNextPage ?? rawData.length >= 10
      } else {
        hasMore.value = false
      }

      const items = rawData.map(normalizePayment)
      if (isLoadMore) {
        transactions.value.push(...items)
      } else {
        transactions.value = items
      }
    } catch (err) {
      if (currentRequestId === _requestId) {
        hasMore.value = false
      }
    }
  }

  async function fetchTransactions(currentRequestId: number, targetStep: number, isLoadMore = false) {
    const apiStep = targetStep - 1 // 2 -> 1 (Dikemas), 3 -> 2 (Dikirim), etc.
    try {
      const res = await api.post<{
        message?: string
        result?: { docs?: any[]; totalDocs?: number; hasNextPage?: boolean } | any[]
      }>(
        API_TRANSACTION_LIST,
        { page: page.value, type: 0, step: apiStep, lang: 'id' }
      )

      if (currentRequestId !== _requestId) return

      let rawData: any[] = []
      if (Array.isArray(res?.result)) {
        rawData = res.result
        hasMore.value = rawData.length >= 10
      } else if (res?.result && Array.isArray(res.result.docs)) {
        rawData = res.result.docs
        totalDocs.value = res.result.totalDocs || rawData.length
        hasMore.value = res.result.hasNextPage ?? rawData.length >= 10
      } else {
        hasMore.value = false
      }

      const items = rawData.map(normalizeTransaction)
      if (isLoadMore) {
        transactions.value.push(...items)
      } else {
        transactions.value = items
      }
    } catch (err) {
      if (currentRequestId === _requestId) {
        hasMore.value = false
      }
    }
  }

  async function fetchSemua(currentRequestId: number, isLoadMore = false) {
    let paymentItems: TransactionListItem[] = []

    if (!isLoadMore) {
      try {
        const resPay = await api.post<{
          message?: string
          result?: { docs?: any[] } | any[]
        }>(
          API_MYPAYMENT_LIST,
          { page: 1, lang: 'id' },
          { usePaymentToken: true }
        )
        if (currentRequestId !== _requestId) return

        let rawPay: any[] = []
        if (Array.isArray(resPay?.result)) {
          rawPay = resPay.result
        } else if (resPay?.result && Array.isArray(resPay.result.docs)) {
          rawPay = resPay.result.docs
        }
        paymentItems = rawPay.map(normalizePayment)
      } catch {
        // ignore payment fetch failure on all
      }
    }

    if (currentRequestId !== _requestId) return

    try {
      const resTrans = await api.post<{
        message?: string
        result?: { docs?: any[]; totalDocs?: number; hasNextPage?: boolean } | any[]
      }>(
        API_TRANSACTION_LIST,
        { page: page.value, type: 0, lang: 'id' }
      )

      if (currentRequestId !== _requestId) return

      let rawTrans: any[] = []
      if (Array.isArray(resTrans?.result)) {
        rawTrans = resTrans.result
        hasMore.value = rawTrans.length >= 10
      } else if (resTrans?.result && Array.isArray(resTrans.result.docs)) {
        rawTrans = resTrans.result.docs
        totalDocs.value = resTrans.result.totalDocs || rawTrans.length
        hasMore.value = resTrans.result.hasNextPage ?? rawTrans.length >= 10
      } else {
        hasMore.value = false
      }

      const transItems = rawTrans.map(normalizeTransaction)
      if (isLoadMore) {
        transactions.value.push(...transItems)
      } else {
        transactions.value = [...paymentItems, ...transItems]
      }
    } catch (err) {
      if (currentRequestId === _requestId) {
        hasMore.value = false
      }
    }
  }

  async function fetchData(options: { isLoadMore?: boolean; isRefresh?: boolean } = {}) {
    if (!authStore.isLoggedIn) {
      isLoading.value = false
      transactions.value = []
      return
    }

    const { isLoadMore = false, isRefresh = false } = options
    const currentRequestId = ++_requestId
    const currentStep = selectedStep.value

    if (!isLoadMore) {
      isLoading.value = !isRefresh
    } else {
      isLoadingMore.value = true
    }

    try {
      if (currentStep === TRANSACTION_TAB_ALL) {
        await fetchSemua(currentRequestId, isLoadMore)
      } else if (currentStep === TRANSACTION_TAB_UNPAID) {
        await fetchPayments(currentRequestId, 0, isLoadMore)
      } else if (currentStep === TRANSACTION_TAB_PAID) {
        await fetchPayments(currentRequestId, 1, isLoadMore)
      } else {
        await fetchTransactions(currentRequestId, currentStep, isLoadMore)
      }
    } finally {
      if (currentRequestId === _requestId) {
        isLoading.value = false
        isLoadingMore.value = false
        isRefreshing.value = false
      }
    }
  }

  function changeStep(step: number) {
    if (selectedStep.value === step && transactions.value.length > 0 && !isLoading.value) {
      return
    }
    selectedStep.value = step
    transStore.setActiveStep(step)
    page.value = 1
    hasMore.value = true
    transactions.value = []
    fetchData()
  }

  async function onRefresh() {
    isRefreshing.value = true
    page.value = 1
    hasMore.value = true
    recomPage.value = 1
    await Promise.all([
      fetchData({ isRefresh: true }),
      fetchTabCounts(),
      fetchRecommendations(),
    ])
    isRefreshing.value = false
  }

  async function onLoadMore() {
    if (hasMore.value && !isLoadingMore.value && !isLoading.value) {
      page.value++
      await fetchData({ isLoadMore: true })
    }
  }

  const { fetchRecommendations: fetchRecomApi } = useProducts()

  // 15 items per page for "Sesuai kesukaan kamu"
  async function fetchRecommendations(isLoadMore = false) {
    if (recomLoading.value) return
    recomLoading.value = true
    try {
      const res = await fetchRecomApi({
        page: recomPage.value,
        limit: 15,
      })
      const docs = res?.docs || []
      recomHasMore.value = res?.hasNextPage ?? docs.length >= 15

      if (isLoadMore) {
        recommendations.value.push(...docs)
      } else {
        recommendations.value = docs
      }
    } catch {
      // fallback silent
    } finally {
      recomLoading.value = false
    }
  }

  async function loadMoreRecommendations() {
    if (recomHasMore.value && !recomLoading.value) {
      recomPage.value++
      await fetchRecommendations(true)
    }
  }

  return {
    selectedStep,
    steps: TRANSACTION_STEPS,
    transactions,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    page,
    totalDocs,
    tabCounts: computed(() => transStore.counts),
    recommendations,
    recomLoading,
    recomHasMore,
    changeStep,
    fetchData,
    fetchTabCounts,
    onRefresh,
    onLoadMore,
    fetchRecommendations,
    loadMoreRecommendations,
  }
}

