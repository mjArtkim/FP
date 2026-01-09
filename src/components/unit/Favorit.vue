<script setup lang="ts">
import { computed, ref } from 'vue'
import MonthNavigator from '@/components/part/MonthNavigator.vue'
import CalendarGrid from '@/components/part/CalendarGrid.vue'
import { favorites, festivalFavorites, loadFavorites } from '@/utils/favorites'
import artists from '@/data/artists.json'
import festivals from '@/data/festivals.json'
import { useI18n } from '@/i18n'

type Artist = {
  slug: string
  identity: {
    name: string
  }
  spotify?: {
    image?: string
  }
}

type FestivalItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  city: string
  contry: string
  artistSlugs?: string[]
}

const artistList = artists as Artist[]
const festivalData = festivals as Record<string, FestivalItem[]>
loadFavorites()
const { t } = useI18n()

const favoriteArtists = computed(() =>
  artistList.filter((artist) => favorites.value.includes(artist.slug))
)

const favoriteFestivals = computed(() => {
  const allFestivals = Object.values(festivalData).flat()
  return allFestivals.filter((fest) => festivalFavorites.value.includes(fest.id))
})

const favoriteArtistFestivals = computed(() => {
  const allFestivals = Object.values(festivalData).flat()
  if (!favorites.value.length) return []
  return allFestivals.filter((fest) =>
    (fest.artistSlugs || []).some((slug) => favorites.value.includes(slug))
  )
})

const previewArtists = computed(() => favoriteArtists.value.slice(0, 4))
const previewFestivals = computed(() => favoriteFestivals.value.slice(0, 4))

const now = new Date()
const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const currentMonth = ref(todayMonthKey)

const getMonthRange = (monthKey: string) => {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null
  const lastDate = new Date(year, month, 0).getDate()
  const paddedMonth = String(month).padStart(2, '0')
  return {
    start: `${year}-${paddedMonth}-01`,
    end: `${year}-${paddedMonth}-${String(lastDate).padStart(2, '0')}`,
  }
}

const currentCalendarEvents = computed(() => {
  const range = getMonthRange(currentMonth.value)
  if (!range) return []
  return favoriteArtistFestivals.value.filter(
    (event) => event.end >= range.start && event.start <= range.end
  )
})
</script>
<template>
  <div class="px-5 py-8 pc:px-14 pc:py-10">
    <div class="max-w-5xl mx-auto space-y-10">
      <div class="space-y-4">
        <div class="text-xs tracking-[0.25em] font-black text-[var(--muted)]">MY FAVORITE</div>
        <div class="grid gap-4">
          <router-link
            to="/favorite/artists"
            class="rounded-2xl bg-[var(--surface)] shadow-[0_0_6px_var(--shadow-weak)] p-4 text-left pc:hover:bg-neonpink/5 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="flex -space-x-2">
                <div
                  v-for="artist in previewArtists"
                  :key="artist.slug"
                  class="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--surface)] bg-black/10 flex items-center justify-center text-xs font-semibold uppercase"
                >
                  <img
                    v-if="artist.spotify?.image"
                    :src="artist.spotify.image"
                    :alt="artist.identity.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ artist.identity.name?.[0] || '?' }}</span>
                </div>
              </div>
              <div class="text-sm font-semibold">
                You've liked {{ favoriteArtists.length }} artists
              </div>
              <div class="ml-auto material-symbols-rounded text-lg text-[var(--muted)]">
                arrow_right_alt
              </div>
            </div>
            <div v-if="!favoriteArtists.length" class="text-xs text-gray-500 mt-2">
              {{ t('favorites.noFavoriteArtists') }}
            </div>
          </router-link>

          <router-link
            to="/favorite/festivals"
            class="rounded-2xl bg-[var(--surface)] shadow-[0_0_6px_var(--shadow-weak)] p-4 text-left pc:hover:bg-neonpink/5 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="grid grid-cols-2 gap-1">
                <div
                  v-for="fest in previewFestivals"
                  :key="fest.id"
                  class="w-10 h-10 rounded-md overflow-hidden bg-black/10 flex items-center justify-center text-[10px] font-semibold uppercase"
                >
                  <img
                    v-if="fest.image"
                    :src="fest.image"
                    :alt="fest.title"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ fest.title?.[0] || '?' }}</span>
                </div>
              </div>
              <div class="text-sm font-semibold">
                You've bookmarked {{ favoriteFestivals.length }} festivals
              </div>
              <div class="ml-auto material-symbols-rounded text-lg text-[var(--muted)]">
                arrow_right_alt
              </div>
            </div>
            <div v-if="!favoriteFestivals.length" class="text-xs text-gray-500 mt-2">
              {{ t('favorites.noFavoriteFestivals') }}
            </div>
          </router-link>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold">Your Festival Date</div>
          <MonthNavigator v-model="currentMonth" />
        </div>
        <CalendarGrid :month="currentMonth" :events="currentCalendarEvents" />
      </div>
    </div>
  </div>
</template>
