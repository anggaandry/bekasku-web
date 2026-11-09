import { ref, computed, toValue, type MaybeRefOrGetter, onMounted, onBeforeUnmount } from 'vue'
import {
  API_PAYMENT_DASHBOARD,
  API_MYPAYMENT_STATUS,
  API_MYPAYMENT_MAKE,
  API_MYPAYMENT_CANCEL,
} from '~/utils/constants'
import type { PaymentDashboardData, PaymentStatusResult } from '~/types/payment'
import { useNotification } from '~/composables/useNotification'

export interface PaymentDashboardOptions {
  isModal?: boolean
  onSuccess?: (result: PaymentStatusResult) => void
  onCancel?: () => void
  onExpire?: () => void
}

export function usePaymentDashboard(
  paymentIdSource: MaybeRefOrGetter<string>,
  initialSource: MaybeRefOrGetter<string> = '',
  options?: PaymentDashboardOptions
) {
  const api = useApi()
  const { showNotification } = useNotification()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const data = ref<PaymentDashboardData | null>(null)

  const limitPayment = ref(0)
  const source = ref(toValue(initialSource))
  const checkingStatus = ref(false)
  const sendingMakePayment = ref(false)
  const isCanceling = ref(false)

  // QR Download States
  const showQrModal = ref(false)
  const qrCompleted = ref(false)
  const qrProgress = ref(0)
  const qrError = ref<string | null>(null)
  const qrBlobUrl = ref<string | null>(null)
  const qrFileName = ref('QRIS_Payment.png')

  let countdownInterval: any = null
  let pollingInterval: any = null
  let isNavigating = false

  const isNonTransaction = computed(() => {
    if (!data.value) return false
    const src = (source.value || '').toLowerCase()
    const pType = (data.value.payment_type || '').toLowerCase()
    const title = (data.value.payment_title || '').toLowerCase()
    return (
      src === 'subscription' ||
      src === 'promotion' ||
      src === 'sundul' ||
      src === 'spotlight' ||
      src === 'highlight' ||
      src === 'vip' ||
      pType === 'subscription' ||
      pType === 'promotion' ||
      Boolean(data.value.is_promotion) ||
      Boolean(data.value.type_subscribe) ||
      title.includes('subscription') ||
      title.includes('langganan') ||
      title.includes('promosi') ||
      title.includes('sundul') ||
      title.includes('spotlight') ||
      title.includes('highlight') ||
      title.includes('vip')
    )
  })

  const formattedDuration = computed(() => {
    const sec = limitPayment.value
    if (sec <= 0) return '00:00:00'
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  })

  function startCountdown() {
    stopCountdown()
    countdownInterval = setInterval(() => {
      if (limitPayment.value > 0) {
        limitPayment.value--
      } else {
        stopCountdown()
        stopPolling()
        showNotification({
          type: 'error',
          message: 'Waktu pembayaran sudah habis',
        })
        if (options?.isModal) {
          options.onExpire?.()
        } else {
          navigateTo('/transaction')
        }
      }
    }, 1000)
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  function startPolling() {
    stopPolling()
    pollingInterval = setInterval(() => {
      checkPaymentStatus(false)
    }, 5000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  async function fetchDashboard(): Promise<boolean> {
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
        result?: PaymentDashboardData
      }>(
        API_PAYMENT_DASHBOARD,
        {
          payment_id: id,
          lang: 'id',
        },
        { usePaymentToken: true }
      )

      if (res && res.result) {
        data.value = res.result
        limitPayment.value = Math.max(0, Number(res.result.limit_payment || 0))
        if (!source.value && res.result.payment_type) {
          source.value = res.result.payment_type
        }
        startCountdown()
        startPolling()
        return true
      }

      error.value = res?.message || 'Gagal memuat detail pembayaran.'
      return false
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Terjadi kesalahan saat memuat tagihan.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkPaymentStatus(manual = false): Promise<void> {
    const id = toValue(paymentIdSource)
    if (!id || isNavigating) return
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
        const result = res.result

        if (result.paid === true) {
          if (isNavigating) return
          isNavigating = true
          stopCountdown()
          stopPolling()

          if (options?.isModal) {
            showNotification({
              type: 'success',
              message: 'Pembayaran sukses diterima',
            })
            options.onSuccess?.(result)
          } else if (result.is_promotion || source.value === 'promotion') {
            showNotification({
              type: 'success',
              message: 'Pembayaran sukses diterima',
            })
            navigateTo('/catalog')
          } else if (
            result.type_subscribe ||
            source.value === 'subscription' ||
            data.value?.type_subscribe
          ) {
            showNotification({
              type: 'success',
              message: 'Pembayaran langganan sukses diterima',
            })
            navigateTo('/subscribe/vip')
          } else {
            showNotification({
              type: 'success',
              message: 'Pembayaran sukses diterima',
            })
            navigateTo('/transaction')
          }
        } else if (result.expired === true) {
          if (isNavigating) return
          isNavigating = true
          stopCountdown()
          stopPolling()
          showNotification({
            type: 'error',
            message: 'Pembayaran kadaluarsa',
          })
          if (options?.isModal) {
            options.onExpire?.()
          } else {
            navigateTo('/transaction')
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

  async function makePayment(): Promise<void> {
    const id = toValue(paymentIdSource)
    if (!data.value || !id) return

    // 1. Jika memiliki link redirect (ShopeePay, LinkAja, DANA, Akulaku, dsb)
    if (data.value.payment_link) {
      data.value.has_sent_payment = true
      if (import.meta.client) {
        window.open(data.value.payment_link, '_blank', 'noopener,noreferrer')
      }
      return
    }

    // 2. Jika metode OVO Direct (dengan input HP)
    if (data.value.with_input) {
      sendingMakePayment.value = true
      try {
        const res = await api.post<{ message?: string; status?: boolean }>(
          API_MYPAYMENT_MAKE,
          { payment_id: id },
          { usePaymentToken: true }
        )

        const isSuccess =
          res?.message?.toString().toLowerCase() === 'success' ||
          res?.status === true

        if (isSuccess) {
          if (data.value) data.value.has_sent_payment = true
          showNotification({
            type: 'success',
            message: 'Permintaan pembayaran dikirim ke aplikasi OVO.',
          })
          await fetchDashboard()
        } else {
          showNotification({
            type: 'error',
            message: res?.message || 'Gagal memproses pembayaran OVO.',
          })
        }
      } catch (err: any) {
        showNotification({
          type: 'error',
          message: err?.message || 'Terjadi kesalahan saat memproses pembayaran.',
        })
      } finally {
        sendingMakePayment.value = false
      }
    }
  }

  const TRUSTED_QR_DOMAINS = [
    'api.bekasku.id',
    'sandbox.bekasku.id',
    'api.midtrans.com',
    'api.xendit.co',
    'firebasestorage.googleapis.com',
    'qris.online',
  ]

  function isTrustedQrUrl(rawUrl: string): boolean {
    if (!rawUrl) return false
    if (rawUrl.startsWith('data:image/')) return true
    try {
      const parsed = new URL(rawUrl)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
      return TRUSTED_QR_DOMAINS.some(
        domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  }

  async function downloadQr(): Promise<void> {
    const id = toValue(paymentIdSource)
    if (!data.value?.qr_url) return

    if (!isTrustedQrUrl(data.value.qr_url)) {
      qrError.value = 'URL kode QR tidak valid atau di luar domain tepercaya.'
      showQrModal.value = true
      return
    }

    const sanitizedInvoice = (data.value.invoice_no || id || 'QRIS').replace(
      /[/\\?%*:|"<>]/g,
      '_'
    )
    qrFileName.value = `QRIS_${sanitizedInvoice}.png`
    showQrModal.value = true
    qrCompleted.value = false
    qrError.value = null
    qrProgress.value = 0.2

    try {
      // Mengunduh gambar QR sebagai Blob
      const response = await fetch(data.value.qr_url)
      if (!response.ok) throw new Error('Gagal mengambil gambar QR')
      qrProgress.value = 0.6
      const blob = await response.blob()
      qrProgress.value = 0.9

      if (qrBlobUrl.value && qrBlobUrl.value.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(qrBlobUrl.value)
        } catch {
          // ignore
        }
      }

      const objectUrl = URL.createObjectURL(blob)
      qrBlobUrl.value = objectUrl

      // Trigger auto-download via anchor tag
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = qrFileName.value
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      qrProgress.value = 1
      qrCompleted.value = true
    } catch {
      qrError.value = 'Gagal mengunduh gambar kode QR. Silakan tangkap layar (screenshot).'
    }
  }

  async function cancelOrderInstant(customReason?: string): Promise<boolean> {
    const id = toValue(paymentIdSource)
    if (isCanceling.value || !id) return false
    isCanceling.value = true
    stopCountdown()
    stopPolling()

    const reason =
      customReason ||
      (isNonTransaction.value
        ? 'Tagihan dibatalkan oleh pembeli'
        : 'Dibatalkan instan oleh pembeli')

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
          message: isNonTransaction.value
            ? 'Tagihan pembayaran berhasil dibatalkan.'
            : 'Pesanan berhasil dibatalkan.',
        })
        if (options?.isModal) {
          options.onCancel?.()
        } else if (source.value === 'subscription' || data.value?.type_subscribe) {
          navigateTo('/subscribe/vip')
        } else {
          navigateTo(isNonTransaction.value ? '/' : '/transaction')
        }
        return true
      }

      showNotification({
        type: 'error',
        message: res?.message || 'Gagal membatalkan pembayaran.',
      })
      startPolling()
      return false
    } catch (err: any) {
      showNotification({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat membatalkan.',
      })
      startPolling()
      return false
    } finally {
      isCanceling.value = false
    }
  }

  onMounted(() => {
    if (!options?.isModal) {
      fetchDashboard()
    }
  })

  onBeforeUnmount(() => {
    stopCountdown()
    stopPolling()
    if (qrBlobUrl.value) {
      URL.revokeObjectURL(qrBlobUrl.value)
    }
  })

  return {
    loading,
    error,
    data,
    limitPayment,
    source,
    isNonTransaction,
    formattedDuration,
    checkingStatus,
    sendingMakePayment,
    isCanceling,
    showQrModal,
    qrCompleted,
    qrProgress,
    qrError,
    qrBlobUrl,
    qrFileName,
    fetchDashboard,
    checkPaymentStatus,
    makePayment,
    downloadQr,
    cancelOrderInstant,
    stopCountdown,
    stopPolling,
  }
}
