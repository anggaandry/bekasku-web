/**
 * Utility to determine whether a product is eligible for instant delivery
 * based on buyer location and product origin location.
 * Ported identically from bekasku_v3 InstantDeliveryChecker (Flutter).
 *
 * Uses a 3-level waterfall matching algorithm:
 * 1. Exact City Match (normalized)
 * 2. Major Metropolitan Group Match (e.g. Mebidangro, Jabodetabek, etc.)
 * 3. Province Fallback Match (from comma-separated address format)
 */

const METRO_GROUPS: string[][] = [
  // Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi, Tangerang Selatan)
  [
    'jakarta',
    'jakarta pusat',
    'jakarta barat',
    'jakarta selatan',
    'jakarta timur',
    'jakarta utara',
    'bekasi',
    'depok',
    'tangerang',
    'tangerang selatan',
    'south tangerang',
    'bogor',
  ],
  // Mebidangro (Medan, Binjai, Deli Serdang, Karo, Langkat)
  [
    'medan',
    'binjai',
    'deli serdang',
    'deliserdang',
    'karo',
    'langkat',
  ],
  // Bandung Raya (Bandung, Cimahi, Bandung Barat, Sumedang)
  [
    'bandung',
    'cimahi',
    'bandung barat',
    'sumedang',
  ],
  // Gerbangkertosusila (Surabaya, Gresik, Sidoarjo, Mojokerto, Lamongan, Bangkalan)
  [
    'surabaya',
    'gresik',
    'sidoarjo',
    'mojokerto',
    'lamongan',
    'bangkalan',
  ],
  // DI Yogyakarta / Jogja Raya (Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul)
  [
    'yogyakarta',
    'jogja',
    'sleman',
    'bantul',
    'kulon progo',
    'kulonprogo',
    'gunungkidul',
  ],
  // Kedungsepur / Semarang Raya (Semarang, Kendal, Demak, Salatiga, Grobogan)
  [
    'semarang',
    'kendal',
    'demak',
    'salatiga',
    'grobogan',
  ],
  // Solo Raya / Subosukawonosraten (Surakarta/Solo, Boyolali, Sukoharjo, Karanganyar, Wonogiri, Sragen, Klaten)
  [
    'surakarta',
    'solo',
    'sukoharjo',
    'karanganyar',
    'boyolali',
    'klaten',
    'sragen',
    'wonogiri',
  ],
  // Mamminasata / Makassar Raya (Makassar, Maros, Sungguminasa/Gowa, Takalar)
  [
    'makassar',
    'gowa',
    'maros',
    'takalar',
  ],
  // Patungraya Agung / Palembang Raya (Palembang, Banyuasin, Ogan Ilir, Ogan Komering Ilir)
  [
    'palembang',
    'banyuasin',
    'ogan ilir',
    'ogan komering ilir',
  ],
  // Sarbagita / Denpasar Raya (Denpasar, Badung, Gianyar, Tabanan)
  [
    'denpasar',
    'badung',
    'gianyar',
    'tabanan',
  ],
]

function normalizeCity(s: string): string {
  if (!s) return ''
  const raw = s.split(',')[0].toLowerCase().trim()
  return raw
    .replace(/\b(kota|kabupaten|kab\.|kab|adm\.|administratif)\b/gi, '')
    .replace(/\./g, '')
    .trim()
}

function matchesMetroGroup(cityA: string, cityB: string): boolean {
  for (const group of METRO_GROUPS) {
    const hasA = group.some(m => cityA === m || cityA.includes(m) || m.includes(cityA))
    const hasB = group.some(m => cityB === m || cityB.includes(m) || m.includes(cityB))
    if (hasA && hasB) {
      return true
    }
  }
  return false
}

function extractProvince(fullAddress: string): string | null {
  const parts = fullAddress.split(',')
  if (parts.length >= 2) {
    const prov = parts[parts.length - 1].toLowerCase().trim()
    return prov
      .replace(/\b(provinsi|prov\.|prov)\b/gi, '')
      .replace(/\./g, '')
      .trim()
  }
  return null
}

export function isInstantDelivery(userLocation?: string | null, productLocation?: string | null): boolean {
  if (!userLocation || !productLocation) return false
  const userRaw = userLocation.trim()
  const prodRaw = productLocation.trim()
  if (!userRaw || !prodRaw) return false

  const userCity = normalizeCity(userRaw)
  const prodCity = normalizeCity(prodRaw)

  if (!userCity || !prodCity) return false

  // Level 1: Exact / substring match
  if (userCity === prodCity || userCity.includes(prodCity) || prodCity.includes(userCity)) {
    return true
  }

  // Level 2: Metropolitan Group Match
  if (matchesMetroGroup(userCity, prodCity)) {
    return true
  }

  // Level 3: Province Fallback Match
  const userProvince = extractProvince(userRaw)
  const prodProvince = extractProvince(prodRaw)
  if (userProvince && prodProvince) {
    if (userProvince === prodProvince || userProvince.includes(prodProvince) || prodProvince.includes(userProvince)) {
      return true
    }
  }

  return false
}

