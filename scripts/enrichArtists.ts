// scripts/enrichArtists.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MB_BASE = 'https://musicbrainz.org/ws/2'

// ✅ 너 이메일(또는 연락 가능한 주소)로 바꿔줘
const USER_AGENT = 'FestivalPulse/1.0 (contact: your-email@example.com)'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let lastCall = 0
async function rateLimit() {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastCall)) // 1초 제한 안전빵
  if (wait) await sleep(wait)
  lastCall = Date.now()
}

async function mbFetch(url: string) {
  await rateLimit()
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`MusicBrainz ${res.status}: ${await res.text()}`)
  return res.json()
}

type Artist = {
  slug: string
  name: string
  mbid?: string
  type?: string
  country?: string
  genres?: string[]
  aliases?: string[]
  links?: Record<string, string>
}

function extractLinks(relations: any[] | undefined) {
  const links: Record<string, string> = {}
  if (!relations) return links

  for (const r of relations) {
    // 예: type = 'wikidata', 'wikipedia', 'official homepage' 등
    if (r?.type && r?.target) links[r.type] = r.target
  }
  return links
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const raw = fs.readFileSync(artistsPath, 'utf-8')
  const artists = JSON.parse(raw) as Artist[]

  let count = 0

  for (const a of artists) {
    if (!a.mbid) continue

    const data = await mbFetch(
      `${MB_BASE}/artist/${a.mbid}?inc=aliases+genres+tags+url-rels&fmt=json`
    )

    a.name = data.name ?? a.name
    a.type = data.type ?? a.type
    a.country = data.country ?? a.country

    a.aliases = (data.aliases ?? []).map((x: any) => x.name).slice(0, 10)
    a.genres = (data.genres ?? []).map((x: any) => x.name).slice(0, 10)

    a.links = {
      ...(a.links ?? {}),
      ...extractLinks(data.relations),
      musicbrainz: `https://musicbrainz.org/artist/${a.mbid}`,
    }

    count++
    console.log(`✅ enriched: ${a.name} (${a.mbid})`)
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! mbid 있는 아티스트 ${count}명 업데이트됨`)
  console.log(`📄 파일: ${artistsPath}`)
})()
