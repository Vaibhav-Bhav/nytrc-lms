import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '@/middleware/auth'
import { storageService } from '@/services/storage'
import { lessonRepository } from '@/repositories/lesson'

export const Route = createFileRoute('/api/admin/lessons/$id/preview')({
  server: {
    handlers: {
      GET: async ({ params, request }: { params: { id: string }; request: Request }) => {
        await requireAdmin(request)

        try {
          const lesson = await lessonRepository.findById(params.id)
          if (!lesson) {
            return Response.json({ error: 'Lesson not found' }, { status: 404 })
          }

          if (lesson.video_id && lesson.video_id !== 'pending') {
            const { streamUrl } = await storageService.generateVideoPlaybackUrl(params.id)
            return Response.json({ type: 'video', url: streamUrl })
          } else if (lesson.pdf_url) {
            const { downloadUrl } = await storageService.generateDocumentDownloadUrl(params.id)
            return Response.json({ type: 'pdf', url: downloadUrl })
          }

          return Response.json({ error: 'No content available for preview' }, { status: 404 })
        } catch (err: any) {
          if (err instanceof Response) return err
          return Response.json({ error: err.message || 'Failed to generate preview url' }, { status: 500 })
        }
      },
    },
  },
})
