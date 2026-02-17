import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const parseLineup = (lineup) => {
  if (!lineup) return []
  return String(lineup)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

const festivalsPath = path.resolve(__dirname, '../src/data/festivals.json')
const artistsPath = path.resolve(__dirname, '../src/data/artists.json')

const festivalsRaw = fs.readFileSync(festivalsPath, 'utf-8')
const festivals = JSON.parse(festivalsRaw)

const artistsRaw = fs.readFileSync(artistsPath, 'utf-8')
const artists = JSON.parse(artistsRaw)

const existingSlugs = new Set(artists.map((artist) => artist.slug))

const slugToName = new Map()
const allFestivalSlugs = new Set()

for (const festival of Object.values(festivals).flat()) {
  const slugs = (festival.artistSlugs || []).filter(Boolean)
  slugs.forEach((slug) => allFestivalSlugs.add(String(slug).trim()))

  if (!festival.lineup || !slugs.length) continue
  const names = parseLineup(festival.lineup)
  const count = Math.min(names.length, slugs.length)
  for (let i = 0; i < count; i += 1) {
    const slug = String(slugs[i] || '').trim()
    const name = String(names[i] || '').trim()
    if (!slug || !name) continue
    if (!slugToName.has(slug)) slugToName.set(slug, name)
  }
}

const titleFromSlug = (slug) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const missingSlugs = Array.from(allFestivalSlugs)
  .map((slug) => slug.trim())
  .filter(Boolean)
  .filter((slug) => !existingSlugs.has(slug))
  .sort((a, b) => a.localeCompare(b))

if (!missingSlugs.length) {
  console.log('✅ artists.json already includes all festival artist slugs.')
  process.exit(0)
}

const newArtists = missingSlugs.map((slug) => ({
  slug,
  identity: {
    name: slugToName.get(slug) || titleFromSlug(slug),
  },
}))

artists.push(...newArtists)

fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')

console.log(`✅ artists.json updated (+${newArtists.length} artists)`)
console.log(`📄 ${artistsPath}`)
