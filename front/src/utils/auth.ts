import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  type User,
} from 'firebase/auth'
import { auth } from '@/utils/firebase'

const REMEMBER_KEY = 'festival-auth-remember'

const getRememberPreference = (): boolean | null => {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(REMEMBER_KEY)
    if (value === 'true') return true
    if (value === 'false') return false
  } catch {
    return null
  }
  return null
}

const setRememberPreference = (remember: boolean) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
  } catch {
    // ignore storage failures
  }
}

export const applyAuthPersistence = async () => {
  const remember = getRememberPreference() ?? false
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
}

const setAuthPersistence = async (remember: boolean) => {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
  setRememberPreference(remember)
}

export const signIn = async (email: string, password: string, remember = false) => {
  await setAuthPersistence(remember)
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export const signUp = async (email: string, password: string) => {
  await setAuthPersistence(false)
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  return credential.user
}

export const signOutUser = async () => {
  await signOut(auth)
}

export const deleteCurrentUser = async () => {
  if (!auth.currentUser) return
  await deleteUser(auth.currentUser)
}

export const updateCurrentEmail = async (email: string) => {
  if (!auth.currentUser) return
  await updateEmail(auth.currentUser, email)
}

export const sendResetEmail = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}

export const getCurrentUser = () =>
  new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      (error) => {
        unsubscribe()
        reject(error)
      }
    )
  })
