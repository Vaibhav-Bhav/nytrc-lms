import { createFileRoute } from '@tanstack/react-router'
import { progressService } from '@/services/progress'
import { lessonRepository } from '@/repositories/lesson'
import { sectionService } from '@/services/sections'
import { authenticate, requireStudent, requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/progress/$lessonId')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { lessonId: string }; request: Request }) => {
        // 1. Authenticate user session
        const user = await authenticate(request)

        // 2. Authorize student role
        await requireStudent(request)

        try {
          const { lessonId } = params

          // 3. Resolve parent course to check enrollment
          const lesson = await lessonRepository.findById(lessonId)
          if (!lesson || lesson.status !== 'published') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          const section = await sectionService.findById(lesson.section_id)
          
          // 4. Authorize course access entitlement
          await requireEnrolled(request, section.course_id)

          // 5. Fetch progress details
          const result = await progressService.getLessonProgress(user.id, lessonId)
          return Response.json(result)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'LESSON_NOT_FOUND' || err.message === 'SECTION_NOT_FOUND') {
              return Response.json({ error: 'Lesson not found' }, { status: 404 })
            }
          }
          console.error('[getLessonProgressRoute] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
