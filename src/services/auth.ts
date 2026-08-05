// src/services/auth.ts

import { userRepository } from '@/repositories/user'
import { sessionRepository } from '@/repositories/session'
import { verifyPassword, hashPassword, isPasswordStrong } from '@/lib/password'
import type { LoginInput } from '@/schemas/users'

type DeviceInfo = {
  device_identifier: string
  browser: string
  os: string
  ip_address: string
  location_metadata: unknown
}

export const authService = {
  async login(credentials: LoginInput, deviceInfo: DeviceInfo) {
    const user = await userRepository.findByEmail(credentials.email)
    if (!user || !user.is_active) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isValid = await verifyPassword(credentials.password, user.password_hash)
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // TODO (Sprint 1.2 - Sessions): Generate real JWT access token + refresh token
    // TODO (Sprint 1.2 - Sessions): Enforce device session limit (max active sessions per user)
    // TODO (Sprint 1.2 - Sessions): Create session record in sessionRepository

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        force_password_change: user.force_password_change,
      },
      // TODO (Sprint 1.2): Replace with real JWT tokens
      access_token: 'placeholder_access_token',
      refresh_token: 'placeholder_refresh_token',
    }
  },

  async logout(token: string): Promise<void> {
    /*
      TODO (Sprint 1.2 - Sessions)
      - Look up the session by token in sessionRepository
      - Deactivate the session via sessionRepository.deactivate(session.id)
    */
    throw new Error('Not implemented')
  },

  async refresh(refreshToken: string) {
    /*
      TODO (Sprint 1.2 - Sessions)
      - Look up the session by refresh_token in sessionRepository
      - If not found or expired, throw 'INVALID_REFRESH_TOKEN'
      - Generate a new access token (JWT)
      - Optionally rotate the refresh token
      - Update the session record
      - Return new tokens
    */
    throw new Error('Not implemented')
  },

  async forcePasswordChange(userId: string, newPassword: string): Promise<void> {
    /*
      TODO (Sprint 1.3 - Password Security)
      - Verify newPassword meets strength requirements via isPasswordStrong()
      - Hash the new password via hashPassword()
      - Call userRepository.updatePasswordHash(userId, hash)
      - Set force_password_change = false on the user record
    */
    throw new Error('Not implemented')
  },

  async requestPasswordReset(email: string): Promise<void> {
    /*
      TODO (Sprint 1.3 - Password Security)
      - Look up user by email in userRepository
      - If user not found, silently return (do not leak user existence)
      - Generate a time-limited password reset token
      - Store the token against the user record
      - TODO (Sprint 3 - Notifications): Send password reset email via Resend
    */
    throw new Error('Not implemented')
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    /*
      TODO (Sprint 1.3 - Password Security)
      - Verify the reset token is valid and not expired
      - Verify newPassword meets strength requirements via isPasswordStrong()
      - Hash the new password via hashPassword()
      - Call userRepository.updatePasswordHash(userId, hash)
      - Invalidate the reset token
    */
    throw new Error('Not implemented')
  },
}
