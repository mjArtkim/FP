<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GENRE_GROUPS } from '@/utils/genreTone'
import mapSvg from '@/assets/img/map.svg?raw'
import { useI18n } from '@/i18n'
import festivals from '@/data/festivals.json'

type GenreGroup = {
  name: string
  subgenres?: string[]
}

type EventItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  city: string
  contry: string
  lineup: string
}

type ContinentKey =
  | 'asia'
  | 'europe'
  | 'northAmerica'
  | 'southAmerica'
  | 'africa'
  | 'oceania'
  | 'other'

const { t } = useI18n()

const lat = ref(37.5665)
const lng = ref(126.978)
const mapRoot = ref<HTMLElement | null>(null)
const selectedContinents = ref<ContinentKey[]>([])
const locationContinent = ref<ContinentKey | null>(null)
const isLocationDenied = ref(false)

const now = new Date()
const todayKey = now.toISOString().slice(0, 10)
const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const allFestivalData = festivals as Record<string, EventItem[]>
const todayList = computed<EventItem[]>(() => allFestivalData[todayMonthKey] || [])
const todayEvents = computed<EventItem[]>(() => {
  return todayList.value.filter((event) => event.start <= todayKey && todayKey <= event.end)
})

const shortText = (text: string, limit = 18) => {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}

const mapColorToContinent: Record<string, ContinentKey> = {
  '#6e00dd': 'northAmerica',
  '#fda61a': 'southAmerica',
  '#4975ba': 'europe',
  '#fbcb4f': 'africa',
  '#fbce5b': 'africa',
  '#fbc845': 'africa',
  '#ea6466': 'asia',
  '#0fbf00': 'oceania',
  '#707070': 'other',
}

const getContinentByLatLng = (latitude: number, longitude: number): ContinentKey | null => {
  if (latitude >= 7 && latitude <= 84 && longitude >= -170 && longitude <= -50) return 'northAmerica'
  if (latitude >= -60 && latitude <= 13 && longitude >= -82 && longitude <= -30) return 'southAmerica'
  if (latitude >= 35 && latitude <= 72 && longitude >= -25 && longitude <= 45) return 'europe'
  if (latitude >= -35 && latitude <= 37 && longitude >= -18 && longitude <= 52) return 'africa'
  if (latitude >= -10 && latitude <= 55 && longitude >= 45 && longitude <= 180) return 'asia'
  if (latitude >= -50 && latitude <= 0 && longitude >= 110 && longitude <= 180) return 'oceania'
  return null
}

const continentColors = computed<Record<ContinentKey, string[]>>(() => {
  const map = {} as Record<ContinentKey, string[]>
  Object.entries(mapColorToContinent).forEach(([color, continent]) => {
    if (!map[continent]) map[continent] = []
    map[continent].push(color)
  })
  return map
})

const highlightMapColors = (colors: string[] | null) => {
  if (!mapRoot.value) return
  const nodes = mapRoot.value.querySelectorAll('[fill]')
  nodes.forEach((node) => {
    const fill = node.getAttribute('fill')?.toLowerCase()
    if (!colors || !colors.length) {
      ;(node as HTMLElement).style.opacity = '1'
      ;(node as HTMLElement).style.filter = ''
      ;(node as HTMLElement).style.stroke = 'none'
      ;(node as HTMLElement).style.strokeWidth = ''
      return
    }
    const isMatch = !!fill && colors.includes(fill)
    ;(node as HTMLElement).style.opacity = isMatch ? '1' : '0.08'
    ;(node as HTMLElement).style.filter = isMatch
      ? 'drop-shadow(0 0 10px rgba(246,25,121,0.65)) drop-shadow(0 0 18px rgba(246,25,121,0.35))'
      : 'saturate(0.6)'
    ;(node as HTMLElement).style.stroke = isMatch ? '#f61979' : 'none'
    ;(node as HTMLElement).style.strokeWidth = isMatch ? '1.2' : ''
  })
}

const onMapClick = (event: MouseEvent) => {
  const target = event.target as Element | null
  if (!target) return
  const fill = target.getAttribute('fill')
  if (!fill) return
  const color = fill.toLowerCase()
  const continent = mapColorToContinent[color]
  if (!continent) return
  selectContinent(continent)
}

const clearMapSelection = () => {
  selectedContinents.value = []
  highlightMapColors(null)
}

