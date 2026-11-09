export interface LiveSession {
  id?: string
  live_id: string
  user_id: string
  user_name: string
  user_avatar: string
  title?: string
  content?: string
  viewer_count?: number
  viewers?: number
  is_live?: boolean
  rating?: number
  city?: string
  thumbnail?: string
  video_url?: string
}

export interface LiveProductItem {
  _id: string
  title: string
  price: number
  image?: string
  images?: string[]
  step?: number
  rating?: number
  review_count?: number
  seller_id?: string
}

export interface LiveChatMessage {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  message: string
  timestamp?: number
  is_join?: boolean
}
