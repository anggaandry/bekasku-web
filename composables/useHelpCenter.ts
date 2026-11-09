import { computed, ref } from 'vue'
import {
  API_FAQ,
  API_SOCMED,
  BEKASKU_CENTER_SUPPORT_EMAIL,
  BEKASKU_CENTER_DEFAULT_WORKING_HOUR,
  DEFAULT_LOCATION,
  STORAGE_KEY_FAQ_FEEDBACK,
  SUPPORT_EMAIL,
} from '~/utils/constants'
import { slugify } from '~/utils/slug'
import { sanitizeMediaUrl } from '~/utils/media'
import type {
  FaqCategoryId,
  FaqCategoryMeta,
  FaqFeedbackRecord,
  FaqItem,
  FaqRawItem,
  HelpContactInfo,
} from '~/types/help'

export const HELP_CATEGORIES: FaqCategoryMeta[] = [
  {
    id: 'all',
    label: 'Semua Topik',
    description: 'Seluruh panduan transaksi, akun, dan pengiriman',
    iconName: 'LayoutGrid',
  },
  {
    id: 'akun',
    label: 'Akun & Keamanan',
    description: 'Daftar akun, OTP, kata sandi, dan verifikasi KYC',
    iconName: 'ShieldCheck',
  },
  {
    id: 'transaksi',
    label: 'Transaksi & Bayar',
    description: 'Sistem rekber, saldo dompet, dan metode pembayaran',
    iconName: 'CreditCard',
  },
  {
    id: 'pengiriman',
    label: 'Kirim & Komplain',
    description: 'Batas resi penjual, pelacakan kurir, dan retur barang',
    iconName: 'Truck',
  },
  {
    id: 'program',
    label: 'Program Penjual',
    description: 'Kurasi BekasKu+, langganan VIP, dan promosi iklan',
    iconName: 'Award',
  },
]

const ALLOWED_TAGS = new Set([
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
  'h2',
  'h3',
  'h4',
  'blockquote',
  'code',
])

export function stripHtmlTags(raw: string): string {
  return String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeFaqHtml(rawHtml: string): string {
  const input = String(rawHtml || '').trim()
  if (!input) return ''

  let clean = input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  clean = clean.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (full.startsWith('</')) {
      return `</${tag}>`
    }
    if (tag === 'br') {
      return '<br />'
    }
    if (tag === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
      const rawHref = (hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '').trim()
      const isRelativePath = rawHref.startsWith('/') && !rawHref.startsWith('//')
      const isSafeProtocol = /^https?:\/\//i.test(rawHref) || /^mailto:/i.test(rawHref)
      if (!rawHref || (!isRelativePath && !isSafeProtocol)) {
        return '<a class="text-primary font-medium">'
      }
      const escapedHref = rawHref.replace(/"/g, '&quot;').replace(/</g, '&lt;')
      if (isRelativePath) {
        return `<a href="${escapedHref}" class="text-primary font-medium hover:underline">`
      }
      return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer" class="text-primary font-medium hover:underline">`
    }
    return `<${tag}>`
  })

  return clean
}

export function inferFaqCategory(question: string, answerText: string): Exclude<FaqCategoryId, 'all'> {
  const text = `${question} ${answerText}`.toLowerCase()

  if (
    text.includes('daftar') ||
    text.includes('akun') ||
    text.includes('password') ||
    text.includes('otp') ||
    text.includes('kyc') ||
    text.includes('verifikasi identitas')
  ) {
    return 'akun'
  }

  if (
    text.includes('badge') ||
    text.includes('vvip') ||
    text.includes('vip') ||
    text.includes('bekasku+') ||
    text.includes('bekasku plus') ||
    text.includes('kurasi') ||
    text.includes('sundul') ||
    text.includes('promosi')
  ) {
    return 'program'
  }

  if (
    text.includes('pengiriman') ||
    text.includes('kirim') ||
    text.includes('resi') ||
    text.includes('kurir') ||
    text.includes('komplain') ||
    text.includes('retur') ||
    text.includes('cacat')
  ) {
    return 'pengiriman'
  }

  return 'transaksi'
}

export function normalizeFaqItems(rawList: unknown): FaqItem[] {
  if (!Array.isArray(rawList)) return []
  const usedSlugs = new Map<string, number>()

  return rawList
    .filter((item): item is FaqRawItem => Boolean(item && typeof item === 'object'))
    .map((item, idx) => {
      const question = String(item.question || '').trim()
      const answerHtml = sanitizeFaqHtml(String(item.answer || ''))
      const answerText = stripHtmlTags(answerHtml)
      const baseSlug = slugify(question) || `faq-${idx + 1}`
      const seen = usedSlugs.get(baseSlug) || 0
      usedSlugs.set(baseSlug, seen + 1)
      const slug = seen > 0 ? `${baseSlug}-${seen + 1}` : baseSlug
      const category =
        item.category === 'akun' ||
        item.category === 'transaksi' ||
        item.category === 'pengiriman' ||
        item.category === 'program'
          ? item.category
          : inferFaqCategory(question, answerText)

      return {
        id: String(item._id || item.id || slug),
        slug,
        question,
        answerHtml,
        answerText,
        category,
      }
    })
    .filter(item => Boolean(item.question))
}

export function defaultHelpContact(): HelpContactInfo {
  return {
    phone: '+6282112382388',
    email: BEKASKU_CENTER_SUPPORT_EMAIL || SUPPORT_EMAIL,
    address: DEFAULT_LOCATION,
    working_hour: BEKASKU_CENTER_DEFAULT_WORKING_HOUR,
    socmed: [],
  }
}

