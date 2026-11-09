import type {
  ComplainDetailData,
  ComplainCourierItem,
  CreateComplainPayload,
  SubmitWaybillPayload,
} from '~/types/complain'
import {
  API_TRANSACTION_COMPLAIN_CREATE_FILE_RAW,
  API_TRANSACTION_COMPLAIN_DETAIL,
  API_TRANSACTION_COMPLAIN_ACCEPT,
  API_TRANSACTION_COMPLAIN_DECLINE,
  API_TRANSACTION_COMPLAIN_FINISH,
  API_TRANSACTION_COMPLAIN_WAYBILL_INIT,
  API_TRANSACTION_COMPLAIN_WAYBILL_SUBMIT,
  API_TRANSACTION_DETAIL,
} from '~/utils/constants'

export function useComplain() {
  const api = useApi()
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const complainDetail = ref<ComplainDetailData | null>(null)
  const couriers = ref<ComplainCourierItem[]>([])

  async function fetchComplainDetail(transactionId: string): Promise<ComplainDetailData | null> {
    if (!transactionId) return null
    isLoading.value = true
    errorMessage.value = ''
    try {
      const [complainRes, txRes] = await Promise.allSettled([
        api.post<{ message?: string; result?: any }>(
          API_TRANSACTION_COMPLAIN_DETAIL,
          {
            transaction_id: transactionId,
            lang: 'id',
          }
        ),
        api.post<{ message?: string; result?: any }>(
          API_TRANSACTION_DETAIL,
          {
            transaction_id: transactionId,
            lang: 'id',
          }
        ),
      ])

      const addressData = complainRes.status === 'fulfilled' ? (complainRes.value?.result || complainRes.value) : null
      const txData = txRes.status === 'fulfilled' ? (txRes.value?.result || txRes.value) : {}

      const data = {
        ...txData,
        return_address: txData?.return_address || addressData,
      }
      complainDetail.value = data
      return data
    } catch (err: any) {
      errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat detail komplain'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createComplain(payload: CreateComplainPayload): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_COMPLAIN_CREATE_FILE_RAW, {
        lang: 'id',
        transaction_id: payload.transaction_id,
        complain_items: payload.complain_items,
        complain_images: payload.complain_images,
        complain_message: payload.complain_message,
        complain_reason: payload.complain_reason,
        complain_price: payload.complain_price,
        complain_video: payload.complain_video || '',
      })
      return {
        success: true,
        message: res?.message || 'Komplain berhasil diajukan',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal mengajukan komplain'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function acceptComplain(transactionId: string, returnAddress?: any): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_COMPLAIN_ACCEPT, {
        lang: 'id',
        transaction_id: transactionId,
        return_address: returnAddress,
      })
      return {
        success: true,
        message: res?.message || 'Komplain diterima',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal menerima komplain'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function declineComplain(transactionId: string, reason: string): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_COMPLAIN_DECLINE, {
        lang: 'id',
        transaction_id: transactionId,
        reason,
      })
      return {
        success: true,
        message: res?.message || 'Komplain ditolak',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal menolak komplain'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function finishComplain(transactionId: string): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_COMPLAIN_FINISH, {
        lang: 'id',
        transaction_id: transactionId,
      })
      return {
        success: true,
        message: res?.message || 'Komplain berhasil diselesaikan',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal menyelesaikan komplain'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function initWaybill(): Promise<ComplainCourierItem[]> {
    isLoading.value = true
    try {
      const res = await api.post<{ message?: string; result?: { couriers?: ComplainCourierItem[] } }>(
        API_TRANSACTION_COMPLAIN_WAYBILL_INIT,
        { lang: 'id' }
      )
      const list = res?.result?.couriers || []
      couriers.value = list
      return list
    } catch (err: any) {
      errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat daftar kurir'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function submitWaybill(payload: SubmitWaybillPayload): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string }>(API_TRANSACTION_COMPLAIN_WAYBILL_SUBMIT, {
        lang: 'id',
        transaction_id: payload.transaction_id,
        courier_code: payload.courier_code,
        return_courier_code: payload.return_courier_code || payload.courier_code,
        courier_name: payload.courier_name,
        return_courier_name: payload.return_courier_name || payload.courier_name,
        waybill: payload.waybill,
        return_waybill: payload.return_waybill || payload.waybill,
        image: payload.image,
        return_image: payload.return_image || payload.image,
      })
      return {
        success: true,
        message: res?.message || 'Resi pengembalian berhasil diinput',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal menginput resi'
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
    complainDetail,
    couriers,
    fetchComplainDetail,
    createComplain,
    acceptComplain,
    declineComplain,
    finishComplain,
    initWaybill,
    submitWaybill,
  }
}

