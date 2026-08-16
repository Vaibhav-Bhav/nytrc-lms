// src/services/storage.ts

import { lessonRepository } from '@/repositories/lesson'
import { bunnyVideoService } from '@/services/video/bunny'
import { uploadR2File, getSignedDownloadUrl, getSignedUploadUrl, getR2Config, deleteR2File } from '@/lib/r2'

// Allowed MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export const storageService = {
  /**
   * Uploads a video for a lesson.
   * Creates a slot in Bunny Stream, uploads the video bytes, and updates the lesson record.
   */
  async uploadVideo(
    lessonId: string,
    title: string,
    filename: string,
    contentType: string,
    fileData: Buffer,
  ) {
    // 1. Verify MIME type
    if (!ALLOWED_VIDEO_TYPES.includes(contentType.toLowerCase())) {
      throw new Error('INVALID_FILE_TYPE')
    }

    // 2. Validate lesson exists
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    try {
      // --- Garbage Collect Old Video ---
      if (lesson.video_id && lesson.video_id !== 'pending' && !lesson.video_id.startsWith('http')) {
        try {
          await bunnyVideoService.deleteVideoAsset(lesson.video_id)
        } catch (err) {
          console.warn(`[storageService] Failed to delete old video asset ${lesson.video_id}:`, err)
        }
      }

      // 3. Register video slot in Bunny Stream via bunnyVideoService
      const { videoId } = await bunnyVideoService.createVideoAsset({ title })

      // 4. Upload actual video bytes
      await bunnyVideoService.uploadVideoAsset(videoId, fileData)

      // 5. Persist video ID and publish status to the lesson metadata
      await lessonRepository.update(lessonId, { video_id: videoId, status: 'published' })

      return {
        lessonId,
        videoId,
        title,
        filename,
        contentType,
        status: 'uploaded',
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith('Missing required environment variable')) {
          throw new Error('CONFIGURATION_ERROR')
        }
        if (err.message === 'LESSON_NOT_FOUND') {
          throw err
        }
      }
      throw new Error('UPLOAD_FAILED')
    }
  },

  /**
   * Uploads a document for a lesson.
   * Uploads the file to Cloudflare R2 and updates the lesson record.
   */
  async uploadDocument(
    lessonId: string,
    filename: string,
    contentType: string,
    fileData: Buffer,
  ) {
    // 1. Verify MIME type
    if (!ALLOWED_DOCUMENT_TYPES.includes(contentType.toLowerCase())) {
      throw new Error('INVALID_FILE_TYPE')
    }

    // 2. Validate lesson exists
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    try {
      // --- Garbage Collect Old Document ---
      if (lesson.pdf_url && !lesson.pdf_url.startsWith('http')) {
        try {
          await deleteR2File(lesson.pdf_url)
        } catch (err) {
          console.warn(`[storageService] Failed to delete old document asset ${lesson.pdf_url}:`, err)
        }
      }

      // 3. Construct unique file key: lessons/{lessonId}/{timestamp}-{filename}
      const uniqueKey = `lessons/${lessonId}/${Date.now()}-${filename}`

      // 4. Upload to Cloudflare R2
      const { key } = await uploadR2File(uniqueKey, fileData, contentType)

      // 5. Persist the R2 object key and publish status to the lesson metadata
      //    We store the key (not the public URL) so we can always generate presigned URLs
      await lessonRepository.update(lessonId, { pdf_url: key, status: 'published' })

      return {
        lessonId,
        filename,
        contentType,
        key,
        status: 'uploaded',
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith('Missing required environment variable')) {
          throw new Error('CONFIGURATION_ERROR')
        }
        if (err.message === 'LESSON_NOT_FOUND') {
          throw err
        }
      }
      throw new Error('UPLOAD_FAILED')
    }
  },

  /**
   * Generates a signed video playback URL for a lesson.
   */
  async generateVideoPlaybackUrl(lessonId: string) {
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    if (!lesson.video_id) {
      throw new Error('VIDEO_NOT_FOUND')
    }

    try {
      const { streamUrl } = bunnyVideoService.resolvePlaybackUrl(lesson.video_id)
      return {
        lessonId,
        videoId: lesson.video_id,
        streamUrl,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Missing required environment variable')) {
        throw new Error('CONFIGURATION_ERROR')
      }
      throw err
    }
  },

  /**
   * Generates a signed document download URL for a lesson.
   */
  async generateDocumentDownloadUrl(lessonId: string) {
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new Error('LESSON_NOT_FOUND')
    }

    if (!lesson.pdf_url) {
      throw new Error('DOCUMENT_NOT_FOUND')
    }

    try {
      // The pdf_url might be:
      //   1. An R2 object key like 'lessons/{id}/{timestamp}-file.pdf'
      //   2. A full public URL like 'https://pub-xxx.r2.dev/lessons/...'
      //   3. An external URL like 'https://example.com/file.pdf'
      let key = lesson.pdf_url

      // If it's an external URL (not R2), return it directly
      if (key.startsWith('http://') || key.startsWith('https://')) {
        try {
          const config = getR2Config()
          if (config.publicUrl && key.startsWith(config.publicUrl)) {
            key = key.substring(config.publicUrl.length).replace(/^\//, '')
          } else {
            // It's an external URL, return as-is
            return {
              lessonId,
              url: lesson.pdf_url,
              downloadUrl: lesson.pdf_url,
            }
          }
        } catch {
          // Config error, treat as external URL
          return {
            lessonId,
            url: lesson.pdf_url,
            downloadUrl: lesson.pdf_url,
          }
        }
      }

      const { downloadUrl } = await getSignedDownloadUrl(key)
      return {
        lessonId,
        url: lesson.pdf_url,
        downloadUrl,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Missing required environment variable')) {
        throw new Error('CONFIGURATION_ERROR')
      }
      throw err
    }
  },

  /**
   * Generates a Bunny Stream direct upload ticket.
   */
  async generateVideoUploadTicket(lessonId: string, title: string, filename: string) {
    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) throw new Error('LESSON_NOT_FOUND')

    try {
      if (lesson.video_id && lesson.video_id !== 'pending' && !lesson.video_id.startsWith('http')) {
        try {
          await bunnyVideoService.deleteVideoAsset(lesson.video_id)
        } catch (err) {
          console.warn(`[storageService] Failed to delete old video asset ${lesson.video_id}:`, err)
        }
      }

      const { videoId } = await bunnyVideoService.createVideoAsset({ title })
      const { libraryId, expirationTime, signature } = bunnyVideoService.generateDirectUploadSignature(videoId)

      return {
        lessonId,
        videoId,
        libraryId,
        expirationTime,
        signature,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Missing required environment variable')) {
        throw new Error('CONFIGURATION_ERROR')
      }
      throw new Error('UPLOAD_FAILED')
    }
  },

  /**
   * Generates a Cloudflare R2 presigned PUT upload ticket.
   */
  async generateDocumentUploadTicket(lessonId: string, filename: string, contentType: string) {
    if (!ALLOWED_DOCUMENT_TYPES.includes(contentType.toLowerCase())) {
      throw new Error('INVALID_FILE_TYPE')
    }

    const lesson = await lessonRepository.findById(lessonId)
    if (!lesson) throw new Error('LESSON_NOT_FOUND')

    try {
      if (lesson.pdf_url && !lesson.pdf_url.startsWith('http')) {
        try {
          await deleteR2File(lesson.pdf_url)
        } catch (err) {
          console.warn(`[storageService] Failed to delete old document asset ${lesson.pdf_url}:`, err)
        }
      }

      const uniqueKey = `lessons/${lessonId}/${Date.now()}-${filename}`
      const { uploadUrl } = await getSignedUploadUrl(uniqueKey, contentType)

      return {
        lessonId,
        key: uniqueKey,
        uploadUrl,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Missing required environment variable')) {
        throw new Error('CONFIGURATION_ERROR')
      }
      throw new Error('UPLOAD_FAILED')
    }
  },
}
