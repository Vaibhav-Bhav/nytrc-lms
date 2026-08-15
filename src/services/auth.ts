// src/services/auth.ts

import { userRepository } from '@/repositories/user'
import { sessionRepository } from '@/repositories/session'
import { verifyPassword, hashPassword, isPasswordStrong } from '@/lib/password'
import { emailDispatcher } from '@/services/email/dispatcher'
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
   * Enforces a maximum of 2 active device sessions per user and 30-day session duration.
   */
  async login(credentials: LoginInput, deviceInfo: DeviceInfo) {
    console.log(`[authService] Login attempt for email: ${credentials.email}`)
    const user = await userRepository.findByEmail(credentials.email)
    if (!user || !user.is_active) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Check temporary credential 72-hour expiration if forced password change is active
    if (user.force_password_change && user.reset_token_expires_at) {
      if (new Date(user.reset_token_expires_at) < new Date()) {
        console.warn(`[authService] Temporary credential expired for user ${user.id} at ${user.reset_token_expires_at}`)
        throw new Error('TEMPORARY_CREDENTIAL_EXPIRED')
      }
    }

    const isValid = await verifyPassword(credentials.password, user.password_hash)
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Expire old inactive sessions first to get an accurate count
    await sessionRepository.deactivateExpiredSessions()

    // Check if there is an existing active session for this device and deactivate it
    const existingSessions = await sessionRepository.findActiveByUserId(user.id)
    const existingDeviceSession = existingSessions.find(
      (s) => s.device_identifier === deviceInfo.device_identifier
    )

    if (existingDeviceSession) {
      console.log(`[authService] Found existing session for device ${deviceInfo.device_identifier}. Deactivating old session.`)
      await sessionRepository.deactivate(existingDeviceSession.id)
    }

    // Enforce max 2 active devices limit
    const activeSessionCount = await sessionRepository.countActiveByUserId(user.id)
    if (activeSessionCount >= 2) {
      console.warn(`[authService] Device limit exceeded for user: ${user.id} (active sessions: ${activeSessionCount})`)
      throw new Error('DEVICE_LIMIT_EXCEEDED')
    }

    // Generate random UUID session token
    const sessionToken = crypto.randomUUID()

    // 30-day rolling session expiry calculation
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)
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

    console.log(`[authService] Session ${session.id} created successfully for user ${user.id} (expires ${expiresAt})`)

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
    console.log(`[authService] Logout attempt received`)
    const session = await sessionRepository.findByToken(token)
    if (!session) {
      throw new Error('SESSION_NOT_FOUND')
    }

    await sessionRepository.deactivate(session.id)
    console.log(`[authService] Session ${session.id} deactivated successfully`)
  },

  /**
   * Retrieves the authenticated user profile if the session is active and not expired.
   * Refreshes session expiry to 30 days on every valid request (Rolling 30-Day Session Expiry).
   */
  async getCurrentUser(token: string) {
    const session = await sessionRepository.findByToken(token)
    if (!session || !session.is_active) {
      throw new Error('UNAUTHORIZED')
    }

    // Verify session expiration
    if (new Date(session.expires_at) < new Date()) {
      await sessionRepository.deactivate(session.id)
      throw new Error('UNAUTHORIZED')
    }

    const user = await userRepository.findById(session.user_id)
    if (!user || !user.is_active) {
      throw new Error('UNAUTHORIZED')
    }

    // Enforce 72-hour temporary credential expiry for accounts requiring forced password change
    if (user.force_password_change && user.reset_token_expires_at) {
      if (new Date(user.reset_token_expires_at) < new Date()) {
        console.warn(`[authService] Temporary credential expired during getCurrentUser for user ${user.id}`)
        await sessionRepository.deactivate(session.id)
        throw new Error('TEMPORARY_CREDENTIAL_EXPIRED')
      }
    }

    // Refresh 30-day rolling session expiry on valid authenticated activity
    const newExpiry = new Date()
    newExpiry.setDate(newExpiry.getDate() + 30)
    const newExpiresAt = newExpiry.toISOString()
    await sessionRepository.updateExpiry(session.id, newExpiresAt).catch((err) => {
      console.warn(`[authService] Could not refresh rolling session expiry for ${session.id}:`, err)
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      force_password_change: user.force_password_change,
    }
  },

  /**
   * Password change method for authenticated users (Sprint 5.5).
   * Validates current password, enforces password strength, clears force_password_change,
   * and clears reset_token_expires_at upon success.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId)
    if (!user || !user.is_active) {
      throw new Error('UNAUTHORIZED')
    }

    // Check temporary credential 72-hour expiry
    if (user.force_password_change && user.reset_token_expires_at) {
      if (new Date(user.reset_token_expires_at) < new Date()) {
        throw new Error('TEMPORARY_CREDENTIAL_EXPIRED')
      }
    }

    // 1. Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash)
    if (!isValid) {
      throw new Error('INVALID_CURRENT_PASSWORD')
    }

    // 2. Prevent setting new password equal to current password
    if (currentPassword === newPassword) {
      throw new Error('PASSWORD_SAME_AS_CURRENT')
    }

    // 3. Validate password strength policy
    if (!isPasswordStrong(newPassword)) {
      throw new Error('PASSWORD_POLICY_FAILED')
    }

    // 4. Hash new password securely
    const newHash = await hashPassword(newPassword)
    await userRepository.updatePasswordHash(user.id, newHash)

    // 5. Clear forced password change flag & temporary credential expiration
    await userRepository.update(user.id, {
      force_password_change: false,
      reset_token_expires_at: null,
      reset_token: null,
    })

    console.log(`[authService] Password successfully updated and force_password_change cleared for user ${user.id}`)
  },

  /**
   * Lists all active (non-expired) sessions for the authenticated user.
   */
  async listSessions(token: string) {
    const user = await this.getCurrentUser(token)
    await sessionRepository.deactivateExpiredSessions()
    const sessions = await sessionRepository.findActiveByUserId(user.id)
    const currentSession = await sessionRepository.findByToken(token)

    return sessions.map((s) => ({
      id: s.id,
      device_identifier: s.device_identifier,
      browser: s.browser,
      os: s.os,
      ip_address: s.ip_address,
      location_metadata: s.location_metadata,
      expires_at: s.expires_at,
      created_at: s.created_at,
      is_current_device: currentSession ? s.id === currentSession.id : false,
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

  async refresh(refreshToken: string) {
    throw new Error('Not implemented')
  },

  async forcePasswordChange(userId: string, newPassword: string): Promise<void> {
    const newHash = await hashPassword(newPassword)
    await userRepository.updatePasswordHash(userId, newHash)
    await userRepository.update(userId, {
      force_password_change: false,
      reset_token_expires_at: null,
    })
  },

  async requestPasswordReset(email: string): Promise<void> {
    console.log(`[authService] Password reset requested for email: ${email}`)
    const user = await userRepository.findByEmail(email)
    if (!user) {
      console.log(`[authService] Password reset request: Email not found, returning silently`)
      return
    }

    const resetToken = crypto.randomUUID()
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)
    const resetTokenExpiresAt = expiry.toISOString()

    await userRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpiresAt,
    })

    try {
      const baseUrl = process.env['APP_URL'] || 'http://localhost:3000'
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`
      
      await emailDispatcher.sendPasswordResetEmail(user.id, {
        userName: user.name || 'Student',
        email: user.email,
        resetUrl: resetLink,
        expiresInMinutes: 60,
      })
      console.log(`[authService] Password reset email dispatched to ${user.email}`)
    } catch (emailErr) {
      console.error('[authService] Failed to send password reset email:', emailErr)
    }
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    console.log('[authService] Password reset attempt received')
    const user = await userRepository.findByResetToken(resetToken)
    if (!user || !user.reset_token_expires_at) {
      throw new Error('INVALID_TOKEN')
    }

    if (new Date(user.reset_token_expires_at) < new Date()) {
      await userRepository.update(user.id, {
        reset_token: null,
        reset_token_expires_at: null,
      })
      throw new Error('EXPIRED_TOKEN')
    }

    if (!isPasswordStrong(newPassword)) {
      throw new Error('WEAK_PASSWORD')
    }

    const hashedPassword = await hashPassword(newPassword)
    await userRepository.updatePasswordHash(user.id, hashedPassword)

    await userRepository.update(user.id, {
      reset_token: null,
      reset_token_expires_at: null,
      force_password_change: false,
    })

    await sessionRepository.deactivateAllForUser(user.id)
    console.log(`[authService] Password successfully reset for user ${user.id}. All active sessions invalidated.`)
  },
}
