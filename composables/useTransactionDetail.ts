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

  const statusCode = computed(() => {
    const s = detail.value?.status
    return (typeof s === 'object' && s !== null ? s.code : '') || ''
  })

  // Action capabilities based on status & role (matching mobile transaction_detail_controller.dart / transaction_detail_view.dart)
  const canConfirm = computed(() => {
    return isSeller.value && (statusCode.value === 'confirm' || detail.value?.step === 1)
  })

  const canCancel = computed(() => {
    if (!detail.value) return false
    const code = statusCode.value
    if (code) {
      if (isBuyer.value) return code === 'confirm' || code === 'payment'
      return code === 'confirm'
    }
    return detail.value.step === 1
  })

  const canRequestPickup = computed(() => {
    return isSeller.value && detail.value?.step === 2 && !isMeet.value
  })

  const canRequestDropoff = computed(() => {
    return isSeller.value && detail.value?.step === 2 && !isMeet.value
  })

  const canPrintLabel = computed(() => {
    return isSeller.value && (detail.value?.step === 2 || (detail.value?.step === 3 && statusCode.value !== 'arrived')) && !isMeet.value
  })

  const canFinish = computed(() => {
    return isBuyer.value && statusCode.value === 'arrived'
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
        detail.value = {
          ...res.result,
          transaction_id: res.result.transaction_id || res.result._id || res.result.id || id.value,
        }
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

