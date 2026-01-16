import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/utils/firebase'

export type UserRole = 'guest' | 'user' | 'admin'

let cachedRole: { uid: string; role: UserRole } | null = null

export const getProfileRole = async (uid: string): Promise<UserRole> => {
  const snapshot = await getDoc(doc(db, 'profiles', uid))
  if (!snapshot.exists()) return 'user'
  const data = snapshot.data() as { role?: string }
  return data.role === 'admin' ? 'admin' : 'user'
}

export const resolveUserRole = async (): Promise<UserRole> => {
  const user = auth.currentUser
  if (!user) return 'guest'
  if (cachedRole?.uid === user.uid) return cachedRole.role
  const role = await getProfileRole(user.uid)
  cachedRole = { uid: user.uid, role }
  return role
}

export const clearRoleCache = () => {
  cachedRole = null
}
