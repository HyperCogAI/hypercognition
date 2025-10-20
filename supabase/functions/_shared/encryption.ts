// Phase 1.3: Credential encryption helper using AES-GCM

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get('TELEGRAM_ENCRYPTION_KEY');
  if (!keyString) {
    throw new Error('TELEGRAM_ENCRYPTION_KEY not configured');
  }
  
  // Convert hex string to Uint8Array
  const keyData = new Uint8Array(
    keyString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedData
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedData: string): Promise<string> {
  const key = await getEncryptionKey();
  
  // Convert from base64
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  );
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decryptedData);
}
