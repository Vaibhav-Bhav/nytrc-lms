import { createFileRoute } from '@tanstack/react-router'
import { lessonService } from '@/services/lessons'
import { sectionService } from '@/services/sections'
import { courseService } from '@/services/courses'
import { authenticate, requireEnrolled, isAdminRequest } from '@/middleware/auth'

export const Route = createFileRoute('/api/sections/$sectionId/lessons')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { sectionId: string }; request: Request }) => {
        try {
          const section = await sectionService.findById(params.sectionId)
          const course = await courseService.findById(section.course_id)
          const isAdmin = await isAdminRequest(request)

          if (course.status !== 'published' && !isAdmin) {
            return Response.json({ error: 'Section not found' }, { status: 404 })
          }

          if (!isAdmin) {
            await authenticate(request)
            await requireEnrolled(request, course.id)
          }

          const lessons = await lessonService.findBySectionId(params.sectionId)
          const filteredLessons = isAdmin
            ? lessons
            : lessons.filter((l) => l.status === 'published')

          return Response.json(filteredLessons)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'SECTION_NOT_FOUND' || err.message === 'COURSE_NOT_FOUND') {
              return Response.json({ error: 'Section not found' }, { status: 404 })
            }
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})