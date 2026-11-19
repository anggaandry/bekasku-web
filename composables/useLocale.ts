import { computed } from 'vue'
import idDict from '~/locales/id.json'
import enDict from '~/locales/en.json'
import msDict from '~/locales/ms.json'
import zhDict from '~/locales/zh.json'
import {
  type AppLocale,
  matchSupportedLocaleTag,
  normalizeAppLocale,
  resolveLocaleFromTags,
  parseAcceptLanguageHeader,
} from '~/utils/locale'

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
    const candidates: (string | undefined)[] = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
    ]
    try {
      const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale
      if (intlLocale) candidates.push(intlLocale)
    } catch {
      // ignore Intl unavailable
    }
    return resolveLocaleFromTags(candidates)
  }

  return 'id'
}

export function useLocaleState() {
  const langCookie = useCookie<AppLocale | null>('bekasku_lang', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })
  const manualCookie = useCookie<'1' | null>('bekasku_lang_manual', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const localeState = useState<AppLocale>('bekasku_locale', () => {
    if (manualCookie.value === '1') {
      const fromCookie = matchSupportedLocaleTag(langCookie.value)
      if (fromCookie) return fromCookie
    }
    // Clear non-explicit legacy auto cookie so browser detection / 'id' default applies cleanly
    if (langCookie.value && manualCookie.value !== '1') {
      langCookie.value = null
    }
    return detectBrowserLocale()
  })

  return {
    langCookie,
    manualCookie,
    localeState,
  }
}

export function useLocale() {
  const { langCookie, manualCookie, localeState } = useLocaleState()

  const locale = computed<AppLocale>({
    get: () => normalizeAppLocale(localeState.value || (manualCookie.value === '1' ? langCookie.value : null)),
    set: (next) => {
      const normalized = normalizeAppLocale(next)
      localeState.value = normalized
      langCookie.value = normalized
      manualCookie.value = '1'
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

  function syncBrowserLocale() {
    if (!import.meta.client) return
    if (manualCookie.value === '1' && matchSupportedLocaleTag(langCookie.value)) return
    const detected = detectBrowserLocale()
    localeState.value = detected
    if (typeof document !== 'undefined') {
      document.documentElement.lang = detected
    }
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
    syncBrowserLocale,
    t,
  }
}
