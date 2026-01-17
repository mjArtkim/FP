<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const isDarkTheme = ref(false)
let themeObserver: MutationObserver | null = null
const ticketStripEl = ref<HTMLElement[] | HTMLElement | null>(null)
const ticketRepeatCount = ref(1)
let ticketObserver: ResizeObserver | null = null

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
  if (ticketObserver) ticketObserver.disconnect()
})

const favoriteFestivals = computed(() => {
  const allFestivals = Object.values(festivalData).flat()
  return allFestivals.filter((fest) => festivalFavorites.value.includes(fest.id))
})

const barcodeSrc = computed(() => (isDarkTheme.value ? favoBlackTicket : favoWhiteBarcode))

const syncTicketCount = () => {
  const el = Array.isArray(ticketStripEl.value)
    ? ticketStripEl.value[0]
    : ticketStripEl.value
  const width = el?.clientWidth ?? 0
  const itemWidth = 11
  ticketRepeatCount.value = Math.max(1, Math.floor(width / itemWidth))
}

onMounted(async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  syncTicketCount()
  if ('ResizeObserver' in window) {
    ticketObserver = new ResizeObserver(syncTicketCount)
    const el = Array.isArray(ticketStripEl.value)
      ? ticketStripEl.value[0]
      : ticketStripEl.value
    if (el) ticketObserver.observe(el)
  }
})
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
        <div class="text-lg font-black">FESTIVAL</div>
      </div>

      <div v-if="favoriteFestivals.length" class="space-y-4">
        <router-link
          v-for="(fest, index) in favoriteFestivals"
          :key="fest.id"
          :to="{ name: 'festivaldetail', params: { id: fest.id } }"
          class="group h-44 flex overflow-hidden rounded-md shadow-[0_0_8px_rgba(0,0,0,0.08)] border border-black/5"
          :class="index % 2 === 0 ? 'bg-pulseblue' : 'bg-neonpink'"
        >
          <div class="festival-pulse font-bold text-white text-[8px] tracking-tight mb-[8px] mx-2 self-end">FESTIVAL PULSE</div>
          <div class="w-28 h-full shrink-0 bg-black/10 overflow-hidden">
            <img
              v-if="fest.image"
              :src="fest.image"
              :alt="fest.title"
              class="h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xs font-semibold uppercase">
              {{ fest.title?.[0] || '?' }}
            </div>
          </div>
          <div class="relative flex flex-1 text-white pl-3">
            <div class="min-w-0 flex-1 py-3 pr-2 flex flex-col justify-between">
              <div class=" text-[10px] uppercase opacity-80">Your Pick</div>
              <div class="text-sm font-bold mt-1">{{ fest.title }}</div>
            <div
              ref="ticketStripEl"
              class="mt-1 flex w-full items-center gap-[2px]"
              aria-hidden="true"
            >
              <img
                v-for="n in ticketRepeatCount"
                :key="n"
                :src="whiteFavoTicket"
                alt=""
                class="h-[9px] w-[9px] shrink-0 opacity-90"
              />
            </div>
              <div>
                <div class="text-[10px] opacity-85 mt-1">
                  {{ fest.start }} ~ {{ fest.end }}
                </div>
                <div class="flex justify-between pr-2">
                  <div>
                    <div class="text-xs font-bold mt-2">{{ fest.city }}</div>
                    <div class="text-xs opacity-80">{{ fest.contry }}</div>
                  </div>
                  <button
                    type="button"
                    class="mt-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-white"
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>
            <div class="relative w-10 border-l border-dotted border-white/60">
              <img
                :src="barcodeSrc"
                alt=""
                class="absolute left-[35%] top-1/2 -translate-y-1/2 opacity-90 object-cover"
              />
            </div>
          </div>
        </router-link>
      </div>
      <div v-else class="text-xs text-gray-500">
        {{ t('favorites.noFavoriteFestivals') }}
      </div>
    </div>
  </div>
</template>
<style>
  .festival-pulse {
    writing-mode: vertical-lr;
    text-orientation: mixed;
  }
</style>
