import type { SearchFilters } from '~/types/search'
import { SEARCH_TYPE_REGULAR } from '~/utils/constants'
import { toSafeString, toSafePositiveInt } from '~/utils/inputGuard'

export function useSearchQuery() {
  const route = useRoute()

  function parseFiltersFromRoute(): SearchFilters {
    const q = toSafeString(route.query.q) || toSafeString(route.query.filter)

    const filterArr = q ? [q] : []
    const typeNum = route.query.type !== undefined ? toSafePositiveInt(route.query.type, q ? SEARCH_TYPE_REGULAR : 0, 0, 100) : (q ? SEARCH_TYPE_REGULAR : 0)

    const citiesRaw = route.query.cities
    let cities: string[] = []
    if (Array.isArray(citiesRaw)) {
      cities = citiesRaw.map(c => toSafeString(c, 100)).filter(Boolean)
    } else if (typeof citiesRaw === 'string' && citiesRaw.trim()) {
      cities = citiesRaw.split(',').map(c => toSafeString(c, 100)).filter(Boolean)
    } else if (route.query.city) {
      const singleCity = toSafeString(route.query.city, 100)
      if (singleCity) cities = [singleCity]
    }

    const cityParam = toSafeString(route.query.city, 100)

    return {
      q,
      filter: filterArr,
      type: typeNum,
      categoryId: toSafeString(route.query.category_id, 50),
      categoryName: toSafeString(route.query.category_name, 100) || toSafeString(route.query.category, 100),
      subcategoryId: toSafeString(route.query.subcategory_id, 50),
      locationId: toSafeString(route.query.location_id, 50),
      locationName: toSafeString(route.query.location_name, 100),
      provinceId: toSafeString(route.query.province_id, 50),
      provinceName: toSafeString(route.query.province_name, 100),
      city: cityParam || (cities[0] || ''),
      cities,
      minPrice: toSafePositiveInt(route.query.min_price, 0, 0),
      maxPrice: toSafePositiveInt(route.query.max_price, 0, 0),
      newest: toSafePositiveInt(route.query.newest, 0, 0, 1),
      cheapest: toSafePositiveInt(route.query.cheapest, 0, 0, 1),
      mostExpensive: toSafePositiveInt(route.query.most_expensive, 0, 0, 1),
      freeOngkir: toSafePositiveInt(route.query.free_ongkir, 0, 0, 1),
      trusted: toSafePositiveInt(route.query.trusted, 0, 0, 1),
      verified: toSafePositiveInt(route.query.verified, 0, 0, 1),
      vip: toSafePositiveInt(route.query.vip, 0, 0, 1),
      needed: toSafePositiveInt(route.query.needed, 0, 0, 1),
      rating: toSafePositiveInt(route.query.rating, 0, 0, 5),
      tab: route.query.tab === 'store' ? 'store' : 'product',
      mode: route.query.mode === 'visual' ? 'visual' : 'text',
    }
  }

  function buildQueryFromFilters(filters: Partial<SearchFilters>): Record<string, string> {
    const qObj: Record<string, string> = {}

    const keyword = filters.q?.trim() || (filters.filter && filters.filter[0]?.trim()) || ''
    if (keyword) qObj.q = keyword

    if (filters.type !== undefined && filters.type !== 0) qObj.type = String(filters.type)
    if (filters.categoryId) qObj.category_id = filters.categoryId
    if (filters.categoryName) qObj.category_name = filters.categoryName
    if (filters.subcategoryId) qObj.subcategory_id = filters.subcategoryId
    if (filters.locationId) qObj.location_id = filters.locationId
    if (filters.locationName) qObj.location_name = filters.locationName
    if (filters.provinceId) qObj.province_id = filters.provinceId
    if (filters.provinceName) qObj.province_name = filters.provinceName
    if (filters.city) qObj.city = filters.city
    if (filters.cities && filters.cities.length > 0) qObj.cities = filters.cities.join(',')
    if (filters.minPrice && filters.minPrice > 0) qObj.min_price = String(filters.minPrice)
    if (filters.maxPrice && filters.maxPrice > 0) qObj.max_price = String(filters.maxPrice)
    if (filters.newest && filters.newest > 0) qObj.newest = String(filters.newest)
    if (filters.cheapest && filters.cheapest > 0) qObj.cheapest = String(filters.cheapest)
    if (filters.mostExpensive && filters.mostExpensive > 0) qObj.most_expensive = String(filters.mostExpensive)
    if (filters.freeOngkir && filters.freeOngkir > 0) qObj.free_ongkir = String(filters.freeOngkir)
    if (filters.trusted && filters.trusted > 0) qObj.trusted = String(filters.trusted)
    if (filters.verified && filters.verified > 0) qObj.verified = String(filters.verified)
    if (filters.vip && filters.vip > 0) qObj.vip = String(filters.vip)
    if (filters.needed && filters.needed > 0) qObj.needed = String(filters.needed)
    if (filters.rating && filters.rating > 0) qObj.rating = String(filters.rating)
    if (filters.tab && filters.tab !== 'product') qObj.tab = filters.tab
    if (filters.mode && filters.mode === 'visual') qObj.mode = 'visual'

    return qObj
  }

  function updateRouteFilters(filters: Partial<SearchFilters>, targetPath = '/search/result') {
    const query = buildQueryFromFilters(filters)
    return navigateTo({ path: targetPath, query })
  }

  return {
    parseFiltersFromRoute,
    buildQueryFromFilters,
    updateRouteFilters,
  }
}

