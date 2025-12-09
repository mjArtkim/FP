<script setup lang="ts">
  import Header from './components/unit/Header.vue'
  import MobileBar from './components/unit/MobileBar.vue';
  import { RouterView } from 'vue-router'
</script>


<template>
  <div class="h-screen overflow-y-auto relative">
    <Header></Header>
    <RouterView />
    <MobileBar class="fixed bottom-0"></MobileBar>
  </div>
</template>