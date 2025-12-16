<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import artists from '@/data/artists.json'

type Artist = {
  slug: string
  identity: {
    name: string
    mbid?: string
    type?: string
    country?: string
    aliases?: string[]
    links?: {
      musicbrainz?: string
    }
  }
  spotify?: {
    spotifyId?: string
    image?: string
    genres?: string[]
  }
}

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const artistList = artists as Artist[]
const artist = computed(() => artistList.find((item) => item.slug === slug.value))

const displayAliases = computed(() => artist.value?.identity.aliases || [])
const displayGenres = computed(() => artist.value?.spotify?.genres || [])
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
            <span v-if="artist.identity.country">Country: {{ artist.identity.country }}</span>
            <span v-if="artist.identity.type" class="ml-2">Type: {{ artist.identity.type }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">Genres</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="genre in displayGenres"
            :key="genre"
            class="px-3 py-1 rounded-full bg-black/5 text-sm text-[var(--text)]"
          >
            {{ genre }}
          </span>
          <div v-if="!displayGenres.length" class="text-sm text-gray-500">장르 정보가 없습니다.</div>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">Aliases</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="alias in displayAliases"
            :key="alias"
            class="px-3 py-1 rounded-full bg-neonpink/10 text-sm text-neonpink"
          >
            {{ alias }}
          </span>
          <div v-if="!displayAliases.length" class="text-sm text-gray-500">다른 이름이 없습니다.</div>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
        <div class="text-sm font-semibold text-gray-700">Links</div>
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
            등록된 링크가 없습니다.
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto text-center text-gray-500 py-20">
      선택한 아티스트 정보를 찾을 수 없습니다.
    </div>
  </div>
</template>
