import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { getSpotifyToken } from './spotifyAuth.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type SpotifyAlbum = {
  id: string
  name: string
  albumType: string
  releaseDate: string
  totalTracks: number
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

type Artist = {
  slug: string
  identity: { name: string }
  spotify: {
    spotifyId?: string
    image?: string
    genres?: string[]
    followers?: number
    popularity?: number
    spotifyUrl?: string

    // ✅ 추가
    albums?: SpotifyAlbum[]
    topTracks?: SpotifyTopTrack[]
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function searchSpotifyArtist(name: string, token: string) {
  const q = encodeURIComponent(name)
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=artist&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return (data?.artists?.items ?? []) as any[]
}

async function fetchSpotifyJSON(url: string, token: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Spotify ${res.status}: ${await res.text()}`)
  return res.json()
}

async function getArtistAlbums(artistId: string, token: string) {
  // album,single 만 (compilation/appears_on 제외) + 최근순으로 가져온 다음 정리
  const url =
    `https://api.spotify.com/v1/artists/${artistId}/albums` +
    `?include_groups=album,single&limit=20&market=US`
  const json = await fetchSpotifyJSON(url, token)
  const items = (json?.items ?? []) as any[]

  // 중복(같은 앨범이 여러 시장/버전으로 잡히는 경우) 제거: name+release_date 기준
  const seen = new Set<string>()
  const out: SpotifyAlbum[] = []

  for (const it of items) {
    const key = `${it?.name ?? ''}|${it?.release_date ?? ''}|${it?.album_type ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      id: it.id,
      name: it.name,
      albumType: it.album_type, // "album" | "single"
      releaseDate: it.release_date, // "YYYY-MM-DD" or "YYYY"
      totalTracks: it.total_tracks ?? 0,
      image: it.images?.[0]?.url,
      url: it.external_urls?.spotify,
    })
  }

  return out.slice(0, 12) // ✅ 너무 길어지지 않게 상위 12개만
}

async function getArtistTopTracks(artistId: string, token: string) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`
  const json = await fetchSpotifyJSON(url, token)
  const tracks = (json?.tracks ?? []) as any[]

  const out: SpotifyTopTrack[] = tracks.slice(0, 10).map((t) => ({
    id: t.id,
    name: t.name,
    previewUrl: t.preview_url ?? null,
    url: t.external_urls?.spotify,
    durationMs: t.duration_ms,
    popularity: t.popularity,
    album: {
      id: t.album?.id,
      name: t.album?.name,
      releaseDate: t.album?.release_date,
      image: t.album?.images?.[0]?.url,
    },
    artists: Array.isArray(t.artists) ? t.artists.map((x: any) => x.name) : [],
  }))

  return out
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as Artist[]

  const token = await getSpotifyToken()

  let updated = 0

  for (const a of artists) {
    const queryName = a.identity?.name || a.slug

    // ✅ spotifyId 없으면 먼저 찾기
    if (!a.spotify?.spotifyId) {
      const candidates = await searchSpotifyArtist(queryName, token)
      const best = candidates[0]
      if (!best) {
        console.log(`❌ not found: ${queryName}`)
        continue
      }

    a.spotify = {
      ...(a.spotify ?? {}),
      spotifyId: best.id,
      image: best.images?.[0]?.url || a.spotify?.image || '',
      genres: best.genres || [],
      followers: best.followers?.total ?? 0,
      popularity: best.popularity ?? 0,
      spotifyUrl: best.external_urls?.spotify || '',
    }
      console.log(`🔎 Spotify matched: ${queryName} -> ${best.name}`)
      await sleep(120)
    }

    const id = a.spotify.spotifyId
    if (!id) continue

    // ✅ 이미 albums/topTracks가 있으면 스킵하고 싶으면 여기 조건 추가 가능
    // if ((a.spotify.albums?.length ?? 0) > 0 && (a.spotify.topTracks?.length ?? 0) > 0) continue

    try {
      const [albums, topTracks] = await Promise.all([
        getArtistAlbums(id, token),
        getArtistTopTracks(id, token),
      ])

      a.spotify = {
        ...(a.spotify ?? {}),
        albums,
        topTracks,
      }

      updated++
      console.log(
        `✅ Spotify extra: ${queryName} (albums: ${albums.length}, topTracks: ${topTracks.length})`
      )
    } catch (e: any) {
      console.log(`⚠️ Spotify extra failed: ${queryName} -> ${e?.message ?? e}`)
    }

    await sleep(150)
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! Spotify 앨범/탑트랙 업데이트 ${updated}명`)
  console.log(`📄 ${artistsPath}`)
})()
