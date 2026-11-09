import type { ProductCard } from './product'

export interface NeededOfferTargetInfo {
  needed_title: string
  seller_id: string
  seller_name: string
  seller_avatar?: string
}

export interface OfferNeededResponse {
  docs: ProductCard[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  needed_title?: string
  seller_name?: string
  seller_avatar?: string
  seller_id?: string
}

