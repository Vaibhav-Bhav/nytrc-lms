// NOTE: Not in the original API_SPEC.md — add this endpoint to the spec
// doc before merging, per Team Rule 3.
//
// POST /api/admin/sections/:sectionId/lessons/reorder
// Body: { "orderedIds": ["lessonId1", "lessonId2", ...] }
// Returns the section's lessons in their new order.

import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { lessonService } from '@/services/lessons'
import { requireAdmin } from '@/middleware/auth'

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
})

export const Route = createFileRoute('/api/admin/sections/$sectionId/lessons/reorder')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const parsed = reorderSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const lessons = await lessonService.reorder(params.sectionId, parsed.data.orderedIds)
          return Response.json(lessons)
        } catch (err) {
          if (err instanceof Error && err.message === 'SECTION_NOT_FOUND') {
            return Response.json({ error: 'Section not found' }, { status: 404 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})