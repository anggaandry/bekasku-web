/** Raw flag as delivered by the legacy API (boolean, 0/1, or "true"/"false" string). */
export type ApiFlag = boolean | number | string | null | undefined

/** Normalizes API flags (true, 1, "1", "true") to a strict boolean. */
export function isFlagOn(value: ApiFlag): boolean {
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true'
  return value === true || value === 1
}

/** True only when the flag is explicitly off (false, 0, "false"); missing flags are not "off". */
export function isFlagOff(value: ApiFlag): boolean {
  if (value === undefined || value === null) return false
  return !isFlagOn(value)
}
