import { createRouter, createWebHistory } from 'vue-router'
import FirstView from '@/components/FirstView.vue'
import FestivalDetail from '@/components/unit/FestivalDetail.vue'
import ArtistDetail from '@/components/unit/ArtistDetail.vue'
import Favorit from '@/components/unit/Favorit.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FirstView,
  },
  {
    path: '/festivaldetail/:id',
    name: 'festivaldetail',
    component: FestivalDetail,
    props: true,
  },
  {
    path: '/artist/:slug',
    name: 'artistdetail',
    component: ArtistDetail,
    props: true,
  },
  {
    path: '/favorite',
    name: 'favorite',
    component: Favorit,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
