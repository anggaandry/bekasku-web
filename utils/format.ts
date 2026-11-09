/**
 * Central Formatting Utilities for BekasKu Web Nuxt
 * Handles currency (IDR / Rupiah), numeric formatting, and dates.
 */

/**
 * Formats a number with dot thousand separators (e.g. 1500000 -> "1.500.000").
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0'
  }
  const num = Math.round(Number(value))
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formats currency as Indonesian Rupiah with prefix (e.g. 1500000 -> "Rp 1.500.000").
 */
export function formatRupiah(value: number | string | undefined | null): string {
  return `Rp ${formatNumber(value)}`
}

export const formatPrice = formatRupiah

/**
 * Formats ISO date into readable short Indonesian date (e.g. "12 Des 2026").
 */
export function formatDate(iso: string | Date | undefined | null): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return String(iso)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(iso)
  }
}

/**
 * Formats a date relative to now (e.g. "5 menit lalu", "2 jam lalu", "Kemarin").
 */
export function formatRelativeTime(iso: string | Date | undefined | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return String(iso)
    const diffMs = Date.now() - d.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'Baru saja'
    if (diffMin < 60) return `${diffMin} menit lalu`
    if (diffHour < 24) return `${diffHour} jam lalu`
    if (diffDay === 1) return 'Kemarin'
    if (diffDay < 7) return `${diffDay} hari lalu`
    return formatDate(d)
  } catch {
    return String(iso)
  }
}
