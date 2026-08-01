import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/lessons/$id/unpublish')({
  server: {
    handlers: {
      // POST /api/admin/lessons/:id/unpublish
      // Sets lesson status = draft
      POST: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          const updated = await lessonService.unpublish(params.id)
          return Response.json(updated)
        } catch (err) {
          if (err instanceof Error && err.message === 'LESSON_NOT_FOUND') {
            return Response.json(
              { error: 'Lesson not found' },
              { status: 404 }
            )
          }

          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      },
    },
  },
})