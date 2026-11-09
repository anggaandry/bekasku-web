import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import {
  API_POLICY,
  API_SOCMED,
  APP_VERSION_DISPLAY,
  BEKASKU_CENTER_DEFAULT_WORKING_HOUR,
  BEKASKU_CENTER_SUPPORT_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_MAPS_URL,
  COMPANY_OFFICE_ADDRESS,
  COMPANY_OFFICIAL_PHONE,
  LEGAL_PRIVACY_UPDATED,
  LEGAL_PRIVACY_VERSION,
  LEGAL_TERMS_UPDATED,
  LEGAL_TERMS_VERSION,
  SUPPORT_EMAIL,
} from '~/utils/constants'
import { slugify } from '~/utils/slug'
import { defaultHelpContact, normalizeContactInfo, stripHtmlTags } from '~/composables/useHelpCenter'
import type { HelpSocmedItem } from '~/types/help'
import type {
  AboutCompanyInfo,
  FormattedSocialItem,
  LegalDocument,
  LegalFetchResult,
  LegalLanguage,
  LegalSectionMeta,
  SafetyComparisonItem,
  SafetyTipItem,
  SocialChannelKind,
} from '~/types/legal'

const POLICY_ALLOWED_TAGS = new Set([
  'section',
  'div',
  'h2',
  'h3',
  'h4',
  'p',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'br',
  'ul',
  'ol',
  'li',
  'a',
  'span',
])

const ROMAN_MAP: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

function romanToInt(romanRaw: string): number {
  const roman = romanRaw.trim().toUpperCase()
  let total = 0
  let prev = 0
  for (let i = roman.length - 1; i >= 0; i--) {
    const ch = roman[i] || ''
    const val = ROMAN_MAP[ch] || 0
    if (val < prev) {
      total -= val
    } else {
      total += val
    }
    prev = val
  }
  return total
}

function resolveSectionId(headingText: string, index: number): string {
  const plain = headingText.trim()
  const upper = plain.toUpperCase()

  if (upper.startsWith('PENDAHULUAN') || upper.startsWith('INTRODUCTION')) {
    return 'pendahuluan'
  }

  const babMatch = upper.match(/^(?:BAB|CHAPTER)\s+([IVXLCDM]+)\b/)
  if (babMatch?.[1]) {
    const num = romanToInt(babMatch[1])
    if (num > 0) return `bab-${num}`
  }

  return slugify(plain) || `bagian-${index + 1}`
}

function formatTocTitle(headingText: string): string {
  const clean = headingText.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  return clean
    .replace(/^PENDAHULUAN$/i, 'Pendahuluan')
    .replace(/^INTRODUCTION$/i, 'Introduction')
}

function unwrapOuterHeaderAndContainer(rawHtml: string): string {
  let html = rawHtml.trim()
  const firstSectionIdx = html.search(/<section\b/i)

  if (firstSectionIdx !== -1 && /<div[^>]*header-section/i.test(html.slice(0, firstSectionIdx))) {
    const wrappedByOuter = /^<div[^>]*bekasku-terms-content/i.test(html)
    html = html.slice(firstSectionIdx)
    if (wrappedByOuter) {
      html = html.replace(/<\/div>\s*$/i, '')
    }
  }

  return html.trim()
}

export function sanitizePolicyHtml(rawHtml: string): {
  contentHtml: string
  sections: LegalSectionMeta[]
} {
  const input = String(rawHtml || '').trim()
  if (!input) {
    return { contentHtml: '', sections: [] }
  }

  let clean = unwrapOuterHeaderAndContainer(input)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\bVVIP\b/gi, 'BekasKu+ & VIP')

  clean = clean.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase()
    if (!POLICY_ALLOWED_TAGS.has(tag)) return ''

    if (full.startsWith('</')) {
      return `</${tag}>`
    }

    if (tag === 'br') {
      return '<br />'
    }

    if (tag === 'ol') {
      const startMatch = attrs.match(/\bstart\s*=\s*(?:"(\d+)"|'(\d+)'|(\d+))/i)
      const startNum = startMatch?.[1] || startMatch?.[2] || startMatch?.[3]
      return startNum ? `<ol start="${startNum}">` : '<ol>'
    }

    if (tag === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
      const rawHref = (hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '').trim()
      const isRelativePath = rawHref.startsWith('/') && !rawHref.startsWith('//')
      const isHashLink = rawHref.startsWith('#')
      const isSafeProtocol = /^https?:\/\//i.test(rawHref) || /^mailto:/i.test(rawHref) || /^tel:/i.test(rawHref)

      if (!rawHref || (!isRelativePath && !isHashLink && !isSafeProtocol)) {
        return '<span>'
      }

      const escapedHref = rawHref.replace(/"/g, '&quot;').replace(/</g, '&lt;')
      if (isRelativePath || isHashLink) {
        return `<a href="${escapedHref}">`
      }
      return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">`
    }

    if (tag === 'div') {
      return '<div class="legal-callout">'
    }

    return `<${tag}>`
  })

  // Assign deterministic section IDs on <section> or <h3> and build Table of Contents
  const sections: LegalSectionMeta[] = []
  const usedIds = new Set<string>()
  let sectionIdx = 0

  if (/<section>/i.test(clean)) {
    clean = clean.replace(/<section>([\s\S]*?)<\/section>/gi, (_full, inner: string) => {
      const hMatch = inner.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i)
      const rawTitle = hMatch ? stripHtmlTags(hMatch[1] || '') : `Bagian ${sectionIdx + 1}`
      let id = resolveSectionId(rawTitle, sectionIdx)
      if (usedIds.has(id)) {
        id = `${id}-${sectionIdx + 1}`
      }
      usedIds.add(id)
      sections.push({
        id,
        title: formatTocTitle(rawTitle),
      })
      sectionIdx += 1
      return `<section id="${id}">${inner}</section>`
    })
  } else {
    clean = clean.replace(/<h3>([\s\S]*?)<\/h3>/gi, (_full, inner: string) => {
      const rawTitle = stripHtmlTags(inner || '')
      let id = resolveSectionId(rawTitle, sectionIdx)
      if (usedIds.has(id)) {
        id = `${id}-${sectionIdx + 1}`
      }
      usedIds.add(id)
      sections.push({
        id,
        title: formatTocTitle(rawTitle),
      })
      sectionIdx += 1
      return `<h3 id="${id}">${inner}</h3>`
    })
  }

  return {
    contentHtml: clean,
    sections,
  }
}