const selectContinent = (continent: ContinentKey) => {
  if (selectedContinents.value.includes(continent)) {
    selectedContinents.value = selectedContinents.value.filter((item) => item !== continent)
  } else {
    selectedContinents.value = [...selectedContinents.value, continent]
  }
  const colors = selectedContinents.value.flatMap(
    (item) => continentColors.value[item] ?? []
  )
  highlightMapColors(colors.length ? colors : null)
}

const selectedContinentLabel = computed(() =>
  selectedContinents.value
    .map((continent) => t(`mapExplorer.continents.${continent}`))
    .join(', ')
)

const continents = [
  { key: 'asia', color: '#ff5a5f' },
  { key: 'europe', color: '#3b82f6' },
  { key: 'northAmerica', color: '#7c3aed' },
  { key: 'africa', color: '#f59e0b' },
  { key: 'southAmerica', color: '#f97316' },
  { key: 'oceania', color: '#22c55e' },
] as const

const genreGroups = ref<GenreGroup[]>(
  GENRE_GROUPS.map((group) => ({
    name: group.label,
    subgenres: group.children.map((child) => child.label),
  }))
)

const openGenre = ref<string | null>(genreGroups.value[0]?.name ?? null)
const isAllOpen = ref(true)
const selectedGenres = ref<string[]>([])

const monthMode = ref<'all' | 'range'>('all')
const dateStart = ref('')
const dateEnd = ref('')
const filterError = ref('')

const router = useRouter()

const toggleGenre = (name: string) => {
  if (selectedGenres.value.includes(name)) {
    selectedGenres.value = selectedGenres.value.filter((g) => g !== name)
    return
  }
  selectedGenres.value = [...selectedGenres.value, name]
}

const toggleSubgenre = (parent: GenreGroup, sub: string) => {
  if (selectedGenres.value.includes(sub)) {
    selectedGenres.value = selectedGenres.value.filter((g) => g !== sub)
    return
  }
  selectedGenres.value = [...selectedGenres.value, sub]
  if (parent.subgenres && parent.subgenres.every((s) => selectedGenres.value.includes(s))) {
    if (!selectedGenres.value.includes(parent.name)) {
      selectedGenres.value = [...selectedGenres.value, parent.name]
    }
  }
}

const toggleGroup = (group: GenreGroup) => {
  if (!group.subgenres) {
    toggleGenre(group.name)
    return
  }
  const allSelected = group.subgenres.every((s) => selectedGenres.value.includes(s))
  if (allSelected) {
    selectedGenres.value = selectedGenres.value.filter(
      (g) => g !== group.name && !group.subgenres?.includes(g)
    )
    return
  }
  const merged = new Set(selectedGenres.value)
  merged.add(group.name)
  group.subgenres.forEach((s) => merged.add(s))
  selectedGenres.value = Array.from(merged)
}

const isGroupChecked = (group: GenreGroup) => {
  if (!group.subgenres) return selectedGenres.value.includes(group.name)
  return group.subgenres.every((s) => selectedGenres.value.includes(s))
}

const isSubChecked = (sub: string) => selectedGenres.value.includes(sub)

const allItems = computed(() => {
  const items: string[] = []
  genreGroups.value.forEach((group) => {
    items.push(group.name)
    group.subgenres?.forEach((sub) => items.push(sub))
  })
  return items
})

const isAllChecked = computed(() => {
  if (!allItems.value.length) return false
  return allItems.value.every((item) => selectedGenres.value.includes(item))
})

const toggleAll = () => {
  if (isAllChecked.value) {
    selectedGenres.value = []
    return
  }
  selectedGenres.value = Array.from(new Set(allItems.value))
}

const toggleAccordion = (name: string) => {
  openGenre.value = openGenre.value === name ? null : name
}

const hasActiveFilters = () => {
  const hasContinents = selectedContinents.value.length > 0
  const hasGenres = selectedGenres.value.length > 0
  const hasDateRange = monthMode.value === 'range' && !!dateStart.value && !!dateEnd.value
  return hasContinents || hasGenres || hasDateRange
}

const startSearch = () => {
  if (!hasActiveFilters()) {
    filterError.value = t('mapExplorer.filterRequired')
    return
  }
  filterError.value = ''
  router.push({
    name: 'mapresult',
    query: {
      continents: selectedContinents.value.join(','),
      genres: selectedGenres.value.join(','),
      start: dateStart.value || undefined,
      end: dateEnd.value || undefined,
      mode: monthMode.value,
    },
  })
}

