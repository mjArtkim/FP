import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getSpotifyToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET 을 .env에 넣어줘')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!data.access_token) throw new Error('토큰 발급 실패: ' + JSON.stringify(data))
  return data.access_token
}

async function searchSpotifyArtist(name, token) {
  const q = encodeURIComponent(name)
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=artist&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return (data?.artists?.items ?? [])
}

async function fetchSpotifyJSON(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Spotify ${res.status}: ${await res.text()}`)
  return res.json()
}

async function getArtistAlbums(artistId, token) {
  const url =
    `https://api.spotify.com/v1/artists/${artistId}/albums` +
    `?include_groups=album,single&limit=20&market=US`
  const json = await fetchSpotifyJSON(url, token)
  const items = (json?.items ?? [])

  const seen = new Set()
  const out = []

  for (const it of items) {
    const key = `${it?.name ?? ''}|${it?.release_date ?? ''}|${it?.album_type ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      id: it.id,
      name: it.name,
      albumType: it.album_type,
      releaseDate: it.release_date,
      totalTracks: it.total_tracks ?? 0,
      image: it.images?.[0]?.url,
      url: it.external_urls?.spotify,
    })
  }

  return out.slice(0, 9)
}

async function getArtistTopTracks(artistId, token) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`
  const json = await fetchSpotifyJSON(url, token)
  const tracks = (json?.tracks ?? [])

  const out = tracks.slice(0, 5).map((t) => ({
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
    artists: Array.isArray(t.artists) ? t.artists.map((x) => x.name) : [],
  }))

  return out
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8'))

  const token = await getSpotifyToken()

  let updated = 0

  for (const a of artists) {
    const queryName = a.identity?.name || a.slug

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
    } catch (e) {
      console.log(`⚠️ Spotify extra failed: ${queryName} -> ${e?.message ?? e}`)
    }

    await sleep(150)
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! Spotify 앨범/탑트랙 업데이트 ${updated}명`)
  console.log(`📄 ${artistsPath}`)
})()
