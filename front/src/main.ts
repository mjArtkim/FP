import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initAuthState } from '@/utils/authState'

initAuthState()

createApp(App)
  .use(router)
  .mount('#app')
