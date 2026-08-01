// TEMPORARY: requireEnrolled is a stub — see src/middleware/auth.ts.
// Filtering to status === 'published' so students never see draft/admin-only
// courses, even before real entitlement checks land.

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'

export const Route = createFileRoute('/api/student/courses')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const courses = await courseService.findAll()
          const published = courses.filter((c) => c.status === 'published')
          return Response.json(published)
        } catch (err) {
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})