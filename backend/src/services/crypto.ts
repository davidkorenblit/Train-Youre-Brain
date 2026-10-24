// ============================================================================
// CodeReview Arena - Maximum Security Cryptographic Engine
// Standards: AES-256-GCM with dynamic random 96-bit IVs (Web Crypto API)
// Protects all PII (Usernames, Emails) at rest in Supabase
// ============================================================================

const DEFAULT_SECRET_FALLBACK = "cr-arena-maximum-security-pii-key-2026-edge";

/**
 * Derives a raw CryptoKey from the secret string using SHA-256
 */
async function getEncryptionKey(secretString?: string): Promise<CryptoKey> {
  const secret = secretString || DEFAULT_SECRET_FALLBACK;
  const encoder = new TextEncoder();
  const rawHash = await crypto.subtle.digest("SHA-256", encoder.encode(secret));

  return crypto.subtle.importKey(
    "raw",
    rawHash,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Converts Uint8Array to hex string
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(uint8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Encrypts sensitive plaintext data with AES-256-GCM.
 * Output format: enc:v1:<12-byte-hex-iv>:<ciphertext-and-auth-tag-hex>
 */
export async function encryptPii(
  plaintext: string | null | undefined,
  secretKey?: string
): Promise<string | null> {
  if (!plaintext) return null;

  const key = await getEncryptionKey(secretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  const ivHex = bufferToHex(iv);
  const ciphertextHex = bufferToHex(ciphertextBuffer);

  return `enc:v1:${ivHex}:${ciphertextHex}`;
}

/**
 * Decrypts AES-256-GCM ciphertext back into cleartext.
 */
export async function decryptPii(
  encryptedString: string | null | undefined,
  secretKey?: string
): Promise<string | null> {
  if (!encryptedString) return null;
  if (!encryptedString.startsWith("enc:v1:")) {
    // Return as-is if not encrypted in this format (fallback/legacy)
    return encryptedString;
  }

  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 4) return encryptedString;

    const ivHex = parts[2];
    const ciphertextHex = parts[3];

    const iv = hexToBuffer(ivHex);
    const ciphertext = hexToBuffer(ciphertextHex);
    const key = await getEncryptionKey(secretKey);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err: any) {
    console.error("PII Decryption failure:", err.message);
    return null;
  }
}
