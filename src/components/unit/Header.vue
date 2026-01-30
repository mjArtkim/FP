<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import topLogow from '@/assets/img/top_logo_w.svg'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import LanguageToggle from '@/components/part/LanguageToggle.vue'
import NeonSwitch from '@/components/part/NeonSwitch.vue'
import { useI18n } from '@/i18n'
import { getCurrentUser } from '@/utils/auth'
import { getProfile } from '@/utils/profile'

const profileCity = ref('')
const profileCountry = ref('')
const today = new Date()
const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
const DateText = ref(formattedDate)

const { t } = useI18n()
const route = useRoute()

const isGnbOpen = ref(false)
const themeMode = ref<'light' | 'dark'>('light')
const isDarkMode = ref(false)
let observer: MutationObserver | null = null

const applyTheme = (mode: 'light' | 'dark') => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (root.dataset.theme !== mode) root.dataset.theme = mode
}

const syncTheme = () => {
  if (typeof document === 'undefined') return
  const mode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  themeMode.value = mode
  isDarkMode.value = mode === 'dark'
}

onMounted(() => {
  if (typeof document === 'undefined') return
  syncTheme()
  observer = new MutationObserver(syncTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  void loadProfileLocation()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

watch(
  isDarkMode,
  (isDark) => {
    applyTheme(isDark ? 'dark' : 'light')
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  () => {
    if (isGnbOpen.value) isGnbOpen.value = false
  }
)

const toggleGnb = () => {
  isGnbOpen.value = !isGnbOpen.value
}

const currentLogo = computed(() => (themeMode.value === 'dark' ? topLogow : topLogo))
const locationText = computed(() => {
  const city = profileCity.value.trim()
  const country = profileCountry.value.trim()
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return t('common.locationUnset')
})

const loadProfileLocation = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return
    const profile = await getProfile(user.uid, user.email ?? '')
    profileCity.value = profile?.city ?? ''
    profileCountry.value = profile?.country ?? ''
  } catch {
    profileCity.value = ''
    profileCountry.value = ''
  }
}
</script>
<template>
  <div class="p-5 relative z-[9999]">
    <div class="flex justify-between items-center">
      <router-link to="/"><img :src="currentLogo" class="h-8"/></router-link>
      <ul class="flex items-center gap-2">
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">location_on</div>
          <div class="font-gugi text-xs">{{ locationText }}</div>
        </li>
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">date_range</div>
          <div class="font-gugi text-xs">{{ DateText }}</div>
        </li>

        <li class="flex items-center">
          <button
            type="button"
            class="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--stroke)] bg-[var(--surface)] text-[var(--text)] shadow-[2px_2px_5px_rgba(0,0,0,0.12)]"
            :aria-expanded="isGnbOpen"
            aria-controls="mobile-gnb"
            @click="toggleGnb"
          >
            <span class="material-symbols-rounded text-lg">menu</span>
          </button>
        </li>
      </ul>
    </div>
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isGnbOpen"
        id="mobile-gnb"
        class="absolute z-50 w-[90%] mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] backdrop-blur-md shadow-[4px_6px_12px_rgba(0,0,0,0.15)]"
      >
        <div class="grid grid-cols-3 gap-3 p-4 text-xs font-gugi text-[var(--text)]">
          <router-link to="/" class="flex flex-col items-center gap-1 pc:hover:text-[var(--accent)]">
            <span class="material-symbols-rounded text-xl">home</span>
            <span>{{ t('nav.home') }}</span>
          </router-link>
          <router-link to="/map" class="flex flex-col items-center gap-1 pc:hover:text-[var(--accent)]">
            <span class="material-symbols-rounded text-xl">map</span>
            <span>{{ t('nav.map') }}</span>
          </router-link>
          <router-link to="/favorite" class="flex flex-col items-center gap-1 pc:hover:text-[var(--accent)]">
            <span class="material-symbols-rounded text-xl">star</span>
            <span>{{ t('nav.favorite') }}</span>
          </router-link>
          <router-link to="/insights" class="flex flex-col items-center gap-1 pc:hover:text-[var(--accent)]">
            <span class="material-symbols-rounded text-xl">insert_chart</span>
            <span>{{ t('nav.insights') }}</span>
          </router-link>
          <router-link to="/mypage" class="flex flex-col items-center gap-1 pc:hover:text-[var(--accent)]">
            <span class="material-symbols-rounded text-xl">account_box</span>
            <span>{{ t('nav.mypage') }}</span>
          </router-link>

        </div>
        <div class="flex items-center justify-between border-t border-[var(--stroke)] px-4 py-3">
          <div class="flex items-center">
            <LanguageToggle />
          </div>
          <div class="flex items-center gap-2 text-xs font-gugi text-[var(--muted)]">
            <span class="material-symbols-rounded text-base">
              {{ isDarkMode ? 'dark_mode' : 'light_mode' }}
            </span>
            <span>{{ isDarkMode ? t('theme.dark') : t('theme.light') }}</span>
          </div>
          <NeonSwitch v-model="isDarkMode" />
        </div>
      </div>
    </transition>
  </div>
</template>
