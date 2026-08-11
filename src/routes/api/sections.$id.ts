import { createFileRoute } from '@tanstack/react-router'
import { sectionService } from '@/services/sections'

export const Route = createFileRoute('/api/sections/$id')({
  server: {
    handlers: {
      GET: async ({ params }: { params: Record<string, string> }) => {
        try {
          const section = await sectionService.findById(params.id)
          return Response.json(section)
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
