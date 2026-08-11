import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'
import { loginSchema } from '@/schemas/users'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const parsed = loginSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          const userAgent = request.headers.get('user-agent') ?? 'unknown'
          const ipAddress = request.headers.get('x-forwarded-for') ?? '127.0.0.1'

          const result = await authService.login(parsed.data, {
            device_identifier: body.device_identifier ?? 'Desktop App',
            browser: userAgent,
            os: 'Detected OS',
            ip_address: ipAddress,
            location_metadata: body.location_metadata ?? null,
          })

          // Setup secure cookie header configuration (30-day rolling session duration)
          const isProduction = process.env.APP_ENV !== 'development'
          const cookieOptions = [
            `session_token=${result.session_token}`,
            'HttpOnly',
            'Path=/',
            `Max-Age=${30 * 24 * 60 * 60}`, // 30 days in seconds
            'SameSite=Lax',
            ...(isProduction ? ['Secure'] : [])
          ].join('; ')

          console.log(`[login] Successful login for: ${parsed.data.email}. Setting 30-day session cookie.`)

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': cookieOptions
            }
          })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'INVALID_CREDENTIALS') {
              return Response.json({ error: 'Invalid email or password' }, { status: 401 })
            }
            if (err.message === 'TEMPORARY_CREDENTIAL_EXPIRED') {
              return Response.json({
                error: 'Your 72-hour temporary credential has expired. Please reset your password or contact support.',
                code: 'TEMPORARY_CREDENTIAL_EXPIRED',
              }, { status: 403 })
            }
            if (err.message === 'ACCOUNT_LOCKED') {
              return Response.json({ error: 'Account is locked. Contact support.' }, { status: 403 })
            }
            if (err.message === 'DEVICE_LIMIT_EXCEEDED') {
              return Response.json({ error: 'Active device session limit exceeded' }, { status: 400 })
            }
          }
          console.error('[login] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
