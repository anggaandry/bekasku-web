import type { CartSeller, CartProduct } from './cart'

export interface CheckoutAddress {
  _id?: string
  address_name?: string
  name?: string
  phone?: string
  contact_name?: string
  contact_phone?: string
  address?: string
  address_note?: string
  city?: string
  province?: string
  postal?: string
  subdistrict?: string
  subdistrict_id?: string
  city_id?: string
  lat?: string | number
  lon?: string | number
}

export interface ShippingServiceItem {
  name?: string
  logo?: string
  courier_code?: string
  code?: string
  shipping_code?: string
  service_name?: string
  price?: number
  pickup?: boolean
  description?: string
  est?: string
  duration?: string
  partner?: string
  insurance_max?: number
  insurance_min?: number
  insurance_number?: number
  insurance_percent?: number
  [key: string]: unknown
}

export interface CourierRateGroup {
  courier_code: string
  name: string
  logo?: string
  lowest_price: number
  services: ShippingServiceItem[]
}

export interface PaymentMethodItem {
  id: string
  name: string
  image: string
  charge_number: number
  charge_percent: number
  with_input: boolean
  fee_text?: string
  min?: number
  max?: number
  description?: string
}

export interface PaymentCategoryItem {
  id: string
  name: string
  methods: PaymentMethodItem[]
}

export interface CheckoutDraftSeller extends CartSeller {
  shipping?: ShippingServiceItem | null
  use_insurance?: boolean
  insurance_price?: number
  lock_insurance?: boolean
  discount_shipping?: number
}

export interface CheckoutDraft {
  items: { seller: CartSeller; product: CartProduct }[]
  totalPrice: number
  transactionMethod: number
}