export function normalizeContactInfo(raw: unknown): HelpContactInfo {
  const base = defaultHelpContact()
  if (!raw || typeof raw !== 'object') return base
  const m = raw as Record<string, unknown>

  const socmedRaw = Array.isArray(m.socmed) ? m.socmed : []
  const socmed = socmedRaw
    .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === 'object'))
    .map(s => ({
      _id: s._id ? String(s._id) : undefined,
      logo: s.logo ? sanitizeMediaUrl(String(s.logo), '') : undefined,
      title: String(s.title || ''),
      description: String(s.description || ''),
      link: String(s.link || ''),
    }))
    .filter(s => Boolean(s.title && s.link))

  return {
    phone: m.phone ? String(m.phone) : base.phone,
    email: m.email ? String(m.email) : base.email,
    address: m.address ? String(m.address) : base.address,
    working_hour: m.working_hour ? String(m.working_hour) : base.working_hour,
    socmed,
  }
}

export function useHelpCenter() {
  const api = useApi()
  const { showNotification } = useNotification()

  const feedbackMap = useState<Record<string, FaqFeedbackRecord>>('help_faq_feedbacks', () => ({}))
  const feedbackModalOpen = ref(false)
  const feedbackTargetFaqId = ref('')
  const feedbackIsSatisfied = ref(true)

  function loadFeedbackFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAQ_FEEDBACK)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        feedbackMap.value = parsed as Record<string, FaqFeedbackRecord>
      }
    } catch {
      // ignore corrupted storage
    }
  }

  function saveFeedbackToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY_FAQ_FEEDBACK, JSON.stringify(feedbackMap.value))
    } catch {
      // ignore quota error
    }
  }

  function isFeedbackSubmitted(faqId: string): boolean {
    if (!faqId) return false
    return Boolean(feedbackMap.value[faqId])
  }

  function getFeedbackRecord(faqId: string): FaqFeedbackRecord | null {
    if (!faqId) return null
    return feedbackMap.value[faqId] || null
  }

  function openFeedbackModal(faqId: string, isSatisfied: boolean) {
    if (!faqId) return
    loadFeedbackFromStorage()
    if (isFeedbackSubmitted(faqId)) return
    feedbackTargetFaqId.value = faqId
    feedbackIsSatisfied.value = isSatisfied
    feedbackModalOpen.value = true
  }

  function submitFeedbackReasons(reasons: string[]) {
    const faqId = feedbackTargetFaqId.value
    if (!faqId || reasons.length === 0) return

    feedbackMap.value = {
      ...feedbackMap.value,
      [faqId]: {
        faqId,
        isSatisfied: feedbackIsSatisfied.value,
        reasons,
        submittedAt: new Date().toISOString(),
      },
    }
    saveFeedbackToStorage()
    feedbackModalOpen.value = false
    showNotification({
      type: 'success',
      message: 'Terima kasih atas masukan Anda.',
    })
  }

  async function fetchFaqList(filter = ''): Promise<{ items: FaqItem[]; error: string }> {
    try {
      const res = await api.post<{ message?: string; result?: FaqRawItem[] }>(API_FAQ, {
        lang: 'id',
        filter: filter.trim(),
      })
      const items = normalizeFaqItems(res?.result || [])
      return { items, error: '' }
    } catch {
      return {
        items: [],
        error: 'Gagal memuat pusat bantuan. Silakan coba beberapa saat lagi.',
      }
    }
  }

  async function fetchContactInfo(): Promise<HelpContactInfo> {
    try {
      const res = await api.post<{ message?: string; result?: Record<string, unknown> }>(
        API_SOCMED,
        { lang: 'id' },
      )
      return normalizeContactInfo(res?.result)
    } catch {
      return defaultHelpContact()
    }
  }

  function filterFaqItems(
    items: FaqItem[],
    keyword: string,
    category: FaqCategoryId,
  ): FaqItem[] {
    const q = keyword.trim().toLowerCase()
    return items.filter((item) => {
      const matchCat = category === 'all' || item.category === category
      if (!matchCat) return false
      if (!q) return true
      return (
        item.question.toLowerCase().includes(q) ||
        item.answerText.toLowerCase().includes(q)
      )
    })
  }

  function findFaqBySlug(items: FaqItem[], slug: string): FaqItem | null {
    const target = String(slug || '').trim().toLowerCase()
    if (!target) return null
    return (
      items.find(item => item.slug.toLowerCase() === target || item.id.toLowerCase() === target) ||
      null
    )
  }

  function categoryCounts(items: FaqItem[]): Record<FaqCategoryId, number> {
    const counts: Record<FaqCategoryId, number> = {
      all: items.length,
      akun: 0,
      transaksi: 0,
      pengiriman: 0,
      program: 0,
    }
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }

  return {
    categories: computed(() => HELP_CATEGORIES),
    feedbackMap,
    feedbackModalOpen,
    feedbackTargetFaqId,
    feedbackIsSatisfied,
    loadFeedbackFromStorage,
    isFeedbackSubmitted,
    getFeedbackRecord,
    openFeedbackModal,
    submitFeedbackReasons,
    fetchFaqList,
    fetchContactInfo,
    filterFaqItems,
    findFaqBySlug,
    categoryCounts,
  }
}

