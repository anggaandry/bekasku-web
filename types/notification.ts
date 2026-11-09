export interface NotificationFeedData {
  sub_type?: string
  type?: string
  live_id?: string
  liveId?: string
  host_id?: string
  hostId?: string
  host_name?: string
  hostName?: string
  hostUsername?: string
  user_avatar?: string
  userAvatar?: string
  avatar?: string
  cover?: string
  thumbnail?: string
  title?: string
  total_viewers?: string | number
  duration_minutes?: string | number
  duration_formatted?: string
  action_url?: string
}

export interface NotificationTransactionData {
  id?: string
  _id?: string
  transaction_id?: string
  transactionId?: string
  product_id?: string
  product_name?: string
  product_image?: string
  productImage?: string
  other?: number
  has_review?: boolean
  [key: string]: unknown
}

export interface NotificationChatData {
  id?: string
  objectId?: string
  name?: string
  avatar?: string
  [key: string]: unknown
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  type: number // 1=pesanan, 2=promo, 3=sistem, 4=live
  read: boolean
  time: string
  image?: string | null
  screen?: string | null
  transaction?: NotificationTransactionData | null
  chat?: NotificationChatData | null
  feed?: NotificationFeedData | null
}

export interface NotificationListResponse {
  message?: string
  result?: {
    docs: NotificationItem[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface NotificationReviewProductRef {
  id?: string
  product_id?: string
  title?: string
  product_title?: string
  image?: string
  product_image?: string
  price?: number
  total_price?: number
}

export interface NotificationWaitingReviewItem {
  id?: string
  _id?: string
  product_name?: string
  product_image?: string
  transaction_time?: string
  createdAt?: string
  total_price?: number
  product_id?: NotificationReviewProductRef[]
}

export interface NotificationMyReviewItem {
  id?: string
  _id?: string
  transaction_id?: string
  product_name?: string
  product_image?: string
  total_price?: number
  products?: NotificationReviewProductRef[]
  product_id?: NotificationReviewProductRef[]
  avatar?: string
  buyer_avatar?: string
  name?: string
  buyer_name?: string
  score?: number
  review_score?: number
  service_score?: number
  review_service_score?: number
  shipping_score?: number
  review_shipping_score?: number
  time?: string
  review_time?: string
  createdAt?: string
  review?: string
  review_text?: string
  comment?: string
}

export interface NotificationReviewListResponse<T> {
  message?: string
  result?: {
    docs?: T[]
    totalDocs?: number
    hasNextPage?: boolean
  }
}
