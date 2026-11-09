import {
  TOKEN_AUTH,
  API_AUTH_OTP_METHODS,
  API_AUTH_CHECK_ACCOUNT,
  API_AUTH_RESEND_OTP,
  API_AUTH_LOGIN_OTP,
  API_AUTH_PASSWORD_CREATE,
  API_AUTH_LOGIN_PASSWORD,
  API_AUTH_LOGIN_SOCIAL,
  API_FORGOT_PASSWORD_OTP,
  API_FORGOT_PASSWORD_OTP_CHECK,
  API_FORGOT_PASSWORD_NEW,
  API_FREEOTP_SEND,
  API_FREEOTP_VERIFY,
  API_ACCOUNT_AVAILABILITY,
  API_REGISTER,
  API_PHONE_VERIFY,
  API_AVATAR,
  API_LOCATION,
} from '~/utils/constants'
import type { AuthApiResponse, OtpMethodStatus, AuthUserPayload } from '~/types/auth'

export function useAuthApi() {
  const api = useApi()

  const authHeaders = {
    'x-auth-token': `Bearer ${TOKEN_AUTH}`,
  }

  async function safeAuthPost<T = any>(path: string, body: any = {}): Promise<AuthApiResponse<T>> {
    try {
      const raw = await api.post<any>(path, body, {
        headers: authHeaders,
        skipAuthRefresh: true,
      })

      const isSuccess =
        raw?.message === 'Success' ||
        raw?.status === true ||
        (raw?.result !== undefined && raw?.message !== 'Failed')

      return {
        status: Boolean(isSuccess),
        message: raw?.message || (isSuccess ? 'Success' : 'Terjadi kesalahan'),
        result: raw?.result,
        token: raw?.token,
        otp: raw?.otp,
        old_account: raw?.old_account,
        not_registered: raw?.not_registered,
        email: raw?.email,
        name: raw?.name,
        avatar: raw?.avatar,
      }
    } catch (err: any) {
      const data = err?.data || err?.response?._data || {}
      const msg =
        data?.message ||
        err?.statusMessage ||
        'Gagal terhubung ke server. Periksa koneksi Anda.'
      return {
        status: false,
        message: String(msg),
        result: data?.result,
        otp: data?.otp,
        not_registered: Boolean(data?.not_registered),
        email: data?.email,
        name: data?.name,
        avatar: data?.avatar,
      }
    }
  }

  async function checkOtpMethods(): Promise<OtpMethodStatus> {
    const res = await safeAuthPost<Partial<OtpMethodStatus>>(API_AUTH_OTP_METHODS, {})
    const r = res.result || {}
    const waLock = Boolean(r.wa_lock ?? (r.whatsapp_available === false))
    const smsLock = Boolean(r.sms_lock ?? (r.sms_available === false))
    return {
      wa_lock: waLock,
      sms_lock: smsLock,
      whatsapp_available: !waLock,
      sms_available: !smsLock,
    }
  }

  async function checkAccount(payload: {
    username: string
    username_type: 'email' | 'phone'
    otp_method?: string
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    return safeAuthPost<AuthUserPayload>(API_AUTH_CHECK_ACCOUNT, {
      username: payload.username,
      username_type: payload.username_type,
      otp_method: payload.otp_method || '',
      lang: 'id',
    })
  }

  async function loginWithPassword(payload: {
    user_id: string
    password: string
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    return safeAuthPost<AuthUserPayload>(API_AUTH_LOGIN_PASSWORD, {
      user_id: payload.user_id,
      password: payload.password,
      fb_token: 'web_client',
    })
  }

  async function resendLoginOtp(payload: {
    user_id: string
    phone?: string
    email?: string
    method: 'wa' | 'sms' | 'email'
  }): Promise<AuthApiResponse> {
    const body: Record<string, any> = {
      user_id: payload.user_id,
      method: payload.method,
    }
    if (payload.phone) body.phone = payload.phone
    if (payload.email) body.email = payload.email
    return safeAuthPost(API_AUTH_RESEND_OTP, body)
  }

  async function loginWithOtp(payload: {
    user_id: string
    otp: string
    phone?: string
    email?: string
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    const body: Record<string, any> = {
      user_id: payload.user_id,
      otp: payload.otp,
      fb_token: 'web_client',
    }
    if (payload.phone) body.phone = payload.phone
    if (payload.email) body.email = payload.email
    return safeAuthPost<AuthUserPayload>(API_AUTH_LOGIN_OTP, body)
  }

  async function createPassword(payload: {
    user_id: string
    password: string
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    return safeAuthPost<AuthUserPayload>(API_AUTH_PASSWORD_CREATE, {
      user_id: payload.user_id,
      password: payload.password,
    })
  }

  async function loginSocial(payload: {
    provider: 'google' | 'apple'
    id_token: string
    access_token?: string
    email: string
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    return safeAuthPost<AuthUserPayload>(API_AUTH_LOGIN_SOCIAL, {
      provider: payload.provider,
      id_token: payload.id_token,
      access_token: payload.access_token || '',
      email: payload.email,
      fb_token: 'web_client',
      lang: 'id',
    })
  }

  async function checkAvailability(payload: {
    email?: string
    phone?: string
  }): Promise<AuthApiResponse> {
    const body: Record<string, string> = {}
    if (payload.email) body.email = payload.email
    if (payload.phone) body.phone = payload.phone
    return safeAuthPost(API_ACCOUNT_AVAILABILITY, body)
  }

  async function sendFreeOtp(payload: {
    method: 'wa' | 'sms' | 'email'
    phone?: string
    email?: string
  }): Promise<AuthApiResponse> {
    const body: Record<string, string> = { method: payload.method }
    if (payload.phone) body.phone = payload.phone
    if (payload.email) body.email = payload.email
    return safeAuthPost(API_FREEOTP_SEND, body)
  }

  async function verifyFreeOtp(payload: {
    otp: string
    phone?: string
    email?: string
  }): Promise<AuthApiResponse> {
    const body: Record<string, string> = { otp: payload.otp }
    if (payload.phone) body.phone = payload.phone
    if (payload.email) body.email = payload.email
    return safeAuthPost(API_FREEOTP_VERIFY, body)
  }

  async function registerUser(payload: {
    email: string
    email_type?: 'email' | 'gmail' | 'apple'
    name: string
    psw: string
    avatar?: string
    phone: string
    phone_verify?: boolean
    default_loc: string
    default_lat: number
    default_lon: number
  }): Promise<AuthApiResponse<AuthUserPayload>> {
    return safeAuthPost<AuthUserPayload>(API_REGISTER, {
      email: payload.email,
      email_type: payload.email_type || 'email',
      name: payload.name,
      psw: payload.psw,
      avatar: payload.avatar || '',
      phone: payload.phone,
      phone_verify: payload.phone_verify ?? true,
      fb_token: 'web_client',
      default_loc: payload.default_loc,
      default_lat: payload.default_lat,
      default_lon: payload.default_lon,
    })
  }

  async function uploadAvatar(userId: string, file: File): Promise<AuthApiResponse<{ avatar?: string }>> {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('avatar', file)
    return safeAuthPost<{ avatar?: string }>(API_AVATAR, formData)
  }

  async function verifyPhoneAccount(payload: {
    user_id: string
    phone: string
  }): Promise<AuthApiResponse> {
    return safeAuthPost(API_PHONE_VERIFY, {
      user_id: payload.user_id,
      phone: payload.phone,
    })
  }

  async function requestForgotOtp(payload: {
    identity: string
    method: 'email' | 'wa' | 'sms'
  }): Promise<AuthApiResponse<{ user_id?: string; email?: string; phone?: string }>> {
    return safeAuthPost(API_FORGOT_PASSWORD_OTP, {
      identity: payload.identity,
      method: payload.method,
    })
  }

  async function verifyForgotOtp(payload: {
    user_id: string
    username: string
    otp: string
  }): Promise<AuthApiResponse> {
    return safeAuthPost(API_FORGOT_PASSWORD_OTP_CHECK, {
      user_id: payload.user_id,
      username: payload.username,
      otp: payload.otp,
    })
  }

  async function submitNewPassword(payload: {
    user_id: string
    password: string
    password_confirmation?: string
  }): Promise<AuthApiResponse> {
    return safeAuthPost(API_FORGOT_PASSWORD_NEW, {
      user_id: payload.user_id,
      password: payload.password,
      password_confirmation: payload.password_confirmation || payload.password,
    })
  }

  async function saveUserLocation(payload: {
    user_id: string
    default_loc: string
    default_lat: number
    default_lon: number
  }): Promise<AuthApiResponse> {
    return safeAuthPost(API_LOCATION, payload)
  }

  return {
    checkOtpMethods,
    checkAccount,
    loginWithPassword,
    resendLoginOtp,
    loginWithOtp,
    createPassword,
    loginSocial,
    checkAvailability,
    sendFreeOtp,
    verifyFreeOtp,
    registerUser,
    uploadAvatar,
    verifyPhoneAccount,
    requestForgotOtp,
    verifyForgotOtp,
    submitNewPassword,
    saveUserLocation,
  }
}

