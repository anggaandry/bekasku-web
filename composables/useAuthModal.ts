import {
  DEFAULT_LOCATION,
  DEFAULT_LAT,
  DEFAULT_LON,
  NAME_MIN_LENGTH,
  OTP_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  STORAGE_KEY_LOCATION,
  STORAGE_KEY_PENDING_HELP_POPUP,
} from '~/utils/constants'
import {
  normalizePhoneTo62,
  formatPhoneLocalDisplay,
  isValidEmailAddress,
} from '~/composables/usePasswordRules'
import { sanitizeMediaUrl } from '~/utils/media'
import { useAuthStore } from '~/stores/auth'
import type {
  AuthStep,
  AuthLoginTab,
  AuthModalOptions,
  OtpChannel,
  OtpMethodStatus,
  OtpVerifyOrigin,
  LoginDraft,
  RegisterDraft,
  ForgotDraft,
  AuthUserPayload,
} from '~/types/auth'

let pendingOnSuccessCallback: (() => void) | null = null

export function sanitizeRedirectPath(raw?: unknown): string {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return ''
  }
  return trimmed
}

export function useAuthModal() {
  const authApi = useAuthApi()
  const authStore = useAuthStore()

  const isOpen = useState<boolean>('auth_modal_open', () => false)
  const step = useState<AuthStep>('auth_modal_step', () => 'login')
  const featureTitle = useState<string>('auth_modal_feature_title', () => '')
  const customMessage = useState<string>('auth_modal_custom_message', () => '')
  const redirectPath = useState<string>('auth_modal_redirect_path', () => '')
  const errorMsg = useState<string>('auth_modal_error', () => '')
  const infoMsg = useState<string>('auth_modal_info', () => '')
  const isSubmitting = useState<boolean>('auth_modal_submitting', () => false)
  const isReloading = useState<boolean>('auth_modal_reloading', () => false)
  const reloadingTitle = useState<string>('auth_modal_reloading_title', () => '')
  const reloadingSubtitle = useState<string>('auth_modal_reloading_subtitle', () => '')
  const otpOrigin = useState<OtpVerifyOrigin>('auth_modal_otp_origin', () => 'login_otp')

  const otpMethods = useState<OtpMethodStatus>('auth_modal_otp_methods', () => ({
    wa_lock: false,
    sms_lock: false,
    whatsapp_available: true,
    sms_available: true,
  }))

  const loginDraft = useState<LoginDraft>('auth_modal_login_draft', () => ({
    identity: '',
    tab: 'email',
    email: '',
    phone: '',
    userId: '',
    userName: '',
    userAvatar: '',
    otpMethod: 'sms',
    password: '',
    newPassword: '',
    confirmPassword: '',
  }))

  const registerDraft = useState<RegisterDraft>('auth_modal_register_draft', () => ({
    email: '',
    emailType: 'email',
    emailVerified: false,
    name: '',
    phone: '',
    phoneVerified: false,
    otpMethod: 'wa',
    password: '',
    confirmPassword: '',
    userId: '',
    avatarUrl: '',
  }))

  const forgotDraft = useState<ForgotDraft>('auth_modal_forgot_draft', () => ({
    identity: '',
    identityType: 'email',
    method: 'email',
    userId: '',
    email: '',
    phone: '',
    maskedEmail: '',
    maskedPhone: '',
    maskedTarget: '',
    otp: '',
    password: '',
    confirmPassword: '',
  }))

  const phoneVerifyDraft = useState<{
    phone: string
    method: OtpChannel
    otpSent: boolean
  }>('auth_modal_phone_verify_draft', () => ({
    phone: '',
    method: 'wa',
    otpSent: false,
  }))

  function clearMessages() {
    errorMsg.value = ''
    infoMsg.value = ''
  }

  async function refreshOtpMethods() {
    const status = await authApi.checkOtpMethods()
    otpMethods.value = status
    const defaultChannel: OtpChannel = !status.wa_lock ? 'wa' : !status.sms_lock ? 'sms' : 'wa'
    if (loginDraft.value.otpMethod === 'wa' && status.wa_lock && !status.sms_lock) {
      loginDraft.value.otpMethod = 'sms'
    }
    if (registerDraft.value.otpMethod === 'wa' && status.wa_lock && !status.sms_lock) {
      registerDraft.value.otpMethod = 'sms'
    }
    if (phoneVerifyDraft.value.method === 'wa' && status.wa_lock && !status.sms_lock) {
      phoneVerifyDraft.value.method = defaultChannel
    }
  }

  function openLogin(opts: AuthModalOptions = {}) {
    clearMessages()
    featureTitle.value = opts.featureTitle || ''
    customMessage.value = opts.message || ''
    redirectPath.value = sanitizeRedirectPath(opts.redirectPath)
    pendingOnSuccessCallback = opts.onSuccess || null
    step.value = opts.step || 'login'
    if (opts.tab) {
      loginDraft.value.tab = opts.tab
    }
    if (opts.prefillIdentity) {
      loginDraft.value.identity = opts.prefillIdentity
      if (opts.prefillIdentity.includes('@')) {
        loginDraft.value.tab = 'email'
        loginDraft.value.email = opts.prefillIdentity
      } else {
        loginDraft.value.tab = 'phone'
        loginDraft.value.phone = formatPhoneLocalDisplay(opts.prefillIdentity)
      }
    }
    isOpen.value = true
    refreshOtpMethods()
  }

  function openRegister(opts: AuthModalOptions = {}) {
    clearMessages()
    featureTitle.value = opts.featureTitle || ''
    customMessage.value = opts.message || ''
    redirectPath.value = sanitizeRedirectPath(opts.redirectPath)
    pendingOnSuccessCallback = opts.onSuccess || null
    if (opts.prefillIdentity && opts.prefillIdentity.includes('@')) {
      registerDraft.value.email = opts.prefillIdentity
    }
    step.value = 'register-email'
    isOpen.value = true
    refreshOtpMethods()
  }

  function openForgotPassword(prefillIdentity?: string) {
    clearMessages()
    if (prefillIdentity) {
      forgotDraft.value.identity = prefillIdentity
    } else if (loginDraft.value.identity) {
      forgotDraft.value.identity = loginDraft.value.identity.trim()
    } else if (loginDraft.value.email) {
      forgotDraft.value.identity = loginDraft.value.email
    } else if (loginDraft.value.phone) {
      forgotDraft.value.identity = `0${formatPhoneLocalDisplay(loginDraft.value.phone)}`
    }
    step.value = 'forgot-request'
    isOpen.value = true
    refreshOtpMethods()
  }

  function openPhoneVerify(opts: AuthModalOptions = {}) {
    clearMessages()
    featureTitle.value = opts.featureTitle || 'Verifikasi Nomor HP'
    customMessage.value = opts.message || ''
    redirectPath.value = sanitizeRedirectPath(opts.redirectPath)
    pendingOnSuccessCallback = opts.onSuccess || null
    phoneVerifyDraft.value.phone = formatPhoneLocalDisplay(authStore.user?.phone || '')
    phoneVerifyDraft.value.otpSent = false
    step.value = 'phone-verify'
    isOpen.value = true
    refreshOtpMethods()
  }

  function openLocationAsk() {
    clearMessages()
    step.value = 'location-ask'
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    clearMessages()
    if (import.meta.client && !isReloading.value && !authStore.isLoggedIn) {
      try {
        sessionStorage.removeItem(STORAGE_KEY_PENDING_HELP_POPUP)
      } catch {
        // ignore
      }
    }
  }

  function switchToStep(nextStep: AuthStep) {
    clearMessages()
    step.value = nextStep
  }

  function goBack() {
    clearMessages()
    switch (step.value) {
      case 'login-password':
      case 'login-otp':
      case 'make-password':
      case 'register-email':
      case 'forgot-request':
        step.value = 'login'
        break
      case 'register-otp':
        step.value = 'register-phone'
        break
      case 'register-phone':
        step.value = 'register-email'
        break
      case 'register-password':
        step.value = 'register-phone'
        break
      case 'register-avatar':
        closeModal()
        break
      case 'forgot-method':
        step.value = 'forgot-request'
        break
      case 'forgot-otp':
        step.value = 'forgot-method'
        break
      case 'forgot-new':
        step.value = 'forgot-method'
        break
      case 'forgot-success':
        step.value = 'login'
        break
      case 'phone-verify':
      case 'location-ask':
        closeModal()
        break
      default:
        closeModal()
    }
  }

  function triggerAuthReload(title: string, subtitle: string, targetUrl?: string) {
    const safeUrl = sanitizeRedirectPath(targetUrl)
    closeModal()
    reloadingTitle.value = title
    reloadingSubtitle.value = subtitle
    isReloading.value = true
    if (import.meta.client) {
      setTimeout(() => {
        if (safeUrl) {
          window.location.href = safeUrl
        } else {
          window.location.reload()
        }
      }, 250)
      return
    }
    if (safeUrl) {
      navigateTo(safeUrl)
    }
  }

  function finalizeSuccessNavigation() {
    const target = redirectPath.value
    const cb = pendingOnSuccessCallback
    redirectPath.value = ''
    featureTitle.value = ''
    customMessage.value = ''
    pendingOnSuccessCallback = null
    if (cb) {
      cb()
    }
    triggerAuthReload(
      'Berhasil Masuk',
      'Sedang menyiapkan sesi akun Anda...',
      target || undefined,
    )
  }

  async function completeAuthSession(userPayload: AuthUserPayload, jwtToken?: string) {
    const resolvedToken = jwtToken || authStore.token || 'session_active'
    authStore.setSession(userPayload, resolvedToken)
    finalizeSuccessNavigation()
  }

  // =========================================================================
  // FLOW 07: LOGIN ACTIONS (Sesuai LoginController & LoginPhoneController V3)
  // =========================================================================
  async function submitLoginCheck() {
    clearMessages()
    const rawInput = (loginDraft.value.identity || '').trim()
    if (!rawInput) {
      errorMsg.value = 'Email atau Nomor HP wajib diisi.'
      return
    }

    const isEmailInput = rawInput.includes('@') || /[a-zA-Z]/.test(rawInput)

    if (isEmailInput) {
      const email = rawInput.toLowerCase()
      if (!isValidEmailAddress(email)) {
        errorMsg.value = 'Format alamat email tidak valid.'
        return
      }
      loginDraft.value.tab = 'email'
      loginDraft.value.email = email

      isSubmitting.value = true
      try {
        const res = await authApi.checkAccount({
          username: email,
          username_type: 'email',
          otp_method: '',
        })
        if (res.status && res.result) {
          loginDraft.value.userId = String(res.result.user_id || res.result._id || res.result.id || '')
          loginDraft.value.userName = res.result.name || email
          loginDraft.value.userAvatar = sanitizeMediaUrl(res.result.avatar, '')
          loginDraft.value.password = ''

          if (res.otp?.ask && res.otp?.method === 'email') {
            otpOrigin.value = 'login_otp'
            loginDraft.value.otpMethod = 'email'
            step.value = 'login-otp'
          } else {
            step.value = 'login-password'
          }
          return
        }

        const lowerMsg = (res.message || '').toLowerCase()
        if (lowerMsg.includes('terdaftar') || lowerMsg.includes('belum') || lowerMsg.includes('not found') || lowerMsg.includes('email')) {
          registerDraft.value.email = email
          registerDraft.value.emailType = 'email'
          registerDraft.value.name = email.split('@')[0] || ''
          step.value = 'register-phone'
          infoMsg.value = 'Akun belum terdaftar, silakan lengkapi nomor handphone untuk mendaftar akun baru.'
          return
        }

        errorMsg.value = res.message || 'Gagal memeriksa akun.'
      } finally {
        isSubmitting.value = false
      }
    } else {
      const rawDigits = rawInput.replace(/[\s-]/g, '').replace(/^\+/, '')
      if (rawDigits.length < PHONE_MIN_LENGTH || rawDigits.length > PHONE_MAX_LENGTH) {
        errorMsg.value = 'Nomor HP minimal 10 digit dan maksimal 14 digit.'
        return
      }
      loginDraft.value.tab = 'phone'
      loginDraft.value.phone = formatPhoneLocalDisplay(rawDigits)

      isSubmitting.value = true
      try {
        const res = await authApi.checkAccount({
          username: rawDigits,
          username_type: 'phone',
        })
        if (res.status && res.result) {
          loginDraft.value.userId = String(res.result.user_id || res.result._id || res.result.id || '')
          loginDraft.value.userName = res.result.name || rawDigits
          loginDraft.value.userAvatar = sanitizeMediaUrl(res.result.avatar, '')
          loginDraft.value.password = ''
          step.value = 'login-password'
          return
        }

        const lowerMsg = (res.message || '').toLowerCase()
        if (
          lowerMsg.includes('tidak terdaftar') ||
          lowerMsg.includes('belum terdaftar') ||
          lowerMsg.includes('silahkan daftar') ||
          lowerMsg.includes('terdaftar')
        ) {
          registerDraft.value.phone = formatPhoneLocalDisplay(rawDigits)
          step.value = 'register-email'
          infoMsg.value = 'Nomor HP belum terdaftar, silakan masukkan email untuk mendaftar akun baru.'
          return
        }

        errorMsg.value = res.message || 'Gagal memeriksa nomor handphone.'
      } finally {
        isSubmitting.value = false
      }
    }
  }

  async function submitLoginPassword() {
    clearMessages()
    if (!loginDraft.value.password) {
      errorMsg.value = 'Password tidak boleh kosong.'
      return
    }
    isSubmitting.value = true
    try {
      const res = await authApi.loginWithPassword({
        user_id: loginDraft.value.userId,
        password: loginDraft.value.password,
      })
      if (res.status && res.result) {
        if (res.result.phone_verify === false && res.result.phone) {
          authStore.setSession(res.result, res.token || 'session_active')
          loginDraft.value.userId = String(res.result.id || res.result._id || loginDraft.value.userId)
          loginDraft.value.phone = formatPhoneLocalDisplay(res.result.phone)
          loginDraft.value.otpMethod = 'sms'
          otpOrigin.value = 'login_otp'
          await authApi.resendLoginOtp({
            user_id: loginDraft.value.userId,
            phone: normalizePhoneTo62(res.result.phone),
            method: 'sms',
          })
          step.value = 'login-otp'
          return
        }
        await completeAuthSession(res.result, res.token)
      } else {
        errorMsg.value = res.message || 'Password yang Anda masukkan salah.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitSocialAuth(provider: 'google' | 'apple') {
    clearMessages()
    const { signInWithGoogle, signInWithApple } = useFirebase()

    isSubmitting.value = true
    try {
      const cred = provider === 'google'
        ? await signInWithGoogle()
        : await signInWithApple()

      if (!cred || !cred.idToken) {
        errorMsg.value = `Gagal mendapatkan token otentikasi ${provider === 'google' ? 'Google' : 'Apple'}.`
        return
      }

      const res = await authApi.loginSocial({
        provider,
        id_token: cred.idToken,
        access_token: cred.accessToken,
        email: cred.email,
      })

      if (res.status && res.result) {
        if (res.old_account) {
          authStore.setSession(res.result, res.token || 'session_active')
          loginDraft.value.userId = String(res.result.id || res.result._id || res.result.user_id || '')
          step.value = 'make-password'
          return
        }
        if (res.result.phone_verify === false && res.result.phone) {
          authStore.setSession(res.result, res.token || 'session_active')
          loginDraft.value.userId = String(res.result.id || res.result._id || res.result.user_id || '')
          loginDraft.value.phone = formatPhoneLocalDisplay(res.result.phone)
          loginDraft.value.otpMethod = 'sms'
          otpOrigin.value = 'login_otp'
          await authApi.resendLoginOtp({
            user_id: loginDraft.value.userId,
            phone: normalizePhoneTo62(res.result.phone),
            method: 'sms',
          })
          step.value = 'login-otp'
          return
        }
        await completeAuthSession(res.result, res.token)
      } else if (res.not_registered || (res.message || '').toLowerCase().includes('belum terdaftar')) {
        const resolvedEmail = (res.email || cred.email || '').trim().toLowerCase()
        const resolvedName = (res.name || cred.name || resolvedEmail.split('@')[0] || '').trim()
        registerDraft.value.email = resolvedEmail
        registerDraft.value.emailType = provider === 'google' ? 'gmail' : 'apple'
        registerDraft.value.emailVerified = Boolean(resolvedEmail)
        registerDraft.value.name = resolvedName
        registerDraft.value.avatarUrl = sanitizeMediaUrl(res.avatar || cred.photoUrl, '')
        step.value = resolvedEmail ? 'register-phone' : 'register-email'
        infoMsg.value = 'Akun belum terdaftar, silakan lengkapi nomor handphone untuk mendaftar.'
      } else {
        errorMsg.value = res.message || `Autentikasi ${provider === 'google' ? 'Google' : 'Apple'} gagal.`
      }
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return
      }
      if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
        errorMsg.value = `Layanan login ${provider === 'google' ? 'Google' : 'Apple'} belum diaktifkan di Firebase Console.`
        return
      }
      errorMsg.value = err?.message || `Terjadi kesalahan saat masuk dengan ${provider === 'google' ? 'Google' : 'Apple'}.`
    } finally {
      isSubmitting.value = false
    }
  }

  async function switchPasswordToEmailOtp() {
    clearMessages()
    isSubmitting.value = true
    try {
      const res = await authApi.resendLoginOtp({
        user_id: loginDraft.value.userId,
        email: loginDraft.value.email.trim(),
        method: 'email',
      })
      if (res.status) {
        otpOrigin.value = 'login_otp'
        loginDraft.value.otpMethod = 'email'
        step.value = 'login-otp'
        infoMsg.value = `Kode OTP telah dikirim ke ${loginDraft.value.email}`
      } else {
        errorMsg.value = res.message || 'Gagal mengirim OTP ke email.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitMakePassword() {
    clearMessages()
    if (loginDraft.value.newPassword !== loginDraft.value.confirmPassword) {
      errorMsg.value = 'Konfirmasi kata sandi tidak cocok.'
      return
    }
    isSubmitting.value = true
    try {
      const res = await authApi.createPassword({
        user_id: loginDraft.value.userId,
        password: loginDraft.value.newPassword,
      })
      if (res.status && res.result) {
        await completeAuthSession(res.result, res.token)
      } else {
        errorMsg.value = res.message || 'Gagal menyimpan kata sandi baru.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // =========================================================================
  // FLOW 08: REGISTER ACTIONS (Sesuai RegisterController V3)
  // =========================================================================
  async function submitRegisterEmail() {
    clearMessages()
    const email = registerDraft.value.email.trim().toLowerCase()
    if (!isValidEmailAddress(email)) {
      errorMsg.value = 'Masukkan alamat email yang valid.'
      return
    }
    isSubmitting.value = true
    try {
      const avail = await authApi.checkAvailability({ email })
      if (!avail.status) {
        errorMsg.value = avail.message || 'Email sudah digunakan. Silakan gunakan email lain atau masuk.'
        return
      }
      registerDraft.value.emailVerified = true
      registerDraft.value.name = email.split('@')[0] || ''
      step.value = 'register-phone'
    } finally {
      isSubmitting.value = false
    }
  }

  function submitRegisterName() {
    clearMessages()
    if (registerDraft.value.name.trim().length < NAME_MIN_LENGTH) {
      errorMsg.value = `Nama lengkap minimal ${NAME_MIN_LENGTH} karakter.`
      return
    }
    step.value = 'register-phone'
  }

  async function submitRegisterPhone(selectedMethod?: OtpChannel) {
    clearMessages()
    const cleanDigits = formatPhoneLocalDisplay(registerDraft.value.phone)
    if (cleanDigits.length < PHONE_MIN_LENGTH - 1 || cleanDigits.length > PHONE_MAX_LENGTH) {
      errorMsg.value = 'Nomor HP harus terdiri dari 10 hingga 14 digit angka.'
      return
    }
    const phone62 = normalizePhoneTo62(cleanDigits)
    const method = selectedMethod || registerDraft.value.otpMethod || 'wa'
    registerDraft.value.otpMethod = method

    isSubmitting.value = true
    try {
      const avail = await authApi.checkAvailability({ phone: phone62 })
      if (!avail.status) {
        errorMsg.value = avail.message || 'Nomor handphone sudah digunakan akun lain.'
        return
      }
      const otpRes = await authApi.sendFreeOtp({
        method,
        phone: phone62,
      })
      if (otpRes.status) {
        otpOrigin.value = 'register_phone'
        step.value = 'register-otp'
      } else {
        errorMsg.value = otpRes.message || 'Gagal mengirim kode OTP ke nomor HP.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitRegisterAccount() {
    clearMessages()
    if (registerDraft.value.password !== registerDraft.value.confirmPassword) {
      errorMsg.value = 'Konfirmasi kata sandi tidak cocok.'
      return
    }

    let loc = DEFAULT_LOCATION
    let lat = DEFAULT_LAT
    let lon = DEFAULT_LON

    if (import.meta.client) {
      try {
        const rawLoc = localStorage.getItem(STORAGE_KEY_LOCATION)
        if (rawLoc) {
          const parsed = JSON.parse(rawLoc)
          if (parsed?.default_loc) loc = parsed.default_loc
          if (typeof parsed?.default_lat === 'number') lat = parsed.default_lat
          if (typeof parsed?.default_lon === 'number') lon = parsed.default_lon
        }
      } catch {
        // use default Medan coordinates
      }
    }

    isSubmitting.value = true
    try {
      const phone62 = normalizePhoneTo62(registerDraft.value.phone)
      const res = await authApi.registerUser({
        email: registerDraft.value.email.trim().toLowerCase(),
        email_type: registerDraft.value.emailType,
        name: registerDraft.value.name.trim(),
        psw: registerDraft.value.password,
        avatar: registerDraft.value.avatarUrl || '',
        phone: phone62,
        phone_verify: true,
        default_loc: loc,
        default_lat: lat,
        default_lon: lon,
      })
      if (res.status && res.result) {
        const uid = String(res.result._id || res.result.id || res.result.user_id || '')
        registerDraft.value.userId = uid
        authStore.setSession(res.result, res.token || 'session_active')
        await authStore.fetchProfile()
        step.value = 'register-avatar'
      } else {
        errorMsg.value = res.message || 'Pendaftaran gagal. Silakan coba lagi.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitRegisterAvatar(file: File | null) {
    clearMessages()
    if (!file) {
      finalizeSuccessNavigation()
      return
    }
    const uid = registerDraft.value.userId || authStore.userId
    if (!uid) {
      finalizeSuccessNavigation()
      return
    }
    isSubmitting.value = true
    try {
      const res = await authApi.uploadAvatar(uid, file)
      if (res.status) {
        if (res.result?.avatar) {
          authStore.updateAvatar(res.result.avatar)
        } else {
          await authStore.fetchProfile()
        }
        finalizeSuccessNavigation()
      } else {
        errorMsg.value = res.message || 'Gagal mengunggah foto profil.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // =========================================================================
  // FLOW 09: FORGOT PASSWORD ACTIONS (Sesuai ForgotPasswordController V3)
  // =========================================================================
  function maskEmail(emailStr: string): string {
    if (!emailStr || !emailStr.includes('@')) return ''
    const [name, domain] = emailStr.split('@')
    if (name.length <= 2) return `${name[0]}*@${domain}`
    if (name.length <= 4) return `${name[0]}***${name[name.length - 1]}@${domain}`
    return `${name.slice(0, 2)}****${name.slice(-1)}@${domain}`
  }

  function maskPhone(phoneStr: string): string {
    if (!phoneStr) return ''
    const clean = phoneStr.replace(/\D/g, '')
    if (clean.length < 8) return clean
    let local = clean
    if (local.startsWith('62')) local = local.slice(2)
    if (local.startsWith('0')) local = local.slice(1)
    const prefix = local.slice(0, 3)
    const suffix = local.slice(-4)
    return `+62 ${prefix}****${suffix}`
  }

  async function submitForgotRequest() {
    clearMessages()
    const raw = forgotDraft.value.identity.trim()
    if (!raw) {
      errorMsg.value = 'Masukkan email atau nomor handphone yang terdaftar.'
      return
    }

    const isEmail = raw.includes('@')
    forgotDraft.value.identityType = isEmail ? 'email' : 'phone'

    let targetIdentity = raw
    if (isEmail) {
      if (!isValidEmailAddress(raw)) {
        errorMsg.value = 'Format email tidak valid.'
        return
      }
      targetIdentity = raw.toLowerCase()
    } else {
      const cleanDigits = formatPhoneLocalDisplay(raw)
      if (cleanDigits.length < PHONE_MIN_LENGTH - 1 || cleanDigits.length > PHONE_MAX_LENGTH) {
        errorMsg.value = 'Nomor HP harus terdiri dari 10 hingga 14 digit angka.'
        return
      }
      targetIdentity = normalizePhoneTo62(cleanDigits)
    }

    isSubmitting.value = true
    try {
      // 1. Cek akun via /auth/account/check untuk mendapatkan data email & nomor HP akun terdaftar
      const checkRes = await authApi.checkAccount({
        username: targetIdentity,
        username_type: isEmail ? 'email' : 'phone',
      })

      if (!checkRes.status || !checkRes.result) {
        errorMsg.value = checkRes.message || 'Akun tidak ditemukan. Silakan periksa kembali email atau nomor HP Anda.'
        return
      }

      const user = checkRes.result
      forgotDraft.value.userId = String(user.user_id || user._id || user.id || '')
      forgotDraft.value.email = user.email || (isEmail ? targetIdentity : '')
      forgotDraft.value.phone = user.phone ? normalizePhoneTo62(user.phone) : (!isEmail ? targetIdentity : '')

      forgotDraft.value.maskedEmail = maskEmail(forgotDraft.value.email)
      forgotDraft.value.maskedPhone = maskPhone(forgotDraft.value.phone)

      // Defaultkan kanal: jika email ada -> email, jika nomor HP -> sms (karena wa_lock)
      if (isEmail || !forgotDraft.value.phone) {
        forgotDraft.value.method = 'email'
      } else {
        forgotDraft.value.method = otpMethods.value.wa_lock ? 'sms' : 'wa'
      }

      step.value = 'forgot-method'
    } finally {
      isSubmitting.value = false
    }
  }

  async function dispatchForgotOtp(selectedMethod?: OtpChannel) {
    clearMessages()
    const method = selectedMethod || forgotDraft.value.method || 'email'
    forgotDraft.value.method = method

    const identity = method === 'email'
      ? forgotDraft.value.email
      : (forgotDraft.value.phone || forgotDraft.value.identity)

    if (!identity) {
      errorMsg.value = `Akun Anda belum memiliki data ${method === 'email' ? 'email' : 'nomor HP'} yang valid.`
      return
    }

    forgotDraft.value.maskedTarget = method === 'email'
      ? forgotDraft.value.maskedEmail
      : forgotDraft.value.maskedPhone

    isSubmitting.value = true
    try {
      const res = await authApi.requestForgotOtp({
        identity,
        method,
      })
      if (res.status) {
        if (res.result?.user_id) {
          forgotDraft.value.userId = String(res.result.user_id)
        }
        otpOrigin.value = 'forgot_password'
        step.value = 'forgot-otp'
      } else {
        errorMsg.value = res.message || 'Gagal mengirim kode OTP pemulihan.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitForgotNewPassword() {
    clearMessages()
    if (forgotDraft.value.password !== forgotDraft.value.confirmPassword) {
      errorMsg.value = 'Konfirmasi kata sandi tidak cocok.'
      return
    }
    isSubmitting.value = true
    try {
      const res = await authApi.submitNewPassword({
        user_id: forgotDraft.value.userId,
        password: forgotDraft.value.password,
        password_confirmation: forgotDraft.value.confirmPassword,
      })
      if (res.status) {
        step.value = 'forgot-success'
      } else {
        errorMsg.value = res.message || 'Gagal memperbarui kata sandi.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // =========================================================================
  // FLOW 10: PHONE VERIFY ACTIONS
  // =========================================================================
  async function requestPhoneVerifyOtp(selectedMethod?: OtpChannel) {
    clearMessages()
    const cleanDigits = formatPhoneLocalDisplay(phoneVerifyDraft.value.phone)
    if (cleanDigits.length < PHONE_MIN_LENGTH - 1 || cleanDigits.length > PHONE_MAX_LENGTH) {
      errorMsg.value = 'Nomor HP harus terdiri dari 10 hingga 14 digit angka.'
      return false
    }
    const phone62 = normalizePhoneTo62(cleanDigits)
    const method = selectedMethod || phoneVerifyDraft.value.method || 'wa'
    phoneVerifyDraft.value.method = method

    isSubmitting.value = true
    try {
      const avail = await authApi.checkAvailability({ phone: phone62 })
      if (!avail.status) {
        errorMsg.value = avail.message || 'Nomor HP sudah digunakan oleh akun lain.'
        return false
      }
      const otpRes = await authApi.sendFreeOtp({
        method,
        phone: phone62,
      })
      if (otpRes.status) {
        otpOrigin.value = 'phone_verify'
        phoneVerifyDraft.value.otpSent = true
        infoMsg.value = `Kode OTP telah dikirim ke +${phone62}`
        return true
      }
      errorMsg.value = otpRes.message || 'Gagal mengirim OTP verifikasi.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // =========================================================================
  // UNIFIED OTP VERIFICATION & RESEND (FLOWS 07, 08, 09, 10)
  // =========================================================================
  async function verifyOtpCode(otpCode: string) {
    clearMessages()
    if (!otpCode || otpCode.length < OTP_LENGTH) {
      errorMsg.value = `Masukkan ${OTP_LENGTH} digit kode OTP.`
      return
    }

    isSubmitting.value = true
    try {
      if (otpOrigin.value === 'login_otp') {
        const isEmail = loginDraft.value.otpMethod === 'email'
        const res = await authApi.loginWithOtp({
          user_id: loginDraft.value.userId,
          otp: otpCode,
          ...(isEmail
            ? { email: loginDraft.value.email.trim().toLowerCase() }
            : { phone: normalizePhoneTo62(loginDraft.value.phone) }),
        })
        if (res.status && res.result) {
          if (res.old_account) {
            authStore.setSession(res.result, res.token || 'session_active')
            step.value = 'make-password'
          } else {
            await completeAuthSession(res.result, res.token)
          }
        } else {
          errorMsg.value = res.message || 'Kode OTP salah atau sudah kedaluwarsa.'
        }
        return
      }

      if (otpOrigin.value === 'register_email') {
        const res = await authApi.verifyFreeOtp({
          otp: otpCode,
          email: registerDraft.value.email.trim().toLowerCase(),
        })
        if (res.status) {
          registerDraft.value.emailVerified = true
          step.value = 'register-name'
        } else {
          errorMsg.value = res.message || 'Kode OTP email tidak sesuai.'
        }
        return
      }

      if (otpOrigin.value === 'register_phone') {
        const phone62 = normalizePhoneTo62(registerDraft.value.phone)
        const res = await authApi.verifyFreeOtp({
          otp: otpCode,
          phone: phone62,
        })
        if (res.status) {
          registerDraft.value.phoneVerified = true
          step.value = 'register-password'
        } else {
          errorMsg.value = res.message || 'Kode OTP nomor HP tidak sesuai.'
        }
        return
      }

      if (otpOrigin.value === 'forgot_password') {
        const unmaskedTarget = forgotDraft.value.method === 'email'
          ? forgotDraft.value.email
          : (forgotDraft.value.phone || forgotDraft.value.identity)
        const res = await authApi.verifyForgotOtp({
          user_id: forgotDraft.value.userId,
          username: unmaskedTarget,
          otp: otpCode,
        })
        if (res.status) {
          forgotDraft.value.otp = otpCode
          step.value = 'forgot-new'
        } else {
          errorMsg.value = res.message || 'Kode OTP pemulihan tidak sesuai.'
        }
        return
      }

      if (otpOrigin.value === 'phone_verify') {
        const phone62 = normalizePhoneTo62(phoneVerifyDraft.value.phone)
        const verifyRes = await authApi.verifyFreeOtp({
          otp: otpCode,
          phone: phone62,
        })
        if (!verifyRes.status) {
          errorMsg.value = verifyRes.message || 'Kode OTP tidak sesuai.'
          return
        }
        if (authStore.userId) {
          const bindRes = await authApi.verifyPhoneAccount({
            user_id: authStore.userId,
            phone: phone62,
          })
          if (!bindRes.status) {
            errorMsg.value = bindRes.message || 'Gagal menautkan nomor HP.'
            return
          }
        }
        authStore.markPhoneVerified(phone62)
        finalizeSuccessNavigation()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function resendCurrentOtp(overrideMethod?: OtpChannel): Promise<boolean> {
    clearMessages()
    isSubmitting.value = true
    try {
      if (otpOrigin.value === 'login_otp') {
        const method = overrideMethod || loginDraft.value.otpMethod
        loginDraft.value.otpMethod = method
        const res = await authApi.resendLoginOtp({
          user_id: loginDraft.value.userId,
          method,
          ...(method === 'email'
            ? { email: loginDraft.value.email.trim().toLowerCase() }
            : { phone: normalizePhoneTo62(loginDraft.value.phone) }),
        })
        if (res.status) {
          infoMsg.value = 'Kode OTP baru telah dikirim.'
          return true
        }
        errorMsg.value = res.message || 'Gagal mengirim ulang kode OTP.'
        return false
      }

      if (otpOrigin.value === 'register_email') {
        const res = await authApi.sendFreeOtp({
          method: 'email',
          email: registerDraft.value.email.trim().toLowerCase(),
        })
        if (res.status) {
          infoMsg.value = 'Kode OTP baru telah dikirim ke email Anda.'
          return true
        }
        errorMsg.value = res.message || 'Gagal mengirim ulang OTP email.'
        return false
      }

      if (otpOrigin.value === 'register_phone') {
        const method = overrideMethod || registerDraft.value.otpMethod
        registerDraft.value.otpMethod = method
        const res = await authApi.sendFreeOtp({
          method,
          phone: normalizePhoneTo62(registerDraft.value.phone),
        })
        if (res.status) {
          infoMsg.value = 'Kode OTP baru telah dikirim ke nomor HP Anda.'
          return true
        }
        errorMsg.value = res.message || 'Gagal mengirim ulang OTP nomor HP.'
        return false
      }

      if (otpOrigin.value === 'forgot_password') {
        const method = overrideMethod || forgotDraft.value.method
        forgotDraft.value.method = method
        const unmaskedTarget = method === 'email'
          ? forgotDraft.value.email
          : (forgotDraft.value.phone || forgotDraft.value.identity)
        const res = await authApi.requestForgotOtp({
          identity: unmaskedTarget,
          method,
        })
        if (res.status) {
          infoMsg.value = 'Kode OTP pemulihan baru telah dikirim.'
          return true
        }
        errorMsg.value = res.message || 'Gagal mengirim ulang OTP.'
        return false
      }

      if (otpOrigin.value === 'phone_verify') {
        return await requestPhoneVerifyOtp(overrideMethod)
      }

      return false
    } finally {
      isSubmitting.value = false
    }
  }

  // =========================================================================
  // FLOW 06: LOCATION PERMISSION / FALLBACK
  // =========================================================================
  async function applyLocationChoice(loc: string, lat: number, lon: number) {
    isSubmitting.value = true
    try {
      authStore.updateLocation(loc, lat, lon)
      if (authStore.userId) {
        await authApi.saveUserLocation({
          user_id: authStore.userId,
          default_loc: loc,
          default_lat: lat,
          default_lon: lon,
        })
      }
      finalizeSuccessNavigation()
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isOpen,
    step,
    featureTitle,
    customMessage,
    redirectPath,
    errorMsg,
    infoMsg,
    isSubmitting,
    isReloading,
    reloadingTitle,
    reloadingSubtitle,
    triggerAuthReload,
    otpOrigin,
    otpMethods,
    loginDraft,
    registerDraft,
    forgotDraft,
    phoneVerifyDraft,
    clearMessages,
    refreshOtpMethods,
    openLogin,
    openRegister,
    openForgotPassword,
    openPhoneVerify,
    openLocationAsk,
    closeModal,
    switchToStep,
    goBack,
    submitLoginCheck,
    submitLoginPassword,
    submitSocialAuth,
    switchPasswordToEmailOtp,
    submitMakePassword,
    submitRegisterEmail,
    submitRegisterName,
    submitRegisterPhone,
    submitRegisterAccount,
    submitRegisterAvatar,
    submitForgotRequest,
    dispatchForgotOtp,
    submitForgotNewPassword,
    requestPhoneVerifyOtp,
    verifyOtpCode,
    resendCurrentOtp,
    applyLocationChoice,
  }
}

