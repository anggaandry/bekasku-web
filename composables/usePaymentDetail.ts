import { ref, computed, toValue, type MaybeRefOrGetter, onMounted, onBeforeUnmount } from 'vue'
import {
  API_MYPAYMENT_DETAIL,
  API_MYPAYMENT_STATUS,
  API_MYPAYMENT_CANCEL,
} from '~/utils/constants'
import type { PaymentDetailData, PaymentStatusResult } from '~/types/payment'
import { useNotification } from '~/composables/useNotification'

export interface PaymentDetailOptions {
  onPaid?: () => void
  onCancelled?: () => void
}

export function usePaymentDetail(
  paymentIdSource: MaybeRefOrGetter<string>,
  options?: PaymentDetailOptions
) {
  const api = useApi()
  const { showNotification } = useNotification()

  const loading = ref(true)
  const checkingStatus = ref(false)
  const error = ref<string | null>(null)
  const data = ref<PaymentDetailData | null>(null)
  const isActionLoading = ref(false)

  let pollingInterval: any = null
  let isNavigating = false

  const isPaid = computed(() => {
    if (!data.value) return false
    const name = (data.value.status?.name || '').toLowerCase()
    return (
      name.includes('lunas') ||
      name.includes('sudah dibayar') ||
      name.includes('paid') ||
      name.includes('success')
    )
  })

  const isUnpaid = computed(() => {
    if (!data.value) return false
    if (isPaid.value) return false
    const name = (data.value.status?.name || '').toLowerCase()
    return (
      name.includes('menunggu') ||
      name.includes('unpaid') ||
      name.includes('pending')
    )
  })

  const isDigitalOrder = computed(() => {
    if (!data.value) return false
    return (
      Boolean(data.value.is_promotion) ||
      Boolean(data.value.type_subscribe) ||
      !data.value.orders ||
      data.value.orders.length === 0
    )
  })

  function startPolling() {
    stopPolling()
    pollingInterval = setInterval(() => {
      checkStatus(false)
    }, 5000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  async function fetchDetail(): Promise<boolean> {
    const id = toValue(paymentIdSource)
    if (!id) {
      error.value = 'ID Pembayaran tidak valid.'
      loading.value = false
      return false
    }

    loading.value = true
    error.value = null

    try {
      const res = await api.post<{
        message?: string
        result?: PaymentDetailData
      }>(
        API_MYPAYMENT_DETAIL,
        {
          payment_id: id,
          lang: 'id',
        },
        { usePaymentToken: true }
      )

      if (res && res.result) {
        data.value = res.result
        if (isUnpaid.value) {
          startPolling()
        }
        return true
      }

      error.value = res?.message || 'Gagal memuat detail tagihan.'
      return false
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Terjadi kesalahan saat memuat pesanan.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkStatus(manual = false): Promise<void> {
    const id = toValue(paymentIdSource)
    if (!id || isPaid.value || isNavigating) {
      stopPolling()
      return
    }

    if (manual) checkingStatus.value = true

    try {
      const res = await api.post<{
        message?: string
        result?: PaymentStatusResult
      }>(
        API_MYPAYMENT_STATUS,
        { payment_id: id },
        { usePaymentToken: true }
      )

      if (res && res.result) {
        if (res.result.paid === true) {
          stopPolling()
          if (data.value) {
            data.value.status = {
              name: 'Sudah dibayar',
              text_color: '#16A34A',
              back_color: '#DCFCE7',
            }
          }
          showNotification({
            type: 'success',
            message: 'Pembayaran sukses diterima',
          })
          options?.onPaid?.()
          await fetchDetail()
        } else if (res.result.expired === true) {
          stopPolling()
          if (data.value) {
            data.value.status = {
              name: 'Kadaluarsa',
              text_color: '#EA580C',
              back_color: '#FFEDD5',
            }
          }
          if (manual) {
            showNotification({
              type: 'error',
              message: 'Pembayaran telah kadaluarsa.',
            })
          }
        } else if (manual) {
          showNotification({
            type: 'info',
            message: 'Pembayaran belum terkonfirmasi. Silakan selesaikan pembayaran terlebih dahulu.',
          })
        }
      }
    } catch (err: any) {
      if (manual) {
        showNotification({
          type: 'error',
          message: err?.message || 'Gagal memeriksa status pembayaran.',
        })
      }
    } finally {
      if (manual) checkingStatus.value = false
    }
  }

  async function cancelPayment(reason: string): Promise<boolean> {
    const id = toValue(paymentIdSource)
    if (!id || isActionLoading.value) return false
    isActionLoading.value = true

    try {
      const res = await api.post<{ message?: string }>(
        API_MYPAYMENT_CANCEL,
        {
          payment_id: id,
          cancel_reason: reason,
        },
        { usePaymentToken: true }
      )

      const isSuccess =
        res?.message?.toString().toLowerCase() === 'success' || !res?.message

      if (isSuccess) {
        showNotification({
          type: 'success',
          message: 'Pembayaran berhasil dibatalkan.',
        })
        options?.onCancelled?.()
        await fetchDetail()
        return true
      }

      showNotification({
        type: 'error',
        message: res?.message || 'Gagal membatalkan pembayaran.',
      })
      return false
    } catch (err: any) {
      showNotification({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat membatalkan.',
      })
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  onMounted(() => {
    fetchDetail()
  })

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    loading,
    checkingStatus,
    error,
    data,
    isPaid,
    isUnpaid,
    isDigitalOrder,
    isActionLoading,
    fetchDetail,
    checkStatus,
    cancelPayment,
    stopPolling,
  }
}
