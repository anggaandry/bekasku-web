/**
 * Central Input and Parameter Guard for BekasKu Web Nuxt
 * Defends against Parameter Pollution, NoSQL Operator Injection (e.g. ?id[$ne]=null),
 * and NaN/Negative pagination inputs.
 */

const MONGO_OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/

/**
 * Coerces unknown query/param value into a safe primitive string.
 * Strips nested objects/arrays to avoid NoSQL query injection.
 */
export function toSafeString(val: unknown, maxLength = 250): string {
  if (val === null || val === undefined) return ''
  let str = ''
  if (Array.isArray(val)) {
    str = val.length > 0 ? String(val[0]) : ''
  } else if (typeof val === 'object') {
    // Drop nested objects (e.g., query objects like { $ne: 'x' })
    return ''
  } else {
    str = String(val)
  }
  return str.trim().slice(0, maxLength)
}

/**
 * Validates and returns a 24-char hex MongoDB ObjectId, or empty string if invalid.
 */
export function toSafeMongoId(val: unknown): string {
  const safe = toSafeString(val, 24)
  if (MONGO_OBJECT_ID_REGEX.test(safe)) {
    return safe
  }
  return ''
}

/**
 * Ensures numeric query parameters (such as page, limit, price) are finite positive integers.
 */
export function toSafePositiveInt(val: unknown, fallback = 1, min = 1, max = 1000000000): number {
  if (val === null || val === undefined) return fallback
  const str = toSafeString(val, 20)
  const parsed = Number.parseInt(str, 10)
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < min) {
    return fallback
  }
  return Math.min(parsed, max)
}

/**
 * Validates external URL strictly allowing only http: and https: protocols.
 * Defends against javascript: and data: phishing/XSS vectors.
 */
export function toSafeExternalUrl(raw?: unknown): string {
  if (!raw) return '#'
  const candidate = toSafeString(raw, 2048)
  if (!candidate || candidate === '#') return '#'
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString()
    }
  } catch {
    // If not a full URL, reject unless relative root-path
    if (candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.startsWith('/\\')) {
      return candidate
    }
  }
  return '#'
}

