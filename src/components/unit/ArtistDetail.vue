<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import artists from '@/data/artists.json'
import festivals from '@/data/festivals.json'
import { favorites, loadFavorites, toggleFavorite } from '@/utils/favorites'
import { getGenreToneClass } from '@/utils/genreTone'
import { useI18n } from '@/i18n'

type Artist = {
  slug: string
  identity: {
    name: string
    mbid?: string
    type?: string
    country?: string
    aliases?: string[]
    labels?: Array<{
      name: string
      mbid?: string
      relationType?: string
    }>
    birthYear?: number
    debutYear?: number
    careerYears?: number
    links?: {
      musicbrainz?: string
      instagram?: string
      youtube?: string
      soundcloud?: string
      applemusic?: string
      spotify?: string
      homepage?: string
    }
  }
  spotify?: {
    spotifyId?: string
    image?: string
    genres?: string[]
    albums?: Array<{
      id: string
      name: string
      albumType: string
      releaseDate?: string
      totalTracks?: number
      image?: string
      url?: string
    }>
    topTracks?: Array<{
      id: string
      name: string
      url?: string
      durationMs?: number
      popularity?: number
      previewUrl?: string | null
      album?: {
        id?: string
        name?: string
        releaseDate?: string
        image?: string
      }
    }>
  }
}

type FestivalItem = {
  id: number
  title: string
  start: string
  end: string
  city: string
  contry: string
  image: string
  artistSlugs: string[]
}

const route = useRoute()
const router = useRouter()
const props = defineProps<{
  slug?: string
}>()

const { t } = useI18n()

const slug = computed(() => String(props.slug ?? route.params.slug ?? ''))

const artistList = artists as Artist[]
const artist = computed(() => artistList.find((item) => item.slug === slug.value))
const isBookmarked = computed(() => favorites.value.includes(slug.value))

const displayAliases = computed(() => artist.value?.identity.aliases || [])
const displayGenres = computed(() => artist.value?.spotify?.genres || [])
function releaseDateKey(value?: string) {
  if (!value) return -1
  const parts = String(value).split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  if (!Number.isFinite(year)) return -1
  return year * 10000 + month * 100 + day
}

const displayAlbums = computed(() => {
  const albums = artist.value?.spotify?.albums || []
  return [...albums].sort((a, b) => releaseDateKey(b.releaseDate) - releaseDateKey(a.releaseDate))
})
const displayTracks = computed(() => artist.value?.spotify?.topTracks || [])
const displayLabels = computed(() => artist.value?.identity.labels || [])
const displayLabelText = computed(() => displayLabels.value.map((label) => label.name).join(', '))
const showAllAlbums = ref(false)
const showAllTracks = ref(false)
const showAllGenres = ref(false)
const showAllAliases = ref(false)
const homepageLink = computed(() => artist.value?.identity.links?.homepage)
const instagramLink = computed(() => artist.value?.identity.links?.instagram)
const youtubeLink = computed(() => artist.value?.identity.links?.youtube)
const applemusicLink = computed(() => artist.value?.identity.links?.applemusic)
const soundcloudLink = computed(() => artist.value?.identity.links?.soundcloud)
const spotifyLink = computed(() => {
  const spotifyId = artist.value?.spotify?.spotifyId
  if (spotifyId) return `https://open.spotify.com/artist/${spotifyId}`
  return artist.value?.identity.links?.spotify
})