function extractTermsHeaderMetadata(rawHtml: string): {
  lastUpdated: string
  version: string
} {
  const plain = stripHtmlTags(rawHtml.slice(0, 1400))
  const updatedMatch = plain.match(/Pembaruan(?:\s+Terakhir)?:\s*([^|•\n]+)/i)
  const versionMatch = plain.match(/Versi:\s*([0-9]+(?:\.[0-9]+)+)/i)

  return {
    lastUpdated: updatedMatch?.[1]?.trim() || LEGAL_TERMS_UPDATED,
    version: versionMatch?.[1]?.trim() || LEGAL_TERMS_VERSION,
  }
}

export function formatPhoneDisplay(phoneRaw: string): string {
  const digits = String(phoneRaw || '').replace(/\D/g, '')
  if (!digits) return COMPANY_OFFICIAL_PHONE
  const local = digits.startsWith('62')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits
  if (local.length >= 10) {
    return `(+62) ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`
  }
  return `(+62) ${local}`
}

export function formatPhoneHref(phoneRaw: string): string {
  const digits = String(phoneRaw || '').replace(/\D/g, '')
  if (!digits) return ''
  const local = digits.startsWith('62')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return `tel:+62${local}`
}

export function formatSocialItems(socmed?: HelpSocmedItem[]): FormattedSocialItem[] {
  const source = socmed && socmed.length > 0 ? socmed : defaultHelpContact().socmed
  return source.map((item, idx) => {
    const lower = (item.title || '').toLowerCase()
    let kind: SocialChannelKind = 'globe'
    let badgeClass = 'bg-dark text-white'

    if (lower.includes('instagram')) {
      kind = 'instagram'
      badgeClass = 'bg-primary text-white'
    } else if (lower.includes('facebook')) {
      kind = 'facebook'
      badgeClass = 'bg-info text-white'
    } else if (lower.includes('twitter') || lower === 'x') {
      kind = 'twitter'
      badgeClass = 'bg-dark text-white'
    } else if (lower.includes('youtube')) {
      kind = 'youtube'
      badgeClass = 'bg-primary-dark text-white'
    } else if (lower.includes('tik') || lower.includes('tok')) {
      kind = 'tiktok'
      badgeClass = 'bg-dark text-white'
    }

    return {
      key: item._id || `${item.title}-${idx}`,
      title: item.title,
      description: item.description,
      link: item.link,
      kind,
      badgeClass,
    }
  })
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildHighlightedHtml(
  rawHtml: string,
  query: string,
  activeMatchIndex = 0,
): { html: string; matchCount: number } {
  const q = query.trim()
  if (!q || !rawHtml) {
    return { html: rawHtml, matchCount: 0 }
  }

  const regex = new RegExp(escapeRegExp(q), 'gi')
  const parts = rawHtml.split(/(<[^>]+>|&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g)
  let matchCount = 0

  const renderedParts = parts.map((part) => {
    if (!part) return ''
    // Preserve HTML tags and character entities untouched
    if (part.startsWith('<') || (part.startsWith('&') && part.endsWith(';'))) {
      return part
    }

    return part.replace(regex, (matched) => {
      const currentIdx = matchCount
      matchCount += 1
      const isActive = currentIdx === activeMatchIndex
      const cls = isActive
        ? 'legal-match legal-match-active bg-primary text-white font-semibold rounded px-1'
        : 'legal-match bg-badge-bg text-badge-text font-medium rounded px-0.5'
      return `<mark class="${cls}" data-legal-match-idx="${currentIdx}">${matched}</mark>`
    })
  })

  return {
    html: renderedParts.join(''),
    matchCount,
  }
}

export function getPrivacyDocument(lang: LegalLanguage = 'id'): LegalDocument {
  if (lang === 'en') {
    const contentHtml = `
      <section id="pendahuluan">
        <h3>INTRODUCTION</h3>
        <p>
          ${COMPANY_LEGAL_NAME} as the operator of the <strong>BekasKu</strong> digital platform ("We", "Us", or "Platform") is fully dedicated to respecting, protecting, and safeguarding the personal data confidentiality of all Users (including Sellers, Buyers, Partners, and Visitors). This Privacy Policy sets out how We collect, use, process, store, and safeguard your personal data in accordance with Law No. 27 of 2022 on Personal Data Protection (UU PDP), Google Play Data Safety standards, and applicable laws of the Republic of Indonesia.
        </p>
        <p>
          By accessing our website, downloading the mobile application, or using BekasKu services, you acknowledge that you have read, understood, and provided explicit consent for Us to process your personal data under this Privacy Policy.
        </p>
      </section>

      <section id="bab-1">
        <h3>CHAPTER I: PERSONAL DATA WE COLLECT</h3>
        <h4>Section 1 - Information You Provide Voluntarily</h4>
        <p>We collect information you submit when registering an account, transacting, or interacting on the Platform, including:</p>
        <ol>
          <li><strong>Identity &amp; Account Information:</strong> Full name, active email address, OTP-verified phone/WhatsApp number, encrypted password, profile picture, and date of birth.</li>
          <li><strong>Sensitive Identity Verification Data (KYC &amp; Anti-Fraud):</strong> National Identity Number (NIK), official ID photos (KTP/SIM), and verification selfies required specifically for wallet balance withdrawal authentication, BekasKu+ curated seller verification, VIP verification, and financial crime prevention.</li>
          <li><strong>Shipping &amp; Logistics Address:</strong> Address label, recipient name, contact phone number, full street address, district, city/regency, province, postal code, and pickup/delivery map coordinates.</li>
          <li><strong>Bank &amp; Financial Information:</strong> Bank account numbers, verified account holder names, and e-wallet identifiers for sales proceeds payout or transaction refunds. All payment settlements are handled securely by Bank Indonesia licensed payment gateways.</li>
          <li><strong>Multimedia Content &amp; Communication:</strong> Uploaded product photos and videos, in-app chat messages, offer negotiations, product reviews, and interactive BekasKu Live Shopping streams.</li>
        </ol>

        <h4>Section 2 - Automatically Collected Data &amp; Device Permissions</h4>
        <p>The BekasKu platform uses device permissions strictly for core service functionality:</p>
        <ol start="6">
          <li><strong>Camera Access:</strong> Used to capture product photos, scan KTP/SIM identity documents, take KYC verification selfies before balance withdrawals, and broadcast Live Shopping videos.</li>
          <li><strong>Photos, Gallery &amp; Media Storage:</strong> Used to pick product photos from gallery, upload profile avatars, and attach evidence media for order complaints or returns.</li>
          <li><strong>Precise &amp; Approximate Location:</strong> Uses foreground device GPS coordinates to display nearby listings, support Cash-on-Delivery / Pay and Pick meet-ups, and calculate accurate courier shipping rates. You may revoke this permission anytime in device settings.</li>
          <li><strong>Microphone Access:</strong> Required when broadcasting Live Shopping videos or sending voice messages in transaction chat.</li>
          <li><strong>Push Notifications (FCM):</strong> Collects Firebase Cloud Messaging tokens to deliver order updates, payment receipts, incoming chat alerts, and account security notices.</li>
          <li><strong>Device &amp; Network Logs:</strong> Hardware model, OS version, IP address, crash reports, and performance analytics to preserve platform reliability and security.</li>
        </ol>
      </section>

      <section id="bab-2">
        <h3>CHAPTER II: PURPOSE OF PROCESSING &amp; SENSITIVE DATA PROTECTION</h3>
        <p>We process collected personal data for legitimate operational purposes:</p>
        <ol start="12">
          <li><strong>Service Provision &amp; Order Execution:</strong> Managing account registration, OTP verification, Joint Escrow (Rekber) operations, QRIS and Virtual Account payments, and order tracking.</li>
          <li><strong>Identity Authentication &amp; Payout Security (KYC):</strong> ID card photos and selfie verifications are strictly used to confirm rightful account ownership prior to balance payouts. Sensitive files are stored in encrypted storage using time-limited signed URLs and are never exposed on public user profiles.</li>
          <li><strong>Logistics &amp; Shipping Delivery:</strong> Sharing recipient address and contact phone details with official courier partners (JNE, SiCepat, J&amp;T, Paxel, Lalamove, etc.) for physical pickup and delivery.</li>
          <li><strong>Fraud Prevention &amp; Account Protection:</strong> Detecting suspicious transaction behavior, identity spoofing, unauthorized balance access, and prohibited item listings.</li>
          <li><strong>Customer Care &amp; Dispute Resolution:</strong> Communicating order milestones, waybills, and resolving complaints through BekasKu Center Support.</li>
        </ol>
      </section>

      <section id="bab-3">
        <h3>CHAPTER III: THIRD-PARTY DATA DISCLOSURE</h3>
        <p>
          We guarantee that We <strong>DO NOT</strong> sell, rent, or trade your personal data to third parties for commercial advertising. Data is shared strictly with authorized operational partners under data protection agreements:
        </p>
        <ol start="17">
          <li><strong>Licensed Payment Gateways &amp; Banks:</strong> To securely settle QRIS, Virtual Account, e-wallet payments, and verified seller bank withdrawals under Bank Indonesia licensing.</li>
          <li><strong>Integrated Logistics Providers:</strong> Courier partners executing physical parcel pickup, shipping insurance, and live tracking.</li>
          <li><strong>Cloud Infrastructure Providers:</strong> Encrypted cloud database and object storage servers (Google Cloud Platform) certified under ISO/IEC 27001 and SOC 2.</li>
          <li><strong>Legal &amp; Regulatory Authorities:</strong> Competent law enforcement or judicial bodies when legally mandated under Indonesian regulations or court orders.</li>
        </ol>
      </section>

      <section id="bab-4">
        <h3>CHAPTER IV: DATA SECURITY, STORAGE &amp; RETENTION</h3>
        <ol start="21">
          <li><strong>Strong Encryption Standards:</strong> Data exchanges between your device and BekasKu servers are protected with Transport Layer Security (TLS 1.3 / SSL), while account credentials use Argon2 / Bcrypt cryptographic hashing.</li>
          <li><strong>Strict Access Controls for Sensitive Documents:</strong> KTP/SIM images and KYC verification files are stored in isolated buckets governed by strict Role-Based Access Control (RBAC).</li>
          <li><strong>Retention Schedule:</strong> Account data is retained while your account remains active, while financial transaction logs are preserved for a minimum of 5 (five) years in compliance with Indonesian e-commerce taxation and audit law.</li>
        </ol>
      </section>

      <section id="bab-5">
        <h3>CHAPTER V: YOUR RIGHTS &amp; ACCOUNT / DATA DELETION</h3>
        <p>Under the Personal Data Protection Law (UU PDP) and Google Play transparency standards, you have the following rights:</p>
        <ol start="24">
          <li><strong>Access &amp; Correction:</strong> Review and update profile data, phone numbers, avatars, and saved addresses anytime via <a href="/account">Account Settings</a>.</li>
          <li><strong>Permission Withdrawal:</strong> Revoke camera, precise GPS location, microphone, or notification permissions anytime via your browser or mobile OS settings.</li>
          <li><strong>Account &amp; Personal Data Deletion:</strong> Request permanent closure and deletion of your account and personal records anytime via <a href="/account?tab=delete">Account Deletion Settings</a> (14-day grace period) or by emailing <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with your registered phone number. Once pending transactions and wallet balances are cleared, data is permanently purged from active servers.</li>
        </ol>
      </section>

      <section id="bab-6">
        <h3>CHAPTER VI: CONTACT US &amp; DATA PROTECTION OFFICER</h3>
        <p>
          For inquiries, personal data rights requests, account deletion support, or privacy feedback at BekasKu, contact our Data Protection Officer:
        </p>
        <div class="legal-callout">
          <p><strong>${COMPANY_LEGAL_NAME} (BekasKu)</strong></p>
          <p><strong>Office Address:</strong> ${COMPANY_OFFICE_ADDRESS}</p>
          <p><strong>Privacy &amp; Legal Email:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p><strong>Customer Care Email:</strong> <a href="mailto:${BEKASKU_CENTER_SUPPORT_EMAIL}">${BEKASKU_CENTER_SUPPORT_EMAIL}</a></p>
          <p><strong>Official Phone / WhatsApp:</strong> ${COMPANY_OFFICIAL_PHONE}</p>
          <p><strong>Service Hours:</strong> ${BEKASKU_CENTER_DEFAULT_WORKING_HOUR} WIB</p>
        </div>
      </section>
    `

    const { contentHtml: cleanHtml, sections } = sanitizePolicyHtml(contentHtml)
    return {
      kind: 'privacy',
      title: 'Privacy Policy',
      version: LEGAL_PRIVACY_VERSION,
      lastUpdated: 'October 2026',
      contentHtml: cleanHtml,
      sections,
      lang: 'en',
      source: 'curated',
    }
  }

  const contentHtmlId = `
    <section id="pendahuluan">
      <h3>PENDAHULUAN</h3>
      <p>
        ${COMPANY_LEGAL_NAME} selaku pengelola platform digital <strong>BekasKu</strong> ("Kami" atau "Platform") berkomitmen penuh menghormati, melindungi, dan menjaga kerahasiaan data pribadi seluruh Pengguna (Penjual, Pembeli, Mitra, maupun Pengunjung). Kebijakan Privasi ini mengatur landasan dasar pengumpulan, penggunaan, pemrosesan, penyimpanan, dan perlindungan data pribadi Anda sesuai Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP), Standar Keamanan Data Google Play (Google Play Data Safety), serta ketentuan hukum di Republik Indonesia.
      </p>
      <p>
        Dengan mengakses situs web, mengunduh aplikasi mobile, atau menggunakan layanan BekasKu, Anda menyatakan telah membaca, memahami, dan memberikan persetujuan eksplisit kepada Kami untuk memproses data pribadi Anda sesuai Kebijakan Privasi ini.
      </p>
    </section>

    <section id="bab-1">
      <h3>BAB I: DATA PRIBADI YANG KAMI KUMPULKAN</h3>
      <h4>Pasal 1 - Data yang Diserahkan Secara Sukarela</h4>
      <p>Kami mengumpulkan informasi yang Anda serahkan saat mendaftar akun, bertransaksi, atau berinteraksi di Platform, meliputi:</p>
      <ol>
        <li><strong>Informasi Identitas &amp; Akun:</strong> Nama lengkap, alamat email aktif, nomor telepon/WhatsApp terverifikasi OTP, kata sandi terenkripsi, foto profil, dan tanggal lahir.</li>
        <li><strong>Data Verifikasi Identitas Sensitif (KYC &amp; Anti-Fraud):</strong> Nomor Induk Kependudukan (NIK), foto dokumen identitas resmi (KTP/SIM), serta foto selfie verifikasi. Data ini diklasifikasikan sebagai Data Pribadi Spesifik/Sensitif untuk otentikasi penarikan saldo dompet, pendaftaran penjual terkurasi <strong>BekasKu+ &amp; VIP</strong>, verifikasi toko resmi, serta pencegahan kejahatan finansial.</li>
        <li><strong>Alamat Pengiriman &amp; Logistik:</strong> Label alamat, nama penerima, nomor telepon kontak, alamat jalan lengkap, kecamatan, kota/kabupaten, provinsi, kode pos, dan titik koordinat penjemputan/pengantaran kurir.</li>
        <li><strong>Informasi Rekening &amp; Finansial:</strong> Nomor rekening bank, nama pemilik rekening sesuai identitas sah, serta data akun e-wallet untuk pencairan hasil penjualan (<em>payout</em>) atau pengembalian dana (<em>refund</em>). Seluruh transaksi pembayaran ditangani payment gateway berizin resmi Bank Indonesia.</li>
        <li><strong>Konten Multimedia &amp; Komunikasi:</strong> Foto dan video produk yang diunggah, pesan obrolan dalam aplikasi (<em>in-app chat</em>), negosiasi harga, ulasan produk, serta interaksi siaran langsung (<em>BekasKu Live Shopping</em>).</li>
      </ol>

      <h4>Pasal 2 - Data yang Dikumpulkan Secara Otomatis &amp; Izin Perangkat</h4>
      <p>Aplikasi dan layanan BekasKu memerlukan izin akses perangkat berikut semata-mata untuk fungsi inti layanan:</p>
      <ol start="6">
        <li><strong>Kamera (Camera Access):</strong> Diperlukan untuk mengambil foto produk, memindai dokumen identitas KTP/SIM, mengambil foto selfie KYC penarikan saldo, serta siaran langsung Live Shopping.</li>
        <li><strong>Foto, Galeri &amp; File Media (Storage / Photo Library):</strong> Diperlukan untuk memilih gambar produk dari galeri, mengunggah foto profil, serta melampirkan bukti kondisi barang saat komplain atau retur.</li>
        <li><strong>Lokasi Presisi &amp; Perkiraan (Precise &amp; Approximate Location):</strong> Mengakses data GPS perangkat pada latar depan (<em>foreground</em>) untuk menampilkan etalase produk terdekat, transaksi ketemuan langsung (COD / Pay and Pick), dan penghitungan ongkos kirim kurir. Izin ini dapat dinonaktifkan kapan saja di pengaturan perangkat.</li>
        <li><strong>Mikrofon (Microphone Access):</strong> Diperlukan saat melakukan siaran langsung Live Streaming atau merekam pesan suara pada fitur obrolan transaksi.</li>
        <li><strong>Pemberitahuan &amp; Notifikasi (Push Notifications / FCM):</strong> Mengumpulkan token perangkat dan Firebase Cloud Messaging untuk pembaruan status transaksi, bukti pembayaran, pesan masuk, dan peringatan keamanan akun.</li>
        <li><strong>Data Perangkat &amp; Log Jaringan:</strong> Model perangkat keras, versi OS (Android/iOS/Browser), alamat IP, crash report, serta analitik performa untuk menjaga stabilitas dan keamanan sistem.</li>
      </ol>
    </section>

    <section id="bab-2">
      <h3>BAB II: TUJUAN PENGGUNAAN &amp; PERLINDUNGAN DATA SENSITIF</h3>
      <p>Kami menggunakan data pribadi yang dikumpulkan untuk tujuan operasional yang sah berikut ini:</p>
      <ol start="12">
        <li><strong>Penyediaan Layanan &amp; Transaksi:</strong> Memproses pendaftaran akun, verifikasi OTP, mengoperasikan Rekening Bersama (Rekber / Escrow), memfasilitasi pembayaran QRIS, Virtual Account, e-wallet, serta mengelola pesanan.</li>
        <li><strong>Otentikasi Identitas &amp; Perlindungan Pencairan Dana (KYC):</strong> Foto KTP/SIM dan foto selfie hanya digunakan memverifikasi keaslian pemilik akun sebelum pencairan saldo dompet. Berkas sensitif disimpan di penyimpanan terenkripsi (Google Cloud / Firebase Storage) dengan signed URL berbatas waktu dan tidak pernah dipublikasikan ke profil publik.</li>
        <li><strong>Logistik &amp; Pengiriman:</strong> Meneruskan data alamat dan kontak penerima kepada pihak kurir rekanan resmi (JNE, SiCepat, J&amp;T, Paxel, Lalamove, dll.) untuk penjemputan dan pengantaran paket.</li>
        <li><strong>Pencegahan Fraud &amp; Keamanan Akun:</strong> Mendeteksi dan mencegah penipuan transaksi, pemalsuan identitas, penyalahgunaan saldo, serta iklan barang terlarang.</li>
        <li><strong>Komunikasi &amp; Bantuan Pelanggan:</strong> Mengirim pembaruan status pesanan, nomor resi, serta menyelesaikan keluhan melalui tim BekasKu Center.</li>
      </ol>
    </section>

    <section id="bab-3">
      <h3>BAB III: PENGUNGKAPAN KEPADA PIHAK KETIGA</h3>
      <p>
        Kami menjamin <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun untuk tujuan komersial. Data hanya dapat diungkapkan kepada mitra resmi berikut berdasarkan kebutuhan operasional sah:
      </p>
      <ol start="17">
        <li><strong>Mitra Payment Gateway &amp; Perbankan:</strong> Pemrosesan tagihan pembayaran QRIS, Virtual Account, e-wallet, dan transfer pencairan dana berlisensi Bank Indonesia.</li>
        <li><strong>Mitra Logistik Terintegrasi:</strong> Ekspedisi pengiriman resmi untuk penjemputan, pengantaran fisik paket, dan pelacakan resi real-time.</li>
        <li><strong>Penyedia Infrastruktur Cloud:</strong> Server database dan object storage terenkripsi (Google Cloud Platform) yang mematuhi standar sertifikasi keamanan ISO/IEC 27001 dan SOC 2.</li>
        <li><strong>Kewajiban Hukum:</strong> Otoritas penegak hukum atau pengadilan berwenang di Indonesia bila diwajibkan putusan pengadilan atau peraturan perundang-undangan.</li>
      </ol>
    </section>

    <section id="bab-4">
      <h3>BAB IV: KEAMANAN, PENYIMPANAN &amp; RETENSI DATA</h3>
      <ol start="21">
        <li><strong>Enkripsi Tingkat Tinggi:</strong> Pertukaran data antara perangkat Anda dan server BekasKu dilindungi protokol Transport Layer Security (TLS 1.3 / SSL), sedangkan kata sandi dienkripsi dengan algoritma hashing mutakhir (Argon2 / Bcrypt).</li>
        <li><strong>Perlindungan Data Sensitif:</strong> Dokumen KTP/SIM dan foto selfie KYC disimpan dalam lingkungan terisolasi dengan kontrol akses berbasis peran (Role-Based Access Control).</li>
        <li><strong>Masa Retensi:</strong> Data pribadi disimpan selama akun aktif dan sekurang-kurangnya 5 (lima) tahun untuk arsip transaksi finansial sesuai kewajiban pembukuan serta perpajakan niaga elektronik di Indonesia.</li>
      </ol>
    </section>

    <section id="bab-5">
      <h3>BAB V: HAK PENGGUNA &amp; PENGHAPUSAN AKUN / DATA</h3>
      <p>Sesuai UU Perlindungan Data Pribadi (UU PDP) dan kebijakan transparansi Google Play Store, Anda berhak:</p>
      <ol start="24">
        <li><strong>Hak Akses &amp; Pembaruan:</strong> Meninjau dan memperbarui biodata, nomor kontak, foto profil, dan alamat kapan saja melalui menu <a href="/account">Pengaturan Akun</a>.</li>
        <li><strong>Hak Penarikan Persetujuan Izin:</strong> Mengaktifkan atau menonaktifkan izin akses perangkat (kamera, GPS, mikrofon, notifikasi) sewaktu-waktu dari pengaturan ponsel atau peramban Anda.</li>
        <li><strong>Hak Penghapusan Akun &amp; Data Pribadi (Account &amp; Data Deletion):</strong> Mengajukan penghapusan akun melalui menu <a href="/account?tab=delete">Ajukan Penghapusan Akun</a> (masa tenggang 14 hari) atau mengirim email ke <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> dengan menyertakan nomor telepon terdaftar. Setelah seluruh transaksi selesai dan tidak ada saldo tertahan, data pribadi Anda dihapus secara permanen dari server aktif Kami.</li>
      </ol>
    </section>

    <section id="bab-6">
      <h3>BAB VI: HUBUNGI KAMI &amp; DATA PROTECTION OFFICER</h3>
      <p>
        Untuk pertanyaan, permohonan pelaksanaan hak data pribadi, penghapusan akun, atau keluhan privasi di platform BekasKu, silakan menghubungi Petugas Perlindungan Data (Data Protection Officer) Kami melalui kontak resmi berikut:
      </p>
      <div class="legal-callout">
        <p><strong>${COMPANY_LEGAL_NAME} (BekasKu)</strong></p>
        <p><strong>Alamat Kantor:</strong> ${COMPANY_OFFICE_ADDRESS}</p>
        <p><strong>Email Privasi &amp; Hukum:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p><strong>Email Layanan Pelanggan:</strong> <a href="mailto:${BEKASKU_CENTER_SUPPORT_EMAIL}">${BEKASKU_CENTER_SUPPORT_EMAIL}</a></p>
        <p><strong>Telepon / WhatsApp Resmi:</strong> ${COMPANY_OFFICIAL_PHONE}</p>
        <p><strong>Jam Operasional Layanan:</strong> ${BEKASKU_CENTER_DEFAULT_WORKING_HOUR} WIB</p>
      </div>
    </section>
  `

  const { contentHtml: cleanHtml, sections } = sanitizePolicyHtml(contentHtmlId)
  return {
    kind: 'privacy',
    title: 'Kebijakan Privasi',
    version: LEGAL_PRIVACY_VERSION,
    lastUpdated: LEGAL_PRIVACY_UPDATED,
    contentHtml: cleanHtml,
    sections,
    lang: 'id',
    source: 'curated',
  }
}

export const SAFETY_GUIDE_ITEMS: SafetyTipItem[] = [
  {
    id: 'escrow-only',
    number: 1,
    title: 'Bayar Lewat Rekber Resmi BekasKu',
    description:
      'Gunakan Virtual Account, QRIS, E-Wallet, atau Gerai Retail di aplikasi. Jangan transfer langsung ke rekening pribadi penjual.',
    badge: 'Rekber',
    iconName: 'ShieldAlert',
    severity: 'critical',
  },
  {
    id: 'phishing-links',
    number: 2,
    title: 'Cek Domain & Aplikasi Resmi',
    description:
      'BekasKu hanya beroperasi melalui bekasku.id dan aplikasi resmi Google Play / App Store. Abaikan tautan hadiah atau login ulang dari chat.',
    badge: 'Link Resmi',
    iconName: 'Link2',
    severity: 'critical',
  },
  {
    id: 'otp-secrecy',
    number: 3,
    title: 'Jaga Kode OTP & Password',
    description:
      'Tim BekasKu tidak pernah meminta kode OTP, password, PIN rekening, atau foto KTP lewat chat pribadi.',
    badge: 'Privasi',
    iconName: 'LockKeyhole',
    severity: 'critical',
  },
  {
    id: 'cod-qr-verify',
    number: 4,
    title: 'Scan QR Code Saat COD / Pay & Pick',
    description:
      'Periksa kondisi fisik barang terlebih dahulu, lalu pindai QR Code konfirmasi di aplikasi saat serah terima.',
    badge: 'COD Aman',
    iconName: 'QrCode',
    severity: 'warning',
  },
  {
    id: 'report-suspicious',
    number: 5,
    title: 'Laporkan Aktivitas Mencurigakan',
    description:
      'Hentikan chat bila penjual mengajak transaksi di luar aplikasi, lalu laporkan segera ke BekasKu Center.',
    badge: 'Laporan',
    iconName: 'Flag',
    severity: 'info',
  },
]

export const SAFETY_DO_ITEMS: SafetyComparisonItem[] = [
  {
    title: 'Bayar via checkout resmi BekasKu',
    description: 'Dana ditahan Rekber sampai paket diterima sesuai pesanan.',
  },
  {
    title: 'Rekam video unboxing tanpa jeda',
    description: 'Tunjukkan segel resi dan uji fungsi barang sebagai bukti komplain.',
  },
  {
    title: 'Rekam video packing bagi penjual',
    description: 'Dokumentasikan kondisi barang sampai tempel resi kurir.',
  },
  {
    title: 'Negosiasi lewat chat di aplikasi',
    description: 'Semua kesepakatan tercatat jelas bila terjadi sengketa.',
  },
]

export const SAFETY_DONT_ITEMS: SafetyComparisonItem[] = [
  {
    title: 'Transfer langsung ke rekening pribadi penjual',
    description: 'Transaksi di luar Rekber tidak dilindungi pengembalian dana.',
  },
  {
    title: 'Membagikan kode OTP ke siapa pun',
    description: 'Kode OTP memberi akses penuh ke akun dan saldo Anda.',
  },
  {
    title: 'Membuka file APK atau tautan resi palsu',
    description: 'Penipu sering menyamar sebagai kurir atau admin.',
  },
  {
    title: 'Menekan Selesai sebelum barang diuji',
    description: 'Dana langsung diteruskan ke penjual saat pesanan diselesaikan.',
  },
]

export function useLegalPolicy() {
  const api = useApi()

  async function fetchTermsDocument(): Promise<LegalFetchResult> {
    try {
      const res = await api.post<{ message?: string; result?: string }>(API_POLICY, {
        lang: 'id',
      })

      const rawHtml = typeof res?.result === 'string' ? res.result : ''
      if (!rawHtml.trim()) {
        return {
          document: null,
          error: 'Dokumen Syarat dan Ketentuan belum tersedia dari server. Silakan muat ulang halaman.',
        }
      }

      const meta = extractTermsHeaderMetadata(rawHtml)
      const { contentHtml, sections } = sanitizePolicyHtml(rawHtml)

      if (!contentHtml || sections.length === 0) {
        return {
          document: null,
          error: 'Format dokumen Syarat dan Ketentuan tidak dapat dimuat. Silakan coba lagi.',
        }
      }

      return {
        document: {
          kind: 'terms',
          title: 'Syarat dan Ketentuan Layanan',
          version: meta.version,
          lastUpdated: meta.lastUpdated,
          contentHtml,
          sections,
          lang: 'id',
          source: 'api',
        },
        error: '',
      }
    } catch {
      return {
        document: null,
        error: 'Gagal memuat dokumen Syarat dan Ketentuan dari server. Silakan coba beberapa saat lagi.',
      }
    }
  }

  async function fetchCompanyInfo(): Promise<AboutCompanyInfo> {
    const fallback = defaultHelpContact()
    let normalized = fallback

    try {
      const res = await api.post<{ message?: string; result?: Record<string, unknown> }>(
        API_SOCMED,
        { lang: 'id' },
      )
      if (res?.result) {
        normalized = normalizeContactInfo(res.result)
      }
    } catch {
      // keep safe default contact info if offline
    }

    // Align contact info safely with Mobile V3 about_controller.dart normalization
    const rawPhone = normalized.phone || COMPANY_OFFICIAL_PHONE
    const phone = rawPhone.includes('82294588970') ? COMPANY_OFFICIAL_PHONE : rawPhone

    const rawAddress = normalized.address || ''
    const address =
      !rawAddress || rawAddress === 'Medan, Sumatera Utara' || rawAddress.toLowerCase().includes('placeholder')
        ? COMPANY_OFFICE_ADDRESS
        : rawAddress

    const rawWorkingHour = normalized.working_hour || ''
    const workingHour =
      !rawWorkingHour || rawWorkingHour.includes('09:00 - 17:00')
        ? BEKASKU_CENTER_DEFAULT_WORKING_HOUR
        : rawWorkingHour

    const email = normalized.email || BEKASKU_CENTER_SUPPORT_EMAIL

    return {
      phone,
      email,
      address,
      working_hour: workingHour,
      socmed: normalized.socmed,
      legalName: COMPANY_LEGAL_NAME,
      tagline: 'Marketplace Jual Beli Barang Baru & Preloved',
      mission:
        'PT Jantaka Ladang Unggul menghubungkan penjual dan pembeli barang baru maupun preloved di Indonesia dengan sistem Rekening Bersama (Rekber), ekspedisi terintegrasi, dan kurasi BekasKu+.',
      appVersion: APP_VERSION_DISPLAY,
      mapsUrl: COMPANY_MAPS_URL,
    }
  }

  return {
    fetchTermsDocument,
    getPrivacyDocument,
    fetchCompanyInfo,
    buildHighlightedHtml,
    sanitizePolicyHtml,
  }
}

export function useLegalReader(sections: Ref<LegalSectionMeta[]>) {
  const searchQuery = ref('')
  const matchCount = ref(0)
  const activeMatchIndex = ref(0)
  const activeSectionId = ref(sections.value[0]?.id || 'pendahuluan')

  watch(searchQuery, () => {
    activeMatchIndex.value = 0
  })

  watch(sections, (list) => {
    if (list.length > 0 && !list.some(s => s.id === activeSectionId.value)) {
      activeSectionId.value = list[0]?.id || 'pendahuluan'
    }
  })

  function nextMatch() {
    if (matchCount.value <= 0) return
    activeMatchIndex.value = (activeMatchIndex.value + 1) % matchCount.value
  }

  function prevMatch() {
    if (matchCount.value <= 0) return
    activeMatchIndex.value = (activeMatchIndex.value - 1 + matchCount.value) % matchCount.value
  }

  function clearSearch() {
    searchQuery.value = ''
    activeMatchIndex.value = 0
    matchCount.value = 0
  }

  let ticking = false

  function updateActiveSectionFromScroll() {
    if (!import.meta.client || sections.value.length === 0) return

    const thresholdTop = 170
    let candidateId = sections.value[0]?.id || 'pendahuluan'

    for (const sec of sections.value) {
      const el = document.getElementById(sec.id)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.top <= thresholdTop) {
        candidateId = sec.id
      } else {
        break
      }
    }

    const docBottom = window.innerHeight + window.scrollY
    const docHeight = document.documentElement.scrollHeight
    if (docHeight > 0 && docBottom >= docHeight - 24) {
      const last = sections.value[sections.value.length - 1]
      if (last) candidateId = last.id
    }

    activeSectionId.value = candidateId
  }

  function handleWindowScroll() {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(() => {
      updateActiveSectionFromScroll()
      ticking = false
    })
  }

  onMounted(() => {
    if (import.meta.client && window.location.hash) {
      const hashId = window.location.hash.replace(/^#/, '')
      if (sections.value.some(s => s.id === hashId)) {
        activeSectionId.value = hashId
      }
    }
    if (import.meta.client) {
      window.addEventListener('scroll', handleWindowScroll, { passive: true })
      window.addEventListener('resize', handleWindowScroll, { passive: true })
      setTimeout(() => {
        updateActiveSectionFromScroll()
      }, 60)
    }
  })

  watch(
    [sections, searchQuery],
    () => {
      if (import.meta.client) {
        setTimeout(() => {
          updateActiveSectionFromScroll()
        }, 80)
      }
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('scroll', handleWindowScroll)
      window.removeEventListener('resize', handleWindowScroll)
    }
  })

  return {
    searchQuery,
    matchCount,
    activeMatchIndex,
    activeSectionId,
    nextMatch,
    prevMatch,
    clearSearch,
  }
}
