import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { newLessonSchema } from '@/schemas/lessons'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/lessons')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const parsed = newLessonSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const lesson = await lessonService.create(parsed.data)
          return Response.json(lesson, { status: 201 })
        } catch (err) {
          if (err instanceof Error && err.message === 'SECTION_NOT_FOUND') {
            return Response.json({ error: 'Section not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})