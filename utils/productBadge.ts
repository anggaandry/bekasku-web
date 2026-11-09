export type ProductBadgeVariant = 'soft' | 'outline' | 'vip' | 'bestDeal' | 'trusted' | 'verified'

/**
 * Class Tailwind per varian chip kartu produk. Token warna `chip-*` ada di assets/css/main.css.
 * - soft: Pay & Pick, Dibutuhkan, Jasa & Lowongan Kerja
 * - outline: Instant
 */
export const PRODUCT_BADGE_CLASS: Record<ProductBadgeVariant, string> = {
  soft: 'bg-chip-soft-bg border-chip-soft-border text-chip-soft-text font-medium',
  outline: 'bg-white border-chip-outline-border text-chip-outline-text font-medium',
  vip: 'bg-secondary/12 border-secondary/35 text-amber-700 font-bold',
  bestDeal: 'bg-primary/6 border-primary/20 text-primary font-bold',
  trusted: 'bg-sky-100 border-sky-200 text-blue-700 font-bold',
  verified: 'bg-green-50 border-green-100 text-green-700 font-bold',
}
