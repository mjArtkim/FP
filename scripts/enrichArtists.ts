import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MB_BASE = 'https://musicbrainz.org/ws/2'
const USER_AGENT = 'FestivalPulse/1.0 (contact: mjtwins1@naver.com)'

// ✅ release-group fallback 켤지 (API 호출 늘어남)
const ENABLE_RELEASEGROUP_FALLBACK = true

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
    gender?: string
    country?: string
    aliases?: string[]
    birthYear?: number
    labels?: { name: string; mbid?: string; relationType?: string }[]
    links?: Record<string, string>
    debutYear?: number
    careerYears?: number
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

function extractLabels(relations: any[] | undefined) {
  const list: { name: string; mbid?: string; relationType?: string }[] = []
  if (!relations) return list
  const seen = new Set<string>()
  for (const r of relations) {
    const label = r?.label
    if (!label?.name) continue
    const key = `${label.id ?? label.name}|${r?.type ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    list.push({ name: label.name, mbid: label.id, relationType: r?.type })
  }
  return list
}

function yearFromDateStr(s: any): number | undefined {
  if (!s) return undefined
  const m = String(s).match(/^(\d{4})/)
  if (!m) return undefined
  const y = Number(m[1])
  return Number.isFinite(y) ? y : undefined
}

function extractDebutYearFromLifeSpan(data: any): number | undefined {
  const begin = data?.['life-span']?.begin
  return yearFromDateStr(begin)
}

function calcCareerYears(debutYear?: number): number | undefined {
  if (!debutYear) return undefined
  const thisYear = new Date().getFullYear()
  const diff = thisYear - debutYear
  return diff >= 0 ? diff : undefined
}

/**
 * ✅ life-span.begin 이 없을 때만 쓰는 fallback:
 * release-group의 first-release-date 중 "가장 빠른 연도"를 찾음
 *
 * 호출 예:
 * /release-group?artist={mbid}&fmt=json&limit=100&offset=0
 */
async function getEarliestReleaseGroupYear(mbid: string): Promise<number | undefined> {
  // 너무 많은 페이지를 끝까지 다 돌면 느려질 수 있어서 상한 설정
  const LIMIT = 100
  const MAX_PAGES = 2
  let offset = 0

  let minYear: number | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${MB_BASE}/release-group?artist=${encodeURIComponent(mbid)}&fmt=json&limit=${LIMIT}&offset=${offset}`
    const json = await mbFetch(url)

    const items = json?.['release-groups'] ?? []
    for (const rg of items) {
      const y = yearFromDateStr(rg?.['first-release-date'])
      if (y != null) {
        if (minYear == null || y < minYear) minYear = y
      }
    }

    const count = Number(json?.count ?? 0)
    offset += LIMIT
    if (!count || offset >= count) break
  }

  return minYear
}

;(async () => {
  const artistsPath = path.resolve(__dirname, '../src/data/artists.json')
  const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8')) as Artist[]

  let count = 0

  for (const a of artists) {
    const mbid = a.identity?.mbid
    if (!mbid) continue

    // aliases + url-rels 유지
    const data = await mbFetch(`${MB_BASE}/artist/${mbid}?inc=aliases+url-rels+label-rels&fmt=json`)

    const isPerson = data?.type === 'Person'
    const lifeSpanYear = extractDebutYearFromLifeSpan(data)

    // 1) 기본: 그룹/단체는 life-span.begin을 데뷔로, 개인은 birthYear로
    let debutYear = !isPerson ? lifeSpanYear : undefined

    // 2) fallback: release-group first-release-date 중 최소 연도
    if (!debutYear && ENABLE_RELEASEGROUP_FALLBACK) {
      try {
        const rgYear = await getEarliestReleaseGroupYear(mbid)
        debutYear = rgYear ?? debutYear
      } catch {
        // fallback 실패해도 전체는 계속 진행
      }
    }

    const careerYears = calcCareerYears(debutYear)
    const labels = extractLabels(data.relations)
    const birthYear = isPerson ? lifeSpanYear : undefined

    a.identity = {
      ...(a.identity ?? { name: a.slug }),
      name: data.name ?? a.identity.name,

      type: (data.type === 'Person' ? 'Solo' : data.type) ?? a.identity.type,
      gender: data.gender ?? a.identity.gender,
      country: data.country ?? a.identity.country,

      aliases: (data.aliases ?? []).map((x: any) => x.name).slice(0, 10),
      labels: labels.length > 0 ? labels : a.identity.labels,
      birthYear: birthYear ?? a.identity.birthYear,

      debutYear: debutYear ?? a.identity.debutYear,
      careerYears: careerYears ?? a.identity.careerYears,

      links: {
        ...(a.identity.links ?? {}),
        ...extractLinks(data.relations),
        musicbrainz: `https://musicbrainz.org/artist/${mbid}`,
      },
    }

    count++
    console.log(
      `✅ MB enriched: ${a.identity.name} (${mbid}) debut=${a.identity.debutYear ?? '-'} career=${a.identity.careerYears ?? '-'}`
    )
  }

  fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`🎉 완료! MusicBrainz 업데이트 ${count}명`)
  console.log(`📄 ${artistsPath}`)
})()
