import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import FirstView from '@/components/FirstView.vue'
import FestivalDetail from '@/components/unit/FestivalDetail.vue'
import ArtistDetail from '@/components/unit/ArtistDetail.vue'
import Favorit from '@/components/unit/Favorit.vue'
import FavoArtist from '@/components/unit/FavoArtist.vue'
import FavoFestival from '@/components/unit/FavoFestival.vue'
import Map from '@/components/unit/Map.vue'
import MapResult from '@/components/unit/MapResult.vue'
import Insights from '@/components/unit/Insights.vue'
import Mypage from '@/components/unit/MyPage.vue'
import Login from '@/components/unit/Login.vue'
import Signup from '@/components/unit/Signup.vue'
import { getCurrentUser } from '@/utils/auth'
import { resolveUserRole } from '@/utils/roles'

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
    meta: { requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/favorite/artists',
    name: 'favorite-artists',
    component: FavoArtist,
    meta: { requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/favorite/festivals',
    name: 'favorite-festivals',
    component: FavoFestival,
    meta: { requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/map',
    name: 'map',
    component: Map,
  },
  {
    path: '/map/result',
    name: 'mapresult',
    component: MapResult,
  },
  {
    path: '/insights',
    name: 'insights',
    component: Insights,
    meta: { requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: Mypage,
    meta: { requiresAuth: true, roles: ['user', 'admin'] },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
    meta: { guestOnly: true },
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

router.beforeEach(async (to) => {
  if (to.meta?.requiresAuth) {
    const user = await getCurrentUser()
    if (!user) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  const roles = to.meta?.roles as string[] | undefined
  if (roles?.length) {
    const role = await resolveUserRole()
    if (!roles.includes(role)) {
      if (role === 'guest') {
        return { name: 'login', query: { redirect: to.fullPath } }
      }
      return { name: 'home' }
    }
  }

  if (to.meta?.guestOnly) {
    const user = await getCurrentUser()
    if (user) {
      return { name: 'home' }
    }
  }
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
