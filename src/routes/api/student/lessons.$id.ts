import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { sectionService } from '@/services/sections'
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

          // Fetch the section to resolve course ownership
          const section = await sectionService.findById(lesson.section_id)

          // Perform enrollment authorization check
          await requireEnrolled(request, section.course_id)

          return Response.json(lesson)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error && err.message === 'LESSON_NOT_FOUND') {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }
          if (err instanceof Error && err.message === 'SECTION_NOT_FOUND') {
            return Response.json({ error: 'Section not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})