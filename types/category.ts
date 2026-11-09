import type { ProductCard } from './product'

export interface Category {
  id: string
  _id?: string
  name: string
  image: string
  total_product?: number
}

export interface Subcategory {
  id: string
  _id?: string
  category: string
  name: string
  products: ProductCard[]
}
