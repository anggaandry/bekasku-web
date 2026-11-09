export type IdentityDocType = 'KTP' | 'SIM'

export type KycModalStep =
  | 'intro'
  | 'choose'
  | 'guide'
  | 'capture'
  | 'review'
  | 'success'

export interface IdentityInfoData {
  identity?: string
  identity_name?: string
  identity_number?: string
  identity_type?: string
  selfie_identity?: string
  has_selfie_identity?: boolean
  selfie_verified_at?: string
}

export interface MlVisionResult {
  name?: string
  number?: string
}

export interface IdentityUploadPayload {
  identity_name: string
  identity_number: string
  identity_type: IdentityDocType
  identity: string // base64
}

export interface KycModalOptions {
  reason?: 'sell' | 'bank' | 'withdraw' | 'general' | string
  featureName?: string
  onSuccess?: () => void
}

