// src/services/video/bunny.ts
// Reusable server-side Bunny Stream Video Service Abstraction (Phase 4).

import {
  getBunnyConfig,
  createBunnyVideo,
  uploadBunnyVideo,
  getBunnyVideo,
  deleteBunnyVideo,
  generateSignedPlaybackUrl,
  type BunnyVideoResponse,
  type BunnyCreateVideoParams,
} from '@/lib/bunny'

export const bunnyVideoService = {
  /**
   * Validates runtime Bunny Stream configuration.
   */
  validateConfig() {
    return getBunnyConfig()
  },

  /**
   * Creates a new video asset slot in the Bunny Stream library.
   */
  async createVideoAsset(params: BunnyCreateVideoParams): Promise<{ videoId: string }> {
    console.log(`[bunnyVideoService] Creating video asset slot: "${params.title}"`)
    return createBunnyVideo(params)
  },

  /**
   * Uploads raw video buffer data to an existing Bunny Stream video ID.
   */
  async uploadVideoAsset(videoId: string, fileBuffer: Buffer): Promise<{ success: boolean }> {
    console.log(`[bunnyVideoService] Uploading video bytes for asset: ${videoId} (size: ${fileBuffer.length} bytes)`)
    return uploadBunnyVideo(videoId, fileBuffer)
  },

  /**
   * Retrieves status and encoding metadata for a video asset.
   */
  async getVideoMetadata(videoId: string): Promise<BunnyVideoResponse> {
    console.log(`[bunnyVideoService] Fetching metadata for video asset: ${videoId}`)
    return getBunnyVideo(videoId)
  },

  /**
   * Deletes a video asset from the Bunny Stream library.
   */
  async deleteVideoAsset(videoId: string): Promise<{ success: boolean }> {
    console.log(`[bunnyVideoService] Deleting video asset: ${videoId}`)
    return deleteBunnyVideo(videoId)
  },

  /**
   * Resolves a playback embed URL for an authorized student player.
   */
  resolvePlaybackUrl(videoId: string, expirationSeconds = 3600): { streamUrl: string } {
    return generateSignedPlaybackUrl(videoId, expirationSeconds)
  },
}
