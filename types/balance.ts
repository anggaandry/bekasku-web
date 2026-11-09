export interface BalanceMutation {
  id: string
  title: string
  description?: string
  total: number
  type?: number
  status?: string
  verify?: number
  time?: string
}

export interface WithdrawPayload {
  bank_user_id: string
  name: string
  substract: number
  password: string
}

export interface BalanceFilterOption {
  value: number
  label: string
}

export interface BalanceWithdrawInfo {
  total_balance: number
  mybank: Array<{
    id: string
    logo: string
    name: string
    bank_name: string
    bank_account: string
    custom_bank_name?: string
    status: boolean
  }>
}
