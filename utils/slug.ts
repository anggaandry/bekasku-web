const OBJECT_ID_REGEX = /[0-9a-fA-F]{24}$/
const MAX_SLUG_LENGTH = 80

/** Converts free text into an SEO-friendly, lowercase, hyphenated slug. */
export function slugify(text?: string | null): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '')
}

/** Builds the SEO product detail path: /product/{title-slug}-{id}. */
export function productPath(product: { id?: string; _id?: string; title?: string; name?: string } | null | undefined): string {
  const id = product?.id || product?._id || ''
  if (!id) return '/'
  const slug = slugify(product?.title || product?.name)
  return slug ? `/product/${slug}-${id}` : `/product/${id}`
}

/** Extracts the trailing 24-hex product id from a route param like "kaos-hitam-6a86...". */
export function extractProductId(param?: string | null): string {
  const match = String(param || '').trim().match(OBJECT_ID_REGEX)
  return match ? match[0] : ''
}
