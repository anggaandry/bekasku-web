/**
 * Central File Upload Validator for BekasKu Web Nuxt
 * Enforces strict MIME types, blocks dangerous extensions (.svg, .html, .exe, .sh),
 * and validates size limits to prevent stored XSS, server overload, and DOS.
 */

export interface FileValidationOptions {
  allowedMimeTypes?: string[]
  maxSizeMB?: number
  allowVideo?: boolean
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
]

export const DISALLOWED_EXTENSIONS = [
  '.svg',
  '.html',
  '.htm',
  '.xhtml',
  '.xml',
  '.php',
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.js',
  '.vbs',
]

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates an uploaded file strictly before sending to backend or generating previews.
 */
export function validateUploadedFile(
  file: File | null | undefined,
  options: FileValidationOptions = {},
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' }
  }

  const fileName = (file.name || '').toLowerCase()
  const fileSize = file.size || 0

  // 1. Explicitly check and block dangerous extensions (especially .svg which can carry executable scripts)
  for (const ext of DISALLOWED_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return {
        valid: false,
        error: `Format file ${ext} tidak diizinkan demi keamanan platform.`,
      }
    }
  }

  // 2. Validate MIME type
  const isVideo = file.type.startsWith('video/')
  const allowed = options.allowedMimeTypes || (
    options.allowVideo || isVideo
      ? [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES]
      : ALLOWED_IMAGE_MIME_TYPES
  )

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: isVideo
        ? 'Format video harus berupa MP4 atau MOV.'
        : 'Format gambar harus berupa JPG, PNG, atau WEBP.',
    }
  }

  // 3. Validate size limit
  const maxMB = options.maxSizeMB || (isVideo ? 30 : 5)
  const maxBytes = maxMB * 1024 * 1024

  if (fileSize > maxBytes) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimum (${maxMB} MB).`,
    }
  }

  return { valid: true }
}

/**
 * Safely creates an object URL and returns a cleanup function to prevent memory leaks.
 */
export function createSafeObjectUrl(file: File): { url: string; revoke: () => void } {
  if (typeof window === 'undefined' || !window.URL || !file) {
    return { url: '', revoke: () => {} }
  }
  const url = window.URL.createObjectURL(file)
  return {
    url,
    revoke: () => {
      try {
        window.URL.revokeObjectURL(url)
      } catch {
        // ignore
      }
    },
  }
}

