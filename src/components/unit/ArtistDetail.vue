<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import artists from '@/data/artists.json'
import festivals from '@/data/festivals.json'
import { favorites, loadFavorites, toggleFavorite } from '@/utils/favorites'
import { useI18n } from '@/i18n'

type Artist = {
  slug: string
  identity: {
    name: string
    mbid?: string
    type?: string
    country?: string
    aliases?: string[]
    debutYear?: number
    careerYears?: number
    links?: {
      musicbrainz?: string
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
const displayAlbums = computed(() => artist.value?.spotify?.albums || [])
const displayTracks = computed(() => artist.value?.spotify?.topTracks || [])
const showAllAlbums = ref(false)
const showAllTracks = ref(false)
const showAllGenres = ref(false)

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
  return list.filter((item) => {
    if (seen.has(item.slug)) return false
    seen.add(item.slug)
    return true
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
</script>

<template>
  <div class="px-5 py-8 pc:px-14 pc:py-10">
    <div v-if="artist" class="max-w-4xl mx-auto space-y-6">
      <div class="flex gap-4 items-center">
        <img
          v-if="artist.spotify?.image"
          :src="artist.spotify.image"
          :alt="artist.identity.name"
          class="w-28 h-28 object-cover rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
        />
        <div class="space-y-2">
          <h1 class="text-2xl font-black pc:text-3xl">{{ artist.identity.name }}</h1>
          <div class="text-sm text-gray-600">
            <span v-if="artist.identity.country">
              {{ t('artistDetail.country', { value: artist.identity.country }) }}
            </span>
            <span v-if="artist.identity.type" class="ml-2">
              {{ t('artistDetail.type', { value: artist.identity.type }) }}
            </span>
            <span v-if="artist.identity.debutYear" class="ml-2">
              {{ t('artistDetail.debut', { value: artist.identity.debutYear }) }}
            </span>
            <span v-if="artist.identity.careerYears" class="ml-2">
              {{ t('artistDetail.career', { years: artist.identity.careerYears }) }}
            </span>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] text-sm hover:bg-neonpink hover:text-white transition-colors"
            @click="onToggleFavorite"
          >
            <span class="material-symbols-rounded text-base">
              {{ isBookmarked ? 'favorite' : 'favorite_border' }}
            </span>
            <span>{{ isBookmarked ? t('common.bookmarked') : t('common.bookmark') }}</span>
          </button>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.genres') }}</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="genre in (showAllGenres ? displayGenres : displayGenres.slice(0, 4))"
            :key="genre"
            class="px-3 py-1 rounded-full bg-black/5 text-sm text-[var(--text)] cursor-pointer hover:bg-neonpink/10 hover:text-neonpink transition-colors"
            @click="openGenreModal(genre)"
          >
            {{ genre }}
          </span>
          <div v-if="!displayGenres.length" class="text-sm text-gray-500">
            {{ t('artistDetail.noGenres') }}
          </div>
        </div>
        <div v-if="displayGenres.length > 4" class="text-right">
          <button
            type="button"
            class="text-sm text-pulseblue hover:underline"
            @click="showAllGenres = !showAllGenres"
          >
            {{ showAllGenres ? t('artistDetail.showLess') : t('artistDetail.showMore') }}
          </button>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.aliases') }}</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="alias in displayAliases"
            :key="alias"
            class="px-3 py-1 rounded-full bg-neonpink/10 text-sm text-neonpink"
          >
            {{ alias }}
          </span>
          <div v-if="!displayAliases.length" class="text-sm text-gray-500">
            {{ t('artistDetail.noAliases') }}
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-4">
        <div class="text-sm font-semibold text-gray-700">
          {{ t('artistDetail.albumsSingles') }}
        </div>
        <div class="grid grid-cols-2 pc:grid-cols-3 gap-4">
          <template
            v-for="album in (showAllAlbums ? displayAlbums : displayAlbums.slice(0, 4))"
            :key="album.id"
          >
            <a
              v-if="album.url"
              :href="album.url"
              target="_blank"
              rel="noopener"
              class="flex gap-3 p-3 rounded-lg bg-black/5 hover:bg-neonpink/10 transition-colors"
            >
              <img
                v-if="album.image"
                :src="album.image"
                :alt="album.name"
                class="w-16 h-16 object-cover rounded-md"
              />
              <div v-else class="w-16 h-16 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold">
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
        <div v-if="!displayAlbums.length" class="text-sm text-gray-500">
          {{ t('artistDetail.noAlbums') }}
        </div>
        <div v-else-if="displayAlbums.length > 4" class="text-right">
          <button
            type="button"
            class="text-sm text-pulseblue hover:underline"
            @click="showAllAlbums = !showAllAlbums"
          >
            {{ showAllAlbums ? t('artistDetail.showLess') : t('artistDetail.showMore') }}
          </button>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.topTracks') }}</div>
        <div class="space-y-3">
          <template
            v-for="track in (showAllTracks ? displayTracks : displayTracks.slice(0, 4))"
            :key="track.id"
          >
            <a
              v-if="track.url"
              :href="track.url"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-3 p-3 rounded-lg bg-black/5 hover:bg-neonpink/10 transition-colors"
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
                {{
                  track.durationMs
                    ? t('artistDetail.durationSeconds', { seconds: Math.round(track.durationMs / 1000) })
                    : ''
                }}
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
          <div v-if="!displayTracks.length" class="text-sm text-gray-500">
            {{ t('artistDetail.noTracks') }}
          </div>
        </div>
        <div v-if="displayTracks.length > 4" class="text-right">
          <button
            type="button"
            class="text-sm text-pulseblue hover:underline"
            @click="showAllTracks = !showAllTracks"
          >
            {{ showAllTracks ? t('artistDetail.showLess') : t('artistDetail.showMore') }}
          </button>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.links') }}</div>
        <div class="flex flex-wrap gap-3">
          <a
            v-if="artist.spotify?.spotifyId"
            :href="`https://open.spotify.com/artist/${artist.spotify.spotifyId}`"
            target="_blank"
            rel="noopener"
            class="px-4 py-2 rounded-md bg-neonpink text-white text-sm shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            Spotify
          </a>
          <a
            v-if="artist.identity.links?.musicbrainz"
            :href="artist.identity.links.musicbrainz"
            target="_blank"
            rel="noopener"
            class="px-4 py-2 rounded-md border border-pulseblue text-pulseblue text-sm hover:bg-pulseblue hover:text-white transition-colors"
          >
            MusicBrainz
          </a>
          <div v-if="!artist.spotify?.spotifyId && !artist.identity.links?.musicbrainz" class="text-sm text-gray-500">
            {{ t('artistDetail.noLinks') }}
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">{{ t('artistDetail.latestFestival') }}</div>
        <template v-if="latestFestival">
          <router-link
            :to="{ name: 'festivaldetail', params: { id: latestFestival.id } }"
            class="flex items-center gap-3 p-3 rounded-lg bg-black/5 hover:bg-neonpink/10 transition-colors"
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
              class="flex items-center gap-3 p-3 rounded-lg bg-black/5 hover:bg-neonpink/10 transition-colors"
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
