import { createFileRoute } from '@tanstack/react-router'
import { progressService } from '@/services/progress'
import { lessonRepository } from '@/repositories/lesson'
import { sectionService } from '@/services/sections'
import { patchLessonProgressSchema } from '@/schemas/progress'
import { authenticate, requireStudent, requireEnrolled } from '@/middleware/auth'
import { createNotification } from '@/services/notification'


export const Route = createFileRoute('/api/student/lessons/$id/progress')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        // 1. Authenticate student session
        const user = await authenticate(request)

        // 2. Authorize student role
        await requireStudent(request)

        try {
          const lessonId = params.id

          // 3. Resolve parent course to check enrollment
          const lesson = await lessonRepository.findById(lessonId)
          if (!lesson || lesson.status !== 'published') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          const section = await sectionService.findById(lesson.section_id)

          // 4. Authorize course access entitlement
          await requireEnrolled(request, section.course_id)

          // 5. Fetch student lesson progress
          const result = await progressService.getLessonProgress(user.id, lessonId)
          return Response.json({
            lesson_id: result.lessonId,
            position_seconds: result.video_progress_seconds,
            video_progress_seconds: result.video_progress_seconds,
            document_progress_page: result.document_progress_page,
            completed: result.completed,
            completed_at: result.completed_at,
          })
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

      PATCH: async ({ params, request }: { params: { id: string }; request: Request }) => {
        // 1. Authenticate student session
        const user = await authenticate(request)

        // 2. Authorize student role
        await requireStudent(request)

        try {
          const lessonId = params.id
          const body = await request.json()
          const parsed = patchLessonProgressSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // 3. Resolve lesson & parent course
          const lesson = await lessonRepository.findById(lessonId)
          if (!lesson || lesson.status !== 'published') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          const section = await sectionService.findById(lesson.section_id)

          // 4. Authorize course access entitlement
          await requireEnrolled(request, section.course_id)

          // 5. Sanitize position_seconds input
          const positionSeconds = parsed.data.position_seconds ?? parsed.data.video_progress_seconds
          let validSeconds: number | undefined
          if (positionSeconds !== undefined) {
            if (!Number.isFinite(positionSeconds) || positionSeconds < 0) {
              return Response.json(
                { error: 'position_seconds must be a non-negative finite number' },
                { status: 400 },
              )
            }
            validSeconds = Math.floor(positionSeconds)
          }

          // 6. Update progress via service
          let result = await progressService.updateProgress(
            user.id,
            lessonId,
            validSeconds,
            parsed.data.document_progress_page,
          )

          // 7. Complete lesson if explicitly requested
          if (parsed.data.completed) {
            try {
              result = await progressService.markLessonCompleted(user.id, lessonId)

              createNotification({
                targetRole: 'admin',
                title: 'Lesson Completed',
                message: `Student ${user.name || user.email} completed lesson "${lesson.title}".`,
                type: 'system',
                link: `/admin/students/${user.id}`,
              }).catch(() => {})
            } catch (completionErr: any) {
              if (completionErr.message === 'INSUFFICIENT_PROGRESS_FOR_COMPLETION') {
                return Response.json(
                  { error: 'Insufficient progress to complete lesson' },
                  { status: 400 },
                )
              }
              throw completionErr
            }
          }


          return Response.json({
            lesson_id: result.lessonId,
            position_seconds: result.video_progress_seconds,
            video_progress_seconds: result.video_progress_seconds,
            document_progress_page: result.document_progress_page,
            completed: result.completed,
            completed_at: result.completed_at,
          })
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'LESSON_NOT_FOUND' || err.message === 'SECTION_NOT_FOUND') {
              return Response.json({ error: 'Lesson not found' }, { status: 404 })
            }
          }
          console.error('[patchLessonProgressRoute] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
