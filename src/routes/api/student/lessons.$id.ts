import { createFileRoute } from '@tanstack/react-router'
import { studentService } from '@/services/student'
import { authenticate, requireStudent } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/lessons/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        const user = await authenticate(request)
        await requireStudent(request)

        try {
          const detail = await studentService.getLessonDetail(user.id, params.id)
          return Response.json(detail)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'LESSON_NOT_FOUND') {
              return Response.json({ error: 'Lesson not found' }, { status: 404 })
            }
            if (err.message === 'FORBIDDEN') {
              return Response.json({ error: 'Forbidden: You are not enrolled in this course' }, { status: 403 })
            }
          }
          console.error('[getLessonDetail] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})