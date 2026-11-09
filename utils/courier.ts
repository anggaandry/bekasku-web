/**
 * Courier utility to resolve official courier logos and codes.
 * Matches Flutter CourierLogoWidget implementation.
 */
export function getCourierCode(courierName?: string): string | null {
  if (!courierName) return null
  const nameLower = courierName.toLowerCase().trim()
  if (nameLower.includes('jne')) return 'jne'
  if (nameLower.includes('j&t') || nameLower.includes('jnt') || nameLower.includes('ez')) return 'jnt'
  if (nameLower.includes('sicepat') || nameLower.includes('si cepat')) return 'sicepat'
  if (nameLower.includes('grab')) return 'grab'
  if (nameLower.includes('gojek') || nameLower.includes('gosend')) return 'gojek'
  if (nameLower.includes('lalamove')) return 'lalamove'
  if (nameLower.includes('anteraja') || nameLower.includes('anter aja')) return 'anteraja'
  if (nameLower.includes('lion')) return 'lion'
  if (nameLower.includes('pos')) return 'pos'
  if (nameLower.includes('tiki')) return 'tiki'
  if (nameLower.includes('ninja')) return 'ninja'
  if (nameLower.includes('paxel')) return 'paxel'
  if (nameLower.includes('deliveree')) return 'deliveree'
  if (nameLower.includes('sap')) return 'sap'
  if (nameLower.includes('ide') || nameLower.includes('idexpress') || nameLower.includes('idx')) return 'ide'
  if (nameLower.includes('wahana')) return 'wahana'
  if (nameLower.includes('rpx')) return 'rpx'
  if (nameLower.includes('sentral')) return 'sentral'
  if (nameLower.includes('borzo')) return 'borzo'
  if (nameLower.includes('indah')) return 'indah'
  if (nameLower.includes('rex')) return 'rex'
  if (nameLower.includes('jtcargo')) return 'jtcargo'
  return null
}

export function resolveCourierLogo(courierName?: string, rawLogo?: string): string {
  // 1. High priority: official local courier asset if code is matched
  const code = getCourierCode(courierName)
  if (code) {
    return `/images/couriers/${code}.png`
  }

  const trimmed = (rawLogo || '').trim()

  // 2. If full URL (sanitizing legacy domain bc.bekasku.id)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // 3. If relative path
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  if (trimmed.length > 0) {
    return `/images/couriers/${trimmed}`
  }

  return ''
}
