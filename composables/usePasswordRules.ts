import type { Ref } from 'vue'
import { PASSWORD_MIN_LENGTH } from '~/utils/constants'

const PROHIBITED_CHARS = ['^', '<', '>', '(', ')', '[', ']', '{', '}', '"', "'", '/', '\\', '$', '=', '+', '*', '~']

export function normalizePhoneTo62(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return `62${digits}`
}

export function formatPhoneLocalDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits.slice(2)
  if (digits.startsWith('0')) return digits.slice(1)
  return digits
}

export function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function usePasswordRules(passwordRef: Ref<string>) {
  const hasMinLength = computed(() => passwordRef.value.length >= PASSWORD_MIN_LENGTH)
  const hasLowercase = computed(() => /[a-z]/.test(passwordRef.value))
  const hasUppercase = computed(() => /[A-Z]/.test(passwordRef.value))
  const hasNumber = computed(() => /[0-9]/.test(passwordRef.value))

  const prohibitedCharFound = computed(() => {
    for (const ch of PROHIBITED_CHARS) {
      if (passwordRef.value.includes(ch)) return ch
    }
    return null
  })

  const hasNoProhibitedChar = computed(() => prohibitedCharFound.value === null)

  const rules = computed(() => [
    { key: 'length', label: `Minimal ${PASSWORD_MIN_LENGTH} karakter`, passed: hasMinLength.value },
    { key: 'lower', label: 'Mengandung huruf kecil (a-z)', passed: hasLowercase.value },
    { key: 'upper', label: 'Mengandung huruf besar (A-Z)', passed: hasUppercase.value },
    { key: 'number', label: 'Mengandung angka (0-9)', passed: hasNumber.value },
  ])

  const isValid = computed(
    () =>
      hasMinLength.value &&
      hasLowercase.value &&
      hasUppercase.value &&
      hasNumber.value &&
      hasNoProhibitedChar.value,
  )

  return {
    hasMinLength,
    hasLowercase,
    hasUppercase,
    hasNumber,
    prohibitedCharFound,
    hasNoProhibitedChar,
    rules,
    isValid,
  }
}

