import { createFileRoute } from '@tanstack/react-router'
import { sectionService } from '@/services/sections'
import { newSectionSchema } from '@/schemas/sections'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/sections')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const parsed = newSectionSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const section = await sectionService.create(parsed.data)
          return Response.json(section, { status: 201 })
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