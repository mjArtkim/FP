// scripts/generateArtists.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseLineup, artistSlug } from '../src/utils/artist.ts'

// ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type Festival = {
  lineup?: string
}

// festivals.json 읽기
const festivalsPath = path.resolve(__dirname, '../src/data/festivals.json')
const festivalsRaw = fs.readFileSync(festivalsPath, 'utf-8')
const festivals = JSON.parse(festivalsRaw) as Record<string, Festival[]>

// lineup 모으기
const allLineups = Object.values(festivals)
  .flat()
  .map((f) => f.lineup)
  .filter(Boolean) as string[]

// 중복 제거
const artistSet = new Set<string>()
allLineups.forEach((lineup) => {
  parseLineup(lineup).forEach((name) => artistSet.add(name))
})

// artists.json 만들기
const artists = Array.from(artistSet)
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({
    slug: artistSlug(name),
    name,
    mbid: ''
  }))

// 저장
const outputPath = path.resolve(__dirname, '../src/data/artists.json')
fs.writeFileSync(outputPath, JSON.stringify(artists, null, 2), 'utf-8')

console.log(`✅ artists.json 생성 완료 (${artists.length}명)`)
console.log(`📄 ${outputPath}`)