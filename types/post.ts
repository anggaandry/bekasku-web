export interface CategoryItem {
  _id: string
  id?: string
  name_id: string
  name_en?: string
  name?: string
  image?: string
  slug?: string
}

export interface SubcategoryItem {
  _id: string
  id?: string
  category_id: string
  name_id: string
  name_en?: string
  name?: string
  charge: number
  form?: DynamicFormField[]
}

export interface TypeCategoryItem {
  _id: string
  id?: string
  subcategory_id: string
  name_id: string
  name_en?: string
  name?: string
}

export interface UploadedImage {
  id: string
  url: string
  base64: string
  isExisting?: boolean
}

export interface DynamicFormFieldOption {
  id: number | string
  name?: string
  name_id?: string
  name_en?: string
}

export interface DynamicFormField {
  id: number | string
  type: string | number // '1' = dropdown, '2' = text
  name: string
  name_id?: string
  name_en?: string
  list?: DynamicFormFieldOption[]
}

export interface DynamicFormAnswer {
  id: number | string
  type: string | number
  answer: string
  answer_id?: string | number | null
}

export interface PostAddressData {
  id?: string
  _id?: string
  address_name: string
  address: string
  city: string
  province: string
  postal?: string
  subdistrict?: string
  subdistrict_id?: string
  city_id?: string
  lon: number
  lat: number
  contact_name: string
  contact_phone: string
}

export interface PostSellInitResponse {
  address: PostAddressData | null
  type_name: string
  type_id: string
  form: DynamicFormField[]
  form_answer: DynamicFormAnswer[]
  product_data: Record<string, unknown> | null
  allow_transaction: boolean
  charge: number
  subcategory_name: string
}

export interface AiPriceResult {
  price: number
  description: string
}

export interface AiPostAnalysisResult {
  title: string
  price: number
  description: string
  category_id: string
  category: string
  subcategory_id: string
  subcategory: string
  type_id?: string
  type_name?: string
  weight?: number
  length?: number
  width?: number
  height?: number
  via_courrier?: boolean
  free_delivery?: number
  direct_meet?: boolean
  negotiation?: boolean
  stock?: number
  message?: string
  extra?: DynamicFormAnswer[]
  extra_form?: DynamicFormField[]
}

export interface PostSellSubmitPayload {
  product_id?: string
  title: string
  description: string
  category_id?: string
  subcategory_id?: string
  sub_category_id: string
  type_category_id?: string
  sell_method: number
  price: number
  stock: number
  weight: number
  length?: number
  width?: number
  height?: number
  direct_meet: boolean
  delivery_courrier: boolean
  free_delivery: number | boolean
  total_free_delivery?: number
  address_data: PostAddressData
  image_data: string[]
  video?: string
  extra?: DynamicFormAnswer[]
  lang: string
  negotiation?: boolean
  step?: number
}
