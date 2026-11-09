import {
  DEFAULT_API_BASE,
  TOKEN_REQ,
  TOKEN_DEF,
  TOKEN_PAYMENT,
  JWT_SECRET_DEF,
  API_REQUEST_TOKEN,
  STORAGE_KEY_TOKEN,
  STORAGE_KEY_USER_ID,
  STORAGE_KEY_USER_PROFILE,
} from '~/utils/constants'
import { isJwtExpired } from '~/utils/jwt'
import { normalizeAppLocale, useLocaleState } from '~/composables/useLocale'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
  skipAuthRefresh?: boolean
  usePaymentToken?: boolean
}

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || DEFAULT_API_BASE

  // SSR-safe state & cookie (tidak bocor antar user di SSR server)
  const tokenCookie = useCookie<string | null>(STORAGE_KEY_TOKEN, {
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    sameSite: 'lax',
    path: '/',
  })
  const tokenState = useState<string | null>('auth_token', () => tokenCookie.value || null)
  const { langCookie, localeState } = useLocaleState()

  /**
   * Request / Refresh Guest JWT Token dari backend
   */
  async function fetchGuestToken(): Promise<string | null> {
    try {
      const response = await $fetch<{ token?: string; message?: string }>(
        `${apiBase}${API_REQUEST_TOKEN}`,
        {
          method: 'POST',
          body: {},
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${TOKEN_REQ}`,
            'x-auth-secret': JWT_SECRET_DEF,
          },
        }
      )

      if (response && response.token) {
        tokenState.value = response.token
        tokenCookie.value = response.token
        return response.token
      }
    } catch (err) {
      console.error('[useApi] Failed to obtain guest token:', err)
    }
    return null
  }

  /**
   * Dapatkan token aktif (dari cookie/useState SSR-safe atau request baru)
   */
  async function getToken(): Promise<string | null> {
    if (tokenState.value && !isJwtExpired(tokenState.value)) return tokenState.value
    if (tokenCookie.value && !isJwtExpired(tokenCookie.value)) {
      tokenState.value = tokenCookie.value
      return tokenCookie.value
    }
    return await fetchGuestToken()
  }

  /**
   * Bersihkan token dan session di storage saat token kadaluarsa
   */
  function handleSessionExpired() {
    tokenState.value = null
    tokenCookie.value = null
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER_ID)
        localStorage.removeItem(STORAGE_KEY_USER_PROFILE)
      } catch {
        // ignore
      }
    }
  }

  /**
   * Eksekusi request dengan interceptor auth header
   */
  async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    let token = await getToken()
    const method = options.method || 'POST'

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const activeLang = normalizeAppLocale(localeState.value || langCookie.value)
    const isPlainObjectBody =
      !isFormData &&
      options.body &&
      typeof options.body === 'object' &&
      !Array.isArray(options.body)

    const resolvedBody = isPlainObjectBody
      ? { lang: activeLang, ...options.body }
      : options.body

    const authToken = options.usePaymentToken ? TOKEN_PAYMENT : TOKEN_DEF
    const buildHeaders = (t: string | null) => ({
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept-Language': activeLang,
      'x-auth-token': `Bearer ${authToken}`,
      'x-auth-secret': JWT_SECRET_DEF,
      ...(t ? { 'x-auth-key': t } : {}),
      ...(options.headers || {}),
    })

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${apiBase}${cleanPath}`

    try {
      const res = await $fetch<T>(url, {
        method,
        body: resolvedBody,
        params: options.params,
        headers: buildHeaders(token),
      })
      return res
    } catch (err: any) {
      const status = err?.response?.status || err?.statusCode
      const errMsg = err?.data?.message?.toString()?.toLowerCase() || ''
      const isTokenError =
        status === 403 ||
        errMsg.includes('jwt-expired') ||
        errMsg.includes('token needed') ||
        errMsg.includes('key needed') ||
        errMsg.includes('key access')

      if (isTokenError) {
        handleSessionExpired()
      }

      if (!options.skipAuthRefresh && isTokenError) {
        token = await fetchGuestToken()
        if (token) {
          return await $fetch<T>(url, {
            method,
            body: resolvedBody,
            params: options.params,
            headers: buildHeaders(token),
          })
        }
      }

      throw err
    }
  }

  async function get<T>(path: string, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' })
  }

  async function post<T>(path: string, body: any = {}, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return request<T>(path, { ...options, method: 'POST', body })
  }

  async function put<T>(path: string, body: any = {}, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return request<T>(path, { ...options, method: 'PUT', body })
  }

  async function del<T>(path: string, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' })
  }

  function setToken(newToken: string | null) {
    tokenState.value = newToken
    tokenCookie.value = newToken
  }

  return {
    get,
    post,
    put,
    del,
    request,
    fetchGuestToken,
    getToken,
    setToken,
  }
}
