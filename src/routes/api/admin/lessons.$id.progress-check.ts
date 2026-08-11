// src/routes/api/admin/lessons.$id.progress-check.ts
// GET /api/admin/lessons/:id/progress-check
// Returns count of student progress records for a lesson before deletion/replacement.

import { createFileRoute } from '@tanstack/react-router'
import { progressRepository } from '@/repositories/progress'
import { lessonRepository } from '@/repositories/lesson'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/lessons/$id/progress-check')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        await requireAdmin(request)

        try {
          const lesson = await lessonRepository.findById(params.id)
          if (!lesson) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          const count = await progressRepository.countByLesson(params.id)
          return Response.json({ lessonId: params.id, progressCount: count })
        } catch (err) {
          console.error('[admin/lessons/$id/progress-check GET] Error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
