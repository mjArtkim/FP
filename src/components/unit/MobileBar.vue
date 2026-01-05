<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const isDetailPage = computed(() => {
  const detailRoutes = ['festivaldetail', 'artistdetail']
  return detailRoutes.includes(String(route.name))
})

const goBack = () => {
  // Prefer browser history when available, otherwise go home
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
<template>
  <div class="p-5">
    <div class="b-bar">
      <template v-if="isDetailPage">
        <button
          type="button"
          class="w-[70px] h-[70px] flex flex-col items-center justify-center cursor-pointer hover:text-neonpink bg-white/30 rounded-full backdrop-blur-[5px] border border-white/30 shadow-[2px_2px_5px_rgba(0,0,0,0.2),inset_1px_1px_5px_rgba(255,255,255,0.5)]"
          @click="goBack"
        >
          <div class="material-symbols-rounded text-[30px]">arrow_back_ios_new</div>
          <div class="text-xss font-gugi">{{ t('nav.back') }}</div>
        </button>
      </template>
      <template v-else>
        <div class="w-full">
          <div
            class="b-bar py-[10px] px-6 flex justify-between items-center w-full relative overflow-hidden bg-white/30 rounded-full backdrop-blur-[5px] border border-white/30 shadow-[2px_2px_5px_rgba(0,0,0,0.2),inset_1px_1px_5px_rgba(255,255,255,0.5)]"
          >
          <router-link to="/" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
            <div class="material-symbols-rounded text-[30px]">home</div>
            <div class="text-xss font-gugi">{{ t('nav.home') }}</div>
          </router-link>
          <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
            <div class="material-symbols-rounded pb-1 text-[30px]">map</div>
            <div class="text-xss font-gugi">{{ t('nav.map') }}</div>
          </router-link>
          <router-link to="/favorite" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
            <div class="material-symbols-rounded pb-1 text-[30px]">star</div>
            <div class="text-xss font-gugi">{{ t('nav.favorite') }}</div>
          </router-link>
          <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
            <div class="material-symbols-rounded pb-1 text-[30px]">insert_chart</div>
            <div class="text-xss font-gugi">{{ t('nav.insights') }}</div>
          </router-link>
          <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
            <div class="material-symbols-rounded pb-1 text-[30px]">account_box</div>
            <div class="text-xss font-gugi">{{ t('nav.mypage') }}</div>
          </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
