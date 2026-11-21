import type {
  IdentityDocType,
  KycModalStep,
  IdentityInfoData,
  MlVisionResult,
  IdentityUploadPayload,
  KycModalOptions,
  SelfieVerifyResult,
} from '~/types/identity'
import {
  API_IDENTITY_INFO,
  API_IDENTITY_ML_VISION,
  API_IDENTITY_UPLOAD,
  API_SELFIE_VERIFY,
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
      identityInfo.value?.identity_number ||
      identityInfo.value?.identity
    )
  })

  const isSelfieVerified = computed(() => {
    return Boolean(
      identityInfo.value?.selfie_identity ||
      identityInfo.value?.has_selfie_identity
    )
  })

  async function ensureIdentityInfo(): Promise<boolean> {
    if (!authStore.isLoggedIn) return false
    if (identityInfo.value !== null) {
      return Boolean(
        identityInfo.value?.identity_number ||
        identityInfo.value?.identity
      )
    }
    const res = await fetchIdentityInfo()
    return Boolean(
      res?.identity_number ||
      res?.identity
    )
  }

  async function ensureSelfieInfo(): Promise<boolean> {
    if (!authStore.isLoggedIn) return false
    if (identityInfo.value !== null) {
      return Boolean(
        identityInfo.value?.selfie_identity ||
        identityInfo.value?.has_selfie_identity
      )
    }
    const res = await fetchIdentityInfo()
    return Boolean(
      res?.selfie_identity ||
      res?.has_selfie_identity
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
      const cleanBase64 = base64Image.replace(/^data:image\/[^;]+;base64,/i, '')
      const res = await api.post<{
        message?: string
        result?: { name?: string; number?: string }
      }>(
        API_IDENTITY_ML_VISION,
        {
          identity_type: docType,
          identity: cleanBase64,
        },
        { useAuthToken: true },
      )

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
        /^data:image\/[^;]+;base64,/i,
        ''
      )
      const res = await api.post<{ message?: string; result?: unknown }>(
        API_IDENTITY_UPLOAD,
        {
          identity_name: payload.identity_name,
          identity_number: payload.identity_number,
          identity_type: payload.identity_type,
          identity: cleanBase64,
        },
        { useAuthToken: true },
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

  async function verifySelfie(
    base64Image: string
  ): Promise<{ success: boolean; data?: SelfieVerifyResult; message: string }> {
    try {
      const cleanBase64 = base64Image.replace(/^data:image\/[^;]+;base64,/i, '')
      const res = await api.post<{
        message?: string
        result?: Partial<SelfieVerifyResult>
      }>(
        API_SELFIE_VERIFY,
        {
          selfie_image: cleanBase64,
          image: cleanBase64,
        },
        { useAuthToken: true },
      )

      const result = res?.result || {}
      const matched = result.is_match === true
      const reason = result.reason?.toString() || ''
      const verifyData: SelfieVerifyResult = {
        is_match: matched,
        confidence_score: typeof result.confidence_score === 'number' ? result.confidence_score : 0,
        reason,
        spoof_type: result.spoof_type?.toString() || 'none',
      }

      if (matched) {
        await fetchIdentityInfo()
        return {
          success: true,
          data: verifyData,
          message: res?.message || 'Verifikasi selfie berhasil!',
        }
      }

      const fallbackMsg =
        reason && reason.toLowerCase() !== 'success'
          ? reason
          : res?.message && res.message.toLowerCase() !== 'success'
            ? res.message
            : 'Fisik kartu identitas tidak terdeteksi atau wajah belum cocok. Silakan coba lagi.'

      return {
        success: false,
        data: verifyData,
        message: fallbackMsg,
      }
    } catch (err: unknown) {
      const errObj = err as {
        data?: { message?: string; result?: Partial<SelfieVerifyResult> }
        message?: string
      }
      const errResult = errObj?.data?.result
      const errReason = errResult?.reason?.toString() || errObj?.data?.message || errObj?.message
      return {
        success: false,
        data: errResult
          ? {
              is_match: false,
              confidence_score:
                typeof errResult.confidence_score === 'number' ? errResult.confidence_score : 0,
              reason: errResult.reason?.toString() || '',
              spoof_type: errResult.spoof_type?.toString() || 'none',
            }
          : undefined,
        message: errReason || 'Gagal memproses verifikasi selfie. Silakan coba lagi.',
      }
    }
  }

  return {
    identityInfo,
    isLoading,
    errorMessage,
    isVerified,
    isSelfieVerified,
    ensureIdentityInfo,
    ensureSelfieInfo,
    fetchIdentityInfo,
    checkMlVision,
    uploadIdentity,
    verifySelfie,
  }
}

export function useIdentityKycModal() {
  const { uploadIdentity, checkMlVision, verifySelfie } = useIdentityKyc()
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

  const selfieImage = useState<string>('kyc_modal_selfie_image', () => '')
  const isSelfieVerifying = useState<boolean>('kyc_modal_selfie_verifying', () => false)
  const selfieResult = useState<SelfieVerifyResult | null>('kyc_modal_selfie_result', () => null)

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
    identityName.value = ''
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
      if (!mlRes.success || !mlRes.data) {
        capturedImage.value = ''
        errorMessage.value =
          mlRes.message ||
          'Identitas tidak terbaca. Pastikan foto jelas, tidak buram, dan kartu pas di dalam bingkai.'
        return
      }

      const nameStr = mlRes.data.name.trim()
      const numStr = mlRes.data.number.trim()

      if (!nameStr || !numStr) {
        capturedImage.value = ''
        errorMessage.value =
          'Identitas tidak terbaca. Pastikan foto jelas, tidak buram, dan kartu pas di dalam bingkai.'
        return
      }

      if (docType.value === 'KTP') {
        const cleanNik = numStr.replace(/\D/g, '')
        if (cleanNik.length !== 16) {
          capturedImage.value = ''
          errorMessage.value =
            'NIK tidak terbaca lengkap (harus 16 digit). Silakan foto ulang dengan posisi kartu yang jelas.'
          return
        }
        identityNumber.value = cleanNik
      } else {
        identityNumber.value = numStr
      }

      identityName.value = nameStr
      step.value = 'review'
    } catch {
      capturedImage.value = ''
      errorMessage.value =
        'Identitas tidak terbaca atau koneksi bermasalah. Silakan coba lagi.'
    } finally {
      isOcrLoading.value = false
    }
  }

  async function submitKyc() {
    if (!capturedImage.value) {
      errorMessage.value = 'Silakan ambil foto terlebih dahulu'
      return
    }

    const name = identityName.value.replace(/[<>]/g, '').trim()
    const num = identityNumber.value.trim()
    identityName.value = name

    if (!num) {
      errorMessage.value =
        docType.value === 'KTP'
          ? 'NIK wajib diisi'
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

    if (!name) {
      errorMessage.value = 'Nama wajib diisi'
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

  function openSelfie(options?: KycModalOptions) {
    if (options?.onSuccess) {
      pendingSuccessCallback = options.onSuccess
    } else {
      pendingSuccessCallback = null
    }
    featureReason.value = options?.reason || 'withdraw'
    featureName.value = options?.featureName || 'Tarik Saldo'
    step.value = 'selfie_intro'
    selfieImage.value = ''
    isSelfieVerifying.value = false
    selfieResult.value = null
    errorMessage.value = ''
    isOpen.value = true
  }

  function captureSelfieImage(base64Image: string) {
    selfieImage.value = base64Image
    errorMessage.value = ''
    step.value = 'selfie_preview'
  }

  async function submitSelfie() {
    if (!selfieImage.value) {
      errorMessage.value = 'Silakan ambil foto selfie terlebih dahulu'
      return
    }

    isSelfieVerifying.value = true
    selfieResult.value = null
    errorMessage.value = ''
    step.value = 'selfie_result'

    try {
      const res = await verifySelfie(selfieImage.value)
      selfieResult.value = res.data || {
        is_match: res.success,
        confidence_score: 0,
        reason: res.message,
        spoof_type: 'none',
      }

      if (res.success) {
        showNotification({
          type: 'success',
          message: 'Verifikasi selfie berhasil!',
        })
        if (pendingSuccessCallback) {
          pendingSuccessCallback()
          pendingSuccessCallback = null
        }
      } else {
        errorMessage.value = res.message
      }
    } catch {
      errorMessage.value = 'Gagal memverifikasi foto selfie. Silakan coba lagi.'
    } finally {
      isSelfieVerifying.value = false
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
    selfieImage,
    isSelfieVerifying,
    selfieResult,
    open,
    openSelfie,
    close,
    setStep,
    setDocType,
    processCapturedImage,
    submitKyc,
    captureSelfieImage,
    submitSelfie,
  }
}

