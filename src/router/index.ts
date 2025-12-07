import { createRouter, createWebHistory } from 'vue-router'
import FirstView from '@/components/FirstView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FirstView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
