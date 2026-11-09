import type {
  ChatMessage,
  ProductChatModel,
  TransactionChatModel,
  NegotiationChatModel,
  RequestChatModel,
} from '~/types/chat'
import { sanitizeMediaUrl } from '~/utils/media'

export function sanitizeChatLocation(raw: unknown): string {
  if (!raw) return 'Deli Serdang'
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>
    if (r.city) return String(r.city)
    if (r.address) return String(r.address)
    return 'Deli Serdang'
  }
  const str = String(raw).trim()
  if (!str || str.includes('Point') || str.startsWith('{') || str.contains?.('coordinate') || str.includes('coordinate')) {
    return 'Deli Serdang'
  }
  return str
}

export function mapProductChat(raw: unknown): ProductChatModel | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Record<string, unknown>
  const id = String(m.id || m._id || '').trim()
  if (!id && !m.title) return null
  const rawImg = Array.isArray(m.image) ? m.image[0] : m.image
  return {
    id,
    title: String(m.title || 'Produk'),
    image: sanitizeMediaUrl(rawImg ? String(rawImg) : '', ''),
    price: Number(m.price || 0),
    location: sanitizeChatLocation(m.location),
    rating: m.rating !== undefined && m.rating !== null ? Number(m.rating) || 4.0 : 4.0,
    user_id: m.user_id ? String(m.user_id) : undefined,
    is_seller: Boolean(m.is_seller),
  }
}

export function mapTransactionChat(raw: unknown): TransactionChatModel | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Record<string, unknown>
  return {
    id: String(m.id || m._id || ''),
    invoice: m.invoice ? String(m.invoice) : (m.invoice_no ? String(m.invoice_no) : ''),
    title: String(m.title || 'Transaksi'),
    image: sanitizeMediaUrl(m.image ? String(m.image) : '', ''),
    price: m.price !== undefined && m.price !== null ? Number(m.price) || 0 : 0,
    status: String(m.status || '-'),
    status_code: m.status_code ? String(m.status_code) : undefined,
    status_color: m.status_color ? String(m.status_color) : undefined,
    status_bg: m.status_bg ? String(m.status_bg) : undefined,
    date: m.date ? String(m.date) : undefined,
    total_order: Number(m.total_order ?? m.totalOrder ?? 1) || 1,
  }
}

export function mapNegotiationChat(raw: unknown): NegotiationChatModel | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Record<string, unknown>
  const prodObj = (typeof m.product === 'object' && m.product !== null) ? (m.product as Record<string, unknown>) : null
  const negoId = String(m.nego_id || m.id || m._id || '')
  const productId = String(
    m.product_id ||
    m.productId ||
    (prodObj ? (prodObj.id || prodObj._id || '') : (typeof m.product === 'string' ? m.product : '')),
  )
  const title = String(m.title || (prodObj ? prodObj.title || '' : '') || 'Produk')
  const rawImg = m.image || (prodObj ? (Array.isArray(prodObj.image) ? prodObj.image[0] : prodObj.image) : '')
  const statusObj = (typeof m.status === 'object' && m.status !== null)
    ? (m.status as Record<string, unknown>)
    : null

  return {
    nego_id: negoId,
    product_id: productId,
    title,
    image: sanitizeMediaUrl(rawImg ? String(rawImg) : '', ''),
    expired: m.expired ? String(m.expired) : undefined,
    price: Number(m.price || 0),
    nego_price: Number(m.nego_price || 0),
    seller: Boolean(m.seller),
    status: statusObj
      ? {
          name: String(statusObj.name || ''),
          code: String(statusObj.code || ''),
          text_color: statusObj.text_color ? String(statusObj.text_color) : undefined,
          back_color: statusObj.back_color ? String(statusObj.back_color) : undefined,
        }
      : undefined,
  }
}

export function mapRequestChat(raw: unknown): RequestChatModel | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Record<string, unknown>
  return {
    id: String(m.id || ''),
    is_seller: Boolean(m.is_seller),
    title: String(m.title || 'Produk'),
    image: sanitizeMediaUrl(m.image ? String(m.image) : '', ''),
    type: String(m.type || 'video'),
    chat_id: m.chat_id ? String(m.chat_id) : undefined,
    price: m.price !== undefined && m.price !== null ? Number(m.price) || 0 : undefined,
    location: sanitizeChatLocation(m.location),
    rating: m.rating !== undefined && m.rating !== null ? Number(m.rating) || 4.0 : 4.0,
  }
}

export function mapChatMessage(raw: Record<string, unknown>): ChatMessage {
  const rawImage = raw.image ? String(raw.image) : ''
  const normalizedImage = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/')
        ? sanitizeMediaUrl(rawImage, '')
        : rawImage)
    : ''

  const rawVideo = raw.video ? String(raw.video) : ''
  const normalizedVideo = rawVideo
    ? (rawVideo.startsWith('http') || rawVideo.startsWith('/')
        ? sanitizeMediaUrl(rawVideo, '')
        : rawVideo)
    : ''

  return {
    id: String(raw.id || raw._id || raw.generated_id || ''),
    to_id: raw.to_id ? String(raw.to_id) : undefined,
    image: normalizedImage,
    video: normalizedVideo,
    video_name: raw.video_name ? String(raw.video_name) : undefined,
    video_expired: raw.video_expired ? String(raw.video_expired) : '',
    thumbnail: raw.thumbnail ? String(raw.thumbnail) : undefined,
    message: raw.message !== undefined && raw.message !== null ? String(raw.message) : '',
    reply: raw.reply ? String(raw.reply) : '',
    type: Number(raw.type ?? 0),
    time: raw.time ? String(raw.time) : '',
    date: raw.date ? String(raw.date) : '',
    status: Number(raw.status ?? 0),
    broadcast: Boolean(raw.broadcast),
    product_id: raw.product_id ? String(raw.product_id) : '',
    product: mapProductChat(raw.product),
    transaction_id: raw.transaction_id ? String(raw.transaction_id) : '',
    transaction: mapTransactionChat(raw.transaction),
    negotiation_id: raw.negotiation_id
      ? String(raw.negotiation_id)
      : (typeof raw.negotiation === 'string' ? raw.negotiation : ''),
    negotiation: mapNegotiationChat(raw.negotiation),
    request_id: raw.request_id ? String(raw.request_id) : '',
    request: mapRequestChat(raw.request),
    anomaly: raw.anomaly ? String(raw.anomaly) : '',
  }
}

