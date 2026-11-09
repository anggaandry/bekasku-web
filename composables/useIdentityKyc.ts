import type {
  IdentityDocType,
  KycModalStep,
  IdentityInfoData,
  MlVisionResult,
  IdentityUploadPayload,
  KycModalOptions,
} from '~/types/identity'
import {
  API_IDENTITY_INFO,
  API_IDENTITY_ML_VISION,
  API_IDENTITY_UPLOAD,
} from '~/utils/constants'
import { useAuthStore } from '~/stores/auth'

let pendingSuccessCallback: (() => void) | null = null

export function useIdentityKyc() {
  const api = useApi()
  const authStore = useAuthStore()

  const identityInfo = useState<IdentityInfoData | null>(
    'user_identity_info_data',
    () => null
  )
  const isLoading = ref(false)
  const errorMessage = ref('')

  const isVerified = computed(() => {
    return Boolean(
      authStore.user?.is_verified ||
      identityInfo.value?.identity_number ||
      identityInfo.value?.identity
    )
  })

  async function ensureIdentityInfo(): Promise<boolean> {
    if (!authStore.isLoggedIn) return false
    if (authStore.user?.is_verified) return true
    if (identityInfo.value !== null) {
      return Boolean(
        identityInfo.value?.identity_number ||
        identityInfo.value?.identity ||
        authStore.user?.is_verified
      )
    }
    const res = await fetchIdentityInfo()
    return Boolean(
      res?.identity_number ||
      res?.identity ||
      authStore.user?.is_verified
    )
  }

  async function fetchIdentityInfo(): Promise<IdentityInfoData | null> {
    if (!authStore.isLoggedIn) return null
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{
        message?: string
        result?: IdentityInfoData
      }>(API_IDENTITY_INFO, {})
      if (res?.result) {
        identityInfo.value = res.result
        return res.result
      }
      return null
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      errorMessage.value =
        errObj?.data?.message || errObj?.message || 'Gagal memuat status identitas'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function checkMlVision(
    docType: IdentityDocType,
    base64Image: string
  ): Promise<{ success: boolean; data?: MlVisionResult; message?: string }> {
    try {
      // Strip data:image/...;base64, prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')
      const res = await api.post<{
        message?: string
        result?: { name?: string; number?: string }
      }>(API_IDENTITY_ML_VISION, {
        identity_type: docType,
        identity: cleanBase64,
      })

      if (res?.result) {
        return {
          success: true,
          data: {
            name: res.result.name?.trim() || '',
            number: res.result.number?.trim() || '',
          },
        }
      }
      return {
        success: false,
        message: res?.message || 'Identitas tidak terbaca jelas',
      }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return {
        success: false,
        message:
          errObj?.data?.message ||
          errObj?.message ||
          'Gagal memproses pengenalan identitas (ML Vision)',
      }
    }
  }

  async function uploadIdentity(
    payload: IdentityUploadPayload
  ): Promise<{ success: boolean; message: string }> {
    try {
      const cleanBase64 = payload.identity.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      )
      const res = await api.post<{ message?: string; result?: unknown }>(
        API_IDENTITY_UPLOAD,
        {
          identity_name: payload.identity_name,
          identity_number: payload.identity_number,
          identity_type: payload.identity_type,
          identity: cleanBase64,
        }
      )

      if (res?.message === 'Success' || res?.result) {
        await fetchIdentityInfo()
        return {
          success: true,
          message: res?.message || 'Verifikasi identitas berhasil disimpan',
        }
      }
      return {
        success: false,
        message: res?.message || 'Gagal menyimpan identitas',
      }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      return {
        success: false,
        message:
          errObj?.data?.message ||
          errObj?.message ||
          'Terjadi kesalahan saat mengunggah identitas',
      }
    }
  }

  return {
    identityInfo,
    isLoading,
    errorMessage,
    isVerified,
    ensureIdentityInfo,
    fetchIdentityInfo,
    checkMlVision,
    uploadIdentity,
  }
}

