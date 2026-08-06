import { createFileRoute } from '@tanstack/react-router'
import { progressService } from '@/services/progress'
import { lessonRepository } from '@/repositories/lesson'
import { sectionService } from '@/services/sections'
import { progressInputSchema } from '@/schemas/progress'
import { authenticate, requireStudent, requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/progress')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // 1. Authenticate user session
        const user = await authenticate(request)

        // 2. Authorize as student role
        await requireStudent(request)

        try {
          const body = await request.json()
          const parsed = progressInputSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // 3. Resolve parent course to check enrollment
          const lesson = await lessonRepository.findById(parsed.data.lessonId)
          if (!lesson) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          const section = await sectionService.findById(lesson.section_id)
          
          // 4. Authorize course access entitlement
          await requireEnrolled(request, section.course_id)

          // 5. Update progress metadata values
          let result = await progressService.updateProgress(
            user.id,
            parsed.data.lessonId,
            parsed.data.videoProgressSeconds,
            parsed.data.documentProgressPage,
          )

          // 6. Complete lesson if explicitly requested
          if (parsed.data.completed) {
            result = await progressService.markLessonCompleted(user.id, parsed.data.lessonId)
          }

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
          console.error('[updateProgressRoute] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
