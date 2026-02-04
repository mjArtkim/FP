/** lineup 문자열 → 아티스트 이름 배열 */
export const parseLineup = (lineup: string): string[] => {
  if (!lineup) return []
  return lineup
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

/** 아티스트 이름 → URL-safe slug */
export const artistSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}