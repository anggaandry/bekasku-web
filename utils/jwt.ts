/**
 * Utilitas helper untuk parsing dan validasi masa aktif JWT (JSON Web Token)
 * Berjalan aman di client-side (browser) dan SSR (Node.js).
 */

export interface DecodedJwtPayload {
  user_id?: string
  exp?: number
  iat?: number
  [key: string]: any
}

/**
 * Decode payload token JWT tanpa verifikasi kriptografis
 */
export function decodeJwtPayload(token: string | null | undefined): DecodedJwtPayload | null {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    }

    if (typeof Buffer !== 'undefined') {
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
      return JSON.parse(jsonPayload)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cek apakah token JWT sudah kadaluarsa (expired).
 * @param token JWT token string
 * @param bufferSeconds Buffer waktu dalam detik (default 60 detik toleransi network delay)
 * @returns true jika token terbukti expired, false jika masih valid atau tidak memiliki claim exp
 */
export function isJwtExpired(token: string | null | undefined, bufferSeconds = 60): boolean {
  if (!token || typeof token !== 'string') return true
  // Mock token dev/test bukan jwt valid
  if (token === 'session_active') return false

  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    // Jika bukan format JWT 3 bagian bertanggal exp, biarkan backend yang memvalidasi
    return false
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSeconds + bufferSeconds
}

