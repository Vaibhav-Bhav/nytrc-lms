// TEMPORARY: requireEnrolled is a stub — see src/middleware/auth.ts.
// Filtering to status === 'published' so students never see draft/admin-only
// courses, even before real entitlement checks land.

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { authenticate } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/courses')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          await authenticate(request)
          const courses = await courseService.findAll()
          const published = courses.filter((c) => c.status === 'published')
          return Response.json(published)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})