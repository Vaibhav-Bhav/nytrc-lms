// TEMPORARY: requireEnrolled is a stub — see src/middleware/auth.ts.
// Once real entitlements exist, this should 403 if the caller isn't
// entitled to :id, not just check the course is published.

import { createFileRoute } from '@tanstack/react-router'
import { courseService } from '@/services/courses'
import { sectionService } from '@/services/sections'
import { lessonService } from '@/services/lessons'
import { requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/courses/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        await requireEnrolled(request, params.id)

        try {
          const course = await courseService.findById(params.id)

          if (course.status !== 'published') {
            return Response.json({ error: 'Course not found' }, { status: 404 })
          }

          const sections = await sectionService.findByCourseId(params.id)

          const sectionsWithLessons = await Promise.all(
            sections.map(async (section) => {
              const lessons = await lessonService.findBySectionId(section.id)
              return {
                ...section,
                lessons: lessons.filter((l) => l.status === 'published'),
              }
            }),
          )

          return Response.json({ ...course, sections: sectionsWithLessons })
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