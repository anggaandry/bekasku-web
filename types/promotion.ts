export type PromotionType = 'sundul' | 'highlight' | 'spotlight'

export interface PromotionQuota {
  sundul_quota: number
  highlight_quota: number
  spotlight_quota: number
}

export interface PromotionPackage {
  _id: string
  name?: string
  type: PromotionType
  quota?: number
  days?: number
  price: number
  discount?: number
  final_price?: number
  is_active?: boolean
}

export interface ProductPromotionStatus {
  product_id: string
  sundul_at?: string | null
  sundul_cooldown_expired?: string | null
  sundul_cooldown_seconds: number
  highlight_active: boolean
  highlight_until?: string | null
  spotlight_active: boolean
  spotlight_until?: string | null
}

export interface ActivePromotionProduct {
  _id: string
  title: string
  price: number
  image?: string[] | string
  sundul_active?: boolean
  sundul_at?: string | null
  sundul_cooldown_seconds?: number
  highlight_active?: boolean
  highlight_until?: string | null
  spotlight_active?: boolean
  spotlight_until?: string | null
}

export interface PromotionTargetProduct {
  _id: string
  title: string
  price: number
  image?: string[] | string
  condition?: string
  city?: string
}

export interface PromotionDraft {
  product: PromotionTargetProduct
  package: PromotionPackage
  type: PromotionType
  useQuota: boolean
}

export interface PromotionApplyResponse {
  message?: string
  result?: {
    success?: boolean
    days?: number
    message?: string
  }
}

