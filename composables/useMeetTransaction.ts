import {
  API_MEET_GENERATE_QR,
  API_MEET_CONFIRM_QR,
  API_TRANSACTION_STATUS
} from '~/utils/constants'
import type { MeetQrData, TransactionStatusResponse } from '~/types/transaction'

export function useMeetTransaction() {
  const api = useApi()

  const loading = ref(false)
  const qrLoading = ref(false)
  const confirmLoading = ref(false)
  const error = ref<string | null>(null)
  const qrData = ref<MeetQrData | null>(null)
  const countdown = ref<number>(0)

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let pollInterval: ReturnType<typeof setInterval> | null = null

  async function generateQR(transactionId: string): Promise<MeetQrData | null> {
    qrLoading.value = true
    error.value = null
    try {
      const res = await api.post<{ result?: MeetQrData; message?: string }>(API_MEET_GENERATE_QR, {
        transaction_id: transactionId,
        lang: 'id'
      })

      if (res?.result) {
        qrData.value = res.result
        countdown.value = Number(res.result.limit) || 120
        startCountdown()
        return res.result
      } else {
        error.value = res?.message || 'Gagal mendapatkan QR Code'
        return null
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      return null
    } finally {
      qrLoading.value = false
    }
  }

  function startCountdown(onExpire?: () => void) {
    if (timerInterval) clearInterval(timerInterval)

    timerInterval = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value -= 1
      } else {
        if (timerInterval) clearInterval(timerInterval)
        timerInterval = null
        if (onExpire) onExpire()
      }
    }, 1000)
  }

  function startStatusPolling(
    transactionId: string,
    onStatusChange: (status: TransactionStatusResponse) => void
  ) {
    stopStatusPolling()

    pollInterval = setInterval(async () => {
      try {
        const res = await api.post<{ result?: TransactionStatusResponse }>(API_TRANSACTION_STATUS, {
          transaction_id: transactionId,
          lang: 'id'
        })

        if (res?.result && res.result.code && res.result.code !== 'meet') {
          stopStatusPolling()
          stopCountdown()
          onStatusChange(res.result)
        }
      } catch {
        // Transient network glitches during 3s polling should not interrupt active QR session
      }
    }, 3000)
  }

  function stopCountdown() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function stopStatusPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  // Omitting `status` validates QR token & expiry on backend without mutating transaction state (matches Mobile V3 MeetScanController)
  async function verifyQR(
    transactionId: string,
    qr: string
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true
    error.value = null
    try {
      const res = await api.post<{ message?: string }>(API_MEET_CONFIRM_QR, {
        transaction_id: transactionId,
        qr,
        lang: 'id'
      })
      return {
        success: true,
        message: res?.message || 'QR Code valid'
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memverifikasi QR Code'
      error.value = msg
      return {
        success: false,
        message: msg
      }
    } finally {
      loading.value = false
    }
  }

  async function confirmQR(params: {
    transactionId: string
    qr: string
    status: number
    cancelReason?: string
  }): Promise<{ success: boolean; message: string }> {
    confirmLoading.value = true
    try {
      const res = await api.post<{ message?: string }>(API_MEET_CONFIRM_QR, {
        transaction_id: params.transactionId,
        qr: params.qr,
        status: params.status,
        cancel_reason: params.cancelReason || '',
        lang: 'id'
      })

      return {
        success: true,
        message: res?.message || (params.status === 1 ? 'Transaksi berhasil diselesaikan' : 'Transaksi telah dibatalkan')
      }
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Gagal memproses konfirmasi QR'
      }
    } finally {
      confirmLoading.value = false
    }
  }

  onUnmounted(() => {
    stopCountdown()
    stopStatusPolling()
  })

  return {
    loading,
    qrLoading,
    confirmLoading,
    error,
    qrData,
    countdown,
    generateQR,
    verifyQR,
    startCountdown,
    stopCountdown,
    startStatusPolling,
    stopStatusPolling,
    confirmQR
  }
}

