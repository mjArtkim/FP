import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'festival-locale'

const messages = {
  en: {
    nav: {
      back: 'BACK',
      home: 'HOME',
      map: 'MAP',
      favorite: 'FAVORIT',
      insights: 'INSIGHTS',
      mypage: 'MYPAGE',
      guest: 'Guest',
    },
    common: {
      bookmark: 'Bookmark',
      bookmarked: 'Bookmarked',
      close: 'Close',
      loading: 'Loading...',
      detail: 'Detail',
      cancel: 'Cancel',
      move: 'Move',
      month: 'Month',
      selectMonth: 'Select a month',
    },
    firstView: {
      todayFestival: 'Today Festival',
      emptyToday: 'Let’s focus on work today 💪',
      whatFestivalHere: 'What Festival Here?',
      loadError: 'Failed to load data.',
      oops: 'OOPS :(',
      noEventsThisMonth: 'No events this month.',
      viewOtherMonths: 'View other months 👀',
      monthPickerTitle: 'Select a month',
      monthOptions: 'Month options',
    },
    calendar: {
      moreEvents: 'More Events',
      days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    },
    festivalDetail: {
      location: 'LOCATION',
      share: 'Share',
      shareSuccess: 'Share succeeded.',
      shareCopied: 'Link copied.',
      shareFailed: 'Share failed. Please try again.',
      linkSection: 'LINK',
      getTicket: 'Get Ticket',
      linkPage: 'LINK PAGE',
      noLink: 'No links available.',
      lineup: 'LINE UP',
      showMore: 'More',
      showLess: 'Less',
      map: 'MAP',
      mapTitle: 'Festival location map',
      mapNoInfo: 'No location info to display a map.',
      sameLocation: 'Same Location Festivals',
      noSameLocation: 'No other festivals in the same location.',
      notFound: 'Festival not found.',
    },
    artistDetail: {
      country: 'Country: {value}',
      type: 'Type: {value}',
      debut: 'Debut: {value}',
      career: 'Career: {years}y',
      labels: 'Labels: {value}',
      genres: 'Genres',
      aliases: 'Aliases',
      albumsSingles: 'Albums & Singles',
      topTracks: 'Top Tracks',
      links: 'Links',
      latestFestival: 'Latest Festival',
      noGenres: 'No genre info.',
      noAliases: 'No aliases available.',
      noAlbums: 'No album info.',
      noTracks: 'No track info.',
      showMore: 'More',
      showLess: 'Less',
      unknownAlbum: 'Unknown album',
      albumMeta: '{type} • {date} • {count} tracks',
      durationSeconds: '{seconds}s',
      noLinks: 'No links available.',
      noFestival: 'No festival info available.',
      notFound: 'Artist not found.',
      genreTitle: 'Genre: {name}',
      noGenreMatches: 'No other artists in this genre.',
    },
    favorites: {
      favoriteArtists: 'Favorite Artists',
      favoriteFestivals: 'Favorite Festivals',
      noFavoriteArtists: 'No bookmarked artists yet.',
      noFavoriteFestivals: 'No bookmarked festivals yet.',
    },
  },
  ko: {
    nav: {
      back: '뒤로',
      home: 'HOME',
      map: '지도',
      favorite: '즐겨찾기',
      insights: '인사이트',
      mypage: '마이페이지',
      guest: '게스트',
    },
    common: {
      bookmark: '북마크',
      bookmarked: '북마크됨',
      close: '닫기',
      loading: '불러오는 중...',
      detail: '자세히',
      cancel: '취소',
      move: '이동',
      month: '월',
      selectMonth: '월 선택',
    },
    firstView: {
      todayFestival: '오늘의 페스티벌',
      emptyToday: '오늘은 잠시 쉬어가요 💪',
      whatFestivalHere: '이달의 페스티벌',
      loadError: '데이터를 불러오는 중 오류가 발생했습니다.',
      oops: '이런 :(',
      noEventsThisMonth: '이달에는 일정이 없어요.',
      viewOtherMonths: '다른 달 보기 👀',
      monthPickerTitle: '월 선택',
      monthOptions: '월 선택 옵션',
    },
    calendar: {
      moreEvents: '더 많은 이벤트',
      days: ['일', '월', '화', '수', '목', '금', '토'],
    },
    festivalDetail: {
      location: '위치',
      share: '링크 공유',
      shareSuccess: '공유하기가 성공했습니다.',
      shareCopied: '링크를 복사했어요.',
      shareFailed: '공유에 실패했어요. 다시 시도해주세요.',
      linkSection: '링크',
      getTicket: '티켓 예매',
      linkPage: '링크 페이지',
      noLink: '등록된 링크가 없습니다.',
      lineup: '라인업',
      showMore: '더보기',
      showLess: '접기',
      map: '지도',
      mapTitle: '페스티벌 위치 지도',
      mapNoInfo: '지도를 표시할 위치 정보가 없습니다.',
      sameLocation: '같은 지역의 페스티벌',
      noSameLocation: '같은 지역의 다른 페스티벌이 없습니다.',
      notFound: '선택한 페스티벌 정보를 찾을 수 없습니다.',
    },
    artistDetail: {
      country: '국가: {value}',
      type: '유형: {value}',
      debut: '데뷔: {value}',
      career: '활동: {years}년',
      labels: '레이블: {value}',
      genres: '장르',
      aliases: '다른 이름',
      albumsSingles: '앨범 & 싱글',
      topTracks: '인기 트랙',
      links: '링크',
      latestFestival: '최근 페스티벌',
      noGenres: '장르 정보가 없습니다.',
      noAliases: '다른 이름이 없습니다.',
      noAlbums: '앨범 정보가 없습니다.',
      noTracks: '트랙 정보가 없습니다.',
      showMore: '더보기',
      showLess: '접기',
      unknownAlbum: '알 수 없는 앨범',
      albumMeta: '{type} • {date} • {count}곡',
      durationSeconds: '{seconds}초',
      noLinks: '등록된 링크가 없습니다.',
      noFestival: '참여한 페스티벌 정보가 없습니다.',
      notFound: '선택한 아티스트 정보를 찾을 수 없습니다.',
      genreTitle: '장르: {name}',
      noGenreMatches: '같은 장르의 다른 아티스트가 없습니다.',
    },
    favorites: {
      favoriteArtists: '즐겨찾는 아티스트',
      favoriteFestivals: '즐겨찾는 페스티벌',
      noFavoriteArtists: '아직 북마크한 아티스트가 없습니다.',
      noFavoriteFestivals: '아직 북마크한 페스티벌이 없습니다.',
    },
  },
} as const

