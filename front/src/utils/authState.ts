import { ref } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/utils/firebase'
import { applyAuthPersistence } from '@/utils/auth'

const authUser = ref<User | null>(null)
const authReady = ref(false)
let initialized = false

const initAuthState = () => {
  if (initialized) return
  initialized = true
  void applyAuthPersistence()
  onAuthStateChanged(auth, (user) => {
    authUser.value = user
    authReady.value = true
  })
}

export { authUser, authReady, initAuthState }
