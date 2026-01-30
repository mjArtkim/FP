import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { decryptField, encryptField, type EncryptedField } from '@/utils/crypto'

type ProfileDoc = {
  fullName: string
  city: string
  country: string
  role?: 'user' | 'admin'
  emailEncrypted: EncryptedField | null
  phoneEncrypted: EncryptedField | null
  dobEncrypted: EncryptedField | null
  createdAt?: unknown
  updatedAt?: unknown
}

export type ProfileData = {
  fullName: string
  email: string
  phone: string
  dob: string
  city: string
  country: string
}

export const createProfile = async (uid: string, data: ProfileData) => {
  const payload: ProfileDoc = {
    fullName: data.fullName,
    city: data.city,
    country: data.country,
    role: 'user',
    emailEncrypted: await encryptField(uid, data.email),
    phoneEncrypted: await encryptField(uid, data.phone),
    dobEncrypted: await encryptField(uid, data.dob),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'profiles', uid), payload)
}

export const updateProfile = async (uid: string, data: ProfileData) => {
  await setDoc(
    doc(db, 'profiles', uid),
    {
      fullName: data.fullName,
      city: data.city,
      country: data.country,
      emailEncrypted: await encryptField(uid, data.email),
      phoneEncrypted: await encryptField(uid, data.phone),
      dobEncrypted: await encryptField(uid, data.dob),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export const getProfile = async (uid: string, fallbackEmail = '') => {
  const snapshot = await getDoc(doc(db, 'profiles', uid))
  if (!snapshot.exists()) {
    return null
  }
  const data = snapshot.data() as ProfileDoc
  const email = (await decryptField(uid, data.emailEncrypted)) || fallbackEmail
  const phone = await decryptField(uid, data.phoneEncrypted)
  const dob = await decryptField(uid, data.dobEncrypted)
  return {
    fullName: data.fullName ?? '',
    city: data.city ?? '',
    country: data.country ?? '',
    role: data.role === 'admin' ? 'admin' : 'user',
    email,
    phone,
    dob,
  }
}

export const deleteProfile = async (uid: string) => {
  await deleteDoc(doc(db, 'profiles', uid))
}
