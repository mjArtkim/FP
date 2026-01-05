<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import topLogow from '@/assets/img/top_logo_w.svg'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LanguageToggle from '@/components/unit/LanguageToggle.vue'

const locations = ref('SEOUL.S.KOREA')
const today = new Date()
const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
const DateText = ref(formattedDate)

const themeMode = ref<'light' | 'dark'>('light')
let observer: MutationObserver | null = null

const syncTheme = () => {
  if (typeof document === 'undefined') return
  const mode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  themeMode.value = mode
}

onMounted(() => {
  if (typeof document === 'undefined') return
  syncTheme()
  observer = new MutationObserver(syncTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

const currentLogo = computed(() => (themeMode.value === 'dark' ? topLogow : topLogo))
</script>
<template>
  <div class="p-5">
    <div class="flex justify-between items-center">
      <router-link to="/"><img :src="currentLogo" class="h-8"/></router-link>
      <ul class="flex items-center gap-2">
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">location_on</div>
          <div class="font-gugi text-xs">{{ locations }}</div>
        </li>
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">date_range</div>
          <div class="font-gugi text-xs">{{ DateText }}</div>
        </li>
        <li class="flex items-center">
          <LanguageToggle />
        </li>
      </ul>
    </div>
  </div>
</template>
