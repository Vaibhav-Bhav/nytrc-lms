import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { updateLessonSchema } from '@/schemas/lessons'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/lessons/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        await requireAdmin(request)

        try {
          const lesson = await lessonService.findById(params.id)
          return Response.json(lesson)
        } catch (err) {
          if (err instanceof Error && err.message === 'LESSON_NOT_FOUND') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      PUT: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const parsed = updateLessonSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const updated = await lessonService.update(params.id, parsed.data)
          return Response.json(updated)
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'TITLE_REQUIRED') {
              return Response.json({ error: 'Title is required' }, { status: 400 })
            }
            if (err.message === 'LESSON_NOT_FOUND') {
              return Response.json({ error: 'Lesson not found' }, { status: 404 })
            }
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      DELETE: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          await lessonService.remove(params.id)
          return new Response(null, { status: 204 })
        } catch (err) {
          if (err instanceof Error && err.message === 'LESSON_NOT_FOUND') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})