import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { getSpotifyToken } from './spotifyAuth.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as Artist[]

  const token = await getSpotifyToken()

  let updated = 0

  for (const a of artists) {
    // ✅ 이미 spotifyId가 있고 genres/image도 있으면 스킵
    if (a.spotify?.spotifyId && a.spotify?.image && (a.spotify?.genres?.length ?? 0) > 0) {
      continue
    }

    const queryName = a.identity?.name || a.slug
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

    updated++
    console.log(`✅ Spotify enriched: ${a.identity?.name} -> ${best.name} (followers: ${a.spotify.followers})`)
    await sleep(120)
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! Spotify 업데이트 ${updated}명`)
  console.log(`📄 ${artistsPath}`)
})()