type Locale = keyof typeof messages

const normalizeLocale = (value?: string | null): Locale => {
  if (!value) return 'en'
  const lower = value.toLowerCase()
  if (lower.startsWith('ko')) return 'ko'
  if (lower.startsWith('en')) return 'en'
  return 'en'
}

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) return normalizeLocale(stored)
  return normalizeLocale(window.navigator.language)
}

const locale = ref<Locale>(getInitialLocale())

watch(
  locale,
  (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = value
    }
  },
  { immediate: true }
)

const resolveMessage = (key: string, target: Locale): string | undefined => {
  const parts = key.split('.')
  let node: unknown = messages[target]
  for (const part of parts) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

const formatMessage = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] === undefined ? match : String(params[key])
  )
}

const t = (key: string, params?: Record<string, string | number>) => {
  const active = locale.value
  const template =
    resolveMessage(key, active) ||
    resolveMessage(key, 'en') ||
    resolveMessage(key, 'ko')
  if (!template) return key
  return formatMessage(template, params)
}

const availableLocales = computed(() => Object.keys(messages) as Locale[])
const currentLocale = computed(() => locale.value)

const setLocale = (value: string) => {
  locale.value = normalizeLocale(value)
}

export const useI18n = () => ({
  t,
  locale,
  setLocale,
  availableLocales,
  currentLocale,
})
