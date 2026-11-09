export interface VipPackage {
  _id?: string
  days: number
  price: number
  discount: number
  final_price: number
  type: string
}

export interface SubscribeDraft {
  type: string
  packageName: string
  days: number
  subtotalPrice: number
  discount: number
  totalPrice: number
  serviceFee: number
}

export interface SubscribeDashboardInfo {
  balance: number
  rating: number
  bd_time: number
  ads: number
  subscribe_days: number
  subscribe_type: string
  default_address: string
}

export interface SubscribeCheckoutPayload {
  type: string
  days: number
  password?: string
  payment_method_id: string
  service_fee: number
  payment_fee: number
  balance_use: number
  total_order_only: number
  discount: number
  total_order: number
  final_charge: number
  orders: Record<string, unknown>[]
  input: string
  lang: string
}

