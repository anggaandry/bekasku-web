import type { ProfileData, UpdateProfilePayload, AccountSettingData } from '~/types/account'
import {
  API_PROFILE_INFO,
  API_PROFILE_UPDATE,
  API_ACCOUNT_SETTING_INFO,
  API_ACCOUNT_DELETE,
  API_ACCOUNT_CANCEL_DELETE,
  API_AVATAR,
  API_NOTIFICATION_SWITCH,
  API_NOTIFICATION_SWITCH_CHANGE,
  API_PROFILE_SOCIAL_CODE,
  API_PROFILE_SOCIAL_VERIFY,
  API_PROFILE_SOCIAL_DISCONNECT,
  API_IDENTITY_INFO,
} from '~/utils/constants'
import type { IdentityInfoData } from '~/types/identity'


export function useProfile() {
  const api = useApi()
  const authStore = useAuthStore()

  const profile = useState<ProfileData | null>('user_profile_data', () => (authStore.user as unknown as ProfileData) || null)
  const accountSetting = useState<AccountSettingData | null>('user_account_setting_data', () => null)
  const identityInfo = useState<IdentityInfoData | null>('user_identity_info_data', () => null)
  const notificationList = useState<string[]>('user_notification_list', () => [])
  const isLoading = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const successMessage = ref<string>('')

  // Seed profile from authStore if available and not yet set
  if (!profile.value && authStore.user) {
    profile.value = authStore.user as unknown as ProfileData
  }

  async function fetchProfileInfo(forceLoading = false): Promise<ProfileData | null> {
    if (!authStore.isLoggedIn) return null
    if (!profile.value || forceLoading) {
      isLoading.value = true
    }
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: ProfileData }>(API_PROFILE_INFO, {})
      if (res && res.result) {
        profile.value = res.result
        return res.result
      }
      return null
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string }
      errorMessage.value = errObj?.data?.message || errObj?.message || 'Gagal memuat profil akun'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAccountSetting(): Promise<AccountSettingData | null> {
    if (!authStore.isLoggedIn) return null
    try {
      const res = await api.post<{ message?: string; result?: AccountSettingData }>(
        API_ACCOUNT_SETTING_INFO,
        { lang: 'id' }
      )
      if (res && res.result) {
        accountSetting.value = res.result
        return res.result
      }
      return null
    } catch {
      return null
    }
  }

  async function updateProfile(payload: UpdateProfilePayload): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: any }>(API_PROFILE_UPDATE, payload)
      successMessage.value = res?.message || 'Profil berhasil diperbarui'
      await authStore.fetchProfile()
      await fetchProfileInfo()
      return { success: true, message: successMessage.value }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal memperbarui profil'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function uploadAvatar(file: File): Promise<{ success: boolean; url?: string; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const formData = new FormData()
      formData.append('user_id', authStore.userId)
      formData.append('avatar', file)

      const res = await api.post<{ message?: string; result?: any }>(API_AVATAR, formData)
      const newAvatarUrl = res?.result?.avatar || ''
      if (newAvatarUrl) {
        authStore.updateAvatar(newAvatarUrl)
        if (profile.value) {
          profile.value.avatar = newAvatarUrl
        }
      }
      return {
        success: true,
        url: newAvatarUrl,
        message: 'Foto profil berhasil diubah',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal mengunggah foto profil'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteAccount(): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: any }>(API_ACCOUNT_DELETE, {})
      await fetchAccountSetting()
      await fetchProfileInfo()
      return {
        success: true,
        message: res?.message || 'Pengajuan penghapusan akun berhasil dicatat',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal mengajukan penghapusan akun'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function cancelDeleteAccount(): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: any }>(API_ACCOUNT_CANCEL_DELETE, {})
      await fetchAccountSetting()
      await fetchProfileInfo()
      return {
        success: true,
        message: res?.message || 'Penghapusan akun berhasil dibatalkan',
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal membatalkan penghapusan akun'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function fetchNotifications(): Promise<string[]> {
    if (!authStore.isLoggedIn) return []
    try {
      const res = await api.post<{ message?: string; result?: string[] }>(API_NOTIFICATION_SWITCH, {})
      const list = Array.isArray(res?.result) ? res.result : []
      notificationList.value = list
      return list
    } catch {
      return []
    }
  }

  async function updateNotifications(list: string[]): Promise<boolean> {
    try {
      await api.post(API_NOTIFICATION_SWITCH_CHANGE, { notification: list })
      notificationList.value = list
      return true
    } catch {
      return false
    }
  }

  async function getSocialCode(type: 'instagram' | 'tiktok'): Promise<string> {
    try {
      const res = await api.post<{ message?: string; result?: { code?: string } }>(
        API_PROFILE_SOCIAL_CODE,
        { type }
      )
      return res?.result?.code || ''
    } catch {
      return ''
    }
  }

  async function verifySocialCode(
    type: 'instagram' | 'tiktok',
    username: string,
    clientVerified = true
  ): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: any }>(
        API_PROFILE_SOCIAL_VERIFY,
        {
          type,
          username: username.replace('@', '').trim(),
          client_verified: clientVerified,
        }
      )
      await fetchProfileInfo()
      return { success: true, message: res?.message || 'Akun sosial media berhasil terhubung' }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal memverifikasi akun sosial media'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function disconnectSocial(type: 'instagram' | 'tiktok'): Promise<{ success: boolean; message: string }> {
    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const res = await api.post<{ message?: string; result?: any }>(
        API_PROFILE_SOCIAL_DISCONNECT,
        { type }
      )
      await fetchProfileInfo()
      return { success: true, message: res?.message || 'Sambungan akun berhasil diputus' }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Gagal memutuskan akun'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmitting.value = false
    }
  }

  async function fetchIdentityInfo(): Promise<IdentityInfoData | null> {
    if (!authStore.isLoggedIn) return null
    try {
      const res = await api.post<{ message?: string; result?: IdentityInfoData }>(
        API_IDENTITY_INFO,
        {}
      )
      if (res && res.result) {
        identityInfo.value = res.result
        return res.result
      }
      return null
    } catch {
      return null
    }
  }

  return {
    profile,
    accountSetting,
    identityInfo,
    notificationList,
    isLoading,
    isSubmitting,
    errorMessage,
    successMessage,
    fetchProfileInfo,
    fetchAccountSetting,
    updateProfile,
    uploadAvatar,
    deleteAccount,
    cancelDeleteAccount,
    fetchNotifications,
    updateNotifications,
    getSocialCode,
    verifySocialCode,
    disconnectSocial,
    fetchIdentityInfo,
  }
}

