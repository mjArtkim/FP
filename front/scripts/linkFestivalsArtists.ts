import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseLineup, artistSlug } from '../src/utils/artist.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type Festival = {
  id: number
  title: string
  start: string
  end: string
  lineup?: string
  artistSlugs?: string[]
  [key: string]: any
}

type Artist = {
  slug: string
  identity?: { name?: string }
}

const festivalsPath = path.resolve(__dirname, '../src/data/festivals.json')
const artistsPath = path.resolve(__dirname, '../src/data/artists.json')

const festivalsRaw = fs.readFileSync(festivalsPath, 'utf-8')
const festivals = JSON.parse(festivalsRaw) as Record<string, Festival[]>

const artistsRaw = fs.readFileSync(artistsPath, 'utf-8')
const artists = JSON.parse(artistsRaw) as Artist[]

// ✅ 아티스트 이름 -> slug 매핑 테이블 만들기
const nameToSlug = new Map<string, string>()
for (const a of artists) {
  const name = a.identity?.name?.trim()
  if (name) nameToSlug.set(name.toLowerCase(), a.slug)
}

let linkedCount = 0
const missing: { festivalTitle: string; artistName: string }[] = []

// ✅ festivals.json 전체 순회하면서 artistSlugs 채우기
for (const monthKey of Object.keys(festivals)) {
  festivals[monthKey] = festivals[monthKey].map((f) => {
    const lineupNames = parseLineup(f.lineup || '')
    const slugs: string[] = []

    for (const name of lineupNames) {
      // 1) artists.json에서 이름으로 찾기
      const found = nameToSlug.get(name.toLowerCase())

      // 2) 못 찾으면: 이름을 slugify해서 직접 매칭 시도
      const fallback = found || artistSlug(name)

      // artists.json에 실제로 존재하는 slug인지 확인하고 넣기
      const exists = artists.some((a) => a.slug === fallback)

      if (exists) {
        slugs.push(fallback)
        linkedCount++
      } else {
        missing.push({ festivalTitle: f.title, artistName: name })
      }
    }

    return {
      ...f,
      artistSlugs: Array.from(new Set(slugs)), // 중복 제거
    }
  })
}

fs.writeFileSync(festivalsPath, JSON.stringify(festivals, null, 2), 'utf-8')

console.log(`✅ festivals.json에 artistSlugs 연결 완료`)
console.log(`🔗 연결된 항목 수: ${linkedCount}`)

if (missing.length) {
  console.log(`⚠️ artists.json에서 못 찾은 아티스트 ${missing.length}개 (아래 확인)`)
  console.log(missing.slice(0, 30))
  if (missing.length > 30) console.log(`... (+${missing.length - 30} more)`)
}
