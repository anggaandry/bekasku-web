import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import 'dayjs/locale/id.js'

dayjs.extend(relativeTime)
dayjs.locale('id')

export function useFormat() {
  /**
   * Format harga angka ke Rupiah standar: 720000 -> "Rp720.000"
   */
  function formatPrice(value: number | string | undefined | null): string {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return 'Rp0'
    }
    const num = Math.round(Number(value))
    return 'Rp' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  /**
   * Format harga ringkas: 1200000 -> "Rp1,2jt", 750000 -> "Rp750rb"
   */
  function formatPriceCompact(value: number | string | undefined | null): string {
    if (!value || isNaN(Number(value))) return 'Rp0'
    const num = Number(value)
    if (num >= 1_000_000_000) {
      return 'Rp' + (num / 1_000_000_000).toFixed(1).replace('.0', '') + 'M'
    }
    if (num >= 1_000_000) {
      return 'Rp' + (num / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + 'jt'
    }
    if (num >= 1_000) {
      return 'Rp' + (num / 1_000).toFixed(0) + 'rb'
    }
    return formatPrice(num)
  }

  /**
   * Format tanggal standar: "17 Sep 2026"
   */
  function formatDate(iso: string | Date | undefined | null, format = 'DD MMM YYYY'): string {
    if (!iso) return '-'
    return dayjs(iso).format(format)
  }

  /**
   * Format waktu lampau relatif: "2 jam yang lalu"
   */
  function timeAgo(iso: string | Date | undefined | null): string {
    if (!iso) return ''
    return dayjs(iso).fromNow()
  }

  /**
   * Memotong teks jika melebihi panjang tertentu
   */
  function truncate(text: string | undefined | null, maxLength = 60): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  /**
   * Format rating: 4.88 -> "4.9"
   */
  function formatRating(value: number | string | undefined | null): string {
    if (value === undefined || value === null) return '0.0'
    const num = Number(value)
    if (isNaN(num) || num <= 0) return '0.0'
    return num.toFixed(1)
  }

  /**
   * Format jumlah besar: 12500 -> "12.5k"
   */
  function formatCount(value: number | undefined | null): string {
    if (!value || isNaN(value)) return '0'
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace('.0', '') + 'M'
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace('.0', '') + 'k'
    }
    return value.toString()
  }

  return {
    formatPrice,
    formatPriceCompact,
    formatDate,
    timeAgo,
    truncate,
    formatRating,
    formatCount,
  }
}
