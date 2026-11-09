/**
 * Normalizes media URLs from legacy storage.googleapis.com (with expired signatures),
 * base64 data URIs and raw base64 image strings (JPEG /9j/, PNG iVBORw0KGgo, WebP UklGR, etc.),
 * into stable public Firebase Storage or data URIs.
 */
export function sanitizeMediaUrl(url?: string | null, fallback = '/images/icon_only.png'): string {
  if (!url || typeof url !== 'string') {
    return fallback
  }

  const clean = url.trim()
  if (
    !clean ||
    clean === 'null' ||
    clean === 'undefined' ||
    clean === 'default' ||
    clean === 'default_avatar.png'
  ) {
    return fallback
  }

  // 1. Data URI image
  if (clean.startsWith('data:image/')) {
    return clean
  }

  // 2. Base64 signature checks
  // JPEG base64 starts with SOI marker 0xFF 0xD8 0xFF which encodes to /9j/
  if (clean.startsWith('/9j/') || clean.startsWith('/9J/')) {
    return `data:image/jpeg;base64,${clean}`
  }
  // JPEG base64 without leading slash
  if (clean.startsWith('9j/') || clean.startsWith('9J/')) {
    return `data:image/jpeg;base64,/${clean}`
  }
  // PNG base64 magic bytes
  if (clean.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${clean}`
  }
  // GIF base64 magic bytes
  if (clean.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${clean}`
  }
  // WebP base64 magic bytes
  if (clean.startsWith('UklGR')) {
    return `data:image/webp;base64,${clean}`
  }

  // 3. If already a valid Firebase Storage endpoint, return as is
  if (clean.includes('firebasestorage.googleapis.com')) {
    return clean
  }

  // 4. Convert expired Google Cloud Storage signed URL to public Firebase Storage alt=media URL
  if (clean.includes('storage.googleapis.com')) {
    try {
      const u = new URL(clean)
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        const bucket = parts[0]
        const filePath = parts.slice(1).join('/')
        return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`
      }
    } catch {
      return fallback
    }
  }

  // 5. Generic base64 fallback (long string without spaces/queries or path structure)
  if (clean.length > 100 && !clean.includes(' ') && !clean.includes('?')) {
    const isKnownPath =
      clean.startsWith('/images/') ||
      clean.startsWith('/assets/') ||
      clean.startsWith('/_nuxt/') ||
      clean.startsWith('/icons/') ||
      /\.(png|jpe?g|webp|svg|gif|ico|bmp)($|\?)/i.test(clean)

    if (!isKnownPath && /^\/?[A-Za-z0-9+/=]+$/.test(clean)) {
      return `data:image/jpeg;base64,${clean}`
    }
  }

  // 6. Absolute HTTP/HTTPS URLs
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }

  // 7. Legitimate relative static paths (e.g. /images/..., /favicon.ico)
  if (clean.startsWith('/')) {
    return clean
  }

  return fallback
}
