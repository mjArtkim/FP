<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import festivals from '@/data/festivals.json'
import artists from '@/data/artists.json'
import { isFestivalFavorite, loadFavorites, toggleFestivalFavorite } from '@/utils/favorites'
import { useI18n } from '@/i18n'

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
  venue?: string
  address?: string
  mapQuery?: string
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

const router = useRouter()
const { t } = useI18n()

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

const mapQuery = computed(() => {
  if (!festival.value) return ''
  if (festival.value.mapQuery) return festival.value.mapQuery
  if (festival.value.address && festival.value.venue) {
    return `${festival.value.venue} ${festival.value.address}`
  }
  if (festival.value.address) return festival.value.address
  if (festival.value.venue) return `${festival.value.venue} ${festival.value.city}`
  return `${festival.value.city} ${festival.value.contry}`
})

const mapEmbedSrc = computed(() => {
  if (!mapQuery.value) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(mapQuery.value)}&output=embed`
})

const lineupEntries = computed(() => {
  if (!festival.value) return []
  const names = festival.value.lineup.split(',').map((name) => name.trim()).filter(Boolean)
  const slugs = festival.value.artistSlugs || []
  return names
    .map((name, idx) => ({
      name,
      slug: slugs[idx],
      image: slugs[idx] ? artistImageMap.value[slugs[idx]] : undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const showAllLineup = ref(false)
const visibleLineupEntries = computed(() =>
  showAllLineup.value ? lineupEntries.value : lineupEntries.value.slice(0, 6)
)
const hasMoreLineup = computed(() => lineupEntries.value.length > 6)

loadFavorites()

watch(festivalId, () => {
  showAllLineup.value = false
})
 
const shareFeedback = ref('')
const shareFeedbackType = ref<'success' | 'error' | ''>('')
let feedbackTimer: number | undefined

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const resolved = router.resolve({ name: 'festivaldetail', params: { id: festivalId.value } })
  return new URL(resolved.href, window.location.origin).toString()
})

const onToggleFavorite = () => {
  if (!festival.value) return
  toggleFestivalFavorite(festival.value.id)
}

const onShareLink = async () => {
  if (!shareUrl.value) return

  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: festival.value?.title, url: shareUrl.value })
      shareFeedback.value = t('festivalDetail.shareSuccess')
      shareFeedbackType.value = 'success'
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
      shareFeedback.value = t('festivalDetail.shareCopied')
      shareFeedbackType.value = 'success'
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      shareFeedback.value = t('festivalDetail.shareCopied')
      shareFeedbackType.value = 'success'
    }
  } catch (error) {
    console.error(error)
    shareFeedback.value = t('festivalDetail.shareFailed')
    shareFeedbackType.value = 'error'
  } finally {
    feedbackTimer = window.setTimeout(() => {
      shareFeedback.value = ''
      shareFeedbackType.value = ''
    }, 2400)
  }
}

onBeforeUnmount(() => {
  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer)
  }
})

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
  <div class="px-5 pb-8 pc:px-14 pc:py-10 h-screen">
    <div v-if="festival" class="max-w-5xl mx-auto space-y-8">
      <div class="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <img
          :src="festival.image"
          :alt="festival.title"
          class="w-full h-[450px] object-cover pc:h-[360px]"
        />
      </div>

      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <h1 class="text-2xl font-black pc:text-3xl">{{ festival.title }}</h1>
          <div class="pt-3 text-sm black pc:text-base">{{ dateRange }}</div>
          <div class="py-3">
            <div class="text-sm font-semibold black pc:text-base">{{ t('festivalDetail.location') }}</div>
            <div class="text-base text-gray-700 pc:text-lg">{{ locationText }}</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-[50%] inline-flex justify-center items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] text-sm pc:hover:bg-neonpink pc:hover:text-white transition-colors [text-shadow:1px_1px_2px_var(--shadow-weak)]"
              @click="onToggleFavorite"
              :class="isBookmarked ? 'bg-neonpink text-white' : 'border-neonpink text-neonpink'"
            >
              <div class="material-symbols-rounded text-xl">
                {{ isBookmarked ? 'bookmark' : 'bookmark_border' }}
              </div>
              <div>{{ isBookmarked ? t('common.bookmarked') : t('common.bookmark') }}</div>
            </button>
            <div class="relative w-[50%]">
              <button
                type="button"
                class="w-full inline-flex justify-center items-center gap-2 px-3 py-1 rounded-md border border-[var(--stroke)] text-pulseblue border-pulseblue text-sm pc:hover:bg-pulseblue pc:hover:text-white transition-colors  [text-shadow:1px_1px_2px_var(--shadow-weak)]"
                @click="onShareLink"
              >
                <div class="material-symbols-rounded text-xl">share</div>
                <div>{{ t('festivalDetail.share') }}</div>
              </button>
            <div
              v-if="shareFeedback"
              class="absolute text-xs -bottom-[20px] left-[5px]"
              :class="shareFeedbackType === 'error' ? 'text-red-500' : 'text-pulseblue'"
            >
              {{ shareFeedback }}
            </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-[var(--bg)] space-y-3">
          <div class="text-sm font-bold text-gray-700">{{ t('festivalDetail.linkSection') }}</div>
          <div class="flex gap-3 flex-col text-center">
            <a
              v-if="festival.ticket"
              :href="festival.ticket"
              target="_blank"
              rel="noopener"
              class="h-[30px] flex items-center justify-center gap-5 rounded-md bg-neonpink text-white text-xs shadow-[0_4px_12px_rgba(0,0,0,0.12)] font-gugi pc:text-sm pc:hover:bg-white pc:hover:border pc:hover:text-neonpink pc:hover:border-neonpink"
            >
              <div class="material-symbols-rounded">confirmation_number</div>
              <div>{{ t('festivalDetail.getTicket') }}</div>
            </a>
            <a
              v-if="festival.infolink"
              :href="festival.infolink"
              target="_blank"
              rel="noopener"
              class="h-[30px] flex items-center justify-center gap-5 rounded-md border bg-[#482317] text-white text-xs pc:text-sm pc:hover:border-[#482317] pc:hover:bg-white pc:hover:text-[#482317] transition-colors font-gugi"
            >
              <div class="material-symbols-rounded">link</div>
              <div>{{ t('festivalDetail.linkPage') }}</div>
            </a>
            <div v-if="!festival.ticket && !festival.infolink" class="text-sm text-gray-500">
              {{ t('festivalDetail.noLink') }}
            </div>
          </div>
        </div>

        <div class="grid gap-6 pc:grid-cols-2">
          <div class="space-y-3 relative mb-[30px]">
            <div class="text-sm font-bold text-gray-700">{{ t('festivalDetail.lineup') }}</div>
            <div class="grid grid-cols-2 gap-3">
              <template v-for="item in visibleLineupEntries" :key="item.name">
                <router-link
                  v-if="item.slug"
                  :to="{ name: 'artistdetail', params: { slug: item.slug } }"
                  class=" rounded-md text-sm text-[var(--text)] pc:hover:bg-neonpink pc:hover:text-white transition-colors flex items-center gap-2"
                >
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="w-8 h-8 rounded-md object-cover shadow-[1px_1px_4px_var(--shadow-weak)]"
                  />
                  <div v-else class="w-7 h-7 rounded-md bg-black/10 flex items-center justify-center text-xs font-semibold uppercase">
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
            <button
              v-if="hasMoreLineup"
              type="button"
              class="absolute flex items-center right-0 text-xs font-semibold text-gray-400 pc:hover:text-neonpink transition-colors"
              @click="showAllLineup = !showAllLineup"
            >
              <div>{{ showAllLineup ? t('festivalDetail.showLess') : t('festivalDetail.showMore') }}</div>
              <span class="material-symbols-rounded">{{ showAllLineup ? t('arrow_drop_up') : t('arrow_drop_down') }}</span>
            </button>
          </div>

          <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3">
            <div class="text-sm font-semibold text-gray-700">{{ t('festivalDetail.map') }}</div>
            <div v-if="mapEmbedSrc" class="space-y-2">
              <div class="text-sm text-gray-500">{{ mapQuery }}</div>
              <div class="w-full h-64 rounded-lg overflow-hidden bg-black/5">
                <iframe
                  :src="mapEmbedSrc"
                  class="w-full h-full"
                  style="border: 0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  :title="t('festivalDetail.mapTitle')"
                ></iframe>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              {{ t('festivalDetail.mapNoInfo') }}
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-[var(--bg)] shadow-[0_0_6px_var(--shadow-weak)] space-y-3 mb-[100px]">
          <div class="text-sm font-semibold text-gray-700">
            {{ t('festivalDetail.sameLocation') }}
          </div>
          <div v-if="relatedByLocation.length" class="grid grid-cols-1 pc:grid-cols-2 gap-3">
            <router-link
              v-for="item in relatedByLocation"
              :key="item.id"
              :to="{ name: 'festivaldetail', params: { id: item.id } }"
              class="flex gap-3 p-3 rounded-lg bg-black/5 pc:hover:bg-neonpink/10 transition-colors"
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
          <div v-else class="text-sm text-gray-500">
            {{ t('festivalDetail.noSameLocation') }}
          </div>
        </div>
        
      </div>
    </div>

    <div v-else class="max-w-3xl mx-auto text-center text-gray-500 py-20">
      {{ t('festivalDetail.notFound') }}
    </div>
  </div>
</template>
