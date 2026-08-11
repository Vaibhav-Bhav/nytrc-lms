// src/middleware/auth.ts

import { authService } from '@/services/auth'
import { courseAccessRepository } from '@/repositories/courseAccess'

// Helper to extract session token from authorization header or cookies
function getSessionTokenFromRequest(request: Request): string | null {
  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }

  // 2. Try Cookie header
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, pair) => {
      const [key, val] = pair.split('=').map((c) => c.trim())
      if (key && val) acc[key] = val
      return acc
    }, {} as Record<string, string>)
    return cookies['session_token'] ?? null
  }

  return null
}

/**
 * Core authentication helper.
 * Validates the active session and attaches the user object to the request context
 * to prevent duplicate lookups downstream.
 * Enforces forced-password-change restriction for users with force_password_change = true.
 * Throws 401/403 JSON response on failure.
 */
export async function authenticate(request: Request) {
  // Return cached user if already authenticated in this request lifecycle
  if ((request as any).user) {
    return (request as any).user
  }

  const token = getSessionTokenFromRequest(request)
  if (!token) {
    console.warn(`[authMiddleware] Blocked request: Missing session token`)
    throw Response.json(
      { error: 'Unauthorized: Missing session token' },
      { status: 401 }
    )
  }

  let user
  try {
    user = await authService.getCurrentUser(token)
    ;(request as any).user = user
  } catch (err: any) {
    if (err?.message === 'TEMPORARY_CREDENTIAL_EXPIRED') {
      throw Response.json(
        { error: 'TEMPORARY_CREDENTIAL_EXPIRED', message: 'Your 72-hour temporary credential has expired. Please reset your password or contact support.' },
        { status: 403 }
      )
    }
    console.warn(`[authMiddleware] Blocked request: Invalid or expired session token`)
    throw Response.json(
      { error: 'Unauthorized: Session is invalid or expired' },
      { status: 401 }
    )
  }

  // Global Enforcement: If user must change password, restrict access to protected endpoints except change-password, logout, and me
  if (user.force_password_change) {
    const url = new URL(request.url)
    const allowedPaths = ['/api/auth/change-password', '/api/auth/logout', '/api/auth/me']
    const isAllowed = allowedPaths.some((path) => url.pathname.endsWith(path))

    if (!isAllowed) {
      console.warn(`[authMiddleware] Restricted access for user ${user.id}: Forced password change required.`)
      throw Response.json(
        {
          error: 'FORCED_PASSWORD_CHANGE_REQUIRED',
          message: 'You must change your temporary password before accessing LMS features.',
        },
        { status: 403 }
      )
    }
  }

  return user
}

/**
 * Reusable role-based authorization check.
 * Verifies that the authenticated user possesses at least one of the allowed roles.
 * Throws 403 JSON response if permissions are insufficient.
 */
export async function requireRole(request: Request, allowedRoles: ('admin' | 'student')[]) {
  const user = await authenticate(request)

  if (!allowedRoles.includes(user.role)) {
    console.warn(`[authMiddleware] Forbidden: User ${user.id} with role ${user.role} attempted to access restricted roles ${allowedRoles.join(', ')}`)
    throw Response.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    )
  }

  return user
}

/**
 * Restricts access to admin users only.
 */
export async function requireAdmin(request: Request): Promise<void> {
  await requireRole(request, ['admin'])
}

/**
 * Checks if the request comes from an authenticated admin without throwing errors.
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  try {
    const user = await authenticate(request)
    return user.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Restricts access to student users only.
 */
export async function requireStudent(request: Request): Promise<void> {
  await requireRole(request, ['student'])
}

/**
 * Restricts access to users enrolled in the specified course.
 * Admins bypass this check automatically.
 */
export async function requireEnrolled(request: Request, courseId: string): Promise<void> {
  const user = await authenticate(request)

  // Admin users bypass enrollment checks
  if (user.role === 'admin') {
    return
  }

  const access = await courseAccessRepository.findActiveByStudentAndCourse(user.id, courseId)
  if (!access) {
    console.warn(`[authMiddleware] Forbidden: Student ${user.id} attempted to access unenrolled course ${courseId}`)
    throw Response.json(
      { error: 'Forbidden: You do not have active enrollment access to this course' },
      { status: 403 }
    )
  }
}