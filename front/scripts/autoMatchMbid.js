import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MB_BASE = 'https://musicbrainz.org/ws/2'
const USER_AGENT = 'FestivalPulse/1.0 (contact: mjtwins1@naver.com)'

const MIN_SCORE_EXACT = 70
const MIN_SCORE_FUZZY = 90

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let lastCall = 0
async function rateLimit() {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastCall))
  if (wait) await sleep(wait)
  lastCall = Date.now()
}

async function mbFetch(url) {
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

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

async function searchArtist(name) {
  const query = encodeURIComponent(`artist:"${name}"`)
  const url = `${MB_BASE}/artist?query=${query}&fmt=json&limit=5`
  const json = await mbFetch(url)
  return Array.isArray(json?.artists) ? json.artists : []
}

function pickBestCandidate(candidates, name, country) {
  if (!candidates.length) return null

  const target = String(name || '').toLowerCase()
  const normalizedTarget = normalize(name)
  const targetCountry = String(country || '').toLowerCase()

  const scored = candidates.map((c) => {
    const score = Number(c?.score ?? 0)
    const nameLower = String(c?.name ?? '').toLowerCase()
    const normalizedName = normalize(c?.name)
    let boost = 0

    if (nameLower === target) boost += 20
    else if (normalizedName === normalizedTarget) boost += 10

    if (targetCountry && String(c?.country ?? '').toLowerCase() === targetCountry) {
      boost += 5
    }

    return {
      candidate: c,
      total: score + boost,
      score,
      boost,
      exact: nameLower === target,
    }
  })

  scored.sort((a, b) => b.total - a.total)

  const best = scored[0]
  if (best.exact && best.score >= MIN_SCORE_EXACT) return best.candidate
  if (best.score >= MIN_SCORE_FUZZY) return best.candidate

  return null
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8'))

  const dryRun = process.env.DRY_RUN === '1'

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const artist of artists) {
    const name = artist?.identity?.name || artist?.name
    if (!name) {
      skipped++
      continue
    }
    if (artist?.identity?.mbid) {
      skipped++
      continue
    }

    try {
      const candidates = await searchArtist(name)
      const best = pickBestCandidate(candidates, name, artist?.identity?.country)
      if (!best) {
        console.log(`❌ MBID not found: ${name}`)
        continue
      }

      if (!dryRun) {
        artist.identity = artist.identity || {}
        artist.identity.mbid = best.id
      }

      updated++
      console.log(`✅ MBID matched: ${name} -> ${best.name} (${best.id})`)
    } catch (error) {
      failed++
      const message = error instanceof Error ? error.message : String(error)
      console.log(`⚠️ MBID lookup failed: ${name} -> ${message}`)
    }
  }

  if (!dryRun) {
    fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  }

  console.log(`🎉 완료! MBID 업데이트 ${updated}명 (skipped: ${skipped}, failed: ${failed})`)
  console.log(`📄 ${artistsPath}`)
  if (dryRun) console.log('🧪 DRY_RUN=1: 파일 저장은 하지 않았습니다.')
})()
