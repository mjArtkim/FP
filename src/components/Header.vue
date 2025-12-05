<script setup lang="ts">
import topLogo from '@/assets/img/top_logo_b.svg'
import { ref } from 'vue'

const locations = ref('SEOUL.S.KOREA')

</script>
<template>
  <div class="p-5">
    <div class="flex justify-between items-center">
      <img :src="topLogo" />
      <ul class="flex">
        <li class="flex">
          <div class="material-symbols-rounded">location_on</div>
          <div class="font-gugi" >{{ locations }}</div>
        </li>
        <li class="flex">
          <div class="material-symbols-rounded">date_range</div>
          <div>{{ locations }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped>
</style>