import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'

export const Route = createFileRoute('/api/sections/$sectionId/lessons')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const lessons = await lessonService.findBySectionId(params.sectionId)
          return Response.json(lessons)
        } catch (err) {
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})