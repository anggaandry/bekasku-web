export interface UserAddress {
  id?: string
  _id?: string
  address_id?: string
  address_name?: string
  contact_name?: string
  contact_phone?: string
  name?: string
  phone?: string
  address: string
  address_note?: string
  city: string
  city_id?: string
  province?: string
  postal?: string
  postal_code?: string
  subdistrict?: string
  subdistrict_id?: string
  type_city?: string
  main?: boolean | number | string
  is_default?: boolean
  lat?: number | string
  lon?: number | string
  lng?: number | string
  location?: {
    type?: string
    coordinates?: [number, number]
  }
}

export interface AddressFormPayload {
  address_id?: string | number
  address_name: string
  address: string
  address_note?: string
  city: string
  province: string
  postal: string
  subdistrict: string
  type_city: string
  main: boolean
  lon: number | string
  lat: number | string
  contact_name: string
  contact_phone: string
}

export interface MapLocationPoint {
  lat: number
  lng: number
  title: string
  subtitle: string
  road?: string
  subdistrict?: string
  city?: string
  province?: string
  postal?: string
  type_city?: string
}

export interface NominatimSearchResult {
  display_name: string
  lat: string
  lon: string
}

export interface NominatimReverseAddress {
  road?: string
  pedestrian?: string
  street?: string
  house_number?: string
  suburb?: string
  village?: string
  neighbourhood?: string
  city_district?: string
  subdistrict?: string
  district?: string
  city?: string
  town?: string
  county?: string
  state?: string
  province?: string
  postcode?: string
}

export interface NominatimReverseResponse {
  name?: string
  display_name?: string
  address?: NominatimReverseAddress
}
