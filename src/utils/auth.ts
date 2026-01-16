import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  type User,
} from 'firebase/auth'
import { auth } from '@/utils/firebase'

export const signIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export const signUp = async (email: string, password: string) => {
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
