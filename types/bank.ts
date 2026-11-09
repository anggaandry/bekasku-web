export interface UserBankAccount {
  id: string
  logo?: string
  name: string
  bank_name: string
  bank_account: string
  custom_bank_name?: string
  status?: boolean
}

export interface BankItem {
  _id: string
  id?: string
  name: string
  image: string
  code?: string
  custom_name?: string
}

export interface BankListResponse {
  docs: BankItem[]
  total?: number
  limit?: number
  page?: number
  pages?: number
}

export interface BankFormPayload {
  bank_id: string
  number: string
  name: string
  custom_bank_name?: string
}

export interface BankCheckResult {
  message?: string
  result?: number
}

