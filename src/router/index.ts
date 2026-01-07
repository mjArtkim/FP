import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import FirstView from '@/components/FirstView.vue'
import FestivalDetail from '@/components/unit/FestivalDetail.vue'
import ArtistDetail from '@/components/unit/ArtistDetail.vue'
import Favorit from '@/components/unit/Favorit.vue'
import Map from '@/components/unit/Map.vue'

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
    {
    path: '/map',
    name: 'map',
    component: Map,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0 }
  },
})

const detailRoutes = new Set(['festivaldetail', 'artistdetail'])

router.afterEach((to) => {
  if (!detailRoutes.has(String(to.name))) {
    return
  }

  nextTick(() => {
    const scrollContainer = document.getElementById('app-scroll')
    if (scrollContainer) {
      scrollContainer.scrollTop = 0
      return
    }

    window.scrollTo({ top: 0 })
  })
})

export default router
