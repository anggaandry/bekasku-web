export type AppLocale = 'id' | 'en' | 'ms' | 'zh'

/**
 * Matches a browser/header language tag to a supported BekasKu locale code.
 */
export function matchSupportedLocaleTag(raw?: string | null): AppLocale | null {
  const val = String(raw || '').trim().toLowerCase()
  if (!val) return null
  if (
    val === 'id' ||
    val.startsWith('id_') ||
    val.startsWith('id-') ||
    val === 'in' ||
    val.startsWith('in_') ||
    val.startsWith('in-')
  ) {
    return 'id'
  }
  if (val === 'en' || val.startsWith('en_') || val.startsWith('en-')) {
    return 'en'
  }
  if (
    val === 'ms' ||
    val.startsWith('ms_') ||
    val.startsWith('ms-') ||
    val === 'my' ||
    val.startsWith('my_') ||
    val.startsWith('my-')
  ) {
    return 'ms'
  }
  if (
    val === 'zh' ||
    val.startsWith('zh_') ||
    val.startsWith('zh-') ||
    val === 'cn' ||
    val.startsWith('cn_') ||
    val.startsWith('cn-')
  ) {
    return 'zh'
  }
  return null
}

export function normalizeAppLocale(raw?: string | null): AppLocale {
  return matchSupportedLocaleTag(raw) || 'id'
}

/**
 * Resolves locale from ordered browser language tags.
 * Prefers Indonesian whenever present anywhere in preferences, and always falls back to 'id'
 * when no supported browser language is detected.
 */
export function resolveLocaleFromTags(tags: readonly (string | undefined | null)[]): AppLocale {
  const matched: AppLocale[] = []
  for (const tag of tags) {
    const m = matchSupportedLocaleTag(tag)
    if (m) matched.push(m)
  }
  if (matched.includes('id')) return 'id'
  return matched[0] || 'id'
}

/**
 * Parses HTTP Accept-Language header into a BekasKu locale, defaulting to Indonesian ('id').
 */
export function parseAcceptLanguageHeader(header?: string | null): AppLocale {
  if (!header) return 'id'
  const entries = header
    .split(',')
    .map((part, index) => {
      const [rawTag = '', ...params] = part.trim().split(';')
      let q = 1
      for (const param of params) {
        const [k, v] = param.trim().split('=')
        if (k === 'q' && v) {
          const parsed = Number.parseFloat(v)
          if (!Number.isNaN(parsed)) q = parsed
        }
      }
      return { tag: rawTag.trim(), q, index }
    })
    .filter(item => item.tag && item.q > 0)
    .sort((a, b) => (b.q !== a.q ? b.q - a.q : a.index - b.index))

  return resolveLocaleFromTags(entries.map(item => item.tag))
}