export function useIdentityKycModal() {
  const { uploadIdentity, checkMlVision } = useIdentityKyc()
  const { showNotification } = useNotification()
  const authStore = useAuthStore()

  const isOpen = useState<boolean>('kyc_modal_open', () => false)
  const step = useState<KycModalStep>('kyc_modal_step', () => 'intro')
  const docType = useState<IdentityDocType>('kyc_modal_doc_type', () => 'KTP')
  const capturedImage = useState<string>('kyc_modal_captured_image', () => '')
  const identityName = useState<string>('kyc_modal_identity_name', () => '')
  const identityNumber = useState<string>('kyc_modal_identity_number', () => '')
  const featureReason = useState<string>('kyc_modal_feature_reason', () => '')
  const featureName = useState<string>('kyc_modal_feature_name', () => '')

  const isOcrLoading = useState<boolean>('kyc_modal_ocr_loading', () => false)
  const isSubmitting = useState<boolean>('kyc_modal_submitting', () => false)
  const errorMessage = useState<string>('kyc_modal_error_message', () => '')

  function open(options?: KycModalOptions) {
    if (options?.onSuccess) {
      pendingSuccessCallback = options.onSuccess
    } else {
      pendingSuccessCallback = null
    }

    featureReason.value = options?.reason || 'general'
    featureName.value = options?.featureName || ''
    step.value = 'intro'
    docType.value = 'KTP'
    capturedImage.value = ''
    identityName.value = authStore.user?.name || ''
    identityNumber.value = ''
    errorMessage.value = ''
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    errorMessage.value = ''
    isOcrLoading.value = false
    isSubmitting.value = false
  }

  function setStep(newStep: KycModalStep) {
    errorMessage.value = ''
    step.value = newStep
  }

  function setDocType(type: IdentityDocType) {
    docType.value = type
    step.value = 'guide'
  }

  async function processCapturedImage(base64Image: string) {
    capturedImage.value = base64Image
    isOcrLoading.value = true
    errorMessage.value = ''

    try {
      const mlRes = await checkMlVision(docType.value, base64Image)
      if (mlRes.success && mlRes.data) {
        if (mlRes.data.name) {
          identityName.value = mlRes.data.name
        }
        if (mlRes.data.number) {
          identityNumber.value = mlRes.data.number
        }
      }
    } catch {
      // OCR fail soft fallback: proceed to review screen so user can verify/fill
    } finally {
      isOcrLoading.value = false
      step.value = 'review'
    }
  }

  async function submitKyc() {
    const name = identityName.value.trim()
    const num = identityNumber.value.trim()

    if (!name) {
      errorMessage.value = 'Nama identitas wajib diisi'
      return
    }

    if (!num) {
      errorMessage.value =
        docType.value === 'KTP'
          ? 'NIK wajib diisi (16 digit)'
          : 'Nomor SIM wajib diisi'
      return
    }

    if (docType.value === 'KTP') {
      const cleanNik = num.replace(/\D/g, '')
      if (cleanNik.length !== 16) {
        errorMessage.value = 'NIK wajib terdiri dari 16 digit angka'
        return
      }
    }

    if (!capturedImage.value) {
      errorMessage.value = 'Foto kartu identitas wajib diambil'
      return
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const res = await uploadIdentity({
        identity_name: name,
        identity_number: num,
        identity_type: docType.value,
        identity: capturedImage.value,
      })

      if (res.success) {
        step.value = 'success'
        showNotification({
          type: 'success',
          message: 'Verifikasi identitas berhasil disimpan!',
        })
        if (pendingSuccessCallback) {
          pendingSuccessCallback()
          pendingSuccessCallback = null
        }
      } else {
        errorMessage.value = res.message
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      errorMessage.value =
        errObj?.message || 'Terjadi kesalahan saat memverifikasi identitas'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isOpen,
    step,
    docType,
    capturedImage,
    identityName,
    identityNumber,
    featureReason,
    featureName,
    isOcrLoading,
    isSubmitting,
    errorMessage,
    open,
    close,
    setStep,
    setDocType,
    processCapturedImage,
    submitKyc,
  }
}