onMounted(() => {
  if (!('geolocation' in navigator)) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      lat.value = pos.coords.latitude
      lng.value = pos.coords.longitude
      isLocationDenied.value = false
      locationContinent.value = getContinentByLatLng(lat.value, lng.value)
    },
    () => {
      isLocationDenied.value = true
      locationContinent.value = null
    },
    { enableHighAccuracy: false, timeout: 6000 }
  )
  if (mapRoot.value) {
    mapRoot.value.addEventListener('click', onMapClick)
    const mapSvgEl = mapRoot.value.querySelector('svg')
    if (mapSvgEl) {
      mapSvgEl.removeAttribute('width')
      mapSvgEl.removeAttribute('height')
      mapSvgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }
  }
})

onBeforeUnmount(() => {
  if (mapRoot.value) {
    mapRoot.value.removeEventListener('click', onMapClick)
  }
})
</script>

<template>
  <section class="px-5 pb-20 font-pretend text-[var(--text)] pc:grid pc:grid-cols-2 pc:gap-8 pc:p-8">
    <div>
      <header class="pt-2 pb-6">
        <h1 class="text-3xl font-extrabold tracking-tight">{{ t('mapExplorer.title') }}</h1>
      </header>
      <div  class="pc:h-full pc:flex pc:flex-col gap-5">
        <div class="relative w-full max-w-[720px]">
          <div class="relative w-full aspect-[757/376] overflow-visible">
            <div
              ref="mapRoot"
              class="absolute inset-0 map-svg "
              v-html="mapSvg"
            >
            </div>
          </div>
          <div class="pt-3 text-xs font-semibold text-[var(--muted)]">
            <span v-if="selectedContinents.length">{{ t('mapExplorer.selected', { continent: selectedContinentLabel }) }}</span>
            <span v-else>{{ t('mapExplorer.tapToSelect') }}</span>
          </div>
        </div>

        <section class="pt-8">
          <div class="text-xs font-bold py-2 pc:text-base">{{ t('firstView.todayFestival') }}</div>
          <ul
            v-if="todayEvents.length"
            class="flex flex-nowrap gap-6 overflow-x-auto w-full pl-1 py-3"
          >
            <li
              v-for="item in todayEvents"
              :key="item.id"
              class="w-[130px] h-[130px] flex-shrink-0 p-[10px] rounded-lg bg-[var(--surface)] shadow-[1px_1px_6px_var(--shadow-weak)] flex flex-col content-center"
            >
              <router-link :to="{ name: 'festivaldetail', params: { id: item.id } }">
                <img
                  :src="item.image"
                  alt="festival"
                  class="w-full h-[60px] object-cover rounded-[10px]"
                />
                <div class="flex flex-col">
                  <div class="text-xs font-black py-[10px]">
                    {{ shortText(item.title) }}
                  </div>
                  <div class="text-xs truncate">
                    {{ shortText(item.city + ' / ' + item.contry) }}
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
          <div v-else class="text-base text-gray-400 text-center py-8 border-b">
            {{ t('firstView.emptyToday') }}
          </div>
        </section>
      </div>
    </div>

    <section class="pt-8">
      <h2 class="text-base font-semibold">{{ t('mapExplorer.filterTitle') }}</h2>

      <div class="pt-5">
        <h3 class="text-sm font-semibold pb-3">{{ t('mapExplorer.exploreContinent') }}</h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="continent in continents"
            :key="continent.key"
            type="button"
            class="rounded-xl border px-3 py-3 text-left text-xs font-semibold tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            :style="{
              borderColor: selectedContinents.includes(continent.key) ? continent.color : 'var(--muted)',
              color: selectedContinents.includes(continent.key) ? continent.color : 'var(--muted)',
              backgroundColor: selectedContinents.includes(continent.key) ? `${continent.color}22` : 'var(--surface)',
            }"
            @click="selectContinent(continent.key)"
          >
            {{ t(`mapExplorer.continents.${continent.key}`) }}
          </button>
        </div>
        <div class="pt-3">
          <button
            v-if="selectedContinents.length"
            type="button"
            class="text-xs font-semibold text-[var(--muted)] underline underline-offset-4"
            @click="clearMapSelection"
          >
            {{ t('mapExplorer.clearSelection') }}
          </button>
        </div>
      </div>

      <div class="pt-8">
        <h3 class="text-sm font-semibold pb-3">{{ t('mapExplorer.exploreGenre') }}</h3>
        <div class="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            class="w-full flex items-center justify-between"
            @click="isAllOpen = !isAllOpen"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-6 h-6 rounded-md border border-[var(--stroke)] flex items-center justify-center cursor-pointer"
                :class="isAllChecked ? 'bg-[#f61979] text-white border-[#f61979]' : 'bg-[var(--surface)] text-transparent'"
                @click.stop="toggleAll"
              >
                <span class="material-symbols-rounded text-base">check</span>
              </span>
              <span class="text-sm font-semibold text-[var(--muted)]">{{ t('mapExplorer.allLabel') }}</span>
            </div>
            <span class="material-symbols-rounded text-lg text-[var(--muted)]">
              {{ isAllOpen ? 'expand_less' : 'expand_more' }}
            </span>
          </button>

          <div v-if="isAllOpen" class="pt-4 flex flex-col gap-3">
            <div
              v-for="group in genreGroups"
              :key="group.name"
              class="rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-3 py-3"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between"
                @click="group.subgenres ? toggleAccordion(group.name) : toggleGroup(group)"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="w-6 h-6 rounded-md border border-[var(--stroke)] flex items-center justify-center cursor-pointer"
                    :class="isGroupChecked(group) ? 'bg-[#f61979] text-white border-[#f61979]' : 'bg-[var(--surface)] text-transparent'"
                    @click.stop="toggleGroup(group)"
                  >
                    <span class="material-symbols-rounded text-base">check</span>
                  </span>
                  <span class="text-sm font-semibold text-[var(--muted)]">{{ group.name }}</span>
                </div>
                <span
                  v-if="group.subgenres"
                  class="material-symbols-rounded text-lg text-[var(--muted)]"
                >
                  {{ openGenre === group.name ? 'expand_less' : 'expand_more' }}
                </span>
              </button>

              <div v-if="group.subgenres && openGenre === group.name" class="pt-3 grid grid-cols-2 gap-3">
                <label
                  v-for="sub in group.subgenres"
                  :key="sub"
                  class="flex items-center gap-2 text-xs text-[var(--muted)]"
                >
                  <span
                    class="w-6 h-6 rounded-lg border border-[var(--stroke)] flex items-center justify-center cursor-pointer"
                    :class="isSubChecked(sub) ? 'bg-[#f61979] text-white border-[#f61979]' : 'bg-[var(--surface)] text-transparent'"
                    @click="toggleSubgenre(group, sub)"
                  >
                    <span class="material-symbols-rounded text-base">check</span>
                  </span>
                  <span>{{ sub }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-8">
        <h3 class="text-sm font-semibold pb-3">{{ t('mapExplorer.exploreDate') }}</h3>
        <div class="flex flex-col gap-3">
          <label class="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <input
              type="radio"
              name="date-mode"
              value="all"
              class="accent-[#f61979]"
              v-model="monthMode"
            />
            <span class="text-sm font-semibold text-[var(--muted)]">{{ t('mapExplorer.allDates') }}</span>
          </label>
          <div class="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <label class="flex items-center gap-3">
              <input
                type="radio"
                name="date-mode"
                value="range"
                class="accent-[#f61979]"
                v-model="monthMode"
              />
              <span class="text-sm font-semibold text-[var(--muted)]">{{ t('mapExplorer.dateRange') }}</span>
            </label>
            <div class="pt-3">
              <div class="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  class="w-[90%] rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
                  :disabled="monthMode !== 'range'"
                  v-model="dateStart"
                />
                <input
                  type="date"
                  class="w-[90%] rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
                  :disabled="monthMode !== 'range'"
                  v-model="dateEnd"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="py-10">
        <button
          type="button"
          class="w-full rounded-2xl bg-[#f61979] px-4 py-4 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(246,25,121,0.25)]"
          @click="startSearch"
        >
          {{ t('mapExplorer.search') }}
        </button>
        <p v-if="filterError" class="pt-3 text-xs font-semibold text-[#f61979]">
          {{ filterError }}
        </p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.map-svg svg {
  width: 100%;
  height: 100%;
  display: block;
}

.map-svg {
  width: 100%;
  height: 100%;
}

.map-svg [fill] {
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease;
}
</style>
