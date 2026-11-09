export interface ProductChatModel {
  id: string
  title: string
  image: string
  price: number
  location?: string
  rating?: number
  user_id?: string
  is_seller?: boolean
}

export interface TransactionChatModel {
  id: string
  invoice?: string
  title: string
  image: string
  price?: number
  status: string
  status_code?: string
  status_color?: string
  status_bg?: string
  date?: string
  total_order: number
}

export interface NegotiationStatusModel {
  name: string
  code: 'onoffer' | 'accepted' | 'declined' | 'canceled' | 'expired' | string
  text_color?: string
  back_color?: string
}

export interface NegotiationChatModel {
  nego_id: string
  product_id: string
  title: string
  image: string
  expired?: string
  price: number
  nego_price: number
  seller: boolean
  status?: NegotiationStatusModel
}

export interface RequestChatModel {
  id: string
  is_seller?: boolean
  title: string
  image: string
  type: 'photo' | 'video' | string
  chat_id?: string
  price?: number
  location?: string
  rating?: number
}

export interface ChatMessage {
  id: string
  to_id?: string
  image?: string
  video?: string
  video_name?: string
  thumbnail?: string
  video_expired?: string
  message?: string
  reply?: string
  /** 0 = SENDER (isMe), 1 = RECEIVER (partner) */
  type: number
  time?: string
  date?: string
  /** 100 = LOADING, 0 = SENT, 1 = READ, 99 = FAIL */
  status: number
  broadcast?: boolean
  product_id?: string
  product?: ProductChatModel | null
  transaction_id?: string
  transaction?: TransactionChatModel | null
  negotiation_id?: string
  negotiation?: NegotiationChatModel | null
  request_id?: string
  request?: RequestChatModel | null
  anomaly?: string | null
}

export interface ChatBoxItem {
  id: string
  avatar: string | null
  name: string | null
  time: string
  message?: string | null
  video?: string | null
  image?: string | null
  transaction?: string | null
  negotiation?: string | Record<string, unknown> | boolean | null
  request_type?: 'photo' | 'video' | string | null
  anomaly?: string | null
  product?: string | null
  status?: number | null
  read: boolean
  blocked: boolean
  total_unread: number
  subscribe_type?: string
  is_bekasku_plus?: boolean
  online?: boolean
  intyping?: boolean
}

export interface ChatBoxResponse {
  status?: boolean
  message?: string
  result?: {
    docs: ChatBoxItem[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    unread_seller: number
    unread_buyer: number
  }
}

export interface ChatListResponse {
  status?: boolean
  message?: string
  result?: {
    docs: Record<string, unknown>[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage?: boolean
    blocked?: boolean
    is_blocker?: boolean
  }
}

export interface ChatPartnerProfile {
  id: string
  name: string
  avatar: string
  subscribe_type?: string
  is_bekasku_plus?: boolean
  trusted?: boolean
}

export interface ChatOpenRoomOptions {
  partnerId: string
  partnerName?: string
  partnerAvatar?: string
  subscribeType?: string
  isBekaskuPlus?: boolean
  trusted?: boolean
  initMessage?: string
  reply?: string
  product?: ProductChatModel | null
  transaction?: TransactionChatModel | null
  request?: RequestChatModel | null
  preferFullPage?: boolean
}

