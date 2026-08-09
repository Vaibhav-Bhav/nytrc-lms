// TEMPORARY: requireEnrolled is a stub — see src/middleware/auth.ts.
// Filtering to status === 'published' so students never see draft/admin-only
// courses, even before real entitlement checks land.

import { createFileRoute } from '@tanstack/react-router'
import { studentService } from '@/services/student'
import { authenticate, requireStudent } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/courses')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await authenticate(request)
        await requireStudent(request)

        try {
          const courses = await studentService.getEnrolledCourses(user.id)
          return Response.json(courses)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          console.error('[getEnrolledCourses] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})