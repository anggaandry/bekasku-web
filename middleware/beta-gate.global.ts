export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()
  const reqUrl = useRequestURL()
  const isBetaDomain = reqUrl.hostname.startsWith('beta.') || reqUrl.hostname.startsWith('preview.')
  const isGateActive = Boolean(config.public.betaGate) || isBetaDomain

  if (!isGateActive) {
    return
  }

  // Bypass social link preview bots (WhatsApp, Telegram, Facebook, Twitter) so OpenGraph SSR works
  if (import.meta.server) {
    const headers = useRequestHeaders(['user-agent'])
    const ua = String(headers['user-agent'] || '')
    if (/WhatsApp|TelegramBot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot/i.test(ua)) {
      return
    }
  }

  const accessCookie = useCookie<string | null>('bkk_beta_access', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  })

  // Server-only PIN check for Magic Link (?access=... / ?pin=... / ?vip_key=...) so PINs never ship to client bundle
  const queryKey = String(to.query.access || to.query.pin || to.query.vip_key || '').trim().toUpperCase()
  if (queryKey && import.meta.server) {
    const configuredPin = String(config.betaPin || 'BKK2026').toUpperCase()
    const validPins = new Set([configuredPin, 'BKK2026', 'BEKASKU2026', 'INVESTOR2026', 'QA2026'])
    if (validPins.has(queryKey)) {
      accessCookie.value = 'granted'
      if (to.path === '/beta-access') {
        return navigateTo('/', { replace: true })
      }
      return
    }
  }

  if (to.path === '/beta-access') {
    if (accessCookie.value === 'granted') {
      const redirectTarget = typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/')
        ? to.query.redirect
        : '/'
      return navigateTo(redirectTarget, { replace: true })
    }
    return
  }

  if (accessCookie.value !== 'granted') {
    return navigateTo({
      path: '/beta-access',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    })
  }
})
