/**
 * Central HTML Sanitizer for BekasKu Web Nuxt
 * Defends against Stored/Reflected XSS while preserving legitimate rich text formatting
 * (headings, paragraphs, lists, marks, spans, safe links).
 */

const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'svg',
  'math',
  'base',
  'meta',
  'link',
  'style',
  'applet',
  'frame',
  'frameset',
]

const DANGEROUS_TAG_REGEX = new RegExp(
  `<(?:${DANGEROUS_TAGS.join('|')})\\b[^<]*(?:(?!<\\/(?:${DANGEROUS_TAGS.join('|')})>)<[^<]*)*<\\/(?:${DANGEROUS_TAGS.join('|')})>|<(?:${DANGEROUS_TAGS.join('|')})\\b[^>]*\\/?>`,
  'gi',
)

// Strip inline event handlers: onerror=..., onclick=..., onload=...
const EVENT_HANDLER_REGEX = /\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

// Strip javascript:, vbscript:, data:text/html URIs in href, src, formaction
const DANGEROUS_URI_ATTR_REGEX = /\s+(?:href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:\s*text\/html)[^']*'|[^\s>]*javascript:[^\s>]*)/gi

export function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function sanitizeHtml(raw?: string | null): string {
  if (!raw) return ''
  let clean = String(raw)

  // 1. Remove dangerous executable / frame tags entirely
  clean = clean.replace(DANGEROUS_TAG_REGEX, '')

  // 2. Remove all inline event handlers (onclick, onerror, etc.)
  clean = clean.replace(EVENT_HANDLER_REGEX, '')

  // 3. Remove dangerous protocols in attributes
  clean = clean.replace(DANGEROUS_URI_ATTR_REGEX, '')

  // 4. Ensure target="_blank" has rel="noopener noreferrer"
  clean = clean.replace(/<a\b([^>]*?)target\s*=\s*["']_blank["']([^>]*?)>/gi, (match, before, after) => {
    const combined = `${before} ${after}`
    if (/rel\s*=\s*["'][^"']*noopener/i.test(combined)) {
      return match
    }
    return `<a${before} target="_blank" rel="noopener noreferrer"${after}>`
  })

  return clean
}

