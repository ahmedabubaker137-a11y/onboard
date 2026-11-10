import crypto from "crypto";

/**
 * OnboardX Enterprise Cryptographic Engine (AES-256-GCM)
 * Strictly fulfills Section 16 & Section 7.2 of OnboardX Enterprise Security Specification:
 * - Row-level authenticated encryption for sensitive PII (SSN, banking info, tax IDs)
 * - 256-bit AES cipher in Galois/Counter Mode (GCM)
 * - 96-bit unique cryptographically secure IV per encryption
 * - 128-bit authentication tag to prevent bit-flipping and tampering
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag

// Derive a 32-byte (256-bit) key from the environment key or fallback
function getEncryptionKey(): Buffer {
  const secret = process.env.PII_ENCRYPTION_KEY || "onboardx-default-secret-encryption-key-for-pii-production-sme-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: string;
  createdAt: string;
}

/**
 * Encrypt sensitive plain text using AES-256-GCM
 */
export function encryptPii(plainText: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    algorithm: ALGORITHM,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypt AES-256-GCM ciphertext verifying authentication tag
 */
export function decryptPii(payload: { ciphertext: string; iv: string; authTag: string }): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Mask Social Security Number: e.g. "123-45-6789" -> "•••-••-6789"
 */
export function maskSsn(ssn: string): string {
  const clean = ssn.replace(/\D/g, "");
  if (clean.length < 4) return "•••-••-••••";
  const last4 = clean.slice(-4);
  return `•••-••-${last4}`;
}

/**
 * Mask Bank Account Number: e.g. "9876543210" -> "••••••••3210"
 */
export function maskBankAccount(accountNum: string): string {
  const clean = accountNum.trim();
  if (clean.length <= 4) return "••••" + clean;
  const last4 = clean.slice(-4);
  return "•".repeat(Math.max(4, clean.length - 4)) + last4;
}

/**
 * One-way blinded HMAC hash for indexing/searching encrypted records without plaintext exposure
 */
export function hashBlindIndex(plainText: string): string {
  const key = getEncryptionKey();
  return crypto.createHmac("sha256", key).update(plainText.toLowerCase().trim()).digest("hex");
}
