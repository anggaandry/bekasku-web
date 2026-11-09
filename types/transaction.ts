export interface TransactionStatusInfo {
  name: string
  code?: string
  text_color?: string
  back_color?: string
}

export interface TransactionListItem {
  id: string
  title: string
  shopName: string
  image: string
  price: number
  originalPrice?: number
  totalAmount?: number
  status: string | TransactionStatusInfo
  statusLabel?: string
  textColor?: string
  backgroundColor?: string
  time?: string
  isPayment?: boolean
  paymentType?: string
  otherCount?: number
  canPay?: boolean
}

export interface TransactionTabCount {
  belum_bayar: number
  sudah_bayar: number
  dikemas: number
  dikirim: number
  selesai: number
  pengembalian: number
  dibatalkan: number
}

export interface TransactionProductItem {
  id: string
  product_id?: string
  product_title?: string
  product_name?: string
  title?: string
  product_image?: string
  image?: string
  product_price?: number
  price?: number
  original_price?: number
  total_product?: number
  total?: number
  discount?: number
  discount_percent?: number
  is_best_deal?: boolean
  is_nego?: boolean
  product_weight?: number
  charge?: number
}

export interface TransactionShippingInfoData {
  courier_code?: string
  courier_name?: string
  courier_logo?: string
  type_shipping?: string
  shipping_partner?: string
  shipping_price?: number
  shipping_code?: string
  shipping_est?: string
  shipping_description?: string
  destination_address_name?: string
  destination_address?: string
  destination_address_note?: string
  destination_city?: string
  destination_province?: string
  destination_postal?: string
  destination_contact_name?: string
  destination_contact_phone?: string
  origin_address?: string
  origin_city_id?: string
}

export interface TransactionDetail {
  _id: string
  id?: string
  invoice_no?: string
  buy_date?: string
  step: number
  status?: string | TransactionStatusInfo
  seller?: boolean
  meet?: boolean
  pickup?: boolean
  courier_pickup?: boolean
  courier_dropoff?: boolean
  courier_logo?: string
  courier_name?: string
  waybill?: string
  shipping_id?: string
  track_link?: string
  driver_name?: string
  driver_phone?: string
  driver_plate?: string
  est_delivery?: string
  waybill_service?: string
  payment_method?: {
    name?: string
    image?: string
    type?: string
  }
  payment_id?: string
  payment_expired?: string
  confirm_expired?: string
  packing_expired?: string
  meeting_expired?: string
  finish_expired?: string
  confirm_complain_expired?: string
  delivered_date?: string
  finish_date?: string
  cancel_date?: string
  cancel_reason?: string
  canceled_by?: string
  complain_date?: string
  complain_price?: number
  complain_items?: any[]
  complain_detail?: string
  complain_reason?: string
  complain_decline_reason?: string
  type?: number
  seller_id?: string
  seller_name?: string
  seller_avatar?: string
  seller_city?: string
  seller_rate?: number
  buyer_id?: string
  buyer_name?: string
  buyer_avatar?: string
  buyer_phone?: string
  buyer_city?: string
  order?: {
    products?: TransactionProductItem[]
    shipping?: {
      name?: string
      logo?: string
      description?: string
    }
    typeShipping?: string
    seller_city?: string
  }
  products?: TransactionProductItem[]
  product_id?: TransactionProductItem[]
  price: number
  total_order?: number
  total_item?: number
  insurance?: number
  service_fee?: number
  taking_fee?: number
  taking_fee_percent?: number
  shipping_price?: number
  free_delivery?: number
  discount_shipping_price?: number
  total_discount?: number
  refund_amount?: number
  shipping_label?: string
  review?: string
  review_data?: any
  return_waybill?: string
  return_courier_name?: string
  return_courier_code?: string
  return_arrive_date?: string
  destination_address_name?: string
  destination_address?: string
  destination_contact_name?: string
  destination_contact_phone?: string
}

export interface ManifestEvent {
  note?: string
  description?: string
  time?: string
  date?: string
  status?: string
  timeraw?: any
  proof?: string
}

export interface TrackingDetailInfo {
  waybill: string
  courier_name: string
  service_name: string
  courier_logo: string
  manifest: ManifestEvent[]
  manifest_status: string
  track_link?: string
  driver_name?: string
  driver_phone?: string
  driver_plate?: string
  step?: number
  status_code?: string
  est_delivery?: string
  is_meet?: boolean
  return_arrive_date?: string
  return_waybill_date?: string
}

export interface MeetQrData {
  content: string
  limit: number
  is_seller: boolean
  seller_name?: string
  seller_avatar?: string
  seller_city?: string
  buyer_name?: string
  buyer_avatar?: string
  buyer_city?: string
}

export interface TransactionStatusResponse {
  code: string
  step?: number
  status?: string
  title?: string
}


