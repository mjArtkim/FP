<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import { ref } from 'vue'

const locations = ref('SEOUL.S.KOREA')
const today = new Date()
const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
const DateText = ref(formattedDate)
  const isSidebarOpen = ref(true)
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
</script>
<template>
  <div class="p-5">
    <div class="w-[300px]"
      :class="isSidebarOpen ? 'w-[300px]' : 'w-[50px]'"
      >
      <button
          class="p-3 text-pulsedarkgray hover:text-black material-symbols-rounded text-[28px]"
          @click="toggleSidebar"
        >
          {{ isSidebarOpen ? 'left_panel_close' : 'left_panel_open' }}
        </button>
      <div class="flex items-center">
        <router-link to="/"><img :src="topLogo" class="h-8"/></router-link>
        <div class="font-gugi text-pulsedarkgray">Guest</div>
      </div>
      <ul class="flex">
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">location_on</div>
          <div class="font-gugi text-xs">{{ locations }}</div>
        </li>
        <li class="flex items-center px-1">
          <div class="material-symbols-rounded text-sm px-2">date_range</div>
          <div class="font-gugi text-xs">{{ DateText }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>