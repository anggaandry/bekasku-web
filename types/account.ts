export interface ProfileData {
  avatar?: string
  name: string
  shop_name?: string
  phone?: string
  email?: string
  bio?: string
  instagram?: string
  instagram_verify?: boolean
  tiktok?: string
  tiktok_verify?: boolean
  datebirth?: string
  gender?: string
  location?: string
  rating?: number
  badge_payment?: number
  badge_process?: number
  badge_sent?: number
  badge_received?: number
  badge_return?: number
  badge_review?: number
  badge_wishlist?: number
  total_followers?: number
  total_following?: number
  total_favorite?: number
  member_since?: string
  subscribe?: string
  subscribe_type?: string
  bekasku_plus_status?: string
  is_bekasku_plus_registered?: boolean
  deleted?: string
  deleted_at?: string | null
  delete_days?: number
  is_deleting?: boolean
}

export interface UpdateProfilePayload {
  name?: string
  shop_name?: string
  bio?: string
  datebirth?: string
  gender?: string
  instagram?: string
  tiktok?: string
  address_default_id?: string
  default_loc?: string
  city?: string
  province?: string
}

export interface AccountSettingData {
  deleted?: string
  deleted_at?: string | null
  delete_days?: number
  is_deleting?: boolean
  allow_change_email?: boolean
  allow_change_phone?: boolean
}

