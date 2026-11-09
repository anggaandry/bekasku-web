import type { BalanceMutation, WithdrawPayload } from '~/types/balance'
import {
  API_BALANCE_HISTORY,
  API_BALANCE_WITHDRAW,
  API_TRANSACTION_LIST,
  API_PASSWORD_MATCH,
  API_MYBANK_LIST,
  WITHDRAW_MIN_AMOUNT,
} from '~/utils/constants'
import { formatRupiah } from '~/utils/format'

export const BALANCE_FILTER_TYPES = [
  'Semua transaksi',
  'Pembelian',
  'Penjualan',
  'Pengembalian',
]

export const BALANCE_FILTER_TIMES = [
  'Semua waktu',
  '7 hari yang lalu',
  '14 hari yang lalu',
  '30 hari yang lalu',
]

export function getMutationStatusBadge(item?: BalanceMutation | null) {
  const s = (item?.status || '').toLowerCase()
  if (s === 'selesai' || s === 'success' || item?.verify === 1) {
    return {
      text: 'SELESAI',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    }
  }
  if (s === 'waiting' || s === 'proses' || item?.verify === 0) {
    return {
      text: 'WAITING',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    }
  }
  if (s === 'gagal' || s === 'cancel' || item?.verify === 2) {
    return {
      text: 'GAGAL',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    }
  }
  return {
    text: (item?.status || '-').toUpperCase(),
    bg: 'bg-surface-2 text-text-muted border-border',
  }
}

export function getMutationTypeLabel(type?: number): string {
  switch (type ?? 0) {
    case 0:
      return 'Transaksi'
    case 1:
      return 'Pembelian'
    case 2:
      return 'Penjualan'
    case 3:
      return 'Pengembalian'
    case 4:
    case 5:
      return 'Penarikan Dana (Withdraw)'
    case 6:
      return 'Biaya Layanan (Transfer Bill)'
    default:
      return 'Lainnya'
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const errObj = err as { data?: { message?: string }; message?: string }
    if (errObj.data?.message) return errObj.data.message
    if (errObj.message) return errObj.message
  }
  return fallback
}

export function useBalance() {
  const api = useApi()

  const balance = ref(0)
  const isBalanceLoading = ref(false)

  const historyList = ref<BalanceMutation[]>([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const page = ref(1)
  const hasNextPage = ref(false)
  const errorMessage = ref('')

  const filterType = ref(0)
  const filterTime = ref(0)

  const isSubmittingWithdraw = ref(false)

  // Fetch fresh total balance from /transaction/list or /mybank/list
  async function fetchBalance() {
    isBalanceLoading.value = true
    try {
      const res = await api.post<{
        result?: { balance?: number; total_balance?: number }
        balance?: number
      }>(API_TRANSACTION_LIST, {
        page: 1,
        type: 0,
        lang: 'id',
      })

      if (res?.result && typeof res.result.balance === 'number') {
        balance.value = res.result.balance
      } else if (typeof res?.balance === 'number') {
        balance.value = res.balance
      }
    } catch {
      // Fallback: try mybank/list
      try {
        const bankRes = await api.post<{
          result?: { total_balance?: number; balance?: number }
        }>(API_MYBANK_LIST, {})
        if (bankRes?.result && typeof bankRes.result.total_balance === 'number') {
          balance.value = bankRes.result.total_balance
        }
      } catch {
        // ignore
      }
    } finally {
      isBalanceLoading.value = false
    }
  }

  // Fetch balance mutation history
  async function fetchHistory(isRefresh = true) {
    if (isRefresh) {
      page.value = 1
      isLoading.value = true
      errorMessage.value = ''
      historyList.value = []
    } else {
      isLoadingMore.value = true
    }

    try {
      let days = filterTime.value
      if (filterTime.value > 0) {
        days = filterTime.value * 7
        if (days === 21) days = 30
      }

      const body = {
        page: page.value,
        type: filterType.value,
        time: days,
        lang: 'id',
      }

      const res = await api.post<{
        message?: string
        result?: {
          docs?: BalanceMutation[]
          hasNextPage?: boolean
          balance?: number
        }
        balance?: number
      }>(API_BALANCE_HISTORY, body)

      if (res?.result?.docs) {
        if (isRefresh) {
          historyList.value = res.result.docs
        } else {
          historyList.value.push(...res.result.docs)
        }
        hasNextPage.value = Boolean(res.result.hasNextPage)

        if (typeof res.result.balance === 'number') {
          balance.value = res.result.balance
        }
      } else if (res?.message && res.message !== 'Success') {
        errorMessage.value = res.message
      }
    } catch (err: unknown) {
      errorMessage.value = extractErrorMessage(
        err,
        'Gagal memuat riwayat mutasi'
      )
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  function loadMore() {
    if (hasNextPage.value && !isLoadingMore.value) {
      page.value++
      fetchHistory(false)
    }
  }

  function setFilterType(val: number) {
    if (filterType.value === val) return
    filterType.value = val
    fetchHistory(true)
  }

  function setFilterTime(val: number) {
    if (filterTime.value === val) return
    filterTime.value = val
    fetchHistory(true)
  }

  // Verify password before withdraw
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

  // Submit withdraw request
  async function submitWithdraw(payload: WithdrawPayload) {
    if (payload.substract < WITHDRAW_MIN_AMOUNT) {
      return {
        success: false,
        message: `Minimum penarikan saldo adalah ${formatRupiah(WITHDRAW_MIN_AMOUNT)}`,
      }
    }

    if (payload.substract > balance.value) {
      return {
        success: false,
        message: 'Jumlah penarikan melebihi saldo tersedia',
      }
    }

    isSubmittingWithdraw.value = true
    try {
      const res = await api.post<{
        message?: string
        result?: unknown
      }>(API_BALANCE_WITHDRAW, payload)

      if (res?.message === 'Success') {
        // Refresh balance and history after successful withdraw
        await Promise.all([fetchBalance(), fetchHistory(true)])
        return {
          success: true,
          message:
            'Permintaan penarikan saldo berhasil dikirim. Harap menunggu 1-3 hari kerja.',
        }
      }

      return {
        success: false,
        message: res?.message || 'Gagal melakukan penarikan saldo',
      }
    } catch (err: unknown) {
      return {
        success: false,
        message: extractErrorMessage(
          err,
          'Terjadi kesalahan saat memproses penarikan'
        ),
      }
    } finally {
      isSubmittingWithdraw.value = false
    }
  }

  return {
    balance,
    isBalanceLoading,
    historyList,
    isLoading,
    isLoadingMore,
    page,
    hasNextPage,
    errorMessage,
    filterType,
    filterTime,
    isSubmittingWithdraw,
    fetchBalance,
    fetchHistory,
    loadMore,
    setFilterType,
    setFilterTime,
    verifyPassword,
    submitWithdraw,
  }
}

