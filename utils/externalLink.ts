/** Buka tautan eksternal di tab baru tanpa membocorkan `window.opener`. */
export function openExternal(url: string) {
  if (!import.meta.client || !url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}
