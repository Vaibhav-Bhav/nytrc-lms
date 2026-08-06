import { createFileRoute } from '@tanstack/react-router'
import { storageService } from '@/services/storage'
import { lessonRepository } from '@/repositories/lesson'
import { sectionService } from '@/services/sections'
import { authenticate, requireStudent, requireEnrolled } from '@/middleware/auth'

export const Route = createFileRoute('/api/student/lessons/$id/document')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        // 1. Authenticate user session
        await authenticate(request)

        // 2. Authorize as a student role
        await requireStudent(request)

        try {
          // 3. Retrieve lesson to resolve course enrollment permissions
          const lesson = await lessonRepository.findById(params.id)
          if (!lesson) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          // 4. Retrieve parent section to find course ID
          const section = await sectionService.findById(lesson.section_id)
          
          // 5. Authorize course access entitlement
          await requireEnrolled(request, section.course_id)

          // 6. Generate secure presigned download URL
          const result = await storageService.generateDocumentDownloadUrl(params.id)
          return Response.json(result)
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'LESSON_NOT_FOUND' || err.message === 'SECTION_NOT_FOUND') {
              return Response.json({ error: 'Lesson not found' }, { status: 404 })
            }
            if (err.message === 'DOCUMENT_NOT_FOUND') {
              return Response.json({ error: 'No document attachment is associated with this lesson' }, { status: 404 })
            }
            if (err.message === 'CONFIGURATION_ERROR') {
              return Response.json({ error: 'Storage service configuration is incomplete' }, { status: 503 })
            }
          }
          console.error('[getDocumentDownload] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
