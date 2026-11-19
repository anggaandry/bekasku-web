export interface CookieConsentState {
  essential: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

const CONSENT_COOKIE_NAME = 'bkk_cookie_consent'

export const useCookieConsent = () => {
  const consentCookie = useCookie<CookieConsentState | null>(CONSENT_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    default: () => null,
  })

  const isPreferencesOpen = useState<boolean>('cookie_preferences_open', () => false)

  const hasDecided = computed(() => Boolean(consentCookie.value && typeof consentCookie.value === 'object'))
  const canTrackAnalytics = computed(() => Boolean(consentCookie.value?.analytics))
  const canTrackMarketing = computed(() => Boolean(consentCookie.value?.marketing))

  function saveConsent(analytics: boolean, marketing: boolean) {
    consentCookie.value = {
      essential: true,
      analytics,
      marketing,
      updatedAt: new Date().toISOString(),
    }
    isPreferencesOpen.value = false
  }

  function acceptAll() {
    saveConsent(true, true)
  }

  function rejectNonEssential() {
    saveConsent(false, false)
  }

  function openPreferences() {
    isPreferencesOpen.value = true
  }

  function closePreferences() {
    isPreferencesOpen.value = false
  }

  return {
    consent: consentCookie,
    hasDecided,
    canTrackAnalytics,
    canTrackMarketing,
    isPreferencesOpen,
    acceptAll,
    rejectNonEssential,
    saveConsent,
    openPreferences,
    closePreferences,
  }
}
