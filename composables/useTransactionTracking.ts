import type { TrackingDetailInfo } from '~/types/transaction'
import { API_TRACKING_ORDER, API_TRACKING_RETURN } from '~/utils/constants'
import { resolveCourierLogo } from '~/utils/courier'

export function useTransactionTracking(transactionId: MaybeRefOrGetter<string>, isReturn = false) {
  const api = useApi()

  const tracking = ref<TrackingDetailInfo | null>(null)
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const id = computed(() => toValue(transactionId))

  async function fetchTracking() {
    if (!id.value) return
    isLoading.value = true
    errorMessage.value = ''

    const endpoint = isReturn ? API_TRACKING_RETURN : API_TRACKING_ORDER

    try {
      const res = await api.post<{
        message?: string
        result?: any
      }>(
        endpoint,
        {
          transaction_id: id.value,
          lang: 'id',
        }
      )

      if (res?.result) {
        const d = res.result
        if (isReturn) {
          const cName = String(d.return_courier_name || '')
          const rawLogo = String(d.return_courier_logo || d.courier_logo || '')
          tracking.value = {
            waybill: String(d.return_waybill || ''),
            courier_name: cName,
            service_name: String(d.return_service_name || ''),
            courier_logo: resolveCourierLogo(cName, rawLogo),
            manifest: Array.isArray(d.manifest) ? d.manifest : [],
            manifest_status: String(d.manifest_status || ''),
            track_link: d.track_link ? String(d.track_link) : undefined,
            driver_name: d.driver_name ? String(d.driver_name) : undefined,
            driver_phone: d.driver_phone ? String(d.driver_phone) : undefined,
            driver_plate: d.driver_plate ? String(d.driver_plate) : undefined,
            return_arrive_date: d.return_arrive_date ? String(d.return_arrive_date) : undefined,
            return_waybill_date: d.return_waybill_date ? String(d.return_waybill_date) : undefined,
            step: typeof d.step === 'number' ? d.step : (parseInt(String(d.step || '0'), 10) || 0),
          }
        } else {
          const cName = String(d.courier_name || '')
          const rawLogo = String(d.courier_logo || d.logo || d.shipping_logo || '')
          tracking.value = {
            waybill: String(d.waybill || ''),
            courier_name: cName,
            service_name: String(d.service_name || ''),
            courier_logo: resolveCourierLogo(cName, rawLogo),
            manifest: Array.isArray(d.manifest) ? d.manifest : [],
            manifest_status: String(d.manifest_status || ''),
            track_link: d.track_link ? String(d.track_link) : undefined,
            driver_name: d.driver_name ? String(d.driver_name) : undefined,
            driver_phone: d.driver_phone ? String(d.driver_phone) : undefined,
            driver_plate: d.driver_plate ? String(d.driver_plate) : undefined,
            est_delivery: d.est_delivery ? String(d.est_delivery) : undefined,
            is_meet: d.is_meet === true || d.meet === true || d.type === 0 || d.type === '0',
            step: typeof d.step === 'number' ? d.step : (parseInt(String(d.step || '0'), 10) || 0),
          }
        }
      } else {
        errorMessage.value = res?.message || 'Informasi pelacakan tidak tersedia'
      }
    } catch (err: any) {
      errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat pelacakan'
    } finally {
      isLoading.value = false
    }
  }

  return {
    tracking,
    isLoading,
    errorMessage,
    fetchTracking,
  }
}

