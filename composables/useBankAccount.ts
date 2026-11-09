import {
  API_MYBANK_LIST,
  API_MYBANK_ADD,
  API_MYBANK_CHECK,
  API_MYBANK_DELETE,
  MAX_BANK_ACCOUNTS,
} from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'
import type { UserBankAccount, BankFormPayload, BankCheckResult } from '~/types/bank'

export function useBankAccount() {
  const api = useApi()
  const authStore = useAuthStore()

  const bankAccounts = useState<UserBankAccount[]>('user_bank_accounts', () => [])
  const totalBalance = useState<number>('user_bank_total_balance', () => 0)
  const loading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isMaxReached = computed<boolean>(() => {
    return bankAccounts.value.length >= MAX_BANK_ACCOUNTS
  })

  async function fetchBankAccounts(): Promise<UserBankAccount[]> {
    if (!authStore.isLoggedIn) {
      bankAccounts.value = []
      totalBalance.value = 0
      return []
    }

    loading.value = true
    error.value = null
    try {
      const res = await api.post<{
        message?: string
        result?: {
          mybank?: UserBankAccount[]
          total_balance?: number
        }
      }>(API_MYBANK_LIST, {})

      const list = res?.result?.mybank || []
      bankAccounts.value = list
      totalBalance.value = res?.result?.total_balance || 0
      return list
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      error.value = errObj?.message || 'Gagal memuat daftar rekening bank'
      bankAccounts.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function checkSimilarity(accountName: string): Promise<{
    success: boolean
    similarity: number
    message?: string
  }> {
    isSubmitting.value = true
    error.value = null
    try {
      const res = await api.post<BankCheckResult>(API_MYBANK_CHECK, {
        account_name: accountName.trim(),
      })

      const similarity = typeof res?.result === 'number' ? res.result : 0
      const isMatch = similarity > 90

      return {
        success: isMatch,
        similarity,
        message: res?.message,
      }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return {
        success: false,
        similarity: 0,
        message: errObj?.data?.message || errObj?.message || 'Gagal memeriksa nama pemilik rekening',
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function addBankAccount(payload: BankFormPayload): Promise<{
    success: boolean
    message?: string
  }> {
    if (isMaxReached.value) {
      return {
        success: false,
        message: `Maksimal ${MAX_BANK_ACCOUNTS} rekening bank aktif yang dapat disimpan.`,
      }
    }

    isSubmitting.value = true
    error.value = null
    try {
      const body: Record<string, string> = {
        bank_id: payload.bank_id,
        number: payload.number.replaceAll(/\D/g, '').trim(),
        name: payload.name.replaceAll(/[<>]/g, '').trim(),
      }

      if (payload.custom_bank_name) {
        body.custom_bank_name = payload.custom_bank_name.replaceAll(/[<>]/g, '').trim()
      }

      const res = await api.post<{ message?: string }>(API_MYBANK_ADD, body)
      const ok = String(res?.message || '').toUpperCase() === 'SUCCESS'

      if (ok) {
        await fetchBankAccounts()
        return { success: true, message: 'Berhasil menambahkan rekening bank' }
      }

      return { success: false, message: res?.message || 'Gagal menambahkan rekening bank' }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return {
        success: false,
        message: errObj?.data?.message || errObj?.message || 'Terjadi kesalahan sistem saat menyimpan rekening',
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteBankAccount(bankAccountId: string): Promise<{
    success: boolean
    message?: string
  }> {
    if (!bankAccountId) {
      return { success: false, message: 'ID rekening tidak valid' }
    }

    isSubmitting.value = true
    error.value = null
    try {
      const res = await api.post<{ message?: string }>(API_MYBANK_DELETE, {
        bank_account_id: bankAccountId,
      })
      const ok = String(res?.message || '').toUpperCase() === 'SUCCESS'

      if (ok) {
        await fetchBankAccounts()
        return { success: true, message: 'Berhasil menghapus rekening bank' }
      }

      return { success: false, message: res?.message || 'Gagal menghapus rekening bank' }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return {
        success: false,
        message: errObj?.data?.message || errObj?.message || 'Terjadi kesalahan sistem saat menghapus rekening',
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    bankAccounts,
    totalBalance,
    loading,
    isSubmitting,
    error,
    isMaxReached,
    fetchBankAccounts,
    checkSimilarity,
    addBankAccount,
    deleteBankAccount,
  }
}

