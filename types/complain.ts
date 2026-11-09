export interface ComplainProductItem {
  product_id: string
  product_image: string
  product_title: string
  product_price: number
  total_price: number
  total_product: number
  total_complain: number
}

export interface ComplainImageItem {
  image: string
  description?: string
}

export interface ComplainCourierItem {
  _id: string
  name: string
  code: string
}

export interface ComplainDetailData {
  transaction_id?: string
  invoice_no?: string
  invoice?: string
  complain_items?: ComplainProductItem[]
  complain_images?: ComplainImageItem[]
  complain_price?: number
  complain_date?: string
  complain_message?: string
  complain_video?: string
  complain_reason?: string
  complain_decline_reason?: string
  status?: {
    code: string
    name: string
  }
  status_code?: string
  status_name?: string
  is_seller?: boolean
  return_address?: {
    _id?: string
    id?: string
    contact_name?: string
    contact_phone?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
  }
  return_courier_name?: string
  return_courier_code?: string
  return_waybill?: string
  return_image?: string
}

export interface CreateComplainPayload {
  transaction_id: string
  complain_items: string
  complain_images: string
  complain_message: string
  complain_reason: string
  complain_price: number
  complain_video?: string
  lang?: string
}

export interface SubmitWaybillPayload {
  transaction_id: string
  courier_code: string
  return_courier_code: string
  courier_name: string
  return_courier_name: string
  waybill: string
  return_waybill: string
  image: string
  return_image: string
  lang?: string
}

