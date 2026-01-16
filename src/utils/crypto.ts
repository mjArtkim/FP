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

const getStoredKey = (uid: string) => localStorage.getItem(`fp_key_${uid}`)
const setStoredKey = (uid: string, value: string) => localStorage.setItem(`fp_key_${uid}`, value)

const getOrCreateKey = async (uid: string) => {
  const stored = getStoredKey(uid)
  if (stored) {
    return crypto.subtle.importKey('raw', base64ToBytes(stored), 'AES-GCM', true, ['encrypt', 'decrypt'])
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const raw = await crypto.subtle.exportKey('raw', key)
  setStoredKey(uid, bufferToBase64(raw))
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
  } catch {
    return ''
  }
}

export const clearStoredKey = (uid: string) => {
  localStorage.removeItem(`fp_key_${uid}`)
}