function formatDuration(durationMs?: number) {
  if (!durationMs) return ''
  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const genreToneClass = (genre: string) => getGenreToneClass(genre)

const activeGenre = ref<string | null>(null)
const genreArtistsMap = computed<Record<string, Artist[]>>(() => {
  const map: Record<string, Artist[]> = {}
  artistList.forEach((item) => {
    (item.spotify?.genres || []).forEach((genre) => {
      const key = genre.trim()
      if (!key) return
      if (!map[key]) map[key] = []
      map[key].push(item)
    })
  })
  return map
})

const genreMatches = computed(() => {
  if (!activeGenre.value) return []
  const list = genreArtistsMap.value[activeGenre.value] || []
  const seen = new Set<string>()
  return list
    .filter((item) => {
      if (seen.has(item.slug)) return false
      seen.add(item.slug)
      return true
    })
    .sort((a, b) => {
      const aName = a.identity?.name ?? a.slug
      const bName = b.identity?.name ?? b.slug
      return aName.localeCompare(bName)
    })
})

const openGenreModal = (genre: string) => {
  activeGenre.value = genre
}

const closeGenreModal = () => {
  activeGenre.value = null
}

const allFestivalData = festivals as Record<string, FestivalItem[]>
const allFestivals = computed<FestivalItem[]>(() => Object.values(allFestivalData).flat())
const latestFestival = computed(() => {
  if (!artist.value) return null
  const matches = allFestivals.value.filter((fest) => fest.artistSlugs.includes(artist.value!.slug))
  if (!matches.length) return null
  // sort by end date desc, then start date desc
  return matches.sort((a, b) => b.end.localeCompare(a.end) || b.start.localeCompare(a.start))[0]
})

loadFavorites()

const onToggleFavorite = () => {
  if (!slug.value) return
  toggleFavorite(slug.value)
}

const shareFeedback = ref('')
const shareFeedbackType = ref<'success' | 'error' | ''>('')
let feedbackTimer: number | undefined

const shareUrl = computed(() => {
  if (typeof window === 'undefined' || !slug.value) return ''
  const resolved = router.resolve({ name: 'artistdetail', params: { slug: slug.value } })
  return new URL(resolved.href, window.location.origin).toString()
})

const onShareLink = async () => {
  if (!shareUrl.value) return

  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: artist.value?.identity.name, url: shareUrl.value })
      shareFeedback.value = t('artistDetail.shareSuccess')
      shareFeedbackType.value = 'success'
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
      shareFeedback.value = t('artistDetail.shareCopied')
      shareFeedbackType.value = 'success'
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      shareFeedback.value = t('artistDetail.shareCopied')
      shareFeedbackType.value = 'success'
    }
  } catch (error) {
    console.error(error)
    shareFeedback.value = t('artistDetail.shareFailed')
    shareFeedbackType.value = 'error'
  } finally {
    feedbackTimer = window.setTimeout(() => {
      shareFeedback.value = ''
      shareFeedbackType.value = ''
    }, 2400)
  }
}

onBeforeUnmount(() => {
  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
  }
})
</script>

