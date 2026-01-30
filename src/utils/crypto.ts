const encoder = new TextEncoder()
const decoder = new TextDecoder()

const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array) => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const base64ToBytes = (base64: string) => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const DB_NAME = 'festival_key_store'
const DB_STORE = 'keys'
const memoryKeyCache = new Map<string, CryptoKey>()

export class KeyStorageError extends Error {
  constructor(message = 'Secure storage unavailable.') {
    super(message)
    this.name = 'KeyStorageError'
  }
}

const openKeyDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const assertKeyStorageAvailable = async () => {
  if (typeof indexedDB === 'undefined') {
    throw new KeyStorageError()
  }
  try {
    const db = await openKeyDb()
    db.close?.()
  } catch {
    throw new KeyStorageError()
  }
}

const getStoredKey = async (uid: string) => {
  const cached = memoryKeyCache.get(uid)
  if (cached) return cached
  if (typeof localStorage !== 'undefined') {
    const legacy = localStorage.getItem(`fp_key_${uid}`)
    if (legacy) {
      try {
        const imported = await crypto.subtle.importKey('raw', base64ToBytes(legacy), 'AES-GCM', false, [
          'encrypt',
          'decrypt',
        ])
        await setStoredKey(uid, imported)
        localStorage.removeItem(`fp_key_${uid}`)
        return imported
      } catch {
        localStorage.removeItem(`fp_key_${uid}`)
      }
    }
  }
  if (typeof indexedDB === 'undefined') return null
  const db = await openKeyDb()
  return new Promise<CryptoKey | null>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const request = tx.objectStore(DB_STORE).get(uid)
    request.onsuccess = () => resolve((request.result as CryptoKey | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

const setStoredKey = async (uid: string, key: CryptoKey) => {
  memoryKeyCache.set(uid, key)
  if (typeof indexedDB === 'undefined') return
  const db = await openKeyDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).put(key, uid)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const getOrCreateKey = async (uid: string) => {
  await assertKeyStorageAvailable()
  const stored = await getStoredKey(uid)
  if (stored) {
    return stored
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  await setStoredKey(uid, key)
  return key
}

export type EncryptedField = {
  iv: string
  value: string
}

export const encryptField = async (uid: string, value: string) => {
  if (!value) return null
  const key = await getOrCreateKey(uid)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(value))
  return {
    iv: bufferToBase64(iv),
    value: bufferToBase64(encrypted),
  }
}

export const decryptField = async (uid: string, payload: EncryptedField | null | undefined) => {
  if (!payload?.iv || !payload?.value) return ''
  try {
    const key = await getOrCreateKey(uid)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
      key,
      base64ToBytes(payload.value)
    )
    return decoder.decode(decrypted)
  } catch (error) {
    if (error instanceof KeyStorageError) {
      throw error
    }
    return ''
  }
}

export const clearStoredKey = async (uid: string) => {
  memoryKeyCache.delete(uid)
  if (typeof indexedDB === 'undefined') return
  const db = await openKeyDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).delete(uid)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
