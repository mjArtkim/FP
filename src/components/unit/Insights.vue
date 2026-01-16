<script setup lang="ts">
import { computed, ref } from 'vue'
import festivals from '@/data/festivals.json'
import artists from '@/data/artists.json'
import { useI18n } from '@/i18n'

type FestivalItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  contry?: string
  city?: string
  lineup?: string
  artistSlugs?: string[]
  ticket?: string
  infolink?: string
  continent?: string
}

type ArtistItem = {
  slug: string
  identity?: {
    name?: string
  }
  spotify?: {
    image?: string
  }
}

type ChartSegment = {
  name: string
  count: number
  percent: number
  color: string
}

const { t, currentLocale } = useI18n()

const festivalData = festivals as Record<string, FestivalItem[]>
const artistData = artists as ArtistItem[]
const allFestivals = Object.values(festivalData).flat()

const numberLocale = computed(() => (currentLocale.value === 'ko' ? 'ko-KR' : 'en-US'))
const totalDisplay = computed(() =>
  new Intl.NumberFormat(numberLocale.value).format(allFestivals.length)
)

const countryPalette = ['#3b82f6', '#ef4444', '#1f2937']
const artistPalette = [
  'linear-gradient(135deg, #111827, #4b5563)',
  'linear-gradient(135deg, #0f172a, #334155)',
  'linear-gradient(135deg, #1f2937, #9ca3af)',
  'linear-gradient(135deg, #111827, #f97316)',
]
const neonPalette = [
  'linear-gradient(135deg, #f43f5e, #22d3ee)',
  'linear-gradient(135deg, #7c3aed, #facc15)',
  'linear-gradient(135deg, #22c55e, #38bdf8)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
]
const chartPalette = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444']

const normalizeText = (value = '') => value.trim().toLowerCase()
const toTitle = (value = '') =>
  value
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ') || t('common.unknown')

const getInitials = (name: string) => {
  const words = name
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(' ')
    .filter(Boolean)
  if (!words.length) return '??'
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase()
  const first = words[0] ?? ''
  const second = words[1] ?? ''
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

const slugToName = (slug: string) =>
  slug
    .trim()
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')

const splitLineup = (lineup?: string) =>
  lineup
    ? lineup
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
    : []

const failedImages = ref<Record<string, boolean>>({})

const markImageFailed = (name: string) => {
  failedImages.value = { ...failedImages.value, [name]: true }
}

const topCountries = computed(() => {
  const counts = new Map<string, number>()
  allFestivals.forEach((festival) => {
    const name = festival.contry?.trim() || t('common.unknown')
    counts.set(name, (counts.get(name) || 0) + 1)
  })
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count], index) => ({
      name,
      count,
      color: countryPalette[index % countryPalette.length],
    }))
})

const topArtists = computed(() => {
  const counts = new Map<string, { name: string; count: number; slug?: string }>()
  allFestivals.forEach((festival) => {
    if (festival.artistSlugs?.length) {
      festival.artistSlugs.forEach((slug) => {
        const key = normalizeText(slug)
        if (!key) return
        const entry = counts.get(key)
        if (entry) {
          entry.count += 1
        } else {
          counts.set(key, { name: slugToName(slug), count: 1, slug })
        }
      })
      return
    }
    splitLineup(festival.lineup).forEach((name) => {
      const key = normalizeText(name)
      if (!key) return
      const entry = counts.get(key)
      if (entry) {
        entry.count += 1
      } else {
        counts.set(key, { name, count: 1 })
      }
    })
  })
  const artistMap = new Map(artistData.map((artist) => [artist.slug, artist]))
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((artist, index) => ({
      name: artist.slug ? artistMap.get(artist.slug)?.identity?.name || artist.name : artist.name,
      count: artist.count,
      initials: getInitials(artist.name),
      gradient: artistPalette[index % artistPalette.length],
      fallbackGradient: neonPalette[index % neonPalette.length],
      image: artist.slug ? artistMap.get(artist.slug)?.spotify?.image : undefined,
    }))
})

