import { createFileRoute } from '@tanstack/react-router'
import { sectionService } from '@/services/sections'
import { courseService } from '@/services/courses'
import { isAdminRequest } from '@/middleware/auth'

export const Route = createFileRoute('/api/courses/$courseId/sections')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { courseId: string }; request: Request }) => {
        try {
          const course = await courseService.findById(params.courseId)
          const isAdmin = await isAdminRequest(request)

          if (course.status !== 'published' && !isAdmin) {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }

          const sections = await sectionService.findByCourseId(params.courseId)
          return Response.json(sections)
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