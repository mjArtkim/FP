const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

export const normalizeExternalUrl = (input?: string | null): string => {
  const value = (input ?? '').trim()
  if (!value) return ''

  const candidate = SCHEME_REGEX.test(value) ? value : `https://${value}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}
