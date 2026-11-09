export interface ReviewProductItem {
  id: string
  title: string
  image: string
  price?: number
}

export interface ReviewData {
  transaction_id?: string
  name?: string
  avatar?: string
  location?: string
  products?: ReviewProductItem[]
  review?: string
  review_text?: string
  score?: number
  service_score?: number
  shipping_score?: number
  images?: string[]
  video?: string
  video_thumbnail?: string
  time?: string
}

export interface SubmitReviewPayload {
  transaction_id: string
  review: string
  review_text?: string
  review_score: number
  review_service_score?: number
  review_shipping_score?: number
  review_images?: string[]
  review_video?: string
  review_video_thumbnail?: string
  lang?: string
}

