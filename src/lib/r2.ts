// src/lib/r2.ts
//
// Reusable Cloudflare R2 S3-compatible storage integration layer.
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
 * Resolves and validates Cloudflare R2 configuration at runtime.
 * Throws configuration errors if required variables are missing.
 */
export function getR2Config() {
  return {
    accountId: getRequiredEnv('R2_ACCOUNT_ID'),
    accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
    bucket: getRequiredEnv('R2_BUCKET'),
    publicUrl: getRequiredEnv('R2_PUBLIC_URL'),
  }
}

// -----------------------------------------------------------------------
// Typed interfaces
// -----------------------------------------------------------------------

export type R2ObjectMetadata = {
  key: string
  size: number
  contentType: string
  etag: string
  lastModified: string
}

// -----------------------------------------------------------------------
// Reusable helper methods (stubs for future implementation)
// -----------------------------------------------------------------------

/**
 * Uploads raw binary file buffer data to the Cloudflare R2 bucket.
 * 
 * TODO (Sprint 3.2 - File Uploads): Implement S3 client initialization
 * and S3 PutObjectCommand execution.
 */
export async function uploadR2File(
  key: string,
  _fileBuffer: Buffer,
  _contentType: string,
): Promise<{ publicUrl: string }> {
  const config = getR2Config()

  // Return placeholder public download URL for now
  return {
    publicUrl: `${config.publicUrl}/${key}`,
  }
}

/**
 * Deletes a file from the Cloudflare R2 bucket.
 * 
 * TODO (Sprint 3.3 - File Management): Implement S3 DeleteObjectCommand execution.
 */
export async function deleteR2File(key: string): Promise<{ success: boolean }> {
  getR2Config()

  // TODO: Implement actual S3 call
  return { success: true }
}

/**
 * Generates a temporary secure signed download URL for private files (e.g. course resources).
 * 
 * TODO (Sprint 3.4 - Access Control): Implement getSignedUrl helper via @aws-sdk/s3-request-presigner
 */
export async function getSignedDownloadUrl(
  key: string,
  _expirationSeconds = 3600,
): Promise<{ downloadUrl: string }> {
  const config = getR2Config()

  // Return public URL as fallback placeholder
  return {
    downloadUrl: `${config.publicUrl}/${key}?token=placeholder_r2_signed_token`,
  }
}

/**
 * Retrieves file metadata information directly from R2 without downloading bytes.
 * 
 * TODO (Sprint 3.3 - File Management): Implement HeadObjectCommand execution.
 */
export async function getFileMetadata(key: string): Promise<R2ObjectMetadata> {
  getR2Config()

  // Return stub metadata for now
  return {
    key,
    size: 2048,
    contentType: 'application/octet-stream',
    etag: '"placeholder_etag"',
    lastModified: new Date().toISOString(),
  }
}
