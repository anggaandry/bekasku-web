export interface PaymentGuideItem {
  title: string
  description: string
}

export interface PaymentDashboardData {
  invoice_no: string
  total_payment: number
  payment_logo: string
  payment_name: string
  payment_category: string
  payment_number: string
  payment_direct: boolean
  with_input: boolean
  payment_method_id: string
  limit_payment: number
  payment_link: string
  has_sent_payment: boolean
  qr_url: string
  input: string
  guide: PaymentGuideItem[]
  payment_type: 'transaction' | 'subscription' | 'promotion' | string
  payment_title: string
  type_subscribe?: string | null
  is_promotion?: boolean
  promotion_type?: string | null
}

export interface PaymentStatusResult {
  expired: boolean
  paid: boolean
  type_subscribe?: string | null
  is_promotion?: boolean
  promotion_type?: string | null
  promotion_days?: number
  product_id?: string | null
  product_title?: string
  product_image?: string
}

export interface PaymentStatusBadge {
  name: string
  text_color?: string
  back_color?: string
}

export interface PaymentOrderProduct {
  id: string
  product_id?: string
  product_title?: string
  product_image?: string
  product_price?: number
  total_price?: number
  total_product?: number
}

export interface PaymentOrderAddress {
  id?: string
  address_name?: string
  address?: string
  address_note?: string
  city?: string
  province?: string
  postal?: string
  subdistrict?: string
  contact_name?: string
  contact_phone?: string
  main?: boolean
}

export interface PaymentOrderShipping {
  name?: string
  logo?: string
  price?: number
  description?: string
  est?: string
  courier_code?: string
  shipping_code?: string
  partner?: string
}

export interface PaymentOrderSeller {
  seller_id?: string
  seller_name?: string
  seller_city?: string
  seller_avatar?: string
  products?: PaymentOrderProduct[]
  address?: PaymentOrderAddress
  shipping?: PaymentOrderShipping
}

export interface PaymentMethodDetailInfo {
  id?: string
  _id?: string
  name?: string
  category_name?: string
  image?: string
  direct?: boolean
  with_input?: boolean
  payment_limit?: number
  charge_number?: number
  charge_percent?: number
}

export interface PaymentDetailData {
  _id: string
  invoice_no: string
  status: PaymentStatusBadge
  buy_date: string
  cancel_date: string
  method: number // 0: Meet (COD), 1: Courier
  total_item: number
  service_fee: number
  payment_fee: number
  balance_use: number
  discount: number
  total_order: number
  total_order_only?: number
  total_shipping: number
  total_insurance: number
  final_charge: number
  orders?: PaymentOrderSeller[]
  payment_method?: PaymentMethodDetailInfo
  is_promotion?: boolean
  promotion_type?: string | null
  promotion_days?: number
  promotion_quota?: number
  product_id?: string | null
  product_title?: string
  product_image?: string
  type_subscribe?: string | null
  subscribe_days?: number
  days?: number
  trx_code?: string
  qr_url?: string
  payment_link?: string
  has_sent_payment?: boolean
  stock_locked?: boolean
}

