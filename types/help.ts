export type FaqCategoryId = 'all' | 'akun' | 'transaksi' | 'pengiriman' | 'program'

export interface FaqRawItem {
  _id?: string
  id?: string
  question: string
  answer: string
  category?: string
}

export interface FaqItem {
  id: string
  slug: string
  question: string
  answerHtml: string
  answerText: string
  category: Exclude<FaqCategoryId, 'all'>
}

export interface FaqCategoryMeta {
  id: FaqCategoryId
  label: string
  description: string
  iconName: 'LayoutGrid' | 'ShieldCheck' | 'CreditCard' | 'Truck' | 'Award'
}

export interface FaqFeedbackRecord {
  faqId: string
  isSatisfied: boolean
  reasons: string[]
  submittedAt: string
}

export interface SocmedChannel {
  _id?: string
  logo?: string
  title: string
  description: string
  link: string
}

export type HelpSocmedItem = SocmedChannel

export interface HelpContactInfo {
  phone: string
  email: string
  address: string
  working_hour: string
  socmed: SocmedChannel[]
}

export type HelpCenterTopic =
  | 'general'
  | 'transaction'
  | 'post'
  | 'balance'
  | 'address'
  | 'payment'
  | 'complain'
  | 'kyc'
  | 'codMeetup'
  | 'vip'
  | 'bekaskuPlus'

export interface HelpCenterOpenOptions {
  topic?: HelpCenterTopic
  referenceId?: string
  referenceTitle?: string
  initialMessage?: string
  preferFullPage?: boolean
}

export interface HelpChatListResult {
  docs?: Record<string, unknown>[]
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface HelpChatListResponse {
  status?: boolean
  message?: string
  result?: HelpChatListResult
}

