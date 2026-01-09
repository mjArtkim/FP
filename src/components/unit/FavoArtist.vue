<script setup lang="ts">
import { computed } from 'vue'
import { favorites, loadFavorites } from '@/utils/favorites'
import artists from '@/data/artists.json'
import festivals from '@/data/festivals.json'
import whiteTicket from '@/assets/img/whiteticket.svg'
import blackTicket from '@/assets/img/blackticket.svg'
import whiteBarcode from '@/assets/img/whitebarcode.svg'
import blackBarcode from '@/assets/img/blackbarcode.svg'
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
  artistSlugs?: string[]
}

const artistList = artists as Artist[]
const festivalData = festivals as Record<string, FestivalItem[]>
loadFavorites()
const { t } = useI18n()

const favoriteArtists = computed(() =>
  artistList.filter((artist) => favorites.value.includes(artist.slug))
)

const artistEventCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const festival of Object.values(festivalData).flat()) {
    for (const slug of festival.artistSlugs || []) {
      counts[slug] = (counts[slug] || 0) + 1
    }
  }
  return counts
})

const getArtistEventCount = (slug: string) => artistEventCounts.value[slug] || 0
</script>

<template>
  <div class="px-5 py-8 pc:px-14 pc:py-10">
    <div class="max-w-5xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <router-link
          to="/favorite"
          class="material-symbols-rounded text-2xl pc:hover:text-neonpink"
        >
          arrow_back
        </router-link>
        <div class="text-lg font-black">ARTIST</div>
      </div>

      <div v-if="favoriteArtists.length" class="space-y-3">
        <router-link
          v-for="(artist, index) in favoriteArtists"
          :key="artist.slug"
          :to="{ name: 'artistdetail', params: { slug: artist.slug } }"
          class="relative overflow-hidden rounded-xl px-4 py-3 flex items-center gap-4 transition-all duration-300 pc:hover:translate-x-1"
          :class="
            index % 2 === 0
              ? 'bg-neonpink text-white'
              : 'bg-white text-black border border-pulseblue/40'
          "
        >
          <div
            class="absolute left-0 top-0 h-full w-2"
            :class="index % 2 === 0 ? 'bg-white/30' : 'bg-pulseblue'"
          />
          <img
            :src="index % 2 === 0 ? whiteTicket : blackTicket"
            alt=""
            class="w-10 h-10 opacity-90"
          />
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-black/20">
              <img
                v-if="artist.spotify?.image"
                :src="artist.spotify.image"
                :alt="artist.identity.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-xs font-semibold uppercase">
                {{ artist.identity.name?.[0] || '?' }}
              </div>
            </div>
            <div>
              <div class="text-sm font-bold uppercase">{{ artist.identity.name }}</div>
              <div class="text-[10px] opacity-80">{{ getArtistEventCount(artist.slug) }} EVENTS</div>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <img
              :src="index % 2 === 0 ? whiteBarcode : blackBarcode"
              alt=""
              class="h-3 opacity-90"
            />
            <span class="text-[10px] font-semibold">Detail</span>
            <span class="material-symbols-rounded text-sm">arrow_right_alt</span>
          </div>
        </router-link>
      </div>
      <div v-else class="text-xs text-gray-500">
        {{ t('favorites.noFavoriteArtists') }}
      </div>
    </div>
  </div>
</template>
