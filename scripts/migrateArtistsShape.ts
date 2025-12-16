import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type OldArtist = {
  slug: string
  name?: string
  mbid?: string
  type?: string
  country?: string
  aliases?: string[]
  links?: Record<string, string>

  spotifyId?: string
  image?: string
  genres?: string[]
  followers?: number
  popularity?: number
  spotifyUrl?: string
}

type NewArtist = {
  slug: string
  identity: {
    name: string
    mbid?: string
    type?: string
    country?: string
    aliases?: string[]
    links?: Record<string, string>
  }
  spotify: {
    spotifyId?: string
    image?: string
    genres?: string[]
    followers?: number
    popularity?: number
    spotifyUrl?: string
  }
}

const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
const oldData = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as OldArtist[]

const newData: NewArtist[] = oldData.map((a) => ({
  slug: a.slug,
  identity: {
    name: a.name || a.slug,
    mbid: a.mbid,
    type: a.type,
    country: a.country,
    aliases: a.aliases,
    links: a.links,
  },
  spotify: {
    spotifyId: a.spotifyId,
    image: a.image,
    genres: a.genres,
    followers: a.followers,
    popularity: a.popularity,
    spotifyUrl: a.spotifyUrl,
  },
}))

fs.writeFileSync(artistsPath, JSON.stringify(newData, null, 2), 'utf-8')
console.log('✅ artists.json 구조 마이그레이션 완료 (identity/spotify 분리)')
console.log(`📄 ${artistsPath}`)
