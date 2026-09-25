import {
  DEFAULT_API_BASE,
  TOKEN_REQ,
  TOKEN_DEF,
  JWT_SECRET_DEF,
  API_REQUEST_TOKEN,
  STORAGE_KEY_TOKEN,
} from '~/utils/constants'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
}

// In-memory token cache for SSR/Client
let cachedToken: string | null = null

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || DEFAULT_API_BASE

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
        cachedToken = response.token
        if (import.meta.client) {
          try {
            localStorage.setItem(STORAGE_KEY_TOKEN, response.token)
          } catch {
            // ignore localStorage disabled
          }
        }
        return response.token
      }
    } catch (err) {
      console.error('[useApi] Failed to obtain guest token:', err)
    }
    return null
  }

  /**
   * Dapatkan token aktif (dari memory, localStorage, atau request baru)
   */
  async function getToken(): Promise<string | null> {
    if (cachedToken) return cachedToken

    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_TOKEN)
        if (stored) {
          cachedToken = stored
          return stored
        }
      } catch {
        // ignore
      }
    }

    return await fetchGuestToken()
  }

  /**
   * Eksekusi request dengan interceptor auth header
   */
  async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    let token = await getToken()
    const method = options.method || 'POST'

    const buildHeaders = (t: string | null) => ({
      'Content-Type': 'application/json',
      'x-auth-token': `Bearer ${TOKEN_DEF}`,
      'x-auth-secret': JWT_SECRET_DEF,
      ...(t ? { 'x-auth-key': t } : {}),
      ...(options.headers || {}),
    })

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const url = `${apiBase}${cleanPath}`

    try {
      const res = await $fetch<T>(url, {
        method,
        body: options.body,
        params: options.params,
        headers: buildHeaders(token),
      })
      return res
    } catch (err: any) {
      // Periksa apakah token expired atau perlu refresh
      const status = err?.response?.status || err?.statusCode
      const errMsg = err?.data?.message?.toString()?.toLowerCase() || ''

      if (status === 401 || status === 403 || errMsg.includes('key needed') || errMsg.includes('jwt-expired')) {
        // Coba refresh token 1 kali dan retry request
        token = await fetchGuestToken()
        if (token) {
          return await $fetch<T>(url, {
            method,
            body: options.body,
            params: options.params,
            headers: buildHeaders(token),
          })
        }
      }

      throw err
    }
  }

  // Convenience methods
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

  return {
    get,
    post,
    put,
    del,
    request,
    fetchGuestToken,
    getToken,
  }
}
