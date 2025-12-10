import { createRouter, createWebHistory } from 'vue-router'
import FirstView from '@/components/FirstView.vue'
import FestivalDetail from '@/components/unit/FestivalDetail.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FirstView,
  },
    {
    path: '/festivaldetail',
    name: 'festivaldetail',
    component: FestivalDetail,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
