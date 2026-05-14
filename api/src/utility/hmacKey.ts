const encoder = new TextEncoder()
const keyCache = new Map<string, Promise<CryptoKey>>()

export const encodeText = (value: string) => encoder.encode(value)

export function getHmacKey(secret: string) {
  const cached = keyCache.get(secret)
  if (cached) return cached

  const key = crypto.subtle.importKey(
    'raw',
    encodeText(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  keyCache.set(secret, key)
  return key
}
