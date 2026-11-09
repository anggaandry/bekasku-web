export interface VideoFeedItem {
  id: string
  _id?: string
  user_id: string
  user_name: string
  user_avatar: string
  thumbnail: string
  video_url: string
  content?: string
  title?: string
  city?: string
  likes?: number
  total_like?: number
  is_liked?: boolean
  comments?: number
  total_comment?: number
  music?: string
  is_live?: boolean
  live_id?: string
  viewers?: number
  product_id?: string
  product?: {
    _id: string
    title: string
    price: number
    image?: string
  } | null
  created_at?: string
}

export interface VideoCommentItem {
  _id: string
  comment: string
  user_name: string
  user_avatar?: string
  time?: string
  created_at?: string
}

