export interface MyCatalogStatusObj {
  id?: number
  name: string
  text_color?: string
  back_color?: string
}

export interface MyCatalogItem {
  id: string
  image?: string
  title: string
  price: number
  status?: MyCatalogStatusObj
  step?: number // 0=Menunggu verifikasi, 1=Sedang tayang/lelang, 2=Terjual, 3=Dibatalkan, 4=Ditolak, 5=Kadaluarsa
  allow_delete?: boolean
  free_delivery?: number
  time?: string
  sell_method?: number // 1=Direct, 2=Needed/Dibutuhkan, 3=Auction, 4=Service
  category?: string
  sub_category?: string
  views?: number
  likes?: number
}

export interface MyCatalogCounts {
  all: number
  active: number
  canceled: number
  sold: number
}

export interface MyCatalogResponse {
  message?: string
  result?: {
    docs: MyCatalogItem[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    counts?: MyCatalogCounts
  }
}

export interface StatusFilterItem {
  status: number
  label: string
}

