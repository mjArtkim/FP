<script setup lang="ts">
  import Header from './components/partone/Header.vue'
  import MobileBar from './components/partone/MobileBar.vue';
  import { RouterView } from 'vue-router'
</script>


<template>
  <div class="h-screen overflow-y-auto relative">
    <Header></Header>
    <RouterView />
    <MobileBar></MobileBar>
  </div>
</template>