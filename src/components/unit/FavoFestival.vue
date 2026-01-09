<script setup lang="ts">
import { computed } from 'vue'
import { festivalFavorites, loadFavorites } from '@/utils/favorites'
import festivals from '@/data/festivals.json'
import whiteFavoTicket from '@/assets/img/whitefavoticket.svg'
import favoBlackTicket from '@/assets/img/favoblackticket.svg'
import favoWhiteBarcode from '@/assets/img/favowhitebarcode.svg'
import { useI18n } from '@/i18n'

type FestivalItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  city: string
  contry: string
}

const festivalData = festivals as Record<string, FestivalItem[]>
loadFavorites()
const { t } = useI18n()

const favoriteFestivals = computed(() => {
  const allFestivals = Object.values(festivalData).flat()
  return allFestivals.filter((fest) => festivalFavorites.value.includes(fest.id))
})
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
        <div class="text-lg font-black">FESTIVAL</div>
      </div>

      <div v-if="favoriteFestivals.length" class="space-y-4">
        <router-link
          v-for="(fest, index) in favoriteFestivals"
          :key="fest.id"
          :to="{ name: 'festivaldetail', params: { id: fest.id } }"
          class="group flex overflow-hidden rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.08)] border border-black/5"
        >
          <div class="w-28 h-28 shrink-0 bg-black/10 overflow-hidden">
            <img
              v-if="fest.image"
              :src="fest.image"
              :alt="fest.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xs font-semibold uppercase">
              {{ fest.title?.[0] || '?' }}
            </div>
          </div>
          <div
            class="relative flex-1 px-4 py-3 text-white"
            :class="index % 2 === 0 ? 'bg-pulseblue' : 'bg-neonpink'"
          >
            <div class="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-80">
              <span>Your Pick</span>
              <img :src="whiteFavoTicket" alt="" class="h-3 opacity-90" />
            </div>
            <div class="text-sm font-bold mt-1">{{ fest.title }}</div>
            <div class="text-[10px] opacity-85 mt-1">
              {{ fest.start }} ~ {{ fest.end }}
            </div>
            <div class="text-xs font-bold mt-2">{{ fest.city }}</div>
            <div class="text-xs opacity-80">{{ fest.contry }}</div>
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-white/60"
            >
              Detail
              <span class="material-symbols-rounded text-[12px]">arrow_right_alt</span>
            </button>
            <img
              :src="index % 2 === 0 ? favoWhiteBarcode : favoBlackTicket"
              alt=""
              class="absolute right-3 top-1/2 -translate-y-1/2 h-10 opacity-90"
            />
          </div>
        </router-link>
      </div>
      <div v-else class="text-xs text-gray-500">
        {{ t('favorites.noFavoriteFestivals') }}
      </div>
    </div>
  </div>
</template>
