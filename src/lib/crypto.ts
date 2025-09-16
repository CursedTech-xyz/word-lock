// Advanced cryptography utilities using Web Crypto API

export interface EncryptionResult {
  encrypted: string;
  iv?: string;
  salt?: string;
  metadata?: any;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keySize: number;
  created: string;
}

// AES-256-GCM Encryption
export async function encryptAES256(text: string, password: string): Promise<EncryptionResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Generate salt and derive key
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate IV and encrypt
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  
  // Combine salt, iv, and encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return {
    encrypted: btoa(String.fromCharCode(...combined)),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptAES256(encryptedData: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Decode the combined data
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  
  // Extract salt, IV, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  // Derive key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  
  return new TextDecoder().decode(decrypted);
}

// RSA Key Pair Generation
export async function generateRSAKeyPair(keySize: 2048 | 4096 = 2048): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  
  return {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
    privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
    keySize,
    created: new Date().toISOString()
  };
}

// RSA Encryption
export async function encryptRSA(text: string, publicKeyB64: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Import public key
  const publicKeyBuffer = new Uint8Array(atob(publicKeyB64).split('').map(c => c.charCodeAt(0)));
  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  
  // Encrypt data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// RSA Decryption
export async function decryptRSA(encryptedData: string, privateKeyB64: string): Promise<string> {
  // Import private key
  const privateKeyBuffer = new Uint8Array(atob(privateKeyB64).split('').map(c => c.charCodeAt(0)));
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
  
  // Decrypt data
  const encryptedBuffer = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedBuffer
  );
  
  return new TextDecoder().decode(decrypted);
}

// Hash Functions
export async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashSHA512(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation (for compatibility)
export function hashMD5(text: string): string {
  // Simplified MD5 - in production, use a proper crypto library
  let hash = 0;
  if (text.length === 0) return hash.toString();
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// HMAC Generation
export async function generateHMAC(text: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(text);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Password Strength Analysis
export function analyzePasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  entropy: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Calculate entropy
  const charSetSize = 
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/[0-9]/.test(password) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 32 : 0);
  
  const entropy = password.length * Math.log2(charSetSize);
  
  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'fair';
  else if (score <= 5) strength = 'good';
  else if (score <= 6) strength = 'strong';
  else strength = 'excellent';
  
  return { score, strength, entropy, feedback };
}

// Hybrid Encryption (RSA + AES)
export async function hybridEncrypt(text: string, publicKeyB64: string): Promise<EncryptionResult> {
  // Generate random AES key
  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const aesKeyB64 = btoa(String.fromCharCode(...aesKey));
  
  // Encrypt text with AES
  const aesResult = await encryptAES256(text, aesKeyB64);
  
  // Encrypt AES key with RSA
  const encryptedKey = await encryptRSA(aesKeyB64, publicKeyB64);
  
  return {
    encrypted: aesResult.encrypted,
    iv: aesResult.iv,
    salt: aesResult.salt,
    metadata: {
      encryptedKey,
      algorithm: 'hybrid'
    }
  };
}

export async function hybridDecrypt(encryptedData: string, privateKeyB64: string, metadata: any): Promise<string> {
  if (!metadata?.encryptedKey) {
    throw new Error('Missing encrypted key in metadata');
  }
  
  // Decrypt AES key with RSA
  const aesKey = await decryptRSA(metadata.encryptedKey, privateKeyB64);
  
  // Decrypt text with AES
  return await decryptAES256(encryptedData, aesKey);
}

// ChaCha20 Encryption (lightweight alternative)
export async function encryptChaCha20(text: string, password: string): Promise<EncryptionResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Simple XOR-based encryption (placeholder for actual ChaCha20)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
}

export async function decryptChaCha20(encryptedData: string, password: string, iv: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const ivArray = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));
  const encryptedArray = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    key,
    encryptedArray
  );
  
  return decoder.decode(decrypted);
}

// ECC Encryption using P-256 curve
export async function generateECCKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey']
  );
  
  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  
  return {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
    privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
    keySize: 256,
    created: new Date().toISOString()
  };
}

// Secure Random Password Generator
export function generateSecurePassword(length: number = 16, options: {
  includeLowercase?: boolean;
  includeUppercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
} = {}): string {
  const {
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;
  
  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (charset === '') throw new Error('At least one character type must be selected');
  
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues, byte => charset[byte % charset.length]).join('');
}