import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { updateCourseSchema } from '@/schemas/courses'
import { requireAdmin, isAdminRequest } from '@/middleware/auth'

export const Route = createFileRoute('/api/courses/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        try {
          const course = await courseService.findById(params.id)
          const isAdmin = await isAdminRequest(request)

          if (course.status !== 'published' && !isAdmin) {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }

          return Response.json(course)
        } catch (err) {
          if (err instanceof Error && err.message === 'COURSE_NOT_FOUND') {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      PUT: async ({ params, request }) => {
        await requireAdmin(request)
        try {
          const body = await request.json()
          const parsed = updateCourseSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const updated = await courseService.update(params.id, parsed.data)
          return Response.json(updated)
        } catch (err) {
          if (err instanceof Error && err.message === 'COURSE_NOT_FOUND') {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      DELETE: async ({ params, request }) => {
        await requireAdmin(request)
        try {
          await courseService.remove(params.id)
          return new Response(null, { status: 204 })
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