// src/lib/bunny.ts
//
// Reusable Bunny Stream integration layer.
// All configuration is retrieved from environment variables at call time.

// -----------------------------------------------------------------------
// Environment validation
// -----------------------------------------------------------------------

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

/**
 * Resolves and validates Bunny Stream configuration at runtime.
 * Throws configuration errors if required variables are missing.
 */
export function getBunnyConfig() {
  return {
    apiKey: getRequiredEnv('BUNNY_API_KEY'),
    libraryId: getRequiredEnv('BUNNY_LIBRARY_ID'),
    streamHostname: process.env['BUNNY_STREAM_HOSTNAME'] ?? 'video.bunnycdn.com',
  }
}

// -----------------------------------------------------------------------
// Typed request/response interfaces
// -----------------------------------------------------------------------

export type BunnyVideoResponse = {
  id: string
  title: string
  status: number // 0: Queued, 1: Processing, 2: Encoded, 3: Failed
  length: number
  views: number
  thumbnailUrl: string
  availableResolutions: string[]
  created_at: string
}

export type BunnyCreateVideoParams = {
  title: string
  collectionId?: string
}

// -----------------------------------------------------------------------
// Reusable helper methods (stubs for future implementation)
// -----------------------------------------------------------------------

/**
 * Creates a video entry in the Bunny Stream library.
 * This reserves a video ID before uploading actual video bytes.
 * 
 * TODO (Sprint 3.2 - Video Uploads): Implement API call to POST /library/{libraryId}/videos
 */
export async function createBunnyVideo(
  params: BunnyCreateVideoParams,
): Promise<{ videoId: string }> {
  getBunnyConfig()
  
  // TODO: Implement actual API fetch request
  // Return stub videoId for now
  return { videoId: 'placeholder_bunny_video_id' }
}

/**
 * Uploads video bytes to a previously created Bunny Stream video entry.
 * 
 * TODO (Sprint 3.2 - Video Uploads): Implement API call to PUT /library/{libraryId}/videos/{videoId}
 */
export async function uploadBunnyVideo(
  _videoId: string,
  _fileBuffer: Buffer,
): Promise<{ success: boolean }> {
  getBunnyConfig()
  
  // TODO: Implement actual API fetch request
  return { success: true }
}

/**
 * Retrieves the status and metadata of a specific video from Bunny Stream.
 * 
 * TODO (Sprint 3.3 - Video Management): Implement API call to GET /library/{libraryId}/videos/{videoId}
 */
export async function getBunnyVideo(videoId: string): Promise<BunnyVideoResponse> {
  getBunnyConfig()
  
  // Return stub metadata for now
  return {
    id: videoId,
    title: 'Placeholder Title',
    status: 2, // Encoded
    length: 120,
    views: 0,
    thumbnailUrl: 'https://images.bunnycdn.com/placeholder-thumbnail.png',
    availableResolutions: ['720p', '1080p'],
    created_at: new Date().toISOString(),
  }
}

/**
 * Deletes a video from the Bunny Stream library.
 * 
 * TODO (Sprint 3.3 - Video Management): Implement API call to DELETE /library/{libraryId}/videos/{videoId}
 */
export async function deleteBunnyVideo(
  _videoId: string,
): Promise<{ success: boolean }> {
  getBunnyConfig()
  
  // TODO: Implement actual API fetch request
  return { success: true }
}

/**
 * Generates a secure, signed playback URL to allow authorized students to stream a lesson.
 * Prevents unauthorized users from extracting or sharing direct stream links.
 * 
 * TODO (Sprint 3.4 - Streaming Access): Implement HMAC token tokenization algorithm
 */
export function generateSignedPlaybackUrl(
  videoId: string,
  _expirationSeconds = 3600,
): { streamUrl: string } {
  const config = getBunnyConfig()
  
  // Return a generic placeholder playback stream link
  return {
    streamUrl: `https://${config.streamHostname}/play/${config.libraryId}/${videoId}?token=placeholder_signature_token`,
  }
}
