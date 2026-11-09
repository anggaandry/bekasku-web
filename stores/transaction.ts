import { defineStore } from 'pinia'
import { API_TRANSACTION_COUNT } from '~/utils/constants'
import type { TransactionTabCount } from '~/types/transaction'

export const useTransactionStore = defineStore('transaction', () => {
  const api = useApi()
  const activeStep = ref<number>(0)
  const counts = ref<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  })

  function setCounts(data: Partial<TransactionTabCount>) {
    counts.value = {
      1: Number(data.belum_bayar) || 0,
      2: Number(data.dikemas) || 0,
      3: Number(data.dikirim) || 0,
      4: Number(data.selesai) || 0,
      5: Number(data.pengembalian) || 0,
      6: Number(data.dibatalkan) || 0,
      7: Number(data.sudah_bayar) || 0,
    }
  }

  async function fetchTabCounts() {
    try {
      const res = await api.post<{ message?: string; result?: Partial<TransactionTabCount> }>(
        API_TRANSACTION_COUNT,
        { lang: 'id' }
      )
      if (res?.result) {
        setCounts(res.result)
      }
      return res?.result
    } catch {
      // ignore
      return null
    }
  }

  function setActiveStep(step: number) {
    activeStep.value = step
  }

  return {
    activeStep,
    counts,
    setCounts,
    fetchTabCounts,
    setActiveStep,
  }
})

