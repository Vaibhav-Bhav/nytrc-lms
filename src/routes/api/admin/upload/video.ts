import { createFileRoute } from '@tanstack/react-router'
import { storageService } from '@/services/storage'
import { requireAdmin } from '@/middleware/auth'
import { z } from 'zod'

const videoMetadataSchema = z.object({
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
  title: z.string().min(1, 'title is required'),
})

export const Route = createFileRoute('/api/admin/upload/video')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Enforce administrative permissions
        await requireAdmin(request)

        try {
          const contentTypeHeader = request.headers.get('content-type') ?? ''
          if (!contentTypeHeader.includes('multipart/form-data')) {
            return Response.json(
              { error: 'Content-Type must be multipart/form-data' },
              { status: 400 },
            )
          }

          const formData = await request.formData()
          const lessonId = formData.get('lessonId')
          const title = formData.get('title')
          const file = formData.get('file')

          // Validate metadata inputs
          const parsed = videoMetadataSchema.safeParse({ lessonId, title })
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // Validate file presence
          if (!file || !(file instanceof Blob)) {
            return Response.json(
              { error: 'Validation failed: file is required' },
              { status: 400 },
            )
          }

          // Convert web File/Blob to Node Buffer
          const arrayBuffer = await file.arrayBuffer()
          const fileBuffer = Buffer.from(arrayBuffer)

          const result = await storageService.uploadVideo(
            parsed.data.lessonId,
            parsed.data.title,
            (file as any).name ?? 'video.mp4',
            file.type ?? 'video/mp4',
            fileBuffer,
          )

          return Response.json(result, { status: 201 })
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'INVALID_FILE_TYPE') {
              return Response.json({ error: 'Unsupported video file format' }, { status: 400 })
            }
            if (err.message === 'LESSON_NOT_FOUND') {
              return Response.json({ error: 'Target lesson not found' }, { status: 404 })
            }
            if (err.message === 'CONFIGURATION_ERROR') {
              return Response.json({ error: 'Streaming service configuration is incomplete' }, { status: 503 })
            }
            if (err.message === 'UPLOAD_FAILED') {
              return Response.json({ error: 'Failed to upload video to streaming host' }, { status: 502 })
            }
          }
          console.error('[uploadVideo] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
