// src/services/storage.ts

import { lessonRepository } from '@/repositories/lesson'
import { createBunnyVideo, uploadBunnyVideo, generateSignedPlaybackUrl } from '@/lib/bunny'
import { uploadR2File, getSignedDownloadUrl, getR2Config } from '@/lib/r2'

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
      // 3. Register video slot in Bunny Stream
      const { videoId } = await createBunnyVideo({ title })

      // 4. Upload actual video bytes
      await uploadBunnyVideo(videoId, fileData)

      // 5. Persist video ID to the lesson metadata
      await lessonRepository.update(lessonId, { video_id: videoId })

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
      // 3. Construct unique file key: lessons/{lessonId}/{timestamp}-{filename}
      const uniqueKey = `lessons/${lessonId}/${Date.now()}-${filename}`

      // 4. Upload to Cloudflare R2
      const { publicUrl } = await uploadR2File(uniqueKey, fileData, contentType)

      // 5. Persist document URL to the lesson metadata
      await lessonRepository.update(lessonId, { pdf_url: publicUrl })

      return {
        lessonId,
        filename,
        contentType,
        url: publicUrl,
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
      const { streamUrl } = generateSignedPlaybackUrl(lesson.video_id)
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
      const config = getR2Config()
      let key = lesson.pdf_url
      if (lesson.pdf_url.startsWith(config.publicUrl)) {
        key = lesson.pdf_url.substring(config.publicUrl.length).replace(/^\//, '')
      }

      const { downloadUrl } = await getSignedDownloadUrl(key)
      return {
        lessonId,
        pdfUrl: lesson.pdf_url,
        downloadUrl,
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Missing required environment variable')) {
        throw new Error('CONFIGURATION_ERROR')
      }
      throw err
    }
  },
}
