import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MB_BASE = 'https://musicbrainz.org/ws/2'
const USER_AGENT = 'FestivalPulse/1.0 (contact: your-email@example.com)' // 바꿔줘

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let lastCall = 0
async function rateLimit() {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastCall))
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
  identity: {
    name: string
    mbid?: string
    type?: string
    country?: string
    aliases?: string[]
    links?: Record<string, string>
  }
  spotify: Record<string, any>
}

function extractLinks(relations: any[] | undefined) {
  const links: Record<string, string> = {}
  if (!relations) return links
  for (const r of relations) {
    if (r?.type && r?.target) links[r.type] = r.target
  }
  return links
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as Artist[]

  let count = 0

  for (const a of artists) {
    const mbid = a.identity?.mbid
    if (!mbid) continue

    // ✅ genres/tags는 Spotify에 맡기고, 여기선 정체성(aliases/type/country/links)만
    const data = await mbFetch(
      `${MB_BASE}/artist/${mbid}?inc=aliases+url-rels&fmt=json`
    )

    a.identity = {
      ...(a.identity ?? { name: a.slug }),
      name: data.name ?? a.identity.name,
      type: data.type ?? a.identity.type,
      country: data.country ?? a.identity.country,
      aliases: (data.aliases ?? []).map((x: any) => x.name).slice(0, 10),
      links: {
        ...(a.identity.links ?? {}),
        ...extractLinks(data.relations),
        musicbrainz: `https://musicbrainz.org/artist/${mbid}`,
      },
    }

    count++
    console.log(`✅ MB enriched: ${a.identity.name} (${mbid})`)
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! MusicBrainz 업데이트 ${count}명`)
  console.log(`📄 ${artistsPath}`)
})()
