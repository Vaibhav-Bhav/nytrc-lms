// src/lib/bunny.ts
//
// Reusable Bunny Stream integration layer.
// All configuration is retrieved from environment variables at call time.
//

import crypto from 'node:crypto'

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
    streamHostname: process.env['BUNNY_STREAM_HOSTNAME']?.trim() || 'video.bunnycdn.com',
    tokenKey: process.env['BUNNY_STREAM_TOKEN_KEY']?.trim() || process.env['BUNNY_STREAM_SECURITY_KEY']?.trim() || null,
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
// Helper methods
// -----------------------------------------------------------------------

/**
 * Creates a video entry in the Bunny Stream library via REST API.
 * Reserves a video GUID before uploading actual video bytes.
 */
export async function createBunnyVideo(
  params: BunnyCreateVideoParams,
): Promise<{ videoId: string }> {
  const config = getBunnyConfig()
  const url = `https://video.bunnycdn.com/library/${config.libraryId}/videos`

  const safeTitle = typeof params.title === 'string' && params.title.trim().length > 0 
    ? params.title.trim() 
    : 'Untitled Video';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        AccessKey: config.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: safeTitle,
        collectionId: params.collectionId,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[BunnyStream] Create Video Slot failed. Status: ${res.status}, Body: ${errText}`)
      throw new Error(`Bunny Stream API error (${res.status}): ${errText || res.statusText}`)
    }

    const data = await res.json()
    const videoId = data.guid || data.id
    if (!videoId) {
      throw new Error('Bunny Stream response did not contain a valid video GUID')
    }

    return { videoId }
  } catch (err) {
    console.error('[BunnyStream] Network/Execution error in createBunnyVideo:', err)
    throw err
  }
}

/**
 * Uploads raw video bytes to a previously created Bunny Stream video entry via PUT.
 */
export async function uploadBunnyVideo(
  videoId: string,
  fileBuffer: Buffer,
): Promise<{ success: boolean }> {
  const config = getBunnyConfig()
  const url = `https://video.bunnycdn.com/library/${config.libraryId}/videos/${videoId}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: config.apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer as unknown as BodyInit,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Bunny Stream Upload error (${res.status}): ${errText || res.statusText}`)
  }

  return { success: true }
}

/**
 * Retrieves status and encoding metadata of a specific video from Bunny Stream.
 */
export async function getBunnyVideo(videoId: string): Promise<BunnyVideoResponse> {
  const config = getBunnyConfig()
  const url = `https://video.bunnycdn.com/library/${config.libraryId}/videos/${videoId}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      AccessKey: config.apiKey,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Bunny Stream Metadata error (${res.status}): ${errText || res.statusText}`)
  }

  const data = await res.json()
  return {
    id: data.guid || videoId,
    title: data.title || 'Untitled Video',
    status: data.status ?? 2,
    length: data.length ?? 0,
    views: data.views ?? 0,
    thumbnailUrl: `https://${config.streamHostname}/${videoId}/thumbnail.jpg`,
    availableResolutions: data.availableResolutions ?? ['720p', '1080p'],
    created_at: data.dateUploaded || new Date().toISOString(),
  }
}

/**
 * Deletes a video from the Bunny Stream library.
 */
export async function deleteBunnyVideo(videoId: string): Promise<{ success: boolean }> {
  const config = getBunnyConfig()
  const url = `https://video.bunnycdn.com/library/${config.libraryId}/videos/${videoId}`

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      AccessKey: config.apiKey,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Bunny Stream Delete error (${res.status}): ${errText || res.statusText}`)
  }

  return { success: true }
}

/**
 * Resolves video playback embed URL for authorized students.
 * Conforms to official Bunny Stream Embed View Token Authentication specification.
 * If BUNNY_STREAM_TOKEN_KEY is configured, generates a SHA256 token-signed embed URL.
 * Otherwise returns standard iframe embed URL protected by LMS API route authorization.
 */
export function generateSignedPlaybackUrl(
  videoId: string,
  expirationSeconds = 3600,
): { streamUrl: string; isSigned: boolean } {
  if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
    return { streamUrl: videoId, isSigned: false }
  }

  const config = getBunnyConfig()

  if (config.tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds
    const hashInput = `${config.tokenKey}${videoId}${expires}`
    const token = crypto.createHash('sha256').update(hashInput).digest('hex')
    return {
      streamUrl: `https://iframe.mediadelivery.net/embed/${config.libraryId}/${videoId}?token=${token}&expires=${expires}`,
      isSigned: true,
    }
  }

  return {
    streamUrl: `https://iframe.mediadelivery.net/embed/${config.libraryId}/${videoId}`,
    isSigned: false,
  }
}
