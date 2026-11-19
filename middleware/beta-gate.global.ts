export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const reqUrl = useRequestURL()
  const isBetaDomain = reqUrl.hostname.startsWith('beta.') || reqUrl.hostname.startsWith('preview.')
  const isGateActive = Boolean(config.public.betaGate) || isBetaDomain

  if (!isGateActive) {
    return
  }

  // Bypass social link preview bots (WhatsApp, Telegram, Facebook, Twitter) so OpenGraph SSR works for QA testing
  if (import.meta.server) {
    const headers = useRequestHeaders(['user-agent'])
    const ua = String(headers['user-agent'] || '')
    if (/WhatsApp|TelegramBot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot/i.test(ua)) {
      return
    }
  }

  const configuredPin = String(config.public.betaPin || 'BKK2026').toUpperCase()
  const validPins = new Set([configuredPin, 'BKK2026', 'BEKASKU2026', 'INVESTOR2026', 'QA2026'])

  const accessCookie = useCookie<string | null>('bkk_beta_access', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  })

  // Support Magic Link auto-unlock: ?access=BKK2026 or ?pin=BKK2026 or ?vip_key=BKK2026
  const queryKey = String(to.query.access || to.query.pin || to.query.vip_key || '').trim().toUpperCase()
  if (queryKey && validPins.has(queryKey)) {
    accessCookie.value = 'granted'
    const cleanQuery = { ...to.query }
    delete cleanQuery.access
    delete cleanQuery.pin
    delete cleanQuery.vip_key
    const targetPath = to.path === '/beta-access' ? '/' : to.path
    return navigateTo({ path: targetPath, query: cleanQuery }, { replace: true })
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
