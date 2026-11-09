export type AuthStep =
  | 'login'
  | 'login-password'
  | 'login-otp'
  | 'make-password'
  | 'register-email'
  | 'register-name'
  | 'register-phone'
  | 'register-otp'
  | 'register-password'
  | 'register-avatar'
  | 'forgot-request'
  | 'forgot-method'
  | 'forgot-otp'
  | 'forgot-new'
  | 'forgot-success'
  | 'phone-verify'
  | 'location-ask'

export type AuthLoginTab = 'email' | 'phone'

export type OtpChannel = 'wa' | 'sms' | 'email'

export type OtpVerifyOrigin =
  | 'login_otp'
  | 'register_email'
  | 'register_phone'
  | 'forgot_password'
  | 'phone_verify'

export interface OtpMethodStatus {
  wa_lock: boolean
  sms_lock: boolean
  whatsapp_available: boolean
  sms_available: boolean
}

export interface AuthUserPayload {
  _id?: string
  id?: string
  user_id?: string
  name?: string
  username?: string
  email?: string
  phone?: string
  avatar?: string
  city?: string
  default_loc?: string
  default_lat?: number
  default_lon?: number
  phone_verify?: boolean
  is_verified?: boolean
  cart_count?: number
  unread_notifications?: number
  unread_messages?: number
}

export interface AuthCheckOtpMeta {
  ask?: boolean
  method?: string
}

export interface AuthApiResponse<T = any> {
  status: boolean
  message: string
  result?: T
  token?: string
  otp?: AuthCheckOtpMeta
  old_account?: boolean
  not_registered?: boolean
  email?: string
  name?: string
  avatar?: string
}

export interface AuthModalOptions {
  step?: AuthStep
  tab?: AuthLoginTab
  featureTitle?: string
  message?: string
  redirectPath?: string
  prefillIdentity?: string
  onSuccess?: () => void
}

export interface LoginDraft {
  identity: string
  tab: AuthLoginTab
  email: string
  phone: string
  userId: string
  userName: string
  userAvatar: string
  otpMethod: OtpChannel
  password: string
  newPassword: string
  confirmPassword: string
}

export interface RegisterDraft {
  email: string
  emailType: 'email' | 'gmail' | 'apple'
  emailVerified: boolean
  name: string
  phone: string
  phoneVerified: boolean
  otpMethod: OtpChannel
  password: string
  confirmPassword: string
  userId: string
  avatarUrl: string
}

export interface ForgotDraft {
  identity: string
  identityType: 'email' | 'phone'
  method: OtpChannel
  userId: string
  email: string
  phone: string
  maskedEmail: string
  maskedPhone: string
  maskedTarget: string
  otp: string
  password: string
  confirmPassword: string
}

