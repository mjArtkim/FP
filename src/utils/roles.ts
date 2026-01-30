import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/utils/firebase'

export type UserRole = 'guest' | 'user' | 'admin'

const ROLE_CACHE_TTL_MS = 30_000
let cachedRole: { uid: string; role: UserRole; fetchedAt: number } | null = null

export const getProfileRole = async (uid: string): Promise<UserRole> => {
  const snapshot = await getDoc(doc(db, 'profiles', uid))
  if (!snapshot.exists()) return 'user'
  const data = snapshot.data() as { role?: string }
  return data.role === 'admin' ? 'admin' : 'user'
}

export const resolveUserRole = async (): Promise<UserRole> => {
  const user = auth.currentUser
  if (!user) return 'guest'
  if (cachedRole?.uid === user.uid && Date.now() - cachedRole.fetchedAt < ROLE_CACHE_TTL_MS) {
    return cachedRole.role
  }
  const role = await getProfileRole(user.uid)
  cachedRole = { uid: user.uid, role, fetchedAt: Date.now() }
  return role
}

export const clearRoleCache = () => {
  cachedRole = null
}
