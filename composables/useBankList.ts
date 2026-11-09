import { API_BANK_LIST, BANK_OTHER_ID } from '~/utils/constants'
import type { BankItem, BankListResponse } from '~/types/bank'

export function useBankList() {
  const api = useApi()

  const banks = ref<BankItem[]>([])
  const loading = ref<boolean>(false)
  const searchQuery = ref<string>('')
  const currentPage = ref<number>(1)
  const hasMore = ref<boolean>(false)
  const total = ref<number>(0)

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  async function fetchBanks(query = '', page = 1): Promise<BankItem[]> {
    loading.value = true
    try {
      const res = await api.post<{
        message?: string
        result?: BankListResponse
      }>(API_BANK_LIST, {
        filter: query.trim(),
        page,
      })

      const docs = res?.result?.docs || []
      const pages = res?.result?.pages || 1
      total.value = res?.result?.total || 0
      hasMore.value = page < pages
      currentPage.value = page

      if (page === 1) {
        banks.value = docs
      } else {
        banks.value = [...banks.value, ...docs]
      }

      return banks.value
    } catch {
      if (page === 1) {
        banks.value = []
      }
      return []
    } finally {
      loading.value = false
    }
  }

  function onSearch(q: string) {
    searchQuery.value = q
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchBanks(q, 1)
    }, 350)
  }

  function loadMore() {
    if (!loading.value && hasMore.value) {
      fetchBanks(searchQuery.value, currentPage.value + 1)
    }
  }

  onScopeDispose(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  const otherBankItem: BankItem = {
    _id: BANK_OTHER_ID,
    id: BANK_OTHER_ID,
    name: 'Bank Lainnya',
    image: '',
    code: 'other',
  }

  return {
    banks,
    loading,
    searchQuery,
    currentPage,
    hasMore,
    total,
    otherBankItem,
    fetchBanks,
    onSearch,
    loadMore,
  }
}

