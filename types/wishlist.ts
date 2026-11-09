import type { ProductCard } from './product'

export interface WishlistFilterOption {
  label: string
  type: number // 0: Semua, 2: Best Deal, 4: Dibutuhkan
}

export interface WishlistState {
  items: ProductCard[]
  loading: boolean
  searchLoading: boolean
  error: string | null
  filterType: number
  searchQuery: string
}