const continentSummary = computed(() => {
  const counts = new Map<string, number>()
  allFestivals.forEach((festival) => {
    const name = festival.continent?.trim() || t('common.unknown')
    counts.set(name, (counts.get(name) || 0) + 1)
  })
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const total = sorted.reduce((sum, [, count]) => sum + count, 0)
  const segments: ChartSegment[] = sorted.slice(0, 5).map(([name, count], index) => ({
    name: toTitle(name),
    count,
    percent: total ? (count / total) * 100 : 0,
    color: chartPalette[index % chartPalette.length] ?? '#94a3b8',
  }))
  const used = segments.reduce((sum, item) => sum + item.count, 0)
  if (total > used) {
    segments.push({
      name: t('common.other'),
      count: total - used,
      percent: total ? ((total - used) / total) * 100 : 0,
      color: '#cbd5f5',
    })
  }
  const topList = sorted.slice(0, 3).map(([name, count], index) => ({
    name: toTitle(name),
    count,
    percent: total ? (count / total) * 100 : 0,
    color: chartPalette[index % chartPalette.length] ?? '#94a3b8',
  }))
  return {
    segments,
    topList,
  }
})

const chartGradient = computed(() => {
  const segments = continentSummary.value.segments
  if (!segments.length) return 'conic-gradient(#e5e7eb 0 100%)'
  let cursor = 0
  const parts = segments.map((segment) => {
    const start = cursor
    const end = cursor + segment.percent
    cursor = end
    return `${segment.color} ${start}% ${end}%`
  })
  return `conic-gradient(${parts.join(', ')})`
})
</script>

<template>
  <section class="px-5 pb-10 pt-4 font-pretend text-[var(--text)] pc:px-10 pc:py-8">
    <div class="max-w-[520px] mx-auto space-y-10">
      <div class="space-y-3">
        <div class="w-10 h-10 rounded-2xl bg-[var(--surface)] shadow-[0_6px_16px_rgba(15,23,42,0.08)] flex items-center justify-center">
          <span class="material-symbols-rounded text-[22px]">equalizer</span>
        </div>
        <div class="text-xs tracking-wide text-[var(--muted)]">
          {{ t('insights.yearTotal') }}
        </div>
        <div class="text-5xl font-extrabold tracking-tight text-[var(--text)]">
          {{ totalDisplay }}
        </div>
      </div>

      <div class="space-y-4">
        <div class="text-xs tracking-wide text-[var(--muted)]">
          {{ t('insights.topCountries') }}
        </div>
        <ol class="space-y-4 list-decimal list-inside text-[var(--text)]">
          <li
            v-for="country in topCountries"
            :key="country.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold">{{ country.name }}</div>
            </div>
            <div class="text-sm font-semibold text-[var(--muted)]">
              <span class="inline-flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: country.color }"></span>
                {{ t('insights.festivalCount', { count: country.count }) }}
              </span>
            </div>
          </li>
        </ol>
      </div>

      <div class="space-y-4">
        <div class="text-xs tracking-wide text-[var(--muted)]">
          {{ t('insights.topArtists') }}
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="artist in topArtists"
            :key="artist.name"
            class="flex items-center gap-3"
          >
            <div
              class="w-11 h-11 rounded-xl overflow-hidden shadow-[0_8px_16px_rgba(15,23,42,0.15)] flex items-center justify-center"
              :style="{ background: artist.gradient }"
            >
              <img
                v-if="artist.image && !failedImages[artist.name]"
                :src="artist.image"
                :alt="artist.name"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="markImageFailed(artist.name)"
              />
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-[10px] font-semibold text-white"
                :style="{ background: artist.fallbackGradient }"
              >
                <span class="text-xs">{{ artist.initials }}</span>
                <span class="leading-tight">{{ artist.name }}</span>
              </div>
            </div>
            <div
              class="text-sm font-semibold"
              :class="(!artist.image || failedImages[artist.name]) ? 'text-transparent bg-clip-text' : ''"
              :style="(!artist.image || failedImages[artist.name]) ? { backgroundImage: artist.fallbackGradient } : {}"
            >
              {{ artist.name }}
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="text-xs tracking-wide text-[var(--muted)]">
          {{ t('insights.continentTrends') }}
        </div>
        <div class="grid grid-cols-1 gap-6 items-center pc:grid-cols-[160px_1fr]">
          <div class="relative w-40 h-40 mx-auto">
            <div
              class="absolute inset-0 rounded-full"
              :style="{ background: chartGradient }"
            ></div>
            <div class="absolute inset-6 rounded-full bg-[var(--surface)] shadow-[inset_0_0_12px_rgba(15,23,42,0.08)]"></div>
          </div>
          <div class="space-y-3">
            <div class="text-xs font-semibold text-[var(--muted)] tracking-wide">{{ t('insights.topContinents') }}</div>
            <div class="space-y-2">
              <div
                v-for="continent in continentSummary.topList"
                :key="continent.name"
                class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold"
                :style="{ borderColor: continent.color, color: continent.color }"
              >
                <span>{{ continent.name }}</span>
                <span class="text-xs text-[var(--muted)]">{{ continent.percent.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
