// src/routes/api/courses.$id.ts

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'

export const Route = createFileRoute('/api/courses/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const course = await courseService.findById(params.id)
          return Response.json(course)
        } catch (err) {
          if (err instanceof Error && err.message === 'COURSE_NOT_FOUND') {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})