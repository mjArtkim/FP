import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const festivalsPath = path.resolve(__dirname, '../src/data/festivals.json')

const USER_AGENT = 'FestivalPulse/1.0 (image-fetcher)'
const REQUEST_TIMEOUT_MS = 12000
const MIN_IMAGE_BYTES = 10_000
const FORCE = process.env.FORCE === '1'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isLikelyPlaceholder(image) {
  if (!image) return true
  const value = String(image).toLowerCase()
  return value.includes('testimg') || value.endsWith('/img/testimg.png')
}

function normalizeUrl(url) {
  if (!url) return ''
  let value = String(url).trim()
  if (!value) return ''
  if (!/^https?:\/\//i.test(value)) {
    value = 'https://' + value.replace(/^\/+/, '')
  }
  return value
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

function extractOgImage(html) {
  if (!html) return ''

  const candidates = []

  const metaRegex = /<meta\s+[^>]*>/gi
  const metas = html.match(metaRegex) || []
  for (const tag of metas) {
    const contentMatch = tag.match(/content\s*=\s*["']([^"']+)["']/i)
    if (!contentMatch) continue
    const content = contentMatch[1]
    const propMatch =
      tag.match(/property\s*=\s*["']([^"']+)["']/i) ||
      tag.match(/name\s*=\s*["']([^"']+)["']/i)
    if (!propMatch) continue
    const prop = propMatch[1].toLowerCase()
    if (prop === 'og:image' || prop === 'og:image:url' || prop === 'twitter:image') {
      candidates.push(content)
    }
  }

  return candidates.find(Boolean) || ''
}

async function resolveImageFromUrl(url) {
  const normalized = normalizeUrl(url)
  if (!normalized) return ''

  let html = ''
  try {
    const res = await fetchWithTimeout(normalized, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return ''
    html = await res.text()
  } catch {
    return ''
  }

  let imageUrl = extractOgImage(html)
  if (!imageUrl) return ''

  // relative -> absolute
  if (!/^https?:\/\//i.test(imageUrl)) {
    try {
      imageUrl = new URL(imageUrl, normalized).toString()
    } catch {
      return ''
    }
  }

  return imageUrl
}

async function validateImage(url) {
  if (!url) return false
  try {
    const res = await fetchWithTimeout(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) return false
    const type = res.headers.get('content-type') || ''
    const size = Number(res.headers.get('content-length') || 0)
    if (!type.startsWith('image/')) return false
    if (size && size < MIN_IMAGE_BYTES) return false
    return true
  } catch {
    return false
  }
}

;(async () => {
  const festivals = JSON.parse(fs.readFileSync(festivalsPath, 'utf-8'))

  let updated = 0
  let tried = 0

  for (const monthKey of Object.keys(festivals)) {
    festivals[monthKey] = festivals[monthKey].map((fest) => ({ ...fest }))

    for (const fest of festivals[monthKey]) {
      const currentImage = fest.image
      if (!FORCE && currentImage && !isLikelyPlaceholder(currentImage)) continue

      const infoLink = fest.infolink ?? fest.infoLink ?? fest.infoURL ?? fest.infoUrl
      const ticketLink = fest.ticket ?? fest.ticketLink ?? fest.ticketURL ?? fest.ticketUrl
      const sources = [infoLink, ticketLink].filter(Boolean)
      if (!sources.length) continue

      let found = ''
      for (const source of sources) {
        tried++
        const candidate = await resolveImageFromUrl(source)
        if (!candidate) continue
        const ok = await validateImage(candidate)
        if (!ok) continue
        found = candidate
        break
      }

      if (found) {
        fest.image = found
        updated++
        console.log(`🖼️ ${fest.title}: ${found}`)
      } else {
        console.log(`⚠️ image not found: ${fest.title}`)
      }

      await sleep(300)
    }
  }

  fs.writeFileSync(festivalsPath, JSON.stringify(festivals, null, 2), 'utf-8')
  console.log(`🎉 완료! 이미지 업데이트 ${updated}개 (시도 ${tried}회)`)
  console.log(`📄 ${festivalsPath}`)
})()
