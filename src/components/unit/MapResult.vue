<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import festivals from '@/data/festivals.json'

type EventItem = {
  id: number
  title: string
  start: string
  end: string
  image: string
  city: string
  contry: string
  continent?: ContinentKey
  lineup: string
  mapQuery?: string
}

type ContinentKey =
  | 'asia'
  | 'europe'
  | 'northAmerica'
  | 'southAmerica'
  | 'africa'
  | 'oceania'
  | 'other'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const isLoading = ref(true)
const mapEl = ref<HTMLElement | null>(null)
const loadingTimer = ref<number | null>(null)
const mapInstance = ref<any>(null)
const markers = ref<any[]>([])

const allFestivalData = festivals as Record<string, EventItem[]>
const allEvents = computed<EventItem[]>(() => Object.values(allFestivalData).flat())

const filteredEvents = computed<EventItem[]>(() => {
  if (!selectedContinents.value.length) return allEvents.value
  return allEvents.value.filter((event) => {
    if (!event.continent) return true
    return selectedContinents.value.includes(event.continent)
  })
})

const previewEvent = computed<EventItem | null>(() => filteredEvents.value[0] ?? null)

const continentQueryMap: Record<ContinentKey, string> = {
  asia: 'Asia',
  europe: 'Europe',
  northAmerica: 'North America',
  southAmerica: 'South America',
  africa: 'Africa',
  oceania: 'Oceania',
  other: 'World',
}

const selectedContinents = computed(() => {
  const raw = String(route.query.continents ?? '')
  if (!raw) return []
  return raw.split(',').map((item) => item.trim()).filter(Boolean)
})

const fallbackQuery = computed(() => {
  if (selectedContinents.value.length === 1) {
    const key = selectedContinents.value[0] as ContinentKey
    return continentQueryMap[key] ?? 'World'
  }
  return 'South Korea'
})

const searchMapQuery = computed(() => {
  if (previewEvent.value) {
    return previewEvent.value.mapQuery || `${previewEvent.value.city}, ${previewEvent.value.contry}`
  }
  return fallbackQuery.value
})

const searchResultCount = computed(() => filteredEvents.value.length)

const shortText = (text: string, limit = 18) => {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}

const exploreAgain = () => {
  router.push({ name: 'map' })
}

const getLeaflet = () => {
  return (window as any).L || null
}

const ensureLeafletCss = () => {
  const existing = document.getElementById('leaflet-css')
  if (existing) return
  const link = document.createElement('link')
  link.id = 'leaflet-css'
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
}

const loadLeaflet = () => {
  const existing = getLeaflet()
  if (existing) return Promise.resolve(existing)
  ensureLeafletCss()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve(getLeaflet())
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

const buildInfoCardHtml = (event: EventItem) => {
  const title = shortText(event.title, 20)
  const location = shortText(`${event.city} / ${event.contry}`, 22)
  return `
    <div class="map-card">
      <img class="map-card__img" src="${event.image}" alt="festival" />
      <div class="map-card__title">${title}</div>
      <div class="map-card__location">${location}</div>
      <a class="map-card__button" href="/festivaldetail/${event.id}">Detail</a>
    </div>
  `
}

const geocodeAddress = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.[0] ?? null
}

const setMarkers = async (L: any) => {
  if (!mapInstance.value) return
  markers.value.forEach((marker) => marker.remove())
  markers.value = []

  const targets = filteredEvents.value.slice(0, 12)
  let firstMarker: any = null
  let firstEvent: EventItem | null = null

  for (const event of targets) {
    const query = event.mapQuery || `${event.city}, ${event.contry}`
    // Avoid parallel geocode bursts to reduce quota spikes.
    // eslint-disable-next-line no-await-in-loop
    const result = await geocodeAddress(query)
    const coords = result ? [Number(result.lon), Number(result.lat)] : null
    if (!coords) continue
    const popup = L.popup({ offset: [0, -8] }).setContent(buildInfoCardHtml(event))
    const marker = L.marker([coords[1], coords[0]]).addTo(mapInstance.value).bindPopup(popup)
    if (!firstMarker) {
      firstMarker = marker
      firstEvent = event
    }
    markers.value.push(marker)
  }

  if (markers.value.length) {
    const bounds = L.latLngBounds(markers.value.map((marker) => marker.getLatLng()))
    mapInstance.value.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 })
    if (firstMarker && firstEvent) {
      firstMarker.getPopup().setContent(buildInfoCardHtml(firstEvent))
      firstMarker.openPopup()
    }
    return
  }

  const fallback = searchMapQuery.value || 'South Korea'
  mapInstance.value.setView([37.5665, 126.978], 4)
  const result = await geocodeAddress(fallback)
  const coords = result ? [Number(result.lat), Number(result.lon)] : null
  if (coords) {
    mapInstance.value.setView(coords, 4)
  }
}

const initMap = async () => {
  if (!mapEl.value) return
  const L = await loadLeaflet()
  mapInstance.value = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
  }).setView([37.5665, 126.978], 4)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance.value)
  await setMarkers(L)
}

onMounted(() => {
  loadingTimer.value = window.setTimeout(() => {
    isLoading.value = false
    nextTick(() => {
      initMap().catch(() => {
        isLoading.value = false
      })
    })
  }, 1200)
})

onBeforeUnmount(() => {
  if (loadingTimer.value) {
    window.clearTimeout(loadingTimer.value)
  }
  markers.value.forEach((marker) => marker.remove())
  if (mapInstance.value) {
    mapInstance.value.remove()
  }
})
</script>

<template>
  <section class="map-result font-pretend text-[var(--text)]">
    <div
      v-if="isLoading"
      class="flex h-screen flex-col items-center justify-center gap-6 bg-[var(--surface)] px-6 py-8 text-center"
    >
      <div class="loading-icon material-symbols-rounded text-[56px] text-[var(--muted)]">sync</div>
      <div class="text-sm font-semibold text-[var(--muted)]">
        {{ t('mapExplorer.placingMarkers') }}
      </div>
    </div>

    <div
      v-else
      class="map-shell relative overflow-hidden bg-white top-0"
    >
      <div class="map-overlay absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
        <div class="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.16)]">
          {{ t('mapExplorer.foundFestivals', { count: searchResultCount }) }}
        </div>
        <button
          type="button"
          class="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
          @click="exploreAgain"
        >
          {{ t('mapExplorer.exploreAgain') }}
        </button>
      </div>

      <div class="map-frame relative w-full bg-[#f2f5f9]" ref="mapEl"></div>
    </div>
  </section>
</template>

<style scoped>
.map-result {
  height: 100vh;
  overflow: hidden;
}

.map-shell {
  height: 100vh;
}

.map-frame {
  height: 100vh;
}

.loading-icon {
  animation: spin 1.4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.map-overlay {
  z-index: 1000;
}

.leaflet-popup-content {
  margin: 0;
}

.leaflet-popup-content-wrapper {
  border-radius: 20px;
  padding: 0;
}

.leaflet-popup-tip {
  box-shadow: none;
}

.map-card {
  width: 190px;
  padding: 12px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.map-card__img {
  width: 100%;
  height: 86px;
  object-fit: cover;
  border-radius: 12px;
}

.map-card__title {
  padding-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.map-card__location {
  padding-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.map-card__button {
  display: block;
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid #3b82f6;
  padding: 8px 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
}
</style>
