// src/lib/password.ts

import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * Hashes a plain text password using Node's native scrypt algorithm.
 * Returns a string formatted as "salt:hash".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verifies a plain text password against a stored "salt:hash" formatted string.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  if (!salt || !key) return false
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  const keyBuffer = Buffer.from(key, 'hex')
  return timingSafeEqual(derivedKey, keyBuffer)
}

/**
 * Generates a cryptographically secure temporary password.
 */
export function generateTemporaryPassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  const bytes = randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length]
  }
  return password
}

/**
 * Validates password strength parameters.
 * Requirements: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.
 */
export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasUppercase && hasLowercase && hasNumber
}
