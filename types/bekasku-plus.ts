export type BekaskuPlusStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface BekaskuPlusCategory {
  category_id: string
  category_name: string
}

export interface BekaskuPlusApplication {
  _id?: string
  user_id?: string
  full_name: string
  shop_name: string
  whatsapp: string
  email: string
  instagram: string
  tiktok: string
  categories: BekaskuPlusCategory[]
  status: BekaskuPlusStatus
  admin_note?: string
  createdAt?: string
  updatedAt?: string
}

export interface BekaskuPlusFormPayload {
  full_name: string
  shop_name: string
  whatsapp: string
  email: string
  instagram: string
  tiktok: string
  categories: BekaskuPlusCategory[]
}

export interface BekaskuPlusStatusResponse {
  status: BekaskuPlusStatus
  is_registered: boolean
  admin_note: string
  application: BekaskuPlusApplication | null
}

export const DEFAULT_BEKASKU_CATEGORIES: Array<{ id: string; name: string }> = [
  { id: '1', name: 'Ponsel & Tablet' },
  { id: '2', name: 'Mobil' },
  { id: '3', name: 'Motor' },
  { id: '4', name: 'Properti' },
  { id: '5', name: 'Olahraga' },
  { id: '6', name: 'Sehari-hari' },
  { id: '7', name: 'Fesyen Pria' },
  { id: '8', name: 'Fesyen Wanita' },
  { id: '9', name: 'Fesyen Muslim' },
  { id: '10', name: 'Anak & Bayi' },
  { id: '11', name: 'Buku & Perlengkapan Kantor' },
  { id: '12', name: 'Barang Elektronik' },
  { id: '13', name: 'Kesehatan & kecantikan' },
  { id: '14', name: 'Koleksi & Hobi' },
  { id: '15', name: 'Mainan' },
  { id: '16', name: 'Video Game' },
  { id: '17', name: 'Perhiasan' },
  { id: '18', name: 'Kebutuhan Kehamilan' },
  { id: '19', name: 'Mewah' },
  { id: '20', name: 'Media & Musik' },
  { id: '21', name: 'Barang Antik' },
  { id: '22', name: 'Tiket dan voucher' },
  { id: '23', name: 'J-Pop' },
  { id: '24', name: 'Desain & Kerajinan Tangan' },
  { id: '25', name: 'Pekerjaan' },
  { id: '26', name: 'Hewan Peliharaan' },
  { id: '27', name: 'Jasa' },
  { id: '28', name: 'Promosi & Iklan' },
  { id: '29', name: 'Komunitas' },
  { id: '30', name: 'Pelengkapan Usaha' },
  { id: '31', name: 'Lainnya' },
]
