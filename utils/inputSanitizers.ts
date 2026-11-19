/**
 * Prevent typing non-digit keys on numeric/phone inputs while allowing navigation and shortcuts.
 */
export function enforceDigitsKeydown(e: KeyboardEvent): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowedKeys.includes(e.key)) return
  if (/^\d$/.test(e.key)) return
  e.preventDefault()
}

/**
 * Strip all non-digit characters, optionally remove leading 62/0 for +62 prefixed fields,
 * and force-sync the DOM input value so invalid characters never remain visible.
 */
export function syncDigitsInput(
  e: Event,
  options: { stripLeading62Zero?: boolean; maxLength?: number } = {},
): string {
  const { stripLeading62Zero = false, maxLength = 15 } = options
  const input = e.target as HTMLInputElement
  let digits = input.value.replace(/\D/g, '')
  if (stripLeading62Zero) {
    if (digits.startsWith('62')) digits = digits.slice(2)
    if (digits.startsWith('0')) digits = digits.slice(1)
  }
  const clean = digits.slice(0, maxLength)
  if (input.value !== clean) {
    input.value = clean
  }
  return clean
}
