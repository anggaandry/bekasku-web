import type { TransactionDetail, TransactionStatusInfo } from '~/types/transaction'

export interface StatusBadgeStyle {
  color: string
  backgroundColor: string
  [key: string]: string | undefined
}

const BADGE_SUCCESS: StatusBadgeStyle = { color: '#16A34A', backgroundColor: '#DCFCE7' }
const BADGE_INFO: StatusBadgeStyle = { color: '#2563EB', backgroundColor: '#DBEAFE' }
const BADGE_DANGER: StatusBadgeStyle = { color: '#DC2626', backgroundColor: '#FEE2E2' }
const BADGE_WARNING: StatusBadgeStyle = { color: '#EA580C', backgroundColor: '#FFEDD5' }

export interface SellerIncome {
  gross: number
  feePercent: number
  fee: number
  freeDeliveryDeduct: number
  net: number
}

function statusInfo(detail: TransactionDetail): TransactionStatusInfo | null {
  return typeof detail.status === 'object' && detail.status ? detail.status : null
}

function statusText(detail: TransactionDetail): string {
  const info = statusInfo(detail)
  return (info ? info.name : String(detail.status || '')).toLowerCase()
}

/** Transaksi dianggap selesai: sinkron dengan banner penjual di mobile V3. */
export function isTransactionFinished(detail: TransactionDetail): boolean {
  const code = statusInfo(detail)?.code || ''
  return (
    detail.step === 3 ||
    detail.step === 4 ||
    detail.step === 10 ||
    statusText(detail).includes('selesai') ||
    ['finished', 'done', 'arrived'].includes(code) ||
    Boolean(detail.finish_date)
  )
}

/** Transaksi dibatalkan/diretur: dana kembali ke saldo pembeli. */
export function isTransactionCanceled(detail: TransactionDetail): boolean {
  const code = statusInfo(detail)?.code || ''
  return (
    detail.step === 9 ||
    statusText(detail).includes('batal') ||
    ['canceled', 'returned'].includes(code) ||
    Boolean(detail.cancel_date)
  )
}

/** Warna badge dari API; fallback berdasarkan teks status bila API tidak mengirim warna. */
export function resolveStatusBadgeStyle(
  label: string,
  apiTextColor?: string,
  apiBackColor?: string,
): StatusBadgeStyle {
  if (apiTextColor && apiBackColor) {
    return { color: apiTextColor, backgroundColor: apiBackColor }
  }
  const s = label.toLowerCase()
  if (s.includes('selesai') || s.includes('sampai')) return BADGE_SUCCESS
  if (s.includes('kirim')) return BADGE_INFO
  if (s.includes('batal')) return BADGE_DANGER
  return BADGE_WARNING
}

/** Rumus pendapatan bersih penjual (mobile V3: `_buildSellerIncomeSection`). */
export function calcSellerIncome(detail: TransactionDetail): SellerIncome {
  const gross = detail.total_order || detail.price || 0
  const feePercent = detail.taking_fee_percent || 3
  const fee = typeof detail.taking_fee === 'number'
    ? detail.taking_fee
    : Math.round((gross * feePercent) / 100)
  const freeDeliveryDeduct = detail.free_delivery ? (detail.discount_shipping_price || 0) : 0
  return {
    gross,
    feePercent,
    fee,
    freeDeliveryDeduct,
    net: Math.max(0, gross - fee - freeDeliveryDeduct),
  }
}

/** Total dana yang dikembalikan ke pembeli. */
export function calcBuyerRefund(detail: TransactionDetail): number {
  if (detail.refund_amount && detail.refund_amount > 0) return detail.refund_amount
  return (detail.price || 0) + (detail.service_fee || 0)
}

