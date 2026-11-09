import type { ApiFlag } from '~/utils/flags'

export interface ProductCard {
  id: string
  _id?: string
  image: string
  title: string
  city?: string
  price: number
  original_price?: number
  discount?: number
  auction_limit?: string
  sell_method?: number
  free_delivery?: boolean
  trusted?: ApiFlag
  subscribe?: boolean
  rate?: number
  is_highlighted?: boolean
  is_spotlighted?: boolean
  sundul_at?: string
  distance?: number
  sub_category?: string
  priority?: number
  stock?: number
}

export interface ProductSearchResponse {
  docs: ProductCard[]
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  nextPage?: number | null
  hasPrevPage?: boolean
  prevPage?: number | null
  bd_time?: string
}

export interface ProductSeller {
  id: string
  avatar?: string
  name: string
  username?: string
  phone?: string
  review_score?: number
  rating?: number
  blocked?: boolean
  trusted?: ApiFlag
  subscribe?: string | boolean
  subscribe_type?: string
  verified?: ApiFlag
  time?: string
  live_id?: string | null
  percent_chat_reply?: number
  instagram?: string
  tiktok?: string
  city?: string
  province?: string
  location?: string
  is_bekasku_plus?: ApiFlag
  bekasku_plus_status?: string
  total_sold?: number
  is_vip?: ApiFlag
}

export interface ProductDetail {
  id: string
  _id?: string
  user_id?: string
  price: number
  old_price?: number
  original_price?: number
  image: string[] | string
  title: string
  discount?: number
  sell_method: number // 0: lelang, 1: beli langsung, 2: dibutuhkan, 3: donasi, 4: jasa
  city?: string
  province?: string
  time?: string
  stock?: number
  weight?: number
  height?: number
  width?: number
  length?: number
  direct?: ApiFlag // Ketemuan langsung
  direct_meet?: ApiFlag
  allow_meet?: ApiFlag
  via_courrier?: ApiFlag
  via_courier?: ApiFlag
  allow_courrier?: ApiFlag
  negotiation?: boolean
  category?: string
  sub_category?: string
  category_id?: string
  sub_category_id?: string
  on_verify?: boolean
  on_air?: boolean
  on_decline?: boolean
  on_sale?: boolean
  on_expired?: boolean
  on_canceled?: boolean
  decline_reason?: string
  bd_coming?: string
  bdcd_second?: number
  description?: string
  step?: number
  status?: {
    name?: string
    text_color?: string
    back_color?: string
  }
  total_view?: number
  total_favorite?: number
  mine?: boolean
  in_wishlist?: boolean
  free_delivery?: boolean | number
  free_ongkir?: boolean | number
  allow_transaction?: ApiFlag
  allow_analytics?: boolean
  video?: string
  video_thumbnail?: string
  is_highlighted?: boolean
  is_spotlighted?: boolean
  trusted?: ApiFlag
  verified?: ApiFlag
  subscribe?: string | boolean
  subscribe_type?: string
  bekasku_plus?: ApiFlag
  is_bekasku_plus?: ApiFlag
  bekasku_plus_status?: string
  rate?: number
  rating?: number
  is_needed?: ApiFlag
  is_donation?: ApiFlag
  is_service?: ApiFlag
  is_need?: ApiFlag
  is_vip?: ApiFlag
}

export interface ProductDiscussionReply {
  _id?: string
  id?: string
  user_id?: string
  user_name?: string
  user_avatar?: string
  comment?: string
  discussion?: string
  time?: string
  createdAt?: string
  user_is_seller?: boolean
  is_seller?: boolean
}

export interface ProductDiscussion {
  _id: string
  id?: string
  discussion?: string
  comment?: string
  user_id: string
  user_name: string
  user_avatar?: string
  time?: string
  createdAt?: string
  total_reply?: number
  user_is_seller?: boolean
  is_seller?: boolean
  reply?: ProductDiscussionReply[]
}

export interface ShippingServiceItem {
  carrier: string
  logo?: string
  description: string
  price: number
  est: string
}

export interface ProductDetailResponse {
  product: ProductDetail
  seller: ProductSeller
  total_discussion?: number
  images?: string[]
  in_wishlist?: boolean
  mine?: boolean
}
