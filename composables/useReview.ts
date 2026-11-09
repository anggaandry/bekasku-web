import type { ReviewData, SubmitReviewPayload } from '~/types/review'
import { API_REVIEW_CREATE_INIT, API_REVIEW_SEND } from '~/utils/constants'

export function useReview() {
  const api = useApi()
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const reviewData = ref<ReviewData | null>(null)

  async function fetchReviewInit(transactionId: string): Promise<ReviewData | null> {
    if (!transactionId) return null
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: ReviewData }>(
        API_REVIEW_CREATE_INIT,
        {
          transaction_id: transactionId,
          lang: 'id',
        }
      )
      if (res && res.result) {
        reviewData.value = res.result
        return res.result
      }
      return null
    } catch (err: any) {
      errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat ulasan'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function submitReview(payload: SubmitReviewPayload): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_REVIEW_SEND, {
        lang: 'id',
        transaction_id: payload.transaction_id,
        review: payload.review || payload.review_text || '',
        review_text: payload.review_text || payload.review || '',
        review_score: payload.review_score,
        review_service_score: payload.review_service_score ?? payload.review_score,
        review_shipping_score: payload.review_shipping_score ?? payload.review_score,
        review_images: payload.review_images || [],
        review_video: payload.review_video || '',
        review_video_thumbnail: payload.review_video_thumbnail || '',
      })
      return {
        success: true,
        message: res?.message || 'Ulasan berhasil dikirim',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal mengirim ulasan'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isLoading,
    isSubmitting,
    errorMessage,
    reviewData,
    fetchReviewInit,
    submitReview,
  }
}

