// src/routes/api/student/lessons.$id.ts
//
// TEMPORARY: requireEnrolled is a stub — see src/middleware/auth.ts.
// Note the stub currently ignores its courseId argument, so this call
// doesn't yet verify the student is entitled to the *course* this lesson
// belongs to — that check needs to happen once the real middleware lands.

import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/lessons/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const lesson = await lessonService.findById(params.id)

          if (lesson.status !== 'published') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          // section_id doubles as a stand-in until real entitlement checks
          // resolve course ownership through section -> course.
          await requireEnrolled(request, lesson.section_id)

          return Response.json(lesson)
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