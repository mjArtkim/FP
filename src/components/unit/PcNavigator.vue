<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import { ref } from 'vue'
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
</script>
<template>
  <div class="relative transition-all duration-300 p-6 flex flex-col h-screen justify-between"
    :class="isSidebarOpen ? 'w-[300px]' : 'w-[80px]'"
    >
    <div>
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <router-link to="/"><img :src="topLogo" class="h-10"/></router-link>
          <div v-if="isSidebarOpen" class="font-gugi text-pulsedarkgray">Guest</div>
        </div>
        <ul class="py-6">
          <li class="flex items-center">
            <div class="material-symbols-rounded text-2xl pr-2">location_on</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs">{{ locations }}</div>
          </li>
          <li class="flex items-center">
            <div class="material-symbols-rounded text-2xl pr-2">date_range</div>
            <div  v-if="isSidebarOpen" class="font-gugi text-xs">{{ DateText }}</div>
          </li>
        </ul>
      </div>
      <div class="flex flex-col gap-10">
        <router-link to="/" class="flex items-center cursor-pointer hover:text-neonpink">
          <div class="material-symbols-rounded text-3xl pr-5">home</div>
          <div v-if="isSidebarOpen" class="text-xl font-gugi">HOME</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-neonpink">
          <div class="material-symbols-rounded pb-1 text-3xl pr-5">map</div>
          <div v-if="isSidebarOpen" class="text-xl font-gugi">MAP</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-neonpink">
          <div class="material-symbols-rounded pb-1 text-3xl pr-5">star</div>
          <div v-if="isSidebarOpen" class="text-xl font-gugi">FAVORIT</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-neonpink">
          <div class="material-symbols-rounded pb-1 text-3xl pr-5">insert_chart</div>
          <div v-if="isSidebarOpen" class="text-xl font-gugi">INSIGHTS</div>
        </router-link>
        <router-link to="#" class="flex items-center cursor-pointer hover:text-neonpink">
          <div class="material-symbols-rounded pb-1 text-3xl pr-5">account_box</div>
          <div v-if="isSidebarOpen" class="text-xl font-gugi">MYPAGE</div>
        </router-link>
      </div>
      <div class="flex items-center py-6">
        <div class="material-symbols-rounded text-3xl pr-5 transition-all duration-300" :class="isPowerOn ? 'text-neonpink' : 'text-pulseblue'">
          {{ isPowerOn ? 'dark_mode' : 'light_mode' }}
        </div>
        <div v-if="isSidebarOpen" class="text-xl font-gugi pr-5">Thema</div>
        <NeonSwitch v-model="isPowerOn" v-if="isSidebarOpen"/>
      </div>
    </div>
    <button
      class="text-pulsedarkgray hover:text-black material-symbols-rounded text-3xl self-end"
      @click="toggleSidebar"
    >
      {{ isSidebarOpen ? 'left_panel_close' : 'left_panel_open' }}
    </button>
  </div>
</template>