<template>
  <div class="px-5 pb-5` pc:px-14 pc:py-10 pc:h-screen">
    <div v-if="artist" class="max-w-4xl mx-auto space-y-6 pc:grid pc:mx-0 pc:grid-cols-3 pc:w-full pc:max-w-full pc:gap-6 pc:space-y-0">
      <div class="space-y-3">
        <div class="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <img
            v-if="artist.spotify?.image"
            :src="artist.spotify.image"
            :alt="artist.identity.name"
            class="w-full h-[450px] object-cover pc:h-[500px] pc:w-[400px]"
          />
        </div>
        <div class="space-y-3">
          <h1 class="text-2xl font-black pc:text-3xl">{{ artist.identity.name }}</h1>
          <div class="text-gray-700 flex text-base">
            <div v-if="artist.identity.country">{{ t('artistDetail.country', { value: artist.identity.country }) }}</div>
            <div v-if="artist.identity.birthYear" class="ml-2">{{ t('artistDetail.birth', { value: artist.identity.birthYear }) }}</div>
            <div v-if="artist.identity.type" class="ml-2">{{ t('artistDetail.type', { value: artist.identity.type }) }}</div>
          </div>
          <div class="py-2">
            <div class="text-sm font-bold">{{ t('artistDetail.careerover') }}</div>
            <div class="flex items-center text-gray-700 text-sm">
              <div v-if="artist.identity.debutYear">
                {{ t('artistDetail.debut', { value: artist.identity.debutYear }) }}
              </div>
              <div v-if="artist.identity.careerYears" class="ml-2">
                {{ t('artistDetail.career', { years: artist.identity.careerYears }) }}
              </div>
            </div>
          </div>
          <div class="py-2">
            <div class="font-semibold">{{ t('artistDetail.labels') }}</div>
            <div v-if="displayLabels.length">{{ displayLabelText }}</div>
            <div v-else class="text-sm text-gray-500">{{ t('artistDetail.noLabels') }}</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-[50%] inline-flex justify-center items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] shadow-[1px_1px_2px_var(--shadow-weak)] text-sm pc:hover:bg-[#EA6466] pc:hover:text-white transition-colors [text-shadow:1px_1px_2px_var(--shadow-weak)]"
              @click="onToggleFavorite"
              :class="isBookmarked ? 'bg-[#EA6466] text-white' : 'border-[#EA6466] text-[#EA6466]'"
            >
              <div class="material-symbols-rounded text-xl">
                {{ isBookmarked ? 'favorite' : 'favorite_border' }}
              </div>
              <span>{{ isBookmarked ? t('common.bookmarked') : t('common.bookmark') }}</span>
            </button>
            <div class="relative w-[50%]">
              <button
                type="button"
                class="w-full inline-flex justify-center items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] shadow-[1px_1px_2px_var(--shadow-weak)] text-pulseblue border-pulseblue text-sm pc:hover:bg-pulseblue pc:hover:text-white transition-colors  [text-shadow:1px_1px_2px_var(--shadow-weak)]"
                @click="onShareLink"
              >
                <span class="material-symbols-rounded text-base">share</span>
                <span>{{ t('artistDetail.share') }}</span>
              </button>
              <div
                v-if="shareFeedback"
                class="absolute text-xs -bottom-[20px] left-[5px]"
                :class="shareFeedbackType === 'error' ? 'text-red-500' : 'text-pulseblue'"
              >
                {{ shareFeedback }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="space-y-3 p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] ">
          <div class="text-sm font-semibold">{{ t('artistDetail.genres') }}</div>
          <div class="flex flex-wrap gap-3 ">
            <div
              v-for="genre in (showAllGenres ? displayGenres : displayGenres.slice(0, 5))"
              :key="genre"
              class="px-3 py-1 rounded-md border text-sm cursor-pointer transition-colors [text-shadow:1px_1px_3px_var(--shadow-weak)] shadow-[1px_1px_3px_var(--shadow-weak)]"
              :class="genreToneClass(genre)"
              @click="openGenreModal(genre)"
            >
              {{ genre }}
          </div>
            <div v-if="!displayGenres.length" class="text-sm text-gray-500">
              {{ t('artistDetail.noGenres') }}
            </div>
          </div>
          <div v-if="displayGenres.length > 5" class="w-full">
            <button
              type="button"
              class="w-full text-sm text-gray-400 flex items-center justify-end pc:hover:text-gray-700"
              @click="showAllGenres = !showAllGenres"
            >
              <div>{{ showAllGenres ? t('artistDetail.showLess') : t('artistDetail.showMore') }}</div>
              <span class="material-symbols-rounded">{{ showAllGenres ? t('arrow_drop_up') : t('arrow_drop_down') }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-3 p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] ">
          <div class="text-sm font-bold text-gray-700">{{ t('artistDetail.latestFestival') }}</div>
          <template v-if="latestFestival">
            <router-link
              :to="{ name: 'festivaldetail', params: { id: latestFestival.id } }"
              class="flex items-center gap-3 p-3 rounded-lg bg-pulsegray/15 pc:hover:bg-neonpink/10 transition-colors"
            >
              <img
                v-if="latestFestival.image"
                :src="latestFestival.image"
                :alt="latestFestival.title"
                class="w-14 h-14 object-cover rounded-md"
              />
              <div class="flex flex-col">
                <div class="text-sm font-semibold">{{ latestFestival.title }}</div>
                <div class="text-xs text-gray-500">{{ latestFestival.city }} / {{ latestFestival.contry }}</div>
                <div class="text-xs text-gray-500">{{ latestFestival.start }} ~ {{ latestFestival.end }}</div>
              </div>
            </router-link>
          </template>
          <div v-else class="text-sm text-gray-500">
            {{ t('artistDetail.noFestival') }}
          </div>
        </div>

        <div class="space-y-3 p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] ">
          <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.links') }}</div>
          <div class="flex flex-wrap gap-3 justify-between">
            <a
              v-if="homepageLink"
              :href="homepageLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--stroke)] border-black text-base text-[var(--text)] pc:hover:bg-[var(--surface)] transition-colors shadow-[1px_1px_3px_var(--shadow-weak)]"
            >
              <span class="material-symbols-rounded">home</span>
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-base text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <span class="material-symbols-rounded">home</span>
            </div>

            <a
              v-if="instagramLink"
              :href="instagramLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#E1306C] text-sm text-[#E1306C] shadow-[1px_1px_3px_var(--shadow-weak)] pc:hover:bg-[#E1306C] pc:hover:text-white transition-colors"
            >
              <img src="@/assets/img/insta.svg" alt="Instagram" class="w-4 h-4" />
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-sm text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <img
                src="@/assets/img/insta.svg"
                alt="Instagram"
                class="w-4 h-4 grayscale opacity-50"
              />
            </div>

            <a
              v-if="youtubeLink"
              :href="youtubeLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#FF0000] text-sm shadow-[1px_1px_3px_var(--shadow-weak)] text-[#FF0000] pc:hover:bg-[#FF0000] pc:hover:text-white transition-colors"
            >
              <img src="@/assets/img/youtube.svg" alt="YouTube" class="w-4 h-4" />
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-sm text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <img
                src="@/assets/img/youtube.svg"
                alt="YouTube"
                class="w-4 h-4 grayscale opacity-50"
              />
            </div>

            <a
              v-if="applemusicLink"
              :href="applemusicLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#FA2D48] text-sm shadow-[1px_1px_3px_var(--shadow-weak)] text-[#FA2D48] pc:hover:bg-[#FA2D48] pc:hover:text-white transition-colors"
            >
              <img src="@/assets/img/apple.svg" alt="Apple Music" class="w-4 h-4" />
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-sm text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <img
                src="@/assets/img/apple.svg"
                alt="Apple Music"
                class="w-4 h-4 grayscale opacity-50"
              />
            </div>

            <a
              v-if="spotifyLink"
              :href="spotifyLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsspotify shadow-[1px_1px_3px_var(--shadow-weak)] text-sm pc:hover:bg-pulsspotify pc:hover:text-white transition-colors"
            >
              <img src="@/assets/img/spotify.svg" alt="Spotify" class="w-4 h-4" />
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-sm text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <img
                src="@/assets/img/spotify.svg"
                alt="Spotify"
                class="w-4 h-4 grayscale opacity-50"
              />
            </div>

            <a
              v-if="soundcloudLink"
              :href="soundcloudLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#FBC845] text-sm shadow-[1px_1px_3px_var(--shadow-weak)] text-[#FF5500] pc:hover:bg-[#FF5500] pc:hover:text-white transition-colors"
            >
              <img src="@/assets/img/soundcloud.svg" alt="SoundCloud" class="w-4 h-4" />
            </a>
            <div
              v-else
              :title="t('artistDetail.noLinks')"
              class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-pulsegray text-sm text-pulsegray shadow-[1px_1px_3px_var(--shadow-weak)] cursor-not-allowed"
            >
              <img
                src="@/assets/img/soundcloud.svg"
                alt="SoundCloud"
                class="w-4 h-4 grayscale opacity-50"
              />
            </div>
          </div>
        </div>
        <div class="space-y-3 p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] ">
          <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.aliases') }}</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="alias in (showAllAliases ? displayAliases : displayAliases.slice(0, 3))"
              :key="alias"
              class="px-3 py-1 rounded-md bg-gray-200 text-sm text-gray-700"
            >
              {{ alias }}
            </span>
            <div v-if="!displayAliases.length" class="text-sm text-gray-500">
              {{ t('artistDetail.noAliases') }}
            </div>
          </div>
          <div v-if="displayAliases.length > 3" class="text-right">
            <button
              type="button"
              class="text-sm text-gray-400 inline-flex items-center gap-1 pc:hover:text-gray-700"
              @click="showAllAliases = !showAllAliases"
            >
              <div>{{ showAllAliases ? t('artistDetail.showLess') : t('artistDetail.showMore') }}</div>
              <span class="material-symbols-rounded">
                {{ showAllAliases ? t('arrow_drop_up') : t('arrow_drop_down') }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-4">
          <div class="text-sm font-semibold text-gray-700">
            {{ t('artistDetail.albumsSingles') }}
          </div>
          <div v-if="displayAlbums.length">
            <div class="grid grid-cols-2 gap-4 pc:hidden">
              <template
                v-for="album in (showAllAlbums ? displayAlbums : displayAlbums.slice(0, 4))"
                :key="album.id"
              >
                <a
                  v-if="album.url"
                  :href="album.url"
                  target="_blank"
                  rel="noopener"
                  class="relative w-50% flex flex-col justify-end gap-1 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors bg-cover bg-center aspect-square"
                  :style="album.image ? { backgroundImage: `url(${album.image})` } : undefined"
                >
                  <div class="bg-black/40 p-2 rounded-b-md">
                    <div class="text-sm font-semibold line-clamp-2 text-white">{{ album.name }}</div>
                    <div class="text-xs text-bgdash">
                      {{
                        t('artistDetail.albumMeta', {
                          type: album.albumType,
                          date: album.releaseDate || '—',
                          count: album.totalTracks || 0,
                        })
                      }}
                    </div>
                  </div>
                </a>
                <div
                  v-else
                  class="flex gap-3 p-3 rounded-lg bg-black/5"
                >
                  <div class="w-16 h-16 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    {{ album.albumType }}
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="text-sm font-semibold line-clamp-2">{{ album.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{
                        t('artistDetail.albumMeta', {
                          type: album.albumType,
                          date: album.releaseDate || '—',
                          count: album.totalTracks || 0,
                        })
                      }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="hidden pc:grid pc:grid-cols-2 pc:gap-4 pc:max-h-[400px] pc:overflow-y-auto pc:pr-1">
              <template v-for="album in displayAlbums" :key="album.id">
                <a
                  v-if="album.url"
                  :href="album.url"
                  target="_blank"
                  rel="noopener"
                  class="relative w-50% flex flex-col justify-end gap-1 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors bg-cover bg-center aspect-square"
                  :style="album.image ? { backgroundImage: `url(${album.image})` } : undefined"
                >
                  <div class="bg-black/40 p-2 rounded-b-md">
                    <div class="text-sm font-semibold line-clamp-2 text-white">{{ album.name }}</div>
                    <div class="text-xs text-bgdash">
                      {{
                        t('artistDetail.albumMeta', {
                          type: album.albumType,
                          date: album.releaseDate || '—',
                          count: album.totalTracks || 0,
                        })
                      }}
                    </div>
                  </div>
                </a>
                <div
                  v-else
                  class="flex gap-3 p-3 rounded-lg bg-black/5"
                >
                  <div class="w-16 h-16 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    {{ album.albumType }}
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="text-sm font-semibold line-clamp-2">{{ album.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{
                        t('artistDetail.albumMeta', {
                          type: album.albumType,
                          date: album.releaseDate || '—',
                          count: album.totalTracks || 0,
                        })
                      }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="displayAlbums.length > 4" class="text-right pc:hidden">
              <button
                type="button"
                class="text-sm text-gray-400 inline-flex items-center gap-1 pc:hover:text-gray-700"
                @click="showAllAlbums = !showAllAlbums"
              >
                {{ showAllAlbums ? t('artistDetail.showLess') : t('artistDetail.showMore') }}
                <span class="material-symbols-rounded">
                  {{ showAllAlbums ? t('arrow_drop_up') : t('arrow_drop_down') }}
                </span>
              </button>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            {{ t('artistDetail.noAlbums') }}
          </div>
        </div>

        <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
          <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.topTracks') }}</div>
          <div v-if="displayTracks.length">
            <div class="space-y-2 pc:hidden">
              <template
                v-for="track in (showAllTracks ? displayTracks : displayTracks.slice(0, 4))"
                :key="track.id"
              >
                <a
                  v-if="track.url"
                  :href="track.url"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors"
                >
                  <img
                    v-if="track.album?.image"
                    :src="track.album.image"
                    :alt="track.album?.name || track.name"
                    class="w-12 h-12 object-cover rounded-md"
                  />
                  <div v-else class="w-12 h-12 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    ♪
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold line-clamp-2">{{ track.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ track.album?.name || t('artistDetail.unknownAlbum') }} •
                      {{ track.album?.releaseDate || '—' }}
                    </div>
                  </div>
                  <div class="ml-auto text-xs text-gray-500">
                    {{ formatDuration(track.durationMs) }}
                  </div>
                </a>
                <div
                  v-else
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/5"
                >
                  <div class="w-12 h-12 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    ♪
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold line-clamp-2">{{ track.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ track.album?.name || t('artistDetail.unknownAlbum') }} •
                      {{ track.album?.releaseDate || '—' }}
                    </div>
                  </div>
                  <div class="ml-auto text-xs text-gray-500">
                    {{
                      track.durationMs
                        ? t('artistDetail.durationSeconds', { seconds: Math.round(track.durationMs / 1000) })
                        : ''
                    }}
                  </div>
                </div>
              </template>
            </div>
            <div class="hidden pc:flex pc:flex-col pc:gap-2 pc:max-h-[400px] pc:overflow-y-auto pc:pr-1">
              <template v-for="track in displayTracks" :key="track.id">
                <a
                  v-if="track.url"
                  :href="track.url"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors"
                >
                  <img
                    v-if="track.album?.image"
                    :src="track.album.image"
                    :alt="track.album?.name || track.name"
                    class="w-12 h-12 object-cover rounded-md"
                  />
                  <div v-else class="w-12 h-12 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    ♪
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold line-clamp-2">{{ track.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ track.album?.name || t('artistDetail.unknownAlbum') }} •
                      {{ track.album?.releaseDate || '—' }}
                    </div>
                  </div>
                  <div class="ml-auto text-xs text-gray-500">
                    {{ formatDuration(track.durationMs) }}
                  </div>
                </a>
                <div
                  v-else
                  class="flex items-center gap-3 p-3 rounded-lg bg-black/5"
                >
                  <div class="w-12 h-12 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
                    ♪
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold line-clamp-2">{{ track.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ track.album?.name || t('artistDetail.unknownAlbum') }} •
                      {{ track.album?.releaseDate || '—' }}
                    </div>
                  </div>
                  <div class="ml-auto text-xs text-gray-500">
                    {{
                      track.durationMs
                        ? t('artistDetail.durationSeconds', { seconds: Math.round(track.durationMs / 1000) })
                        : ''
                    }}
                  </div>
                </div>
              </template>
            </div>
            <div v-if="displayTracks.length > 4" class="text-right pc:hidden">
              <button
                type="button"
                class="text-sm text-gray-400 inline-flex items-center gap-1 pc:hover:text-gray-700"
                @click="showAllTracks = !showAllTracks"
              >
                <div>{{ showAllTracks ? t('artistDetail.showLess') : t('artistDetail.showMore') }}</div>
                <span class="material-symbols-rounded">
                  {{ showAllTracks ? t('arrow_drop_up') : t('arrow_drop_down') }}
                </span>
              </button>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            {{ t('artistDetail.noTracks') }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto text-center text-gray-500 py-20">
      {{ t('artistDetail.notFound') }}
    </div>
  </div>

  <teleport to="body">
    <div
      v-if="activeGenre"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4"
    >
      <div class="w-full max-w-3xl bg-[var(--bg)] text-[var(--text)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--stroke)]">
          <div class="text-lg font-semibold">
            {{ t('artistDetail.genreTitle', { name: activeGenre }) }}
          </div>
          <button class="material-symbols-rounded text-2xl" @click="closeGenreModal">close</button>
        </div>
        <div class="max-h-[70vh] overflow-y-auto p-5">
          <div class="grid grid-cols-1 pc:grid-cols-2 gap-4">
            <router-link
              v-for="artistItem in genreMatches"
              :key="artistItem.slug"
              :to="{ name: 'artistdetail', params: { slug: artistItem.slug } }"
              class="flex items-center gap-3 p-3 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors"
              @click="closeGenreModal"
            >
              <img
                v-if="artistItem.spotify?.image"
                :src="artistItem.spotify.image"
                :alt="artistItem.identity.name"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div v-else class="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-sm font-semibold uppercase">
                {{ artistItem.identity.name?.[0] || '?' }}
              </div>
              <div class="flex flex-col">
                <div class="text-sm font-semibold">{{ artistItem.identity.name }}</div>
                <div class="text-xs text-gray-500 truncate">{{ (artistItem.spotify?.genres || []).slice(0, 2).join(', ') }}</div>
              </div>
            </router-link>
          </div>
          <div v-if="!genreMatches.length" class="text-sm text-gray-500 text-center py-6">
            {{ t('artistDetail.noGenreMatches') }}
          </div>
        </div>
        <div class="px-5 py-3 border-t border-[var(--stroke)] text-right">
          <button class="px-4 py-2 rounded-md bg-neonpink text-white text-sm" @click="closeGenreModal">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
