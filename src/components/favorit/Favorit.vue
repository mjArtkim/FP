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
  return allFestivals.filter((fest) => festivalFavorites.value.includes(fest.id))
})

const previewArtists = computed(() => favoriteArtists.value.slice(0, 4))
const previewFestivals = computed(() => favoriteFestivals.value.slice(0, 4))

const now = new Date()
const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const currentMonth = ref(todayMonthKey)
const viewMode = ref<'list' | 'calendar'>('calendar')

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

const sortedMonthEvents = computed(() => {
  return [...currentCalendarEvents.value].sort((a, b) =>
    a.start.localeCompare(b.start)
  )
})
</script>
<template>
  <div class="relative min-h-[100dvh] px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pc:px-14 pc:py-10">
    <div class="max-w-5xl mx-auto space-y-10 pc:grid pc:mx-0 pc:grid-cols-[1fr_1.8fr] pc:max-w-full pc:gap-10">
      <div class="space-y-4 pc:space-y-10 pc:pt-10">
        <div class="text-xs tracking-[0.25em] font-black text-[var(--muted)]">{{ t('favorites.myFavoriteTitle') }}</div>
        <div class="grid gap-4">
          <router-link
            to="/favorite/artists"
            class="rounded-2xl bg-[var(--surface)] shadow-[0_0_6px_var(--shadow-weak)] p-4 text-left pc:hover:bg-neonpink/5 transition-colors pc:min-h-[200px] pc:flex pc:justify-center"
          >
            <div class="flex items-center gap-4 pc:flex-col pc:justify-center">
              <div class="flex -space-x-2">
                <div
                  v-for="artist in previewArtists"
                  :key="artist.slug"
                  class="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--surface)] bg-black/10 flex items-center justify-center text-xs font-semibold uppercase pc:w-16 pc:h-16"
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
              <div class="flex items-center">
                <div class="text-sm font-semibold pc:text-base">
                  {{ t('favorites.artistCount', { count: favoriteArtists.length }) }}
                </div>
                <div class="ml-auto material-symbols-rounded text-lg text-[var(--muted)] pc:text-xl pc:ml-4">
                  arrow_right_alt
                </div>
              </div>
            </div>
            <div v-if="!favoriteArtists.length" class="text-xs text-gray-500 mt-2">
              {{ t('favorites.noFavoriteArtists') }}
            </div>
          </router-link>

          <router-link
            to="/favorite/festivals"
            class="rounded-2xl bg-[var(--surface)] shadow-[0_0_6px_var(--shadow-weak)] p-4 text-left pc:hover:bg-neonpink/5 transition-colors pc:min-h-[200px] pc:flex pc:justify-center"
          >
            <div class="flex items-center gap-4 pc:flex-col pc:justify-center">
              <div class="grid grid-cols-2 gap-1 pc:flex">
                <div
                  v-for="fest in previewFestivals"
                  :key="fest.id"
                  class="w-10 h-10 rounded-md overflow-hidden bg-black/10 flex items-center justify-center text-[10px] font-semibold uppercase pc:w-16 pc:h-16"
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
              <div class="flex items-center">
                <div class="text-sm font-semibold pc:text-base">
                  {{ t('favorites.festivalCount', { count: favoriteFestivals.length }) }}
                </div>
                <div class="ml-auto material-symbols-rounded text-lg text-[var(--muted)] pc:text-xl pc:ml-4">
                  arrow_right_alt
                </div>
              </div>
            </div>
            <div v-if="!favoriteFestivals.length" class="text-xs text-gray-500 mt-2">
              {{ t('favorites.noFavoriteFestivals') }}
            </div>
          </router-link>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold pb-5">{{ t('favorites.myFestivalDate') }}</div>
          <div class="flex items-center gap-3 justify-between">
            <MonthNavigator v-model="currentMonth" />
            <div class="flex justify-end h-[32px] shadow-[0_0_3px_var(--shadow-weak)] p-[2px] rounded-[5px]">
              <div id="favoriteViewToggle" class="relative w-[64px] h-full">
                <input
                  type="checkbox"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                  :checked="viewMode === 'list'"
                  @change="viewMode = ($event.target as HTMLInputElement).checked ? 'list' : 'calendar'"
                />
                <div class="absolute inset-0 z-10 flex justify-between items-center">
                  <div
                    class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                    :class="viewMode === 'calendar' ? 'text-transparent' : 'text-[var(--text)]'"
                  >
                    calendar_month
                  </div>
                  <div
                    class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                    :class="viewMode === 'list' ? 'text-transparent' : 'text-[var(--text)]'"
                  >
                    lists
                  </div>
                </div>
                <div
                  class="absolute top-[0px] left-[0px] w-[32px] h-[28px] rounded-[4px] flex items-center justify-center bg-[#F61979] transition-all duration-300 ease-out z-20"
                  :class="viewMode === 'calendar' ? 'text-white left-[0px]' : 'text-white left-[32px]'"
                >
                  <div class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center">
                    {{ viewMode === 'calendar' ? 'calendar_month' : 'lists' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="viewMode === 'list'" class="grid gap-3">
          <router-link
            v-for="event in sortedMonthEvents"
            :key="event.id"
            :to="{ name: 'festivaldetail', params: { id: event.id } }"
            class="flex gap-3 p-3 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] pc:hover:bg-neonpink/10 transition-colors"
          >
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
              class="w-20 h-20 object-cover rounded-md"
            />
            <div v-else class="w-20 h-20 rounded-md bg-black/10 flex items-center justify-center text-sm font-semibold uppercase">
              {{ event.title?.[0] || '?' }}
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold">{{ event.title }}</div>
              <div class="text-xs text-gray-500">{{ event.city }} / {{ event.contry }}</div>
              <div class="text-xs text-gray-500">{{ event.start }} ~ {{ event.end }}</div>
            </div>
          </router-link>
          <div v-if="!sortedMonthEvents.length" class="text-xs text-gray-500">
            {{ t('favorites.noFavoriteFestivals') }}
          </div>
        </div>
        <CalendarGrid v-else :month="currentMonth" :events="currentCalendarEvents" />
      </div>
    </div>
  </div>
</template>
