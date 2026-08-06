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
  /**
   * Performs user login, creates an active session, and returns profile details.
   * Enforces a maximum of 2 active device sessions per user.
   */
  async login(credentials: LoginInput, deviceInfo: DeviceInfo) {
    console.log(`[authService] Login attempt for email: ${credentials.email}`)
    const user = await userRepository.findByEmail(credentials.email)
    if (!user || !user.is_active) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isValid = await verifyPassword(credentials.password, user.password_hash)
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Expire old inactive sessions first to get an accurate count
    await sessionRepository.deactivateExpiredSessions()

    // Enforce max 2 active devices limit
    const activeSessionCount = await sessionRepository.countActiveByUserId(user.id)
    if (activeSessionCount >= 2) {
      console.warn(`[authService] Device limit exceeded for user: ${user.id} (active sessions: ${activeSessionCount})`)
      throw new Error('DEVICE_LIMIT_EXCEEDED')
    }

    // Generate random UUID session token
    const sessionToken = crypto.randomUUID()
    
    // Set session expiry to 7 days from now
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    const expiresAt = expiry.toISOString()

    const session = await sessionRepository.create({
      user_id: user.id,
      token: sessionToken,
      device_identifier: deviceInfo.device_identifier,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip_address: deviceInfo.ip_address,
      location_metadata: deviceInfo.location_metadata,
      expires_at: expiresAt,
    })

    console.log(`[authService] Session ${session.id} created successfully for user ${user.id}`)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        force_password_change: user.force_password_change,
      },
      session_token: sessionToken,
      expires_at: expiresAt,
    }
  },

  /**
   * Invalidates the active session associated with the provided token.
   */
  async logout(token: string): Promise<void> {
    console.log(`[authService] Logout attempt with token: ${token.substring(0, 8)}...`)
    const session = await sessionRepository.findByToken(token)
    if (!session) {
      throw new Error('SESSION_NOT_FOUND')
    }

    await sessionRepository.deactivate(session.id)
    console.log(`[authService] Session ${session.id} deactivated successfully`)
  },

  /**
   * Retrieves the authenticated user profile if the session is active and not expired.
   */
  async getCurrentUser(token: string) {
    const session = await sessionRepository.findByToken(token)
    if (!session || !session.is_active) {
      throw new Error('UNAUTHORIZED')
    }

    // Verify session expiration
    if (new Date(session.expires_at) < new Date()) {
      // Deactivate expired session
      await sessionRepository.deactivate(session.id)
      throw new Error('UNAUTHORIZED')
    }

    const user = await userRepository.findById(session.user_id)
    if (!user || !user.is_active) {
      throw new Error('UNAUTHORIZED')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      force_password_change: user.force_password_change,
    }
  },

  /**
   * Lists all active (non-expired) sessions for the authenticated user.
   */
  async listSessions(token: string) {
    // 1. Verify caller session
    const user = await this.getCurrentUser(token)
    
    // 2. Clean up expired sessions first
    await sessionRepository.deactivateExpiredSessions()

    // 3. Fetch active sessions
    const sessions = await sessionRepository.findActiveByUserId(user.id)

    // 4. Sanitize list by omitting actual security tokens
    return sessions.map((s) => ({
      id: s.id,
      device_identifier: s.device_identifier,
      browser: s.browser,
      os: s.os,
      ip_address: s.ip_address,
      location_metadata: s.location_metadata,
      expires_at: s.expires_at,
      created_at: s.created_at,
    }))
  },

  /**
   * Revokes a specific session for the authenticated user by ID.
   */
  async revokeSession(token: string, sessionIdToRevoke: string): Promise<void> {
    const user = await this.getCurrentUser(token)

    const sessionToRevoke = await sessionRepository.findById(sessionIdToRevoke)
    if (!sessionToRevoke || sessionToRevoke.user_id !== user.id) {
      throw new Error('SESSION_NOT_FOUND')
    }

    await sessionRepository.deactivate(sessionIdToRevoke)
    console.log(`[authService] Session ${sessionIdToRevoke} revoked by user ${user.id}`)
  },

  /**
   * Revokes all active sessions for the authenticated user except the current one.
   */
  async revokeOtherSessions(token: string): Promise<void> {
    const user = await this.getCurrentUser(token)
    
    const currentSession = await sessionRepository.findByToken(token)
    if (!currentSession) {
      throw new Error('UNAUTHORIZED')
    }

    await sessionRepository.deactivateAllExcept(user.id, currentSession.id)
    console.log(`[authService] All sessions except ${currentSession.id} revoked for user ${user.id}`)
  },

  // -----------------------------------------------------------------------
  // Sprint 2.3 / Sprint 2.4 stubs — DO NOT implement here
  // -----------------------------------------------------------------------

  async refresh(refreshToken: string) {
    /*
      TODO (Sprint 2.3 - Refresh Tokens)
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
      TODO (Sprint 2.4 - Password Security)
      - Verify newPassword meets strength requirements via isPasswordStrong()
      - Hash the new password via hashPassword()
      - Call userRepository.updatePasswordHash(userId, hash)
      - Set force_password_change = false on the user record
    */
    throw new Error('Not implemented')
  },

  async requestPasswordReset(email: string): Promise<void> {
    console.log(`[authService] Password reset requested for email: ${email}`)
    const user = await userRepository.findByEmail(email)
    if (!user) {
      // Do not leak user existence. Return success silently.
      console.log(`[authService] Password reset request: Email not found, returning silently`)
      return
    }

    const resetToken = crypto.randomUUID()
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1) // 1 hour token validity
    const resetTokenExpiresAt = expiry.toISOString()

    await userRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpiresAt
    })

    console.log(`[authService] Secure reset token generated for user ${user.id}`)

    // TODO (Sprint 3 - Notifications): Send password reset email via Resend containing resetToken
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    console.log(`[authService] Password reset attempt with token: ${resetToken.substring(0, 8)}...`)
    
    const user = await userRepository.findByResetToken(resetToken)
    if (!user || !user.reset_token_expires_at) {
      throw new Error('INVALID_TOKEN')
    }

    // Check expiry
    if (new Date(user.reset_token_expires_at) < new Date()) {
      // Clear expired token fields
      await userRepository.update(user.id, {
        reset_token: null,
        reset_token_expires_at: null
      })
      throw new Error('EXPIRED_TOKEN')
    }

    // Validate password strength
    if (!isPasswordStrong(newPassword)) {
      throw new Error('WEAK_PASSWORD')
    }

    // Hash new password and save it
    const hashedPassword = await hashPassword(newPassword)
    await userRepository.updatePasswordHash(user.id, hashedPassword)

    // Clear reset token fields to invalidate it
    await userRepository.update(user.id, {
      reset_token: null,
      reset_token_expires_at: null
    })

    // Deactivate all active sessions for the user to force relogin
    await sessionRepository.deactivateAllForUser(user.id)

    console.log(`[authService] Password successfully reset for user ${user.id}. All active sessions invalidated.`)
  },
}
