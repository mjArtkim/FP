import { ref } from 'vue'

const ARTIST_KEY = 'favoriteArtists'
const FESTIVAL_KEY = 'favoriteFestivals'

const favorites = ref<string[]>([]) // artist slugs
const festivalFavorites = ref<number[]>([]) // festival ids

let initialized = false

const loadFavorites = () => {
  if (initialized) return
  initialized = true
  if (typeof window === 'undefined') return
  try {
    const rawArtists = window.localStorage.getItem(ARTIST_KEY)
    if (rawArtists) {
      const parsed = JSON.parse(rawArtists)
      if (Array.isArray(parsed)) {
        favorites.value = parsed.filter((item) => typeof item === 'string')
      }
    }
    const rawFestivals = window.localStorage.getItem(FESTIVAL_KEY)
    if (rawFestivals) {
      const parsed = JSON.parse(rawFestivals)
      if (Array.isArray(parsed)) {
        festivalFavorites.value = parsed.filter((item) => typeof item === 'number')
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const saveArtistFavorites = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ARTIST_KEY, JSON.stringify(favorites.value))
  } catch (e) {
    console.error(e)
  }
}

const saveFestivalFavorites = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FESTIVAL_KEY, JSON.stringify(festivalFavorites.value))
  } catch (e) {
    console.error(e)
  }
}

const toggleFavorite = (slug: string) => {
  loadFavorites()
  if (!slug) return
  const set = new Set(favorites.value)
  if (set.has(slug)) {
    set.delete(slug)
  } else {
    set.add(slug)
  }
  favorites.value = Array.from(set)
  saveArtistFavorites()
}

const removeFavorite = (slug: string) => {
  loadFavorites()
  favorites.value = favorites.value.filter((item) => item !== slug)
  saveArtistFavorites()
}

const isFavorite = (slug: string) => {
  loadFavorites()
  return favorites.value.includes(slug)
}

const toggleFestivalFavorite = (id: number) => {
  loadFavorites()
  if (!id) return
  const set = new Set(festivalFavorites.value)
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  festivalFavorites.value = Array.from(set)
  saveFestivalFavorites()
}

const removeFestivalFavorite = (id: number) => {
  loadFavorites()
  festivalFavorites.value = festivalFavorites.value.filter((item) => item !== id)
  saveFestivalFavorites()
}

const isFestivalFavorite = (id: number) => {
  loadFavorites()
  return festivalFavorites.value.includes(id)
}

export {
  favorites,
  festivalFavorites,
  loadFavorites,
  toggleFavorite,
  removeFavorite,
  isFavorite,
  toggleFestivalFavorite,
  removeFestivalFavorite,
  isFestivalFavorite,
}
