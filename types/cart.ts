export interface CartProduct {
  id?: string
  product_id: string
  product_title: string
  product_image: string
  product_price: number
  original_price: number
  discount: number
  discount_percent: number
  total_product: number
  total_price: number
  total_weight: number
  product_stock: number
  is_nego: boolean
  is_best_deal: boolean
  in_wishlist: boolean
  allow_meet: boolean
  allow_delivery: boolean
  is_available: boolean
  unavailable_reason?: string
  free_delivery: number
  product_weight?: number
  product_height?: number
  product_length?: number
  product_width?: number
  charge?: number
  checked: boolean
}

export interface CartSeller {
  seller_id: string
  seller_name: string
  seller_city?: string
  seller_avatar?: string
  subscribe_type?: string
  bekasku_plus_status?: string
  is_bekasku_plus?: boolean
  free_delivery?: number | boolean
  products: CartProduct[]
  checked?: boolean
  address?: Record<string, unknown> | null
  shipping?: Record<string, unknown> | null
  type_shipping?: string
  insurance_price?: number
  use_insurance?: boolean
  lock_insurance?: boolean
}

export interface CartListResponse {
  cart: CartSeller[]
  total_item?: number
  buyer_id?: string
  buyer_address?: Record<string, unknown> | null
}

export interface CartSyncItem {
  id?: string
  user_id?: string
  seller_id: string
  product_id: string
  checked: boolean
  total: number
}

