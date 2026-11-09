import { API_PASSWORD_MATCH, API_CHANGE_PASSWORD } from '~/utils/constants'

function sanitizeBackendError(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback
  const msg = raw.trim()
  if (!msg || msg.includes('Error:') || msg.includes('CastError') || msg.includes('stack') || msg.includes('at ')) {
    return fallback
  }
  return msg
}

export function usePasswordChange() {
  const api = useApi()

  const isVerifyingOld = ref(false)
  const isSubmittingNew = ref(false)
  const oldPasswordError = ref('')
  const formError = ref('')
  const isOldPasswordVerified = ref(false)
  const verifiedOldPassword = ref('')

  async function verifyOldPassword(password: string): Promise<boolean> {
    const trimmed = password.trim()
    if (!trimmed) {
      oldPasswordError.value = 'Password lama tidak boleh kosong'
      return false
    }

    oldPasswordError.value = ''
    isVerifyingOld.value = true

    try {
      const res = await api.post<Record<string, unknown>>(
        API_PASSWORD_MATCH,
        { password: trimmed },
        { usePaymentToken: true },
      )

      const isSuccess =
        res?.status === true ||
        res?.status === 1 ||
        String(res?.message || '').toUpperCase() === 'SUCCESS' ||
        res?.result === true

      if (isSuccess) {
        isOldPasswordVerified.value = true
        verifiedOldPassword.value = trimmed
        oldPasswordError.value = ''
        return true
      }

      oldPasswordError.value = sanitizeBackendError(
        res?.message,
        'Password lama salah, silakan coba lagi',
      )
      return false
    } catch (e: unknown) {
      const errObj = e as { data?: { message?: unknown }; message?: unknown }
      oldPasswordError.value = sanitizeBackendError(
        errObj?.data?.message ?? errObj?.message,
        'Password lama salah, silakan coba lagi',
      )
      return false
    } finally {
      isVerifyingOld.value = false
    }
  }

  async function submitNewPassword(newPassword: string): Promise<boolean> {
    if (!isOldPasswordVerified.value || !verifiedOldPassword.value) {
      formError.value = 'Silakan verifikasi password lama terlebih dahulu'
      return false
    }

    const trimmedNew = newPassword.trim()
    if (trimmedNew === verifiedOldPassword.value) {
      formError.value = 'Password baru harus berbeda dari password lama'
      return false
    }

    formError.value = ''
    isSubmittingNew.value = true

    try {
      const res = await api.post<Record<string, unknown>>(API_CHANGE_PASSWORD, {
        old_password: verifiedOldPassword.value,
        new_password: trimmedNew,
      })

      const isSuccess =
        res?.status === true ||
        res?.status === 1 ||
        String(res?.message || '').toUpperCase() === 'SUCCESS'

      if (isSuccess) {
        resetState()
        return true
      }

      formError.value = sanitizeBackendError(
        res?.message,
        'Gagal mengubah password. Silakan coba lagi.',
      )
      return false
    } catch (e: unknown) {
      const errObj = e as { data?: { message?: unknown }; message?: unknown }
      formError.value = sanitizeBackendError(
        errObj?.data?.message ?? errObj?.message,
        'Terjadi kesalahan koneksi saat mengubah password.',
      )
      return false
    } finally {
      isSubmittingNew.value = false
    }
  }

  function resetState() {
    isVerifyingOld.value = false
    isSubmittingNew.value = false
    oldPasswordError.value = ''
    formError.value = ''
    isOldPasswordVerified.value = false
    verifiedOldPassword.value = ''
  }

  return {
    isVerifyingOld,
    isSubmittingNew,
    oldPasswordError,
    formError,
    isOldPasswordVerified,
    verifiedOldPassword,
    verifyOldPassword,
    submitNewPassword,
    resetState,
  }
}
