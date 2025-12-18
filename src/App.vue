<script setup lang="ts">
  import { ref } from 'vue'
  import Header from './components/unit/Header.vue'
  import MobileBar from './components/unit/MobileBar.vue'
  import { RouterView } from 'vue-router'
  import PcNavigatorVue from './components/unit/PcNavigator.vue'
</script>


<template>
  <div class="min-h-screen pc:flex pc:overflow-hidden bg-[var(--bg)] text-[var(--text)]">
    <aside
      class="hidden pc:flex pc:flex-col pc:shrink-0 border-r border-[var(--stroke)] bg-[var(--surface)] text-[var(--text)]"
    >
      <PcNavigatorVue/>
    </aside>
    <div class="flex-1 h-screen overflow-y-auto relative bg-[var(--bg)] text-[var(--text)] pb-24 pc:pb-0">
      <div class="block pc:hidden">
        <Header />
      </div>
      <RouterView />
      <MobileBar class="fixed bottom-0 left-0 w-full pc:hidden" />
    </div>
  </div>
</template>
