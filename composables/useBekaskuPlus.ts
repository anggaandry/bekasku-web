import { ref, computed } from 'vue'
import {
  API_PRELOVED_LIST,
  API_BEKASKU_PLUS_STATUS,
  API_BEKASKU_PLUS_APPLY,
  API_CATEGORY_LIST,
} from '~/utils/constants'
import type { BekaskuPlusSeller } from '~/types/seller'
import type {
  BekaskuPlusStatus,
  BekaskuPlusApplication,
  BekaskuPlusCategory,
  BekaskuPlusFormPayload,
  BekaskuPlusStatusResponse,
} from '~/types/bekasku-plus'
import { DEFAULT_BEKASKU_CATEGORIES } from '~/types/bekasku-plus'
import { useAuthStore } from '~/stores/auth'

export function useBekaskuPlus() {
  const api = useApi()
  const authStore = useAuthStore()

  // Seller curated partner listing
  const sellers = ref<BekaskuPlusSeller[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Application & membership status
  const status = ref<BekaskuPlusStatus>('none')
  const isRegistered = ref<boolean>(false)
  const adminNote = ref<string>('')
  const application = ref<BekaskuPlusApplication | null>(null)
  const submitting = ref<boolean>(false)

  // Category list for application (pre-populated with 31 standard Bekasku categories)
  const categories = ref<Array<{ id: string; name: string }>>([...DEFAULT_BEKASKU_CATEGORIES])
  const loadingCategories = ref<boolean>(false)

  const canApply = computed(() => {
    return status.value === 'none' || status.value === 'rejected'
  })

  const isPending = computed(() => status.value === 'pending')
  const isApproved = computed(() => status.value === 'approved')
  const isRejected = computed(() => status.value === 'rejected')

  async function fetchBekaskuPlus(): Promise<BekaskuPlusSeller[]> {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ result?: BekaskuPlusSeller[] }>(API_PRELOVED_LIST, {})
      // Rule 11: Hanya tampilkan seller dengan is_bekasku_plus === true, status approved, atau anne14
      const list = (response?.result || []).filter((item) => {
        return item.is_bekasku_plus === true || item.name?.toLowerCase().includes('anne14')
      })
      sellers.value = list
      return list
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat partner BekasKu+'
      sellers.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchStatus(): Promise<BekaskuPlusStatusResponse | null> {
    if (!authStore.isLoggedIn) {
      status.value = 'none'
      isRegistered.value = false
      adminNote.value = ''
      application.value = null
      return { status: 'none', is_registered: false, admin_note: '', application: null }
    }

    loading.value = true
    error.value = null
    try {
      const res = await api.get<{ message?: string; result?: BekaskuPlusStatusResponse }>(
        API_BEKASKU_PLUS_STATUS
      )
      if (res?.result) {
        status.value = res.result.status || 'none'
        isRegistered.value = Boolean(res.result.is_registered)
        adminNote.value = res.result.admin_note || ''
        application.value = res.result.application || null
        return res.result
      }
      return null
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Gagal memuat status BekasKu+'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories(): Promise<Array<{ id: string; name: string }>> {
    loadingCategories.value = true
    try {
      const res = await api.post<{ message?: string; result?: any[] }>(API_CATEGORY_LIST, {
        lang: 'id',
      })
      if (res?.result && Array.isArray(res.result) && res.result.length > 0) {
        const mapped = res.result
          .map((item) => {
            const name = item.name_id || item.name || item.category_name || ''
            const id = item._id || item.id || ''
            return { id: String(id), name: String(name) }
          })
          .filter((cat) => cat.name.length > 0)

        if (mapped.length > 0) {
          categories.value = mapped
          return mapped
        }
      }
      categories.value = [...DEFAULT_BEKASKU_CATEGORIES]
      return categories.value
    } catch {
      categories.value = [...DEFAULT_BEKASKU_CATEGORIES]
      return categories.value
    } finally {
      loadingCategories.value = false
    }
  }

  async function submitApplication(
    payload: BekaskuPlusFormPayload
  ): Promise<{ success: boolean; message: string; data?: any }> {
    submitting.value = true
    error.value = null
    try {
      const res = await api.post<{ message?: string; result?: any }>(
        API_BEKASKU_PLUS_APPLY,
        payload
      )
      if (res?.result) {
        status.value = 'pending'
        isRegistered.value = true
        application.value = res.result
        return {
          success: true,
          message: 'Pengajuan BekasKu+ berhasil dikirim!',
          data: res.result,
        }
      }
      return {
        success: false,
        message: res?.message || 'Gagal mengirim pengajuan',
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || 'Terjadi kesalahan saat mengirim pengajuan'
      error.value = errMsg
      return { success: false, message: errMsg }
    } finally {
      submitting.value = false
    }
  }

  return {
    sellers,
    status,
    isRegistered,
    adminNote,
    application,
    loading,
    submitting,
    error,
    categories,
    loadingCategories,
    canApply,
    isPending,
    isApproved,
    isRejected,
    fetchBekaskuPlus,
    fetchStatus,
    fetchCategories,
    submitApplication,
  }
}
