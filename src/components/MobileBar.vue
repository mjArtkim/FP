<script setup lang="ts"></script>
<template>
  <div class="p-5 absolute w-full bottom-0">
    <div class="b-bar py-[10px] px-8 flex justify-between items-center w-full relative overflow-hidden rounded-[35px]  bg-white/40 backdrop-blur-[10px] border border-white/30 shadow-[2px_2px_5px_rgba(0,0,0,0.2),inset_1px_1px_5px_rgba(255,255,255,0.2)]">
      <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
        <div class="material-symbols-rounded text-[30px]">home</div>
        <div class="text-xss font-gugi">HOME</div>
      </router-link>
      <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
        <div class="material-symbols-rounded pb-1 text-[30px]">map</div>
        <div class="text-xss font-gugi">MAP</div>
      </router-link>
      <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
        <div class="material-symbols-rounded pb-1 text-[30px]">star</div>
        <div class="text-xss font-gugi">FAVORIT</div>
      </router-link>
      <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
        <div class="material-symbols-rounded pb-1 text-[30px]">insert_chart</div>
        <div class="text-xss font-gugi">INSIGHTS</div>
      </router-link>
      <router-link to="#" class="min-w-[40px] flex flex-col items-center cursor-pointer hover:text-neonpink">
        <div class="material-symbols-rounded pb-1 text-[30px]">account_box</div>
        <div class="text-xss font-gugi">MYPAGE</div>
      </router-link>
    </div>
  </div>
</template>
<style scoped>

</style>