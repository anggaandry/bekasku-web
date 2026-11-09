import type { TransactionDetail } from '~/types/transaction'
import {
  API_TRANSACTION_DETAIL,
  API_TRANSACTION_CANCEL,
  API_TRANSACTION_CONFIRM,
  API_TRANSACTION_FINISH,
  API_TRANSACTION_LABEL,
  API_REQUEST_PICKUP,
  API_REQUEST_PICKUP_RESCHEDULE,
  API_REQUEST_DROPOFF,
} from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'

export function useTransactionDetail(transactionId: MaybeRefOrGetter<string>) {
  const api = useApi()
  const authStore = useAuthStore()

  const detail = ref<TransactionDetail | null>(null)
  const isLoading = ref<boolean>(false)
  const isActionLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const labelUrl = ref<string>('')

  const id = computed(() => toValue(transactionId))

  const isSeller = computed(() => {
    if (!detail.value) return false
    if (detail.value.seller === true) return true
    if (authStore.user?._id && detail.value.seller_id) {
      return String(authStore.user._id) === String(detail.value.seller_id)
    }
    return false
  })

  const isBuyer = computed(() => !isSeller.value)

  const isMeet = computed(() => {
    if (!detail.value) return false
    if (detail.value.meet === true) return true
    const shippingName = detail.value.order?.shipping?.name?.trim() || ''
    const shippingPrice = detail.value.shipping_price || 0
    return !shippingName && shippingPrice === 0
  })

  // Action capabilities based on step & role (matching mobile transaction_detail_controller.dart)
  const canConfirm = computed(() => {
    return isSeller.value && detail.value?.step === 1
  })

  const canCancel = computed(() => {
    if (!detail.value) return false
    const s = detail.value.step
    if (isBuyer.value) {
      // Buyer can cancel at step 1 (before packing starts)
      return s === 1
    } else {
      // Seller can cancel at step 1 or 2 (before shipped)
      return s === 1 || s === 2
    }
  })

  const canRequestPickup = computed(() => {
    return isSeller.value && detail.value?.step === 2 && !isMeet.value
  })

  const canRequestDropoff = computed(() => {
    return isSeller.value && detail.value?.step === 2 && !isMeet.value
  })

  const canPrintLabel = computed(() => {
    return isSeller.value && (detail.value?.step === 2 || detail.value?.step === 3) && !isMeet.value
  })

  const canFinish = computed(() => {
    return isBuyer.value && (detail.value?.step === 3 || detail.value?.step === 4)
  })

  const canTrack = computed(() => {
    if (!detail.value) return false
    return detail.value.step >= 2 && !isMeet.value
  })

  async function fetchDetail(silent = false) {
    if (!id.value) return
    if (!silent) isLoading.value = true
    errorMessage.value = ''

    try {
      const res = await api.post<{
        message?: string
        result?: TransactionDetail
      }>(
        API_TRANSACTION_DETAIL,
        {
          transaction_id: id.value,
          lang: 'id',
        }
      )

      if (res?.result) {
        detail.value = res.result
      } else {
        errorMessage.value = res?.message || 'Transaksi tidak ditemukan'
      }
    } catch (err: any) {
      errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat transaksi'
    } finally {
      isLoading.value = false
    }
  }

  async function cancelTransaction(reason = 'Dibatalkan oleh pembeli'): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_CANCEL, {
        transaction_id: id.value,
        cancel_reason: reason,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal membatalkan transaksi')
    } finally {
      isActionLoading.value = false
    }
  }

  async function confirmTransaction(): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      await api.post<{ message?: string }>(API_TRANSACTION_CONFIRM, {
        transaction_id: id.value,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal mengkonfirmasi pesanan')
    } finally {
      isActionLoading.value = false
    }
  }

  async function requestPickup(): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      await api.post<{ message?: string }>(API_REQUEST_PICKUP, {
        transaction_id: id.value,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal meminta pickup')
    } finally {
      isActionLoading.value = false
    }
  }

  async function reschedulePickup(): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      await api.post<{ message?: string }>(API_REQUEST_PICKUP_RESCHEDULE, {
        transaction_id: id.value,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal mengatur ulang pickup')
    } finally {
      isActionLoading.value = false
    }
  }

  async function requestDropoff(): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      await api.post<{ message?: string }>(API_REQUEST_DROPOFF, {
        transaction_id: id.value,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal mengajukan dropoff')
    } finally {
      isActionLoading.value = false
    }
  }

  async function finishTransaction(): Promise<boolean> {
    if (!id.value) return false
    isActionLoading.value = true
    try {
      await api.post<{ message?: string }>(API_TRANSACTION_FINISH, {
        transaction_id: id.value,
        lang: 'id',
      })
      await fetchDetail(true)
      return true
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal menyelesaikan pesanan')
    } finally {
      isActionLoading.value = false
    }
  }

  async function fetchShippingLabel(): Promise<string> {
    if (!id.value) return ''
    isActionLoading.value = true
    try {
      const res = await api.post<{ message?: string; result?: string }>(
        API_TRANSACTION_LABEL,
        {
          transaction_id: id.value,
          lang: 'id',
        }
      )
      const url = String(res?.result || '')
      labelUrl.value = url
      return url
    } catch (err: any) {
      throw new Error(err?.data?.message || err?.message || 'Gagal mengambil label pengiriman')
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    detail,
    isLoading,
    isActionLoading,
    errorMessage,
    labelUrl,
    isSeller,
    isBuyer,
    isMeet,
    canConfirm,
    canCancel,
    canRequestPickup,
    canRequestDropoff,
    canPrintLabel,
    canFinish,
    canTrack,
    fetchDetail,
    cancelTransaction,
    confirmTransaction,
    requestPickup,
    reschedulePickup,
    requestDropoff,
    finishTransaction,
    fetchShippingLabel,
  }
}

