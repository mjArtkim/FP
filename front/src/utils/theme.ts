export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-preference'

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    return null
  }
  return null
}

export const setStoredTheme = (mode: ThemeMode | null) => {
  if (typeof window === 'undefined') return
  try {
    if (!mode) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, mode)
    }
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const resolveTheme = (): ThemeMode => getStoredTheme() ?? getSystemTheme()

export const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = mode
}

export const initTheme = () => {
  if (typeof document === 'undefined') return
  applyTheme(resolveTheme())

  if (typeof window === 'undefined' || !window.matchMedia) return
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  const onChange = (event: MediaQueryListEvent) => {
    if (getStoredTheme()) return
    applyTheme(event.matches ? 'dark' : 'light')
  }

  try {
    media.addEventListener('change', onChange)
  } catch {
    // Safari < 14
    media.addListener(onChange)
  }
}
