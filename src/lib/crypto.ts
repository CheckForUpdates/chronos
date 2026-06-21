export const ITERATIONS = 600000;

export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<{ ciphertext: string, iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer)
  };
}

export async function decrypt(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const encryptedData = base64ToBuffer(ciphertextBase64);
  const iv = base64ToBuffer(ivBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function signMetadata(metadata: object, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(metadata));
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signature = await crypto.subtle.sign('HMAC', hmacKey, data);
  return bufferToBase64(signature);
}

export interface ChronosCapsule {
  version: number;
  metadata: {
    title: string;
    unlockDate: string;
    salt: string;
    hint: string;
  };
  payload: {
    ciphertext: string;
    iv: string;
  };
  hmac: string;
}

export async function createCapsuleFile(
  title: string, 
  message: string, 
  unlockDateStr: string, 
  passphrase: string,
  hint: string
): Promise<ChronosCapsule> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  
  const { ciphertext, iv } = await encrypt(message, key);
  
  const metadata = {
    title,
    unlockDate: unlockDateStr,
    salt: bufferToBase64(salt.buffer),
    hint
  };

  const hmac = await signMetadata(metadata, key);

  return {
    version: 1,
    metadata,
    payload: { ciphertext, iv },
    hmac
  };
}

export async function openCapsule(capsule: ChronosCapsule, passphrase: string): Promise<string> {
  const salt = base64ToBuffer(capsule.metadata.salt);
  const key = await deriveKey(passphrase, new Uint8Array(salt));
  
  // Verify HMAC first
  const expectedHmac = await signMetadata(capsule.metadata, key);
  if (expectedHmac !== capsule.hmac) {
    throw new Error('Invalid passphrase or corrupted capsule metadata.');
  }

  // Decrypt payload
  return await decrypt(capsule.payload.ciphertext, capsule.payload.iv, key);
}
