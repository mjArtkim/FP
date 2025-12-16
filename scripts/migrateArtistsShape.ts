import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ================= Types ================= */

type MbTag = { name: string; count?: number }

type SpotifyAlbum = {
  id: string
  name: string
  albumType?: string
  releaseDate?: string
  totalTracks?: number
  image?: string
  url?: string
}

type SpotifyTopTrack = {
  id: string
  name: string
  previewUrl?: string | null
  url?: string
  durationMs?: number
  popularity?: number
  album?: {
    id?: string
    name?: string
    releaseDate?: string
    image?: string
  }
  artists?: string[]
}

type OldArtist = {
  slug: string

  name?: string
  mbid?: string
  type?: string
  gender?: string
  country?: string
  aliases?: string[]
  links?: Record<string, string>

  debutYear?: number
  careerYears?: number
  tags?: MbTag[]

  spotifyId?: string
  image?: string
  genres?: string[]
  followers?: number
  popularity?: number
  spotifyUrl?: string

  albums?: SpotifyAlbum[]
  topTracks?: SpotifyTopTrack[]

  identity?: any
  spotify?: any
}

type NewArtist = {
  slug: string
  identity: {
    name: string
    mbid?: string
    type?: string
    gender?: string
    country?: string
    aliases?: string[]
    links?: Record<string, string>

    debutYear?: number
    careerYears?: number
    tags?: MbTag[]
  }
  spotify: {
    spotifyId?: string
    image?: string
    genres?: string[]
    followers?: number
    popularity?: number
    spotifyUrl?: string

    albums?: SpotifyAlbum[]
    topTracks?: SpotifyTopTrack[]
  }
}

/* ================= Helpers ================= */

function isObject(v: any) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

function pickFirst<T>(...vals: (T | undefined | null)[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v
  return undefined
}

function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {}
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined) continue
    out[k] = val
  }
  return out
}

function toDateKey(s?: string) {
  if (!s) return -1
  const parts = String(s).split('-').map(Number)
  const y = parts[0] ?? 0
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  if (!Number.isFinite(y)) return -1
  return y * 10000 + m * 100 + d
}

function uniqAlbums(albums: SpotifyAlbum[]) {
  const seen = new Set<string>()
  const out: SpotifyAlbum[] = []
  for (const a of albums) {
    const key = `${a.name}|${a.releaseDate}|${a.albumType}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(a)
  }
  return out
}

function normalizeAlbums(albums?: SpotifyAlbum[]) {
  if (!albums?.length) return albums
  const deduped = uniqAlbums(albums)
  deduped.sort((a, b) => toDateKey(b.releaseDate) - toDateKey(a.releaseDate))
  return deduped.slice(0, 12)
}

function normalizeTopTracks(tracks?: SpotifyTopTrack[]) {
  if (!tracks?.length) return tracks
  const map = new Map<string, SpotifyTopTrack>()
  for (const t of tracks) {
    const key = t.id || `${t.name}|${t.album?.name ?? ''}`
    if (!map.has(key)) map.set(key, t)
  }
  const list = [...map.values()]
  list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
  return list.slice(0, 3)
}

function fallbackGenres(current?: string[], mbTags?: MbTag[]) {
  if (current && current.length > 0) return current
  if (mbTags && mbTags.length > 0) {
    const sorted = [...mbTags].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    return sorted.slice(0, 5).map((t) => t.name)
  }
  return current
}

/* ======= debutYear fallback from albums ======= */

function extractYearFromReleaseDate(s?: string): number | undefined {
  if (!s) return undefined
  const m = String(s).match(/^(\d{4})/)
  if (!m) return undefined
  const y = Number(m[1])
  return Number.isFinite(y) ? y : undefined
}

function deriveDebutFromAlbums(albums?: SpotifyAlbum[]): number | undefined {
  if (!albums?.length) return undefined
  let minYear: number | undefined
  for (const a of albums) {
    const y = extractYearFromReleaseDate(a.releaseDate)
    if (y == null) continue
    if (minYear == null || y < minYear) minYear = y
  }
  return minYear
}

function deriveCareerYears(debutYear?: number): number | undefined {
  if (!debutYear) return undefined
  const now = new Date().getFullYear()
  const diff = now - debutYear
  return diff >= 0 ? diff : undefined
}

/* ================= Main ================= */

const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
const raw = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as OldArtist[]

const newData: NewArtist[] = raw.map((a) => {
  const identitySrc = isObject(a.identity) ? a.identity : {}
  const spotifySrc = isObject(a.spotify) ? a.spotify : {}

  const tags = pickFirst<MbTag[]>(identitySrc.tags, a.tags)

  const albumsRaw = pickFirst<SpotifyAlbum[]>(spotifySrc.albums, a.albums)
  const normalizedAlbums = normalizeAlbums(albumsRaw)

  // ✅ debutYear 보정
  const baseDebutYear = pickFirst<number>(identitySrc.debutYear, a.debutYear)
  const finalDebutYear =
    baseDebutYear ?? deriveDebutFromAlbums(normalizedAlbums)

  const finalCareerYears =
    pickFirst<number>(identitySrc.careerYears, a.careerYears) ??
    deriveCareerYears(finalDebutYear)

  const identity = cleanUndefined({
    name: pickFirst(identitySrc.name, a.name, a.slug) ?? a.slug,
    mbid: pickFirst(identitySrc.mbid, a.mbid),
    type: pickFirst(identitySrc.type, a.type),
    gender: pickFirst(identitySrc.gender, a.gender),
    country: pickFirst(identitySrc.country, a.country),
    aliases: pickFirst(identitySrc.aliases, a.aliases),
    links: pickFirst(identitySrc.links, a.links),

    debutYear: finalDebutYear,
    careerYears: finalCareerYears,
    tags,
  })

  const spotify = cleanUndefined({
    spotifyId: pickFirst(spotifySrc.spotifyId, a.spotifyId),
    image: pickFirst(spotifySrc.image, a.image),
    followers: pickFirst(spotifySrc.followers, a.followers),
    popularity: pickFirst(spotifySrc.popularity, a.popularity),
    spotifyUrl: pickFirst(spotifySrc.spotifyUrl, a.spotifyUrl),

    albums: normalizedAlbums,
    topTracks: normalizeTopTracks(pickFirst(spotifySrc.topTracks, a.topTracks)),
    genres: fallbackGenres(pickFirst(spotifySrc.genres, a.genres), tags),
  })

  return { slug: a.slug, identity, spotify }
})

fs.writeFileSync(artistsPath, JSON.stringify(newData, null, 2), 'utf-8')
console.log('✅ debutYear/careerYears 보정 포함 마이그레이션 완료')
console.log(`📄 ${artistsPath}`)
