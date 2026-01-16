<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import topLogow from '@/assets/img/top_logo_w.svg'
import { computed, onMounted, ref, watch } from 'vue'
import NeonSwitch from '@/components/unit/NeonSwitch.vue'
import LanguageToggle from '@/components/unit/LanguageToggle.vue'
import { useI18n } from '@/i18n'
import { resolveUserRole } from '@/utils/roles'
import { getCurrentUser } from '@/utils/auth'
import { getProfile } from '@/utils/profile'
const isPowerOn = ref(false)
const profileCity = ref('')
const profileCountry = ref('')
const today = new Date()
const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
const DateText = ref(formattedDate)
  const isSidebarOpen = ref(true)
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
const { t } = useI18n()
const userRole = ref<'guest' | 'user' | 'admin'>('guest')
const roleLabel = computed(() => t(`nav.roles.${userRole.value}`))
const locationText = computed(() => {
  const city = profileCity.value.trim()
  const country = profileCountry.value.trim()
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return t('common.locationUnset')
})
const currentYear = today.getFullYear()
const copyrightText = computed(() =>
  t('common.copyright', { year: currentYear, brand: t('common.brand') })
)

const applyTheme = (mode: 'light' | 'dark') => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = mode
}

const currentLogo = computed(() => (isPowerOn.value ? topLogow : topLogo))

watch(
  isPowerOn,
  (isDark) => {
    applyTheme(isDark ? 'dark' : 'light')
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return
    userRole.value = await resolveUserRole()
    const profile = await getProfile(user.uid, user.email ?? '')
    profileCity.value = profile?.city ?? ''
    profileCountry.value = profile?.country ?? ''
  } catch {
    userRole.value = 'guest'
  }
})
</script>
<template>
  <div class="relative transition-all duration-300 p-6 flex flex-col h-screen justify-between text-[var(--text)] bg-[var(--surface)]"
    :class="isSidebarOpen ? 'w-[270px]' : 'w-[80px]'"
    >
    <div>
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <router-link to="/"><img :src="currentLogo" class="h-10"/></router-link>
          <div v-if="isSidebarOpen" class="font-gugi text-[var(--muted)]">{{ roleLabel }}</div>
        </div>
        <ul class="py-8">
          <li class="flex items-center py-1">
            <div class="material-symbols-rounded text-2xl pr-5 text-[var(--muted)]">location_on</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs text-[var(--muted)]">{{ locationText }}</div>
          </li>
          <li class="flex items-center py-1">
            <div class="material-symbols-rounded text-2xl pr-5 text-[var(--muted)]">date_range</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs text-[var(--muted)]">{{ DateText }}</div>
          </li>
        </ul>
      </div>
      <div class="flex flex-col gap-9">
        <router-link to="/" class="flex items-center cursor-pointer pc:hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">home</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">{{ t('nav.home') }}</div>
        </router-link>
        <router-link to="/map" class="flex items-center cursor-pointer pc:hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">map</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">{{ t('nav.map') }}</div>
        </router-link>
        <router-link to="/favorite" class="flex items-center cursor-pointer pc:hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">star</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">{{ t('nav.favorite') }}</div>
        </router-link>
        <router-link to="/insights" class="flex items-center cursor-pointer pc:hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">insert_chart</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">{{ t('nav.insights') }}</div>
        </router-link>
        <router-link to="/mypage" class="flex items-center cursor-pointer pc:hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">account_box</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">{{ t('nav.mypage') }}</div>
        </router-link>
      </div>
      <div class="flex items-center py-8">
        <div
          class="material-symbols-rounded text-2xl pr-5 transition-all duration-300"
          :style="{ color: isPowerOn ? 'var(--accent)' : 'var(--muted)' }"
        >
          {{ isPowerOn ? 'dark_mode' : 'light_mode' }}
        </div>
        <NeonSwitch v-model="isPowerOn" v-if="isSidebarOpen"/>
      </div>
      <div v-if="isSidebarOpen" class="pb-6">
        <LanguageToggle />
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div v-if="isSidebarOpen" class="text-xs text-[var(--muted)]">{{ copyrightText }}</div>
      <button
        class="text-[var(--muted)] pc:hover:text-[var(--text)] material-symbols-rounded text-3xl "
        @click="toggleSidebar"
      >
        {{ isSidebarOpen ? 'left_panel_close' : 'left_panel_open' }}
      </button>
    </div>
  </div>
</template>
