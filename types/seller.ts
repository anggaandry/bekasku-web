export interface BekaskuPlusSeller {
  id: string
  _id?: string
  name: string
  avatar: string
  rating?: number
  location?: string
  city?: string
  is_bekasku_plus?: boolean
  badge?: string
}

export interface SellerInfo {
  id: string
  _id?: string
  avatar: string
  name: string
  videos?: any[]
  location?: string
  rating?: number
  bio?: string
  instagram?: string
  tiktok?: string
  total_followers?: number
  total_following?: number
  blocked?: boolean
  has_follow?: boolean
  trusted?: boolean
  verified?: boolean
  is_vvip?: boolean
  is_vip?: boolean
  bekasku_plus_status?: string
  is_bekasku_plus?: boolean
  live_id?: string
  subscribe?: string
  percent_chat_reply?: number | string | null
  total_sold?: number | string | null
  last_active?: string
}

export interface ReviewProductContext {
  id?: string
  _id?: string
  title?: string
  image?: string
  price?: number
}

export interface SellerReviewItem {
  id?: string
  _id?: string
  transaction_id?: string
  avatar?: string
  name?: string
  score?: number | string
  time?: string
  service_score?: number | string
  shipping_score?: number | string
  review?: string
  images?: string[]
  video?: string
  video_thumbnail?: string
  products?: ReviewProductContext[]
  product_title?: string
  product_image?: string
}

export interface SellerProductsResponse {
  docs: any[]
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
}

export interface SellerReviewsResponse {
  docs: SellerReviewItem[]
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
}
