export interface BestDealCreatePayload {
  product_id: string
  bestdeal_price: number
  lang: string
}

export interface BestDealCreateResponse {
  message: string
  result: string
}

export interface BestDealProductSummary {
  id: string
  title: string
  price: number
  image?: string
}

