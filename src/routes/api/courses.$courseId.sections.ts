import { createFileRoute } from '@tanstack/react-router'
import { sectionService } from '@/services/sections'

export const Route = createFileRoute('/api/courses/$courseId/sections')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const sections = await sectionService.findByCourseId(params.courseId)
          return Response.json(sections)
        } catch (err) {
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})