import { createFileRoute } from '@tanstack/react-router'
import { storageService } from '@/services/storage'
import { requireAdmin } from '@/middleware/auth'
import { getBunnyConfig } from '@/lib/bunny'
import { z } from 'zod'

const videoMetadataSchema = z.object({
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
  title: z.string().optional(),
  filename: z.string().optional(),
})

export const Route = createFileRoute('/api/admin/upload/video')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Enforce administrative permissions
        await requireAdmin(request)

        try {
          const body = await request.json()
          
          const parsed = videoMetadataSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          const safeTitle = parsed.data.title || parsed.data.filename || 'Untitled Upload'
          const safeFilename = parsed.data.filename || 'video.mp4'

          const result = await storageService.generateVideoUploadTicket(
            parsed.data.lessonId,
            safeTitle,
            safeFilename
          )

          // Return the raw API key so the admin browser can PUT directly to Bunny.
          // This is safe because this route is behind requireAdmin().
          const bunnyConfig = getBunnyConfig()

          return Response.json({
            videoId: result.videoId,
            libraryId: result.libraryId,
            lessonId: result.lessonId,
            accessKey: bunnyConfig.apiKey,
            uploadUrl: `https://video.bunnycdn.com/library/${result.libraryId}/videos/${result.videoId}`,
          }, { status: 201 })
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'LESSON_NOT_FOUND') {
              return Response.json({ error: 'Target lesson not found' }, { status: 404 })
            }
            if (err.message === 'CONFIGURATION_ERROR') {
              return Response.json({ error: 'Streaming service configuration is incomplete' }, { status: 503 })
            }
            if (err.message === 'UPLOAD_FAILED') {
              return Response.json({ error: 'Failed to generate direct upload ticket' }, { status: 502 })
            }
          }
          console.error('[uploadVideo] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
