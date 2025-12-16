<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import topLogow from '@/assets/img/top_logo_w.svg'
import { computed, ref, watch } from 'vue'
import NeonSwitch from '@/components/unit/NeonSwitch.vue'
const isPowerOn = ref(false)
const locations = ref('SEOUL.S.KOREA')
const today = new Date()
const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
const DateText = ref(formattedDate)
  const isSidebarOpen = ref(true)
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

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
</script>
<template>
  <div class="relative transition-all duration-300 p-6 flex flex-col h-screen justify-between text-[var(--text)] bg-[var(--surface)]"
    :class="isSidebarOpen ? 'w-[270px]' : 'w-[80px]'"
    >
    <div>
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <router-link to="/"><img :src="currentLogo" class="h-10"/></router-link>
          <div v-if="isSidebarOpen" class="font-gugi text-[var(--muted)]">Guest</div>
        </div>
        <ul class="py-8">
          <li class="flex items-center py-1">
            <div class="material-symbols-rounded text-2xl pr-5 text-[var(--muted)]">location_on</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs text-[var(--muted)]">{{ locations }}</div>
          </li>
          <li class="flex items-center py-1">
            <div class="material-symbols-rounded text-2xl pr-5 text-[var(--muted)]">date_range</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs text-[var(--muted)]">{{ DateText }}</div>
          </li>
        </ul>
      </div>
      <div class="flex flex-col gap-9">
        <router-link to="/" class="flex items-center cursor-pointer hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">home</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">HOME</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">map</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">MAP</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">star</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">FAVORIT</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">insert_chart</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">INSIGHTS</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-[var(--accent)]">
          <div class="material-symbols-rounded text-2xl pr-5">account_box</div>
          <div v-if="isSidebarOpen" class="text-lg font-semibold">MYPAGE</div>
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
    </div>
    <div class="flex items-center justify-between">
      <div v-if="isSidebarOpen" class="text-xs text-[var(--muted)]">© 2026, Festival Pulse</div>
      <button
        class="text-[var(--muted)] hover:text-[var(--text)] material-symbols-rounded text-3xl "
        @click="toggleSidebar"
      >
        {{ isSidebarOpen ? 'left_panel_close' : 'left_panel_open' }}
      </button>
    </div>
  </div>
</template>
