<script setup lang="ts">
import { computed } from 'vue'
import {
  favorites,
  festivalFavorites,
  loadFavorites,
  removeFavorite,
  removeFestivalFavorite,
} from '@/utils/favorites'
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

const handleRemove = (slug: string) => {
  removeFavorite(slug)
}

const handleRemoveFestival = (id: number) => {
  removeFestivalFavorite(id)
}
</script>
<template>
  <div class="px-5 py-8 pc:px-14 pc:py-10">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="space-y-4">
        <div class="text-2xl font-black pc:text-3xl">{{ t('favorites.favoriteArtists') }}</div>
        <div v-if="favoriteArtists.length" class="grid grid-cols-1 pc:grid-cols-2 gap-4">
          <router-link
            v-for="artist in favoriteArtists"
            :key="artist.slug"
            :to="{ name: 'artistdetail', params: { slug: artist.slug } }"
            class="group flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] pc:hover:bg-neonpink/10 transition-colors"
          >
            <img
              v-if="artist.spotify?.image"
              :src="artist.spotify.image"
              :alt="artist.identity.name"
              class="w-14 h-14 rounded-full object-cover"
            />
            <div v-else class="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center text-sm font-semibold uppercase">
              {{ artist.identity.name?.[0] || '?' }}
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold">{{ artist.identity.name }}</div>
            </div>
            <button
              type="button"
              class="material-symbols-rounded text-xl text-gray-500 pc:hover:text-neonpink"
              @click.stop.prevent="handleRemove(artist.slug)"
            >
              delete
            </button>
          </router-link>
        </div>
        <div v-else class="text-gray-500">{{ t('favorites.noFavoriteArtists') }}</div>
      </div>

      <div class="space-y-4">
        <div class="text-2xl font-black pc:text-3xl">{{ t('favorites.favoriteFestivals') }}</div>
        <div v-if="favoriteFestivals.length" class="grid grid-cols-1 pc:grid-cols-2 gap-4">
          <router-link
            v-for="fest in favoriteFestivals"
            :key="fest.id"
            :to="{ name: 'festivaldetail', params: { id: fest.id } }"
            class="flex gap-3 p-3 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] pc:hover:bg-neonpink/10 transition-colors"
          >
            <img
              v-if="fest.image"
              :src="fest.image"
              :alt="fest.title"
              class="w-20 h-20 object-cover rounded-md"
            />
            <div v-else class="w-20 h-20 rounded-md bg-black/10 flex items-center justify-center text-sm font-semibold uppercase">
              {{ fest.title?.[0] || '?' }}
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold">{{ fest.title }}</div>
              <div class="text-xs text-gray-500">{{ fest.city }} / {{ fest.contry }}</div>
              <div class="text-xs text-gray-500">{{ fest.start }} ~ {{ fest.end }}</div>
            </div>
            <button
              type="button"
              class="material-symbols-rounded text-xl text-gray-500 pc:hover:text-neonpink"
              @click.stop.prevent="handleRemoveFestival(fest.id)"
            >
              delete
            </button>
          </router-link>
        </div>
        <div v-else class="text-gray-500">{{ t('favorites.noFavoriteFestivals') }}</div>
      </div>
    </div>
  </div>
</template>
