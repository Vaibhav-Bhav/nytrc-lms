import { createFileRoute } from '@tanstack/react-router'
import { progressService } from '@/services/progress'
import { authenticate, requireStudent, requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/courses/$id/progress')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        // 1. Authenticate user session
        const user = await authenticate(request)

        // 2. Authorize student role
        await requireStudent(request)

        // 3. Authorize course access entitlement
        const courseId = params.id
        await requireEnrolled(request, courseId)

        try {
          // 4. Calculate progress percentage
          const result = await progressService.calculateCourseCompletion(user.id, courseId)
          return Response.json(result)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'COURSE_NOT_FOUND') {
              return Response.json({ error: 'Course not found' }, { status: 404 })
            }
          }
          console.error('[getCourseProgressRoute] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
