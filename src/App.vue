<script setup lang="ts">

  import Header from './components/unit/Header.vue'
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
    <div
      id="app-scroll"
      class="flex-1 overflow-y-auto pb-[60px] relative bg-[var(--bg)] text-[var(--text)] pc:pb-0"
      :class="{ 'overflow-hidden': $route?.name === 'mapresult', 'h-screen': $route?.name !== 'mapresult' }"
    >
      <div class="block pc:hidden">
        <Header />
      </div>
      <RouterView />
    </div>
  </div>
</template>
