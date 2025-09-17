const IV_LENGTH = 12; // bytes for AES-GCM
const SALT_LENGTH = 16; // bytes for PBKDF2
const HASH_ALGORITHM = 'SHA-256';
const PBKDF2_ITERATIONS = 100000;

// Helper to convert strings to ArrayBuffer
const textToArrayBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str);
};

// Helper to convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper to convert base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generates a new salt and hashes the password
export const hashPassword = async (password: string): Promise<{ hash: string, salt: string }> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    textToArrayBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM
    },
    keyMaterial,
    256 // derived key length in bits
  );

  return {
    hash: arrayBufferToBase64(hashBuffer),
    salt: arrayBufferToBase64(salt)
  };
};

// Verifies a password against a stored salt and hash
export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
    const saltBuffer = base64ToArrayBuffer(salt);
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        textToArrayBuffer(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const hashBuffer = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM
        },
        keyMaterial,
        256
    );

    const newHash = arrayBufferToBase64(hashBuffer);
    return newHash === hash;
};

// Derives an AES-GCM key from a password and salt for encryption/decryption
export const deriveEncryptionKey = async (password: string, salt: string): Promise<CryptoKey> => {
  const saltBuffer = base64ToArrayBuffer(salt);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    textToArrayBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypts data (string) using a CryptoKey
export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        textToArrayBuffer(data)
    );

    const ivBase64 = arrayBufferToBase64(iv);
    const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
    
    return JSON.stringify({ iv: ivBase64, data: encryptedDataBase64 });
};

// Decrypts data (string) using a CryptoKey
export const decryptData = async (encryptedJsonString: string, key: CryptoKey): Promise<string> => {
    try {
        const { iv: ivBase64, data: encryptedDataBase64 } = JSON.parse(encryptedJsonString);
        const iv = base64ToArrayBuffer(ivBase64);
        const encryptedData = base64ToArrayBuffer(encryptedDataBase64);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );
        
        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("Decryption failed:", e);
        throw new Error("Failed to decrypt data. The stored data may be corrupted or the key is incorrect.");
    }
};

// Converts a CryptoKey to a Base64 string for storage
export const keyToString = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
};

// Converts a Base64 string back into a CryptoKey
export const stringToKey = async (keyString: string): Promise<CryptoKey> => {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    true, // is extractable
    ['encrypt', 'decrypt']
  );
};
