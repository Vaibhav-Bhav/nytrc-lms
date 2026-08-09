// src/routes/api/courses.ts

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'

export const Route = createFileRoute('/api/courses')({
  server: {
    handlers: {
      GET: async () => {
        const courses = await courseService.findAll()
        return Response.json(courses)
      },
    },
  },
})