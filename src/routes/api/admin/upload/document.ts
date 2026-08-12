import { createFileRoute } from '@tanstack/react-router'
import { storageService } from '@/services/storage'
import { requireAdmin } from '@/middleware/auth'
import { z } from 'zod'

const documentMetadataSchema = z.object({
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
})

export const Route = createFileRoute('/api/admin/upload/document')({
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
          const file = formData.get('file')

          if (!lessonId) {
            return Response.json({ error: 'Missing lessonId field' }, { status: 400 })
          }

          if (!file || !(file instanceof Blob)) {
            return Response.json({ error: 'Missing file field' }, { status: 400 })
          }

          // Validate metadata inputs
          const parsed = documentMetadataSchema.safeParse({ lessonId })
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // Convert web File/Blob to Node Buffer
          const arrayBuffer = await file.arrayBuffer()
          const fileBuffer = Buffer.from(arrayBuffer)

          const result = await storageService.uploadDocument(
            parsed.data.lessonId,
            (file as any).name ?? 'document.pdf',
            file.type ?? 'application/pdf',
            fileBuffer,
          )

          return Response.json(result, { status: 201 })
        } catch (err) {
          if (err instanceof Response) {
            return err
          }
          if (err instanceof Error) {
            if (err.message === 'INVALID_FILE_TYPE') {
              return Response.json({ error: 'Unsupported document file format' }, { status: 400 })
            }
            if (err.message === 'LESSON_NOT_FOUND') {
              return Response.json({ error: 'Target lesson not found' }, { status: 404 })
            }
            if (err.message === 'CONFIGURATION_ERROR') {
              return Response.json({ error: 'Storage service configuration is incomplete' }, { status: 503 })
            }
            if (err.message === 'UPLOAD_FAILED') {
              return Response.json({ error: 'Failed to upload document to storage provider' }, { status: 502 })
            }
          }
          console.error('[uploadDocument] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
