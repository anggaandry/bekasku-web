import type { ProductCard } from './product'

export interface SearchFilters {
  q?: string
  filter?: string[]
  type?: number
  categoryId?: string
  categoryName?: string
  subcategoryId?: string
  locationId?: string
  locationName?: string
  provinceId?: string
  provinceName?: string
  city?: string
  cities?: string[]
  minPrice?: number
  maxPrice?: number
  newest?: number
  cheapest?: number
  mostExpensive?: number
  freeOngkir?: number
  trusted?: number
  verified?: number
  vip?: number
  needed?: number
  rating?: number
  page?: number
  limit?: number
  tab?: 'product' | 'store'
  mode?: 'text' | 'visual'
}

export interface SearchHistoryItem {
  _id?: string
  id?: string
  keyword: string
  user_id?: string
  createdAt?: string
}

export interface SearchCategoryItem {
  id: string
  _id?: string
  name: string
  image?: string
  total_product?: number
}

export interface SellerResult {
  id: string
  _id?: string
  name: string
  username?: string
  avatar?: string
  status?: string
  rating?: number | string
  city?: string
  verified?: boolean | number
  trusted?: boolean | number
  subscribe?: string
  is_bekasku_plus?: boolean
  is_plus?: boolean
  bekasku_plus?: boolean
  bekasku_plus_status?: string
  vip?: boolean
  is_vip?: boolean
  followers?: number
  percent_chat_reply?: number | string
  products?: ProductCard[]
}

export interface SellerSearchResponse {
  docs: SellerResult[]
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
}

export interface LocationOption {
  id: string
  name: string
  type?: string
  gps?: boolean
}

