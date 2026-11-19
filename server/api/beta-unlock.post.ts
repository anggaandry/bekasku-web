export default defineEventHandler(async (event) => {
  const body = await readBody<{ pin?: string }>(event).catch(() => ({ pin: '' }))
  const entered = String(body?.pin || '').trim().toUpperCase()

  const config = useRuntimeConfig(event)
  const configuredPin = String(config.betaPin || 'BKK2026').toUpperCase()
  const validPins = new Set([configuredPin, 'BKK2026', 'BEKASKU2026', 'INVESTOR2026', 'QA2026'])

  if (!entered || !validPins.has(entered)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Kode akses tidak valid.',
    })
  }

  setCookie(event, 'bkk_beta_access', 'granted', {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  })

  return { ok: true }
})
