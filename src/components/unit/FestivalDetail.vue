<script setup lang="ts">
import { computed } from 'vue'
import festivals from '@/data/festivals.json'
import artists from '@/data/artists.json'
import { isFestivalFavorite, loadFavorites, toggleFestivalFavorite } from '@/utils/favorites'

type FestivalItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  city: string
  contry: string
  lineup: string
  artistSlugs: string[]
  ticket?: string
  infolink?: string
}

type ArtistItem = {
  slug: string
  spotify?: {
    image?: string
  }
}

const props = defineProps<{
  id: string | number
}>()

const allFestivalData = festivals as Record<string, FestivalItem[]>
const artistList = artists as ArtistItem[]

const artistImageMap = computed<Record<string, string | undefined>>(() => {
  const map: Record<string, string | undefined> = {}
  artistList.forEach((artist) => {
    map[artist.slug] = artist.spotify?.image
  })
  return map
})

const allFestivals = computed(() => Object.values(allFestivalData).flat())
const festivalId = computed(() => Number(props.id))
const festival = computed<FestivalItem | undefined>(() =>
  allFestivals.value.find((item) => item.id === festivalId.value)
)
const isBookmarked = computed(() => !!festival.value && isFestivalFavorite(festival.value.id))

const dateRange = computed(() => {
  if (!festival.value) return ''
  return `${festival.value.start} ~ ${festival.value.end}`
})

const locationText = computed(() => {
  if (!festival.value) return ''
  return `${festival.value.city} / ${festival.value.contry}`
})

const lineupEntries = computed(() => {
  if (!festival.value) return []
  const names = festival.value.lineup.split(',').map((name) => name.trim()).filter(Boolean)
  const slugs = festival.value.artistSlugs || []
  return names.map((name, idx) => ({
    name,
    slug: slugs[idx],
    image: slugs[idx] ? artistImageMap.value[slugs[idx]] : undefined,
  }))
})

loadFavorites()

const onToggleFavorite = () => {
  if (!festival.value) return
  toggleFestivalFavorite(festival.value.id)
}

const relatedByLocation = computed(() => {
  if (!festival.value) return []
  const key = `${festival.value.city}|||${festival.value.contry}`
  return allFestivals.value
    .filter((item) => item.id !== festival.value!.id)
    .filter((item) => `${item.city}|||${item.contry}` === key)
    .slice(0, 6)
})
</script>

<template>
  <div class="px-5 py-8 pc:px-14 pc:py-10 h-screen">
    <div v-if="festival" class="max-w-5xl mx-auto space-y-8">
      <div class="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <img
          :src="festival.image"
          :alt="festival.title"
          class="w-full h-[240px] object-cover pc:h-[360px]"
        />
      </div>

      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <div class="text-sm text-gray-500 pc:text-base">{{ dateRange }}</div>
          <h1 class="text-2xl font-black pc:text-3xl">{{ festival.title }}</h1>
          <div class="text-base text-gray-700 pc:text-lg">{{ locationText }}</div>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] text-sm hover:bg-neonpink hover:text-white transition-colors"
            @click="onToggleFavorite"
          >
            <span class="material-symbols-rounded text-base">
              {{ isBookmarked ? 'favorite' : 'favorite_border' }}
            </span>
            <span>{{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}</span>
          </button>
        </div>

        <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
          <div class="text-sm font-semibold text-gray-700">Same Location Festivals</div>
          <div v-if="relatedByLocation.length" class="grid grid-cols-1 pc:grid-cols-2 gap-3">
            <router-link
              v-for="item in relatedByLocation"
              :key="item.id"
              :to="{ name: 'festivaldetail', params: { id: item.id } }"
              class="flex gap-3 p-3 rounded-lg bg-black/5 hover:bg-neonpink/10 transition-colors"
            >
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="w-16 h-16 object-cover rounded-md"
              />
              <div v-else class="w-16 h-16 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold uppercase">
                {{ item.title?.[0] || '?' }}
              </div>
              <div class="flex flex-col">
                <div class="text-sm font-semibold line-clamp-2">{{ item.title }}</div>
                <div class="text-xs text-gray-500">{{ item.city }} / {{ item.contry }}</div>
                <div class="text-xs text-gray-500">{{ item.start }} ~ {{ item.end }}</div>
              </div>
            </router-link>
          </div>
          <div v-else class="text-sm text-gray-500">같은 지역의 다른 페스티벌이 없습니다.</div>
        </div>

        <div class="grid gap-6 pc:grid-cols-2">
          <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
            <div class="text-sm font-semibold text-gray-700">Line-up</div>
            <div class="flex flex-wrap gap-2">
              <template v-for="item in lineupEntries" :key="item.name">
                <router-link
                  v-if="item.slug"
                  :to="{ name: 'artistdetail', params: { slug: item.slug } }"
                  class="px-3 py-1 rounded-full bg-black/5 text-sm text-[var(--text)] hover:bg-neonpink hover:text-white transition-colors flex items-center gap-2"
                >
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="w-7 h-7 rounded-full object-cover"
                  />
                  <div v-else class="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs font-semibold uppercase">
                    {{ item.name?.[0] || '?' }}
                  </div>
                  {{ item.name }}
                </router-link>
                <span
                  v-else
                  class="px-3 py-1 rounded-full bg-black/5 text-sm text-[var(--text)] flex items-center gap-2"
                >
                  <div class="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs font-semibold uppercase">
                    {{ item.name?.[0] || '?' }}
                  </div>
                  {{ item.name }}
                </span>
              </template>
            </div>
          </div>

          <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
            <div class="text-sm font-semibold text-gray-700">Artists</div>
            <div class="text-sm text-gray-500">라인업 이름을 눌러 아티스트 정보를 확인하세요.</div>
          </div>
        </div>

        <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
          <div class="text-sm font-semibold text-gray-700">Links</div>
          <div class="flex flex-wrap gap-3">
            <a
              v-if="festival.ticket"
              :href="festival.ticket"
              target="_blank"
              rel="noopener"
              class="px-4 py-2 rounded-md bg-neonpink text-white text-sm shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              Get Ticket
            </a>
            <a
              v-if="festival.infolink"
              :href="festival.infolink"
              target="_blank"
              rel="noopener"
              class="px-4 py-2 rounded-md border border-pulseblue text-pulseblue text-sm hover:bg-pulseblue hover:text-white transition-colors"
            >
              Info Page
            </a>
            <div v-if="!festival.ticket && !festival.infolink" class="text-sm text-gray-500">
              등록된 링크가 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto text-center text-gray-500 py-20">
      선택한 페스티벌 정보를 찾을 수 없습니다.
    </div>
  </div>
</template>
