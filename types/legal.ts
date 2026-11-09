import type { HelpContactInfo } from '~/types/help'

export type LegalLanguage = 'id' | 'en'
export type LegalDocKind = 'terms' | 'privacy'
export type SocialChannelKind = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'globe'

export interface LegalSectionMeta {
  id: string
  title: string
}

export interface LegalDocument {
  kind: LegalDocKind
  title: string
  version: string
  lastUpdated: string
  contentHtml: string
  sections: LegalSectionMeta[]
  lang: LegalLanguage
  source: 'api' | 'curated'
}

export interface LegalFetchResult {
  document: LegalDocument | null
  error: string
}

export interface SafetyTipItem {
  id: string
  number: number
  title: string
  description: string
  badge: string
  iconName: 'ShieldAlert' | 'Link2' | 'LockKeyhole' | 'QrCode' | 'Flag'
  severity: 'critical' | 'warning' | 'info'
}

export interface SafetyComparisonItem {
  title: string
  description: string
}

export interface FormattedSocialItem {
  key: string
  title: string
  description: string
  link: string
  kind: SocialChannelKind
  badgeClass: string
}

export interface AboutCompanyInfo extends HelpContactInfo {
  legalName: string
  tagline: string
  mission: string
  appVersion: string
  mapsUrl: string
}
