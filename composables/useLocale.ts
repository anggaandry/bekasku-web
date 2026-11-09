import { computed } from 'vue'
import idDict from '~/locales/id.json'
import enDict from '~/locales/en.json'
import msDict from '~/locales/ms.json'
import zhDict from '~/locales/zh.json'

export type AppLocale = 'id' | 'en' | 'ms' | 'zh'

export interface LocaleOption {
  code: AppLocale
  localeCode: 'id_ID' | 'en_US' | 'ms_MY' | 'zh_CN'
  label: string
  nativeName: string
  shortLabel: string
}

export const SUPPORTED_LOCALES: readonly LocaleOption[] = [
  {
    code: 'id',
    localeCode: 'id_ID',
    label: 'Bahasa Indonesia',
    nativeName: 'Indonesia',
    shortLabel: 'ID',
  },
  {
    code: 'en',
    localeCode: 'en_US',
    label: 'English',
    nativeName: 'English (US)',
    shortLabel: 'EN',
  },
  {
    code: 'ms',
    localeCode: 'ms_MY',
    label: 'Bahasa Melayu',
    nativeName: 'Melayu (Malaysia)',
    shortLabel: 'MS',
  },
  {
    code: 'zh',
    localeCode: 'zh_CN',
    label: '中文 (Mandarin)',
    nativeName: '简体中文',
    shortLabel: '中文',
  },
] as const

const DICTIONARIES: Record<AppLocale, Record<string, string>> = {
  id: idDict as Record<string, string>,
  en: enDict as Record<string, string>,
  ms: msDict as Record<string, string>,
  zh: zhDict as Record<string, string>,
}

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

  for (const entry of entries) {
    const matched = matchSupportedLocaleTag(entry.tag)
    if (matched) return matched
  }

  return 'id'
}

export function detectBrowserLocale(): AppLocale {
  if (import.meta.server) {
    try {
      const headers = useRequestHeaders(['accept-language'])
      return parseAcceptLanguageHeader(headers['accept-language'])
    } catch {
      return 'id'
    }
  }

  if (import.meta.client && typeof navigator !== 'undefined') {
    const candidates =
      Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language]

    for (const candidate of candidates) {
      const matched = matchSupportedLocaleTag(candidate)
      if (matched) return matched
    }
  }

  return 'id'
}

export function useLocaleState() {
  const langCookie = useCookie<AppLocale | null>('bekasku_lang', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const localeState = useState<AppLocale>('bekasku_locale', () => {
    const fromCookie = matchSupportedLocaleTag(langCookie.value)
    if (fromCookie) return fromCookie
    const detected = detectBrowserLocale()
    langCookie.value = detected
    return detected
  })

  return {
    langCookie,
    localeState,
  }
}

export function useLocale() {
  const { langCookie, localeState } = useLocaleState()

  const locale = computed<AppLocale>({
    get: () => normalizeAppLocale(localeState.value || langCookie.value),
    set: (next) => {
      const normalized = normalizeAppLocale(next)
      localeState.value = normalized
      langCookie.value = normalized
      if (import.meta.client && typeof document !== 'undefined') {
        document.documentElement.lang = normalized
      }
    },
  })

  const currentLocaleMeta = computed<LocaleOption>(() => {
    return (
      SUPPORTED_LOCALES.find(item => item.code === locale.value) ||
      SUPPORTED_LOCALES[0]
    )
  })

  function setLocale(next: AppLocale | string) {
    locale.value = normalizeAppLocale(next)
  }

  function t(key: string, params?: Record<string, string | number>): string {
    if (!key) return ''
    const activeLang = locale.value
    const dict = DICTIONARIES[activeLang] || DICTIONARIES.id
    let translated =
      dict[key] ??
      dict[key.trim()] ??
      DICTIONARIES.id[key] ??
      key

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        const strVal = String(paramVal)
        translated = translated
          .replaceAll(`@${paramKey}`, strVal)
          .replaceAll(`$${paramKey}`, strVal)
          .replaceAll(`{${paramKey}}`, strVal)
      }
    }

    return translated
  }

  return {
    locale,
    locales: SUPPORTED_LOCALES,
    currentLocaleMeta,
    setLocale,
    t,
  }
}

