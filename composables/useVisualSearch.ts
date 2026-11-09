import { API_PRODUCT_SEARCH_VISUAL, SEARCH_PAGE_SIZE } from '~/utils/constants'
import type { ProductCard, ProductSearchResponse } from '~/types/product'
import { useSearchStore } from '~/stores/search'
import { validateUploadedFile } from '~/utils/fileValidator'

export interface VisualSearchParams {
  file: File
  page?: number
  limit?: number
  threshold?: number
  categoryId?: string
  subcategoryId?: string
  minPrice?: number
  maxPrice?: number
}

export function useVisualSearch() {
  const api = useApi()
  const searchStore = useSearchStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  function validateImageFile(file: File): string | null {
    const res = validateUploadedFile(file, { maxSizeMB: 5 })
    return res.valid ? null : (res.error || 'Format file tidak valid.')
  }

  async function searchByImage(params: VisualSearchParams): Promise<ProductSearchResponse> {
    loading.value = true
    error.value = null
    try {
      const validationError = validateImageFile(params.file)
      if (validationError) {
        error.value = validationError
        return { docs: [] }
      }

      const formData = new FormData()
      formData.append('image', params.file, params.file.name || 'visual_query.jpg')
      formData.append('page', String(params.page ?? 1))
      formData.append('limit', String(params.limit ?? SEARCH_PAGE_SIZE))
      formData.append('threshold', String(params.threshold ?? 0.18))
      if (params.categoryId) formData.append('category_id', params.categoryId)
      if (params.subcategoryId) formData.append('subcategory_id', params.subcategoryId)
      if (params.minPrice && params.minPrice > 0) formData.append('min_price', String(params.minPrice))
      if (params.maxPrice && params.maxPrice > 0) formData.append('max_price', String(params.maxPrice))

      const res = await api.post<{
        status?: boolean
        message?: string
        result?: {
          docs?: ProductCard[]
          totalDocs?: number
          page?: number
          totalPages?: number
          hasNextPage?: boolean
          query_duration_ms?: number
        }
      }>(API_PRODUCT_SEARCH_VISUAL, formData)

      const data = res?.result
      if (data?.query_duration_ms) {
        searchStore.queryDurationMs = data.query_duration_ms
      }
      return {
        docs: Array.isArray(data?.docs) ? data!.docs : [],
        totalDocs: data?.totalDocs ?? 0,
        page: data?.page ?? 1,
        totalPages: data?.totalPages ?? 1,
        hasNextPage: data?.hasNextPage ?? false,
      }
    } catch (e: any) {
      error.value = e?.message || 'Gagal mencari produk dengan foto'
      return { docs: [] }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    validateImageFile,
    searchByImage,
  }
}

