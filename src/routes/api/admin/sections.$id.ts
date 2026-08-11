import { createFileRoute } from '@tanstack/react-router'
import { sectionService } from '@/services/sections'
import { updateSectionSchema } from '@/schemas/sections'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/sections/$id')({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const parsed = updateSectionSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }
          const updated = await sectionService.update(params.id, parsed.data)
          return Response.json(updated)
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'TITLE_REQUIRED') {
              return Response.json({ error: 'Title is required' }, { status: 400 })
            }
            if (err.message === 'SECTION_NOT_FOUND') {
              return Response.json({ error: 'Section not found' }, { status: 404 })
            }
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      DELETE: async ({ params, request }) => {
        await requireAdmin(request)

        try {
          await sectionService.remove(params.id)
          return new Response(null, { status: 204 })
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