<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
    country?: string
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
const isDarkTheme = ref(false)
let themeObserver: MutationObserver | null = null

const syncTheme = () => {
  if (typeof document === 'undefined') return
  isDarkTheme.value = document.documentElement.dataset.theme === 'dark'
}

onMounted(() => {
  syncTheme()
  if (typeof document === 'undefined') return
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

onBeforeUnmount(() => {
  if (themeObserver) themeObserver.disconnect()
})

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
const ticketSrc = computed(() => (isDarkTheme.value ? blackTicket : whiteTicket))
const barcodeSrc = computed(() => (isDarkTheme.value ? blackBarcode : whiteBarcode))
</script>

<template>
  <div class="px-5 pb-8 pc:px-14 pc:py-10">
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

      <div v-if="favoriteArtists.length" class="space-y-4">
        <router-link
          v-for="(artist, index) in favoriteArtists"
          :key="artist.slug"
          :to="{ name: 'artistdetail', params: { slug: artist.slug } }"
          class="relative overflow-hidden  grid grid-cols-[5%_75%_25%] gap-4 transition-all duration-300 pc:hover:translate-x-1 h-[60px]"
          :class="
            index % 2 === 0
              ? 'bg-neonpink'
              : 'bg-pulseblue '
          "
        >
          <div class="h-full ml-3 w-4 flex items-center justify-center bg-[var(--bg)]">
            <span
              class="text-[9px] font-bold tracking-[0.1em] rotate-90 text-[var(--subline)]"
            >
              {{ artist.identity.country || '--' }}
            </span>
          </div>
          <div class="relative flex items-center gap-3 text-white">
            <div class="w-9 h-9 rounded-md overflow-hidden bg-black/20 pc:w-11 pc:h-11">
              <img
                v-if="artist.spotify?.image"
                :src="artist.spotify.image"
                :alt="artist.identity.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-xs font-semibold uppercases pc:text-sm">
                {{ artist.identity.name?.[0] || '?' }}
              </div>
            </div>
            <div>
              <div class="text-sm font-bold uppercase pc:text-base">{{ artist.identity.name }}</div>
              <div class="text-[10px] opacity-80 pc:text-xs">{{ getArtistEventCount(artist.slug) }} EVENTS</div>
            <div class="absolute right-36 bottom-0 w-[10%] min-w-[36px]">
              <img
                :src="barcodeSrc"
                alt=""
                class="w-full"
              />
            </div>
            </div>
          </div>
          <div class="relative flex items-center max-w-[90px] pc:justify-end">
            <div class="absolute -left-[90px] pc:-left-10">
              <div class="absolute -bottom-2 -left-9 pc:-left-12 font-black art-line text-transparent">ARTIST</div>
              <img
                :src="ticketSrc"
                alt=""
                class="h-[60px]"
              />
            </div>
            <div class="h-[60px] flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--muted)] px-1">
              <div class="text-[8px] font-semibold pc:text-[10px]">Detail</div>
              <div class="material-symbols-rounded text-sm">arrow_right_alt</div>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else class="text-xs text-gray-500">
        {{ t('favorites.noFavoriteArtists') }}
      </div>
    </div>
  </div>
</template>
<style>
  .art-line {
    -webkit-text-stroke-width:1px;
    -webkit-text-stroke-color: white;
  }

  :root[data-theme="dark"] .art-line {
    -webkit-text-stroke-color: black;
  }
</style>
