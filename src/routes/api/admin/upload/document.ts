import { createFileRoute } from '@tanstack/react-router'
import { storageService } from '@/services/storage'
import { requireAdmin } from '@/middleware/auth'
import { z } from 'zod'

const documentMetadataSchema = z.object({
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
  filename: z.string(),
  contentType: z.string(),
})

export const Route = createFileRoute('/api/admin/upload/document')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Enforce administrative permissions
        await requireAdmin(request)

        try {
          const body = await request.json()

          // Validate metadata inputs
          const parsed = documentMetadataSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          const result = await storageService.generateDocumentUploadTicket(
            parsed.data.lessonId,
            parsed.data.filename,
            parsed.data.contentType
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
              return Response.json({ error: 'Failed to generate direct upload ticket' }, { status: 502 })
            }
          }
          console.error('[uploadDocument] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